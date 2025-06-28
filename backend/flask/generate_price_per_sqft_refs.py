import pandas as pd
import json

# Load your cleaned dataset (make sure 'price_per_sqft', 'state', 'city' columns exist)
df = pd.read_csv('cleaned_real_estate_data.csv')

# Check columns
print(df[['price_per_sqft', 'state', 'city']].head())

# Calculate average price_per_sqft by state
avg_price_per_sqft_by_state = df.groupby('state')['price_per_sqft'].mean().to_dict()

# Calculate average price_per_sqft by city
avg_price_per_sqft_by_city = df.groupby('city')['price_per_sqft'].mean().to_dict()

# Save as JSON
with open('avg_price_per_sqft_by_state.json', 'w') as f:
    json.dump(avg_price_per_sqft_by_state, f)

with open('avg_price_per_sqft_by_city.json', 'w') as f:
    json.dump(avg_price_per_sqft_by_city, f)

print("Saved avg_price_per_sqft_by_state.json and avg_price_per_sqft_by_city.json")
