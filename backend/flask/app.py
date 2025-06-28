from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize Flask app, SQLAlchemy, and Bcrypt
db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)

    # Set up the SQLite database (make sure this points to the correct file)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/denai/OneDrive/Desktop/real_estate_app/backend/flask/instance/real_estate.db'  # SQLite database file
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modifications tracking

    # Initialize the extensions
    db.init_app(app)
    bcrypt.init_app(app)
    
    return app

# Define models
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
        }

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
        }

# Run the app and create tables if not already created
app = create_app()

with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
