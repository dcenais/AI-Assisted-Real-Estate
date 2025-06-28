import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import re

# Load dataset
df = pd.read_csv('backend/combined_fixed_dataset.csv')

# Existing cleaning functions...

def clean_bedrooms(value):
    if pd.isnull(value):
        return np.nan
    numbers = re.findall(r'\d+', str(value))
    if not numbers:
        return np.nan
    return sum(int(num) for num in numbers)

df['Bedroom(s)_clean'] = df['Bedroom(s)'].apply(clean_bedrooms)

def clean_price(value):
    try:
        return float(str(value).replace(',', '').strip())
    except:
        return np.nan

df['Price_clean'] = df['Propertyname_price'].apply(clean_price)

def clean_bathrooms(value):
    if pd.isnull(value):
        return np.nan
    match = re.search(r'\d+', str(value))
    if match:
        return int(match.group())
    return np.nan

df['Bathroom(s)_clean'] = df['Bathroom(s)'].apply(clean_bathrooms)

def clean_builtup_area(value):
    if pd.isnull(value):
        return np.nan
    numbers = re.findall(r'\d+', str(value).replace(',', ''))
    if not numbers:
        return np.nan
    return int(''.join(numbers))

df['Builtup_area_clean'] = df['Built-up area'].apply(clean_builtup_area)

def clean_carparks(value):
    if pd.isnull(value):
        return np.nan
    match = re.search(r'\d+', str(value))
    if match:
        return int(match.group())
    return np.nan

df['CarParks_clean'] = df['Car Parks'].apply(clean_carparks)

# --- Location Scoring Section ---

# Mapping of Malaysian states to normalized HDI score (0.7 - 1.0 scale)
state_hdi_scores = {
    "Kuala Lumpur": 1.00,
    "Putrajaya": 1.00,
    "Labuan": 0.90,
    "Penang": 0.95,
    "Selangor": 0.95,
    "Malacca": 0.90,
    "Negeri Sembilan": 0.90,
    "Sarawak": 0.90,
    "Pahang": 0.85,
    "Johor": 0.90,
    "Perak": 0.85,
    "Terengganu": 0.85,
    "Kedah": 0.85,
    "Perlis": 0.80,
    "Sabah": 0.85,
    "Kelantan": 0.80,
}

# City multipliers for prime cities
city_multipliers = {
    "KL City Centre": 1.00,
    "Mont Kiara": 1.00,
    "Bangsar": 1.00,
    "Damansara": 1.00,
    "Putrajaya": 1.00,
    "Labuan Town": 0.90,
    "George Town": 0.95,
    "Bayan Lepas": 0.95,
    "Petaling Jaya": 0.95,
    "Shah Alam": 0.95,
    "Subang Jaya": 0.95,
    "Klang": 0.95,
    "Puchong": 0.95,
    "Melaka City": 0.90,
    "Seremban": 0.90,
    "Port Dickson": 0.90,
    "Kuching": 0.90,
    "Miri": 0.90,
    "Kuantan": 0.85,
    "Johor Bahru": 0.90,
    "Iskandar Puteri": 0.90,
    "Ipoh": 0.85,
    "Kuala Terengganu": 0.85,
    "Alor Setar": 0.85,
    "Kangar": 0.80,
    "Kota Kinabalu": 0.85,
    "Sandakan": 0.85,
    "Kota Bharu": 0.80,
}

def extract_state_city(location_str):
    # Split by comma and strip whitespace
    parts = [x.strip() for x in str(location_str).split(',')]
    # State is assumed to be the last element
    state = parts[-1] if len(parts) > 0 else None
    # City is second last if exists
    city = parts[-2] if len(parts) > 1 else None
    return state, city

# Extract state and city columns
df['state'], df['city'] = zip(*df['Propertyname_location'].apply(extract_state_city))

# Map HDI scores and city multipliers; fallback to 0.8 if missing
df['state_score'] = df['state'].map(state_hdi_scores).fillna(0.8)
df['city_multiplier'] = df['city'].map(city_multipliers).fillna(0.8)

# Calculate combined location score
df['location_score'] = df['state_score'] * df['city_multiplier']

# --- Continue with previous cleaning and imputations ---

print("Missing values per column:")
print(df[['Bedroom(s)_clean', 'Bathroom(s)_clean', 'Price_clean', 'Builtup_area_clean', 'CarParks_clean', 'location_score']].isnull().sum())

print("\nSummary statistics:")
print(df[['Bedroom(s)_clean', 'Bathroom(s)_clean', 'Price_clean', 'Builtup_area_clean', 'CarParks_clean', 'location_score']].describe())

# For safety, convert to numeric if not done
df['Price_clean'] = pd.to_numeric(df['Price_clean'], errors='coerce')
df['Builtup_area_clean'] = pd.to_numeric(df['Builtup_area_clean'], errors='coerce')
df['CarParks_clean'] = pd.to_numeric(df['CarParks_clean'], errors='coerce')
df['location_score'] = pd.to_numeric(df['location_score'], errors='coerce')

# Impute missing built-up area and car parks with median
builtup_median = df['Builtup_area_clean'].median()
carparks_median = df['CarParks_clean'].median()
location_median = df['location_score'].median()

df['Builtup_area_clean'] = df['Builtup_area_clean'].fillna(builtup_median)
df['CarParks_clean'] = df['CarParks_clean'].fillna(carparks_median)
df['location_score'] = df['location_score'].fillna(location_median)

print(f"Median Built-up area used for imputation: {builtup_median}")
print(f"Median Car Parks used for imputation: {carparks_median}")
print(f"Median Location score used for imputation: {location_median}")

# Define capping function using 1st and 99th percentiles
def cap_outliers(series):
    lower = series.quantile(0.01)
    upper = series.quantile(0.99)
    return series.clip(lower, upper)

# Cap outliers
df['Price_capped'] = cap_outliers(df['Price_clean'])
df['Builtup_area_capped'] = cap_outliers(df['Builtup_area_clean'])
df['CarParks_capped'] = cap_outliers(df['CarParks_clean'])

# Cap location score as well (optional, capped between 0.7 and 1.0)
df['location_score_capped'] = df['location_score'].clip(lower=0.7, upper=1.0)

# Remove properties with built-up area above 99th percentile threshold
upper_builtup = df['Builtup_area_clean'].quantile(0.99)
df = df[df['Builtup_area_clean'] <= upper_builtup]
print(f"Removed properties with Built-up area above {upper_builtup}")

# Create price_per_sqft feature
df['price_per_sqft'] = df['Price_capped'] / df['Builtup_area_capped']

print("\nSummary statistics after cleaning and capping:")
print(df[['Price_capped', 'Builtup_area_capped', 'CarParks_capped', 'location_score_capped', 'price_per_sqft']].describe())

print(f"\nNumber of properties after cleaning: {df.shape[0]}")

# Save cleaned DataFrame to CSV
df.to_csv('cleaned_real_estate_data.csv', index=False)

# --- Visualization and Statistical Analysis Section ---

import matplotlib.pyplot as plt
import seaborn as sns

# 1. Statistical Summaries
print("\nDescriptive statistics for key features:")
print(df[['Price_capped', 'Builtup_area_capped', 'CarParks_capped', 'location_score_capped', 'price_per_sqft']].describe())

# 2. Histograms
plt.figure(figsize=(8, 4))
df['Price_capped'].hist(bins=50)
plt.title('Price Distribution')
plt.xlabel('Price')
plt.ylabel('Frequency')
plt.show()

plt.figure(figsize=(8, 4))
df['Builtup_area_capped'].hist(bins=50)
plt.title('Built-up Area Distribution')
plt.xlabel('Built-up Area')
plt.ylabel('Frequency')
plt.show()

# 3. Box Plots (for outlier detection)
plt.figure(figsize=(8, 2))
sns.boxplot(x=df['Price_capped'])
plt.title('Boxplot of Price')
plt.show()

plt.figure(figsize=(8, 2))
sns.boxplot(x=df['Builtup_area_capped'])
plt.title('Boxplot of Built-up Area')
plt.show()

# 4. Scatter Plot (Price vs Built-up Area)
plt.figure(figsize=(6, 6))
plt.scatter(df['Builtup_area_capped'], df['Price_capped'], alpha=0.5)
plt.title('Price vs Built-up Area')
plt.xlabel('Built-up Area')
plt.ylabel('Price')
plt.show()

# 5. Correlation Heatmap
plt.figure(figsize=(6, 4))
corr = df[['Price_capped', 'Builtup_area_capped', 'CarParks_capped', 'location_score_capped', 'price_per_sqft']].corr()
sns.heatmap(corr, annot=True, cmap='coolwarm')
plt.title('Correlation Heatmap')
plt.show()

# 6. Outlier Detection using Z-score
from scipy.stats import zscore
z_scores = zscore(df[['Price_capped', 'Builtup_area_capped']])
outliers = (abs(z_scores) > 3).any(axis=1)
print(f"Number of outliers (z-score > 3): {outliers.sum()}")
