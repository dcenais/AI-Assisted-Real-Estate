# === Imports ===
import os
import json
import joblib
import numpy as np
import pandas as pd
import requests
import csv
from io import StringIO
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from transformers import pipeline  # GPT2LMHeadModel, GPT2Tokenizer can be removed if not used
from database import db, User, SellProperty, BuyProperty, RentProperty, LikedProperty, MarketAnalytics, Message, Enquiry
from werkzeug.utils import secure_filename

# === Flask App & Config ===
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/denai/OneDrive/Desktop/real_estate_app/backend/flask/instance/real_estate.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app)

# === API Keys & Constants ===
OPENROUTER_API_KEY = "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"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# === ML/AI Model Loading (remove if not used) ===
print("Loading model...")
llm_model = pipeline("text-generation", model="./gpt2_finetuned")  # can be removed if not used
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
try:
    rf_model = joblib.load('rf_model_cleaned.joblib')
    xgb_model = joblib.load('xgb_model_cleaned.joblib')
    scaler = joblib.load('scaler_cleaned.joblib')
    with open('one_hot_columns.json', 'r') as f:
        one_hot_columns = json.load(f)
except Exception as e:
    print(f"Error loading models or resources: {e}")
    raise e

# === Feature Columns for Prediction ===
features_num = [
    'Bedroom(s)_clean', 'Bathroom(s)_clean', 'Builtup_area_capped',
    'CarParks_capped', 'price_per_sqft', 'location_score_capped'
]
features_cat = ['Lot type', 'Property type']

# === Helper Functions (ML, Sentiment, SHAP, etc.) ===
def get_sentiment_score(text):
    try:
        if not text or not text.strip():
            return 0.0
        cleaned_text = ' '.join(text.split())
        result = sentiment_analyzer(cleaned_text)[0]
        label = result['label']
        score = result['score']
        return score if label == "POSITIVE" else -score
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return 0.0

def prepare_features(input_data):
    try:
        num_values = [input_data.get(f, 0) for f in features_num]
        num_df = pd.DataFrame([num_values], columns=features_num)
        num_scaled = scaler.transform(num_df)
        cat_dict = {f: input_data.get(f, None) for f in features_cat}
        cat_df = pd.DataFrame([cat_dict])
        cat_encoded = pd.get_dummies(cat_df)
        for col in one_hot_columns:
            if col not in cat_encoded.columns:
                cat_encoded[col] = 0
        cat_encoded = cat_encoded[one_hot_columns]
        X = np.concatenate([num_scaled, cat_encoded.values], axis=1)
        return X
    except Exception as e:
        print(f"Feature preparation error: {e}")
        raise e

def explain_prediction(input_data, model):
    try:
        import shap
        X = prepare_features(input_data)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        feature_names = features_num + one_hot_columns
        feature_contrib = dict(zip(feature_names, shap_values[0]))
        sorted_features = sorted(feature_contrib.items(), key=lambda x: abs(x[1]), reverse=True)
        return sorted_features, X
    except Exception as e:
        print(f"SHAP explanation error: {e}")
        return [], None

def format_explanation(shap_values):
    explanations = []
    try:
        for feat, val in shap_values:
            feat_readable = feat.replace('_', ' ').replace('Builtup area capped', 'Built-up area').capitalize()
            direction = "increased" if val > 0 else "decreased"
            amount = abs(val)
            explanations.append(f"{feat_readable} {direction} the predicted price by RM {amount:,.2f}.")
    except Exception as e:
        print(f"Explanation formatting error: {e}")
    return explanations

def ai_recommendation(predicted_price, sentiment_score, shap_explanation):
    try:
        prompt = f"""
        The predicted price of the property is RM {predicted_price}.
        Here is the explanation of how the price was determined:
        {shap_explanation}
        Based on the market conditions and property features, recommend what the property owner should do next:
        - Should the property be sold now, held for a few more years, or rented out?
        - Are there any changes that could increase the value or rental potential?
        """
        recommendation = llm_model(prompt, max_new_tokens=300)
        return recommendation[0]['generated_text']
    except Exception as e:
        print(f"Recommendation generation error: {e}")
        return "Recommendation unavailable at this time."

def query_llm(context):
    try:
        answer = llm_model(context, max_new_tokens=150)[0]['generated_text']
        return answer
    except Exception as e:
        print(f"Error in LLM query: {e}")
        return "Sorry, I could not answer your question."

def deepseek_explanation(predicted_price, sentiment_score, explanation):
    prompt = (
        f"Property price prediction: RM {predicted_price}.\n"
        f"Sentiment score: {sentiment_score}.\n"
        f"Model explanation: {explanation}\n\n"
        "Instruction: Write a short, clear, and friendly explanation for a Malaysian property owner. "
        "Summarize the main factors affecting the price"
        "Do not use special characters(such as #, @, $, %, ^, &, *, etc.). Use plain, easy-to-understand language."
    )
    payload = {
        "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "messages": [
            {"role": "system", "content": prompt}
        ]
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    response = requests.post(OPENROUTER_URL, headers=headers, data=json.dumps(payload))
    try:
        response_data = response.json()
        return response_data['choices'][0]['message']['content']
    except Exception as e:
        print("Error decoding DeepSeek response:", e)
        return "Sorry, could not generate an explanation at this time."

# === Prediction & AI Endpoints ===
@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json()
        required_fields = ['Bedroom(s)_clean', 'Bathroom(s)_clean', 'Builtup_area_capped', 'CarParks_capped', 'price_per_sqft']
        for field in required_fields:
            if field not in input_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        X = prepare_features(input_data)
        model_name = input_data.get('model', 'xgboost')
        model = xgb_model if model_name == 'xgboost' else rf_model
        predicted_price = model.predict(X)[0]
        predicted_price = round(float(predicted_price), 2)
        shap_explanation, _ = explain_prediction(input_data, model)
        explanation = format_explanation(shap_explanation)
        sentiment_text = input_data.get('description', '')
        sentiment_score = get_sentiment_score(sentiment_text)
        deepseek_text = deepseek_explanation(predicted_price, sentiment_score, explanation)
        shap_chart_data = [
            {'feature': str(feature), 'value': float(value)}
            for feature, value in shap_explanation
        ]
        response = {
            'predicted_price': float(predicted_price),
            'explanation': deepseek_text,
            'shap_chart_data': shap_chart_data
        }
        return jsonify(response)
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": "Prediction failed"}), 500

@app.route('/api/ask-question', methods=['POST'])
def ask_question():
    try:
        user_question = request.get_json().get("question")
        if not user_question:
            return jsonify({"error": "No question provided"}), 400
        predicted_price = request.get_json().get("predicted_price", "N/A")
        explanation = request.get_json().get("explanation", "No explanation available.")
        recommendation = request.get_json().get("recommendation", "No recommendation available.")
        property_context = (
            f"Predicted Price: RM {predicted_price}\n"
            f"Explanation: {explanation}\n"
            f"Recommendation: {recommendation}\n"
        )
        payload = {
            "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        property_context +
                        "\nInstruction: You are an assistant for real estate questions in Malaysia. Answer the user's question in simple, clear, and easy-to-understand language, keep it short and friendly."
                        "Instruction: Write a short, clear, and friendly explanation for a Malaysian property owner or someone interested in Malaysian real estate. "
                        "Summarize the main factors affecting the price and give a simple recommendation (sell, hold, rent, or improve) "
                        "Do not use special characters(such as #, @, $, %, ^, &, *, etc.). Use plain, easy-to-understand language."
                    ),
                },
                {
                    "role": "user",
                    "content": user_question
                }
            ]
        }
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        response = requests.post(OPENROUTER_URL, headers=headers, data=json.dumps(payload))
        try:
            response_data = response.json()
            answer = response_data['choices'][0]['message']['content']
            return jsonify({"answer": answer})
        except Exception as e:
            print("Error decoding response:", e)
            return jsonify({"error": "Failed to get answer from AI"}), 500
    except Exception as e:
        print(f"Error processing question: {e}")
        return jsonify({"error": "Unable to process question."}), 500

# === User Authentication & Profile ===
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    role = data['role']
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400
    new_user = User(username=username, email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    user_data = {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role
    }
    return jsonify({'message': 'User registered successfully', 'user': user_data}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
        return jsonify({'message': 'Login successful', 'user': user_data}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/switch-role', methods=['POST'])
def switch_role():
    data = request.get_json()
    email = data['email']
    new_role = data['role']
    user = User.query.filter_by(email=email).first()
    if user:
        user.role = new_role
        db.session.commit()
        return jsonify({'message': 'Role updated'}), 200
    return jsonify({'message': 'User not found'}), 404

@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    email = data['email']
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if user:
        if username:
            user.username = username
        if password:
            user.set_password(password)
        db.session.commit()
        return jsonify({'message': 'Profile updated'}), 200
    return jsonify({'message': 'User not found'}), 404

# === Property CRUD (Sell, Buy, Rent) ===
@app.route('/properties', methods=['GET'])
def list_properties():
    status = request.args.get('status', 'pending')
    properties = SellProperty.query.filter_by(status=status).all()
    return jsonify([property.to_dict() for property in properties])

@app.route('/properties', methods=['POST'])
def create_property():
    form = request.form
    seller = User.query.filter_by(email=form['sellerEmail']).first()
    if not seller:
        return jsonify({'message': 'Seller not found'}), 400
    img = request.files.get('image')
    doc = request.files.get('doc')
    img_path = doc_path = None
    if img:
        fn = secure_filename(img.filename)
        img.save(os.path.join(app.config['UPLOAD_FOLDER'], fn))
        img_path = f'/uploads/{fn}'
    if doc:
        fn = secure_filename(doc.filename)
        doc.save(os.path.join(app.config['UPLOAD_FOLDER'], fn))
        doc_path = f'/uploads/{fn}'
    import re
    description = form.get('description', '')
    description = re.sub(r'[^a-zA-Z0-9\s.,;:?!\'"-]', '', description)
    listing_type = form.get('listingType', 'sell')
    prop = SellProperty(
        name=form['propertyName'],
        address=form['address'],
        price=float(form['price']),
        size=float(form['size']),
        property_type=form['propertyType'],
        bedrooms=int(form['bedrooms']),
        bathrooms=int(form['bathrooms']),
        image_url=img_path,
        doc_url=doc_path,
        seller_id=seller.id,
        status='pending',
        description=description,
        listing_type=listing_type,
    )
    db.session.add(prop)
    db.session.commit()
    return jsonify({'message': 'Property submitted'}), 201

@app.route('/admin/request', methods=['GET'])
def admin_request():
    properties = SellProperty.query.filter_by(status='pending').all()
    return jsonify([property.to_dict() for property in properties])

@app.route('/admin/request/<int:prop_id>/approve', methods=['POST'])
def approve_property(prop_id):
    prop = SellProperty.query.get_or_404(prop_id)
    prop.status = 'verified'
    if prop.listing_type == 'sell':
        exists = BuyProperty.query.filter_by(name=prop.name, address=prop.address, price=prop.price, seller_id=prop.seller_id).first()
        if not exists:
            buy_prop = BuyProperty(
                name=prop.name,
                address=prop.address,
                price=prop.price,
                size=prop.size,
                property_type=prop.property_type,
                bedrooms=prop.bedrooms,
                bathrooms=prop.bathrooms,
                image_url=prop.image_url,
                description=prop.description,
                seller_id=prop.seller_id
            )
            db.session.add(buy_prop)
    elif prop.listing_type == 'rent':
        exists = RentProperty.query.filter_by(name=prop.name, address=prop.address, price=prop.price, seller_id=prop.seller_id).first()
        if not exists:
            rent_prop = RentProperty(
                name=prop.name,
                address=prop.address,
                price=prop.price,
                size=prop.size,
                property_type=prop.property_type,
                bedrooms=prop.bedrooms,
                bathrooms=prop.bathrooms,
                image_url=prop.image_url,
                description=prop.description,
                seller_id=prop.seller_id
            )
            db.session.add(rent_prop)
    db.session.commit()
    return jsonify({'message': 'Property approved'}), 200

@app.route('/admin/request/<int:prop_id>/reject', methods=['POST'])
def reject_property(prop_id):
    prop = SellProperty.query.get_or_404(prop_id)
    db.session.delete(prop)
    db.session.commit()
    return jsonify({'message': 'Property rejected'}), 200

@app.route('/admin/verified', methods=['GET'])
def admin_verified():
    properties = SellProperty.query.filter_by(status='verified').all()
    return jsonify([property.to_dict() for property in properties])

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/buy-properties', methods=['GET'])
def get_buy_properties():
    properties = BuyProperty.query.all()
    return jsonify([property.to_dict() for property in properties])

@app.route('/api/rent-properties', methods=['GET'])
def get_rent_properties():
    properties = RentProperty.query.all()
    return jsonify([property.to_dict() for property in properties])

@app.route('/api/buy-properties/<int:property_id>', methods=['GET'])
def get_buy_property(property_id):
    property = BuyProperty.query.get_or_404(property_id)
    return jsonify(property.to_dict())

@app.route('/api/rent-properties/<int:property_id>', methods=['GET'])
def get_rent_property(property_id):
    property = RentProperty.query.get_or_404(property_id)
    return jsonify(property.to_dict())

# === Liked Properties (with duplicate prevention) ===
@app.route('/api/like-property', methods=['POST'])
def like_property():
    try:
        data = request.get_json()
        user_id = data['user_id']
        property_id = data['property_id']
        property_type = data['type']
        if not user_id or not property_id or not property_type:
            return jsonify({"error": "Missing required field: user_id, property_id or type"}), 400
        if property_type not in ['buy', 'rent']:
            return jsonify({"error": "Invalid property type"}), 400
        # Prevent duplicate likes
        existing = LikedProperty.query.filter_by(
            user_id=user_id, property_id=property_id, type=property_type
        ).first()
        if existing:
            return jsonify({"message": "Property already liked!"}), 200
        liked_property = LikedProperty(property_id=property_id, type=property_type, user_id=user_id)
        db.session.add(liked_property)
        db.session.commit()
        return jsonify({"message": "Property liked successfully!"}), 200
    except Exception as e:
        print(f"Error liking property: {e}")
        return jsonify({"error": "Failed to like property."}), 500

@app.route('/api/liked-properties/<int:user_id>', methods=['GET'])
def get_liked_properties(user_id):
    try:
        liked_properties = LikedProperty.query.filter_by(user_id=user_id).all()
        liked_properties_list = []
        seen = set()
        for liked_property in liked_properties:
            key = (liked_property.property_id, liked_property.type)
            if key in seen:
                continue  # skip duplicates
            seen.add(key)
            if liked_property.type == 'buy':
                property = BuyProperty.query.get(liked_property.property_id)
            else:
                property = RentProperty.query.get(liked_property.property_id)
            if not property:
                continue
            prop_dict = property.to_dict()
            prop_dict['liked_id'] = liked_property.id
            prop_dict['type'] = liked_property.type
            liked_properties_list.append(prop_dict)
        return jsonify(liked_properties_list), 200
    except Exception as e:
        print(f"Error fetching liked properties: {e}")
        return jsonify({"error": "Failed to fetch liked properties."}), 500

@app.route('/api/remove-liked-property/<int:id>', methods=['DELETE'])
def remove_liked_property(id):
    try:
        liked_property = LikedProperty.query.get(id)
        if liked_property:
            db.session.delete(liked_property)
            db.session.commit()
            return jsonify({"message": "Property removed from liked list"}), 200
        else:
            return jsonify({"error": "Property not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === Market Analytics ===
@app.route('/api/market-analytics', methods=['POST'])
def upload_market_analytics():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    df = pd.read_csv(file)
    MarketAnalytics.query.delete()
    db.session.commit()
    for _, row in df.iterrows():
        if pd.isnull(row['QMYR628BIS']):
            continue
        entry = MarketAnalytics(
            date=str(row['observation_date']),
            index=float(row['QMYR628BIS'])
        )
        db.session.add(entry)
    db.session.commit()
    return jsonify({'message': 'Data uploaded successfully'})

@app.route('/api/market-analytics', methods=['GET'])
def get_market_analytics():
    data = MarketAnalytics.query.order_by(MarketAnalytics.date).all()
    result = []
    for entry in data:
        date_str = entry.date
        formatted_date = date_str
        try:
            formatted_date = datetime.strptime(date_str, '%d/%m/%Y').date().isoformat()
        except ValueError:
            try:
                formatted_date = datetime.strptime(date_str, '%Y-%m-%d').date().isoformat()
            except ValueError:
                formatted_date = date_str
        result.append({
            "date": formatted_date,
            "index": entry.index
        })
    return jsonify(result)

# === Chat & Messaging ===
@app.route('/api/contact-seller', methods=['POST'])
def contact_seller():
    data = request.get_json()
    buyer_email = data['buyer_email']
    seller_email = data['seller_email']
    message = data['message']
    msg = Message(
        buyer_email=buyer_email,
        seller_email=seller_email,
        sender='buyer',
        message=message
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent!'}), 200

@app.route('/api/chats/buyer', methods=['GET'])
def get_buyer_chats():
    buyer_email = request.args.get('buyer_email')
    sellers = (
        db.session.query(Message.seller_email)
        .filter_by(buyer_email=buyer_email)
        .distinct()
        .all()
    )
    seller_list = [s[0] for s in sellers]
    return jsonify({'sellers': seller_list})

@app.route('/api/chats/seller', methods=['GET'])
def get_seller_chats():
    seller_email = request.args.get('seller_email')
    buyers = (
        db.session.query(Message.buyer_email)
        .filter_by(seller_email=seller_email)
        .distinct()
        .all()
    )
    buyer_list = [b[0] for b in buyers]
    return jsonify({'buyers': buyer_list})

@app.route('/api/chat/messages', methods=['GET'])
def get_chat_messages():
    buyer_email = request.args.get('buyer_email')
    seller_email = request.args.get('seller_email')
    messages = (
        Message.query
        .filter_by(buyer_email=buyer_email, seller_email=seller_email)
        .order_by(Message.timestamp)
        .all()
    )
    msg_list = [
        {
            'sender': m.sender,
            'message': m.message,
            'timestamp': m.timestamp.isoformat()
        }
        for m in messages
    ]
    return jsonify({'messages': msg_list})

@app.route('/api/chat/send', methods=['POST'])
def send_chat_message():
    data = request.get_json()
    buyer_email = data['buyer_email']
    seller_email = data['seller_email']
    sender = data['sender']
    message = data['message']
    msg = Message(
        buyer_email=buyer_email,
        seller_email=seller_email,
        sender=sender,
        message=message
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent!'}), 200

# === FAQ/AI Chatbot ===
faq_data = {
    "questions": [
        "Hello", "Hi", "What properties do you have for sale?",
        "How can I rent a property?", "What is the price range for properties in my area?",
        "How do I contact a seller?", "What are the steps for buying a property?",
        "How do I log in or sign up for the platform?", "What AI tools are available for real estate predictions?",
        "Can I compare properties on this platform?", "How do I list my property for sale?",
        "What documents are required to sell a property?", "How can I save my favorite properties?",
        "How do I find verified properties?", "Can I ask AI about property predictions and recommendations?",
        "How do I contact customer support?", "What information do I need to provide for property verification?",
        "How do I know if my property is verified?", "How does the platform ensure property authenticity?",
        "How do I use the 'Ask AI' feature?", "Can I get recommendations for selling, renting, or buying properties?",
        "How does the platform handle user data securely?"
    ],
    "answers": [
        "Hello! How can I assist you today?",
        "Hi there! What can I help you with?",
        "We have a wide range of properties for sale, including residential and commercial spaces.",
        "You can rent a property through our platform by browsing listings, applying filters based on your needs, and contacting the agent directly.",
        "Prices vary depending on the area and type of property. We have listings starting from RM 300,000.",
        "You can contact a seller directly via the contact details provided in the property listing.",
        "To buy a property, follow these steps: 1. Browse listings, 2. Filter by your preferences (location, price, etc.), 3. Contact the seller, and 4. Negotiate and finalize the deal.",
        "To log in or sign up, click on the 'Login/Sign Up' button at the top of the page. If you're a new user, click 'Sign Up' to create an account by providing your email and password. If you're a returning user, just log in with your credentials.",
        "Our platform offers AI-powered tools to predict property prices, provide recommendations, and analyze market trends.",
        "Yes, you can compare properties side by side using the 'Compare' feature.",
        "To list your property for sale, go to the 'Sell Property' page and provide details such as the property name, address, type, price, and size.",
        "To sell a property, you must upload documents such as JPPH (Valuation) and LPPEH (Property Manager) for verification.",
        "You can save your favorite properties by clicking on the 'Like' button next to the property listing.",
        "Verified properties are marked with a special badge on the listing page.",
        "The 'Ask AI' feature allows you to ask for property recommendations and market predictions.",
        "You can contact customer support via the 'Contact' section on our platform.",
        "For property verification, you need to upload documents such as JPPH and LPPEH for approval.",
        "Once the admin approves your documents, your property will be verified.",
        "The platform ensures property authenticity by requiring sellers to upload verification documents, which are reviewed by admins.",
        "The 'Ask AI' feature allows you to get predictions based on real-time data and user preferences.",
        "We provide personalized recommendations for buying, selling, or renting properties based on your needs.",
        "We take security seriously, encrypting user data during transactions."
    ]
}

def get_openrouter_response(question):
    faq_context = "\n".join([f"Q: {faq_data['questions'][i]}\nA: {faq_data['answers'][i]}" for i in range(len(faq_data['questions']))])
    payload = {
        "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
        "messages": [
            {
                "role": "system",
                "content": (
                    faq_context +
                    "\n\nInstruction: Please answer the user's question clearly and concisely. Do not use any special characters (such as #, @, $, %, ^, &, *, etc.) in your reply. Only use plain text."
                ),
            },
            {
                "role": "user",
                "content": question,
            }
        ]
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    response = requests.post(OPENROUTER_URL, headers=headers, data=json.dumps(payload))
    try:
        response_data = response.json()
        answer = response_data['choices'][0]['message']['content']
        return answer
    except Exception as e:
        print("Error decoding response:", e)
        return "Sorry, I couldn't get a response. Please try again later."

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        question = request.get_json().get('question')
        if not question:
            return jsonify({"error": "No question provided"}), 400
        response = get_openrouter_response(question)
        return jsonify({"answer": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === My Properties (Seller Dashboard) ===
@app.route('/api/my-properties', methods=['GET'])
def my_properties():
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify([])
    props = SellProperty.query.filter_by(seller_id=user.id).all()
    return jsonify([p.to_dict() for p in props])

@app.route('/api/my-properties/<int:property_id>', methods=['DELETE'])
def delete_my_property(property_id):
    prop = SellProperty.query.get_or_404(property_id)
    if prop.status == 'verified':
        return jsonify({'error': 'Cannot delete a verified property.'}), 403
    db.session.delete(prop)
    db.session.commit()
    return jsonify({'message': 'Property deleted.'}), 200

@app.route('/api/my-properties/<int:property_id>', methods=['PUT'])
def edit_my_property(property_id):
    prop = SellProperty.query.get_or_404(property_id)
    data = request.form
    if prop.status == 'verified':
        return jsonify({'error': 'Cannot edit a verified property.'}), 403
    prop.name = data.get('propertyName', prop.name)
    prop.address = data.get('address', prop.address)
    prop.price = float(data.get('price', prop.price))
    prop.size = float(data.get('size', prop.size))
    prop.property_type = data.get('propertyType', prop.property_type)
    prop.bedrooms = int(data.get('bedrooms', prop.bedrooms))
    prop.bathrooms = int(data.get('bathrooms', prop.bathrooms))
    prop.description = data.get('description', prop.description)
    db.session.commit()
    return jsonify({'message': 'Property updated.'}), 200

# === Admin Utilities ===
@app.route('/admin/counts')
def admin_counts():
    pending = SellProperty.query.filter_by(status='pending').count()
    verified = SellProperty.query.filter_by(status='verified').count()
    rejected = SellProperty.query.filter_by(status='rejected').count()
    return jsonify({'pending': pending, 'verified': verified, 'rejected': rejected})

@app.route('/admin/export-csv')
def export_csv():
    properties = SellProperty.query.all()
    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Name', 'Address', 'Price', 'Size', 'Type', 'Bedrooms', 'Bathrooms', 'Status', 'Seller', 'Upload Date'])
    for p in properties:
        cw.writerow([p.id, p.name, p.address, p.price, p.size, p.property_type, p.bedrooms, p.bathrooms, p.status, p.seller.email if p.seller else '', p.created_at.strftime('%Y-%m-%d %H:%M')])
    output = si.getvalue()
    return output, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=listings.csv'
    }

# === Enquiries ===
@app.route('/api/enquiry', methods=['POST'])
def submit_enquiry():
    data = request.json
    enquiry = Enquiry(
        name=data['name'],
        email=data['email'],
        message=data['message'],
        created_at=datetime.utcnow()
    )
    db.session.add(enquiry)
    db.session.commit()
    return jsonify({'success': True}), 201

@app.route('/admin/queries')
def admin_queries():
    queries = Enquiry.query.order_by(Enquiry.created_at.desc()).all()
    return jsonify([
        {
            'id': q.id,
            'user_email': q.email,
            'question': q.message,
            'created_at': q.created_at.strftime('%Y-%m-%d %H:%M')
        } for q in queries
    ])

# === Main Entrypoint ===
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
