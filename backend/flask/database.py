from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

# Initialize Flask app, SQLAlchemy, and Bcrypt
app = Flask(__name__)

# Set up the SQLite database (make sure this points to the correct file)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/denai/OneDrive/Desktop/real_estate_app/backend/flask/instance/real_estate.db'  # SQLite database file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modifications tracking

# Initialize SQLAlchemy and Bcrypt
db = SQLAlchemy(app)  # Only this instance!
bcrypt = Bcrypt(app)  # Initialize Bcrypt for password hashing

# Define the User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# Define the SellProperty model
class SellProperty(db.Model):
    __tablename__ = 'sellproperties'
    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(100), nullable=False)
    address      = db.Column(db.String(200), nullable=False)
    price        = db.Column(db.Float, nullable=False)
    size         = db.Column(db.Float, nullable=False)
    property_type= db.Column(db.String(100), nullable=False)
    bedrooms     = db.Column(db.Integer, nullable=False)
    bathrooms    = db.Column(db.Integer, nullable=False)
    status       = db.Column(db.String(20), nullable=False, default='pending')
    image_url    = db.Column(db.String(300), nullable=True)
    doc_url      = db.Column(db.String(300), nullable=True)
    seller_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description  = db.Column(db.String(1000), nullable=True)  # <-- Add this line
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)  # <-- Add this line
    listing_type = db.Column(db.String(10), nullable=False, default='sell')  # 'sell' or 'rent'

    seller       = db.relationship('User', backref=db.backref('properties', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'price': self.price,
            'size': self.size,
            'property_type': self.property_type,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'image_url': self.image_url,
            'doc_url': self.doc_url,
            'status': self.status,
            'upload_date': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'seller_email': self.seller.email if self.seller else '',
            'seller_username': self.seller.username if self.seller else '',
        }

# Define the BuyProperty model
class BuyProperty(db.Model):
    __tablename__ = 'buy_properties'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.Float, nullable=False)
    property_type = db.Column(db.String(100), nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    description = db.Column(db.String(1000), nullable=True)
    seller_id = db.Column(db.Integer, nullable=False)  # <-- Add this line

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'price': self.price,
            'size': self.size,
            'property_type': self.property_type,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'image_url': self.image_url,
            'description': self.description,
            'seller_id': self.seller_id,  # <-- Add this line
        }

# Define the RentProperty model
class RentProperty(db.Model):
    __tablename__ = 'rent_properties'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.Float, nullable=False)
    property_type = db.Column(db.String(100), nullable=False)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    description = db.Column(db.String(1000), nullable=True)
    seller_id = db.Column(db.Integer, nullable=False)  # <-- Add this line

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'price': self.price,
            'size': self.size,
            'property_type': self.property_type,
            'bedrooms': self.bedrooms,
            'bathrooms': self.bathrooms,
            'image_url': self.image_url,
            'description': self.description,
            'seller_id': self.seller_id,  # <-- Add this line
        }

class LikedProperty(db.Model):
    __tablename__ = 'liked_properties'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('buy_properties.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'buy' or 'rent'
    user_id = db.Column(db.Integer, nullable=False)  # user_id who liked the property

    # Define relationship to BuyProperty or RentProperty
    property = db.relationship('BuyProperty', backref='liked_properties', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'type': self.type,
            'user_id': self.user_id,
            'property': self.property.to_dict(),
        }

class MarketAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)
    index = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "date": self.date,
            "index": self.index
        }

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    buyer_email = db.Column(db.String(120), nullable=False)
    seller_email = db.Column(db.String(120), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # 'buyer' or 'seller'
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'buyer_email': self.buyer_email,
            'seller_email': self.seller_email,
            'sender': self.sender,
            'message': self.message,
            'timestamp': self.timestamp.isoformat()  # Convert to ISO 8601 string
        }

# Define the Enquiry model
class Enquiry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'created_at': self.created_at.isoformat()  # Convert to ISO 8601 string
        }


# Initialize database and create tables
def create_tables():
    db.create_all()
    print("Tables created successfully.")

# Create the tables in the database
with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
