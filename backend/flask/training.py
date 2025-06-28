import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import PolynomialFeatures
from math import sqrt
import joblib
import json

# Load cleaned dataset with location score feature
df = pd.read_csv('backend/cleaned_real_estate_data.csv')

# Define numerical features including the new location_score_capped
features_num = [
    'Bedroom(s)_clean', 
    'Bathroom(s)_clean', 
    'Builtup_area_capped', 
    'CarParks_capped', 
    'price_per_sqft',
    'location_score_capped'  # <-- New feature added here
]

# Categorical features (unchanged)
features_cat = ['Lot type', 'Property type']

target = 'Price_capped'

# Drop rows with missing numerical features or target
df_model = df.dropna(subset=features_num + [target])

# One-hot encode categorical variables
df_encoded = pd.get_dummies(df_model[features_cat], drop_first=True)

# Combine numerical and categorical features
X = pd.concat([df_model[features_num].reset_index(drop=True), df_encoded.reset_index(drop=True)], axis=1)
y = df_model[target]

# Scale numerical features only
scaler = StandardScaler()
X[features_num] = scaler.fit_transform(X[features_num])

# Add polynomial features to capture non-linear relationships
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X[features_num])

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_poly, y, test_size=0.2, random_state=42)

# Evaluation function
def evaluate_model(y_true, y_pred, model_name):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"--- {model_name} Performance ---")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R^2 Score: {r2:.4f}\n")

# Cross-validation with Random Forest (GridSearchCV)
rf = RandomForestRegressor(random_state=42)
rf_params = {
    'n_estimators': [100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}

# Use 5-fold cross-validation instead of 3-fold
rf_grid = GridSearchCV(rf, rf_params, cv=5, n_jobs=-1, verbose=1)
rf_grid.fit(X_train, y_train)
print("Best RF params:", rf_grid.best_params_)
rf_best = rf_grid.best_estimator_
rf_preds = rf_best.predict(X_test)
evaluate_model(y_test, rf_preds, "Tuned Random Forest with Cross-Validation")

# Cross-validation with XGBoost (GridSearchCV)
xgb = XGBRegressor(random_state=42, verbosity=0)
xgb_params = {
    'n_estimators': [100, 200],
    'max_depth': [3, 6, 10],
    'learning_rate': [0.1, 0.05]
}

# Use 5-fold cross-validation instead of 3-fold
xgb_grid = GridSearchCV(xgb, xgb_params, cv=5, n_jobs=-1, verbose=1)
xgb_grid.fit(X_train, y_train)
print("Best XGB params:", xgb_grid.best_params_)
xgb_best = xgb_grid.best_estimator_
xgb_preds = xgb_best.predict(X_test)
evaluate_model(y_test, xgb_preds, "Tuned XGBoost with Cross-Validation")

# Linear Regression for comparison
lr = LinearRegression()
lr.fit(X_train, y_train)
lr_preds = lr.predict(X_test)
evaluate_model(y_test, lr_preds, "Linear Regression")

# Save models, scaler, and one-hot columns list
joblib.dump(rf_best, 'rf_model_cleaned_with_cv.joblib')
joblib.dump(xgb_best, 'xgb_model_cleaned_with_cv.joblib')
joblib.dump(scaler, 'scaler_cleaned_with_cv.joblib')

one_hot_columns = list(df_encoded.columns)
with open('one_hot_columns_with_cv.json', 'w') as f:
    json.dump(one_hot_columns, f)

print("Models, scaler, and one-hot columns saved successfully!")
