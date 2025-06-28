import pandas as pd
from app import create_app, db  # Ensure you're importing the app object correctly
from database import BuyProperty, RentProperty

# Read Buy Properties CSV file
buy_df = pd.read_csv('backend/cleaned_real_estate_data_with_image_urls.csv')

# Read Rent Properties CSV file
rent_df = pd.read_csv('backend/cleaned_real_estate_rent_data_with_image_urls.csv')

# Handle missing property_type values
buy_df['Property type'] = buy_df['Property type'].fillna('Unknown')  # Fill NaN with 'Unknown'
rent_df['Property type'] = rent_df['Property type'].fillna('Unknown')  # Fill NaN with 'Unknown'

# Function to add buy properties
def add_buy_properties():
    app = create_app()
    with app.app_context():
        for index, row in buy_df.iterrows():
            property = BuyProperty(
                name=row['Propertyname_name'],
                address=row['Propertyname_address'],
                price=row['Propertyname_price'],
                size=row['Built-up area'],
                property_type=row['Property type'],  # Now has no NaN
                bedrooms=row['Bedroom(s)'],
                bathrooms=row['Bathroom(s)'],
                image_url=row['Propertyname_imageurl'],
                description=row['Propertyname_description']
            )
            db.session.add(property)
        db.session.commit()
        print(f"{len(buy_df)} Buy properties added to the database.")

# Function to add rent properties
def add_rent_properties():
    app = create_app()
    with app.app_context():
        for index, row in rent_df.iterrows():
            property = RentProperty(
                name=row['Propertyname_name'],
                address=row['Propertyname_address'],
                price=row['Propertyname_price'],
                size=row['Built-up area'],
                property_type=row['Property type'],  # Now has no NaN
                bedrooms=row['Bedroom(s)'],
                bathrooms=row['Bathroom(s)'],
                image_url=row['Propertyname_imageurl'],
                description=row['Propertyname_description']
            )
            db.session.add(property)
        db.session.commit()
        print(f"{len(rent_df)} Rent properties added to the database.")

# Call the functions to add the data
add_buy_properties()
add_rent_properties()
