from transformers import DistilBertTokenizerFast, DistilBertForQuestionAnswering, Trainer, TrainingArguments
from datasets import Dataset

# Load the pre-trained DistilBERT model and fast tokenizer
tokenizer = DistilBertTokenizerFast.from_pretrained('distilbert-base-uncased')
model = DistilBertForQuestionAnswering.from_pretrained('distilbert-base-uncased')

# Prepare FAQ data
data = [
    {
        "question": "Hi",
        "context": "Hello! How can I assist you today?",
        "answer": "Hello! How can I assist you today?"
    },
    {
        "question": "Hello",
        "context": "Hi there! How can I help you?",
        "answer": "Hi there! How can I help you?"
    },
    {
        "question": "What properties do you have for sale?",
        "context": "We have a wide range of properties for sale, including residential and commercial spaces. You can browse listings by applying filters such as location, price range, and property type.",
        "answer": "We have a wide range of properties for sale, including residential and commercial spaces. You can browse listings by applying filters such as location, price range, and property type."
    },
    {
        "question": "How can I rent a property?",
        "context": "You can rent a property through our platform by browsing listings, applying filters based on your needs, and contacting the agent directly from the listing page.",
        "answer": "You can rent a property through our platform by browsing listings, applying filters based on your needs, and contacting the agent directly from the listing page."
    },
    {
        "question": "What is the price range for properties in my area?",
        "context": "The price range for properties varies depending on the area, size, and type. For example, properties start from RM 300,000 and can go up based on location and features.",
        "answer": "The price range for properties varies depending on the area, size, and type. For example, properties start from RM 300,000 and can go up based on location and features."
    },
    {
        "question": "How do I contact a seller?",
        "context": "You can contact a seller directly via the contact details provided in the property listing. This includes phone numbers, email addresses, and other relevant contact information.",
        "answer": "You can contact a seller directly via the contact details provided in the property listing. This includes phone numbers, email addresses, and other relevant contact information."
    },
    {
        "question": "What are the steps for buying a property?",
        "context": "To buy a property, follow these steps: 1. Browse listings, 2. Filter by your preferences (location, price, etc.), 3. Contact the seller, and 4. Negotiate and finalize the deal.",
        "answer": "To buy a property, follow these steps: 1. Browse listings, 2. Filter by your preferences (location, price, etc.), 3. Contact the seller, and 4. Negotiate and finalize the deal."
    },
    {
        "question": "How do I log in or sign up for the platform?",
        "context": "To log in or sign up, click on the 'Login/Sign Up' button at the top of the page. If you're a new user, click 'Sign Up' to create an account by providing your email and password. If you're a returning user, just log in with your credentials.",
        "answer": "To log in or sign up, click on the 'Login/Sign Up' button at the top of the page. If you're a new user, click 'Sign Up' to create an account by providing your email and password. If you're a returning user, just log in with your credentials."
    },
    {
        "question": "What AI tools are available for real estate predictions?",
        "context": "Our platform offers AI-powered tools to predict property prices, provide recommendations, and analyze market trends. These tools help buyers, sellers, and investors make informed decisions.",
        "answer": "Our platform offers AI-powered tools to predict property prices, provide recommendations, and analyze market trends. These tools help buyers, sellers, and investors make informed decisions."
    },
    {
        "question": "Can I compare properties on this platform?",
        "context": "Yes, you can compare properties side by side using the 'Compare' feature. Select the properties you want to compare, and you will be shown a detailed comparison based on key features such as price, location, size, and more.",
        "answer": "Yes, you can compare properties side by side using the 'Compare' feature. Select the properties you want to compare, and you will be shown a detailed comparison based on key features such as price, location, size, and more."
    },
    {
        "question": "How do I list my property for sale?",
        "context": "To list your property for sale, go to the 'Sell Property' page and provide details such as the property name, address, type, price, and size. You will also need to upload verification documents like the JPPH and LPPEH.",
        "answer": "To list your property for sale, go to the 'Sell Property' page and provide details such as the property name, address, type, price, and size. You will also need to upload verification documents like the JPPH and LPPEH."
    },
    {
        "question": "What documents are required to sell a property?",
        "context": "To sell a property, you must upload documents such as the JPPH (Valuation and Property Services Department) and LPPEH (Board of Valuers, Appraisers, Estate Agents, and Property Managers) for verification.",
        "answer": "To sell a property, you must upload documents such as the JPPH (Valuation and Property Services Department) and LPPEH (Board of Valuers, Appraisers, Estate Agents, and Property Managers) for verification."
    },
    {
        "question": "How can I save my favorite properties?",
        "context": "You can save your favorite properties by clicking on the 'Like' button next to the property listing. These properties will be added to your 'Liked Properties' page, where you can easily revisit them later.",
        "answer": "You can save your favorite properties by clicking on the 'Like' button next to the property listing. These properties will be added to your 'Liked Properties' page, where you can easily revisit them later."
    },
    {
        "question": "How do I find verified properties?",
        "context": "Verified properties are marked with a special badge on the listing page. You can also filter search results to show only verified properties for a more trustworthy browsing experience.",
        "answer": "Verified properties are marked with a special badge on the listing page. You can also filter search results to show only verified properties for a more trustworthy browsing experience."
    },
    {
        "question": "Can I ask AI about property predictions and recommendations?",
        "context": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights based on real-time data and market trends.",
        "answer": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights based on real-time data and market trends."
    },
    {
        "question": "How do I contact customer support?",
        "context": "You can contact customer support through the 'Contact' section of the website. We provide phone numbers, email addresses, and links to our social media profiles for your convenience.",
        "answer": "You can contact customer support through the 'Contact' section of the website. We provide phone numbers, email addresses, and links to our social media profiles for your convenience."
    },
    {
        "question": "What information do I need to provide for property verification?",
        "context": "For property verification, you need to upload documents such as the JPPH (Valuation and Property Services Department) and LPPEH (Board of Valuers, Appraisers, Estate Agents, and Property Managers) for approval.",
        "answer": "For property verification, you need to upload documents such as the JPPH (Valuation and Property Services Department) and LPPEH (Board of Valuers, Appraisers, Estate Agents, and Property Managers) for approval."
    },
    {
        "question": "How do I know if my property is verified?",
        "context": "Your property will be verified once the admin approves the documents you've uploaded. You will be notified once the verification is complete, and your property will appear on the public listings.",
        "answer": "Your property will be verified once the admin approves the documents you've uploaded. You will be notified once the verification is complete, and your property will appear on the public listings."
    },
    {
        "question": "How does the platform ensure property authenticity?",
        "context": "The platform ensures property authenticity by requiring sellers to upload verification documents, which are then reviewed by our admin team before listing the property publicly.",
        "answer": "The platform ensures property authenticity by requiring sellers to upload verification documents, which are then reviewed by our admin team before listing the property publicly."
    },
    {
        "question": "How do I use the 'Ask AI' feature?",
        "context": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights based on real-time data and market trends.",
        "answer": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights based on real-time data and market trends."
    },
    {
        "question": "Can I get recommendations for selling, renting, or buying properties?",
        "context": "Our platform offers AI recommendations for buying, selling, and renting properties. Based on your search, it provides personalized suggestions to help you make better decisions.",
        "answer": "Our platform offers AI recommendations for buying, selling, and renting properties. Based on your search, it provides personalized suggestions to help you make better decisions."
    },
    {
        "question": "How does the platform handle user data securely?",
        "context": "We take data security seriously. Our platform uses encryption and security protocols to protect your personal and payment information during login, transactions, and property listings.",
        "answer": "We take data security seriously. Our platform uses encryption and security protocols to protect your personal and payment information during login, transactions, and property listings."
    },
    {
        "question": "How do I use the 'Ask AI' feature?",
        "context": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights.",
        "answer": "The 'Ask AI' feature allows you to ask the platform's AI system for property recommendations, market predictions, and other insights."
    },
    {
        "question": "How can I rent a property?",
        "context": "You can rent a property through our platform by browsing listings, applying filters based on your needs, and contacting the agent directly from the listing page.",
        "answer": "You can rent a property through our platform by browsing listings, applying filters based on your needs, and contacting the agent directly from the listing page."
    }
    # Add more examples as needed
]

def preprocess(example):
    # Find answer start/end in context
    answer = example['answer']
    context = example['context']
    start_char = context.find(answer)
    end_char = start_char + len(answer)

    # Tokenize
    encoding = tokenizer(
        example['question'],
        context,
        truncation="only_second",
        padding="max_length",
        max_length=256,
        return_offsets_mapping=True,
        return_tensors='pt'
    )

    # Find start/end token indices
    offsets = encoding['offset_mapping'][0]
    start_token = end_token = None
    for idx, (start, end) in enumerate(offsets):
        if start <= start_char < end:
            start_token = idx
        if start < end_char <= end:
            end_token = idx
    if start_token is None:
        start_token = 0
    if end_token is None:
        end_token = 0

    return {
        'input_ids': encoding['input_ids'][0],
        'attention_mask': encoding['attention_mask'][0],
        'start_positions': start_token,
        'end_positions': end_token
    }

# Convert to Dataset and preprocess
dataset = Dataset.from_list(data)
dataset = dataset.map(preprocess)

# Training
trainer = Trainer(
    model=model,
    args=TrainingArguments(
        output_dir='./results',
        learning_rate=2e-5,
        per_device_train_batch_size=2,
        num_train_epochs=2,
        weight_decay=0.01,
    ),
    train_dataset=dataset,
    tokenizer=tokenizer,
)

trainer.train()

model.save_pretrained("./fine_tuned_distilbert")
tokenizer.save_pretrained("./fine_tuned_distilbert")
print("Fine-tuning completed and model saved!")

