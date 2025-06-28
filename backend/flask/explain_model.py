import joblib
import shap
import pandas as pd
import numpy as np
import json
from typing import List, Tuple

def load_resources(model_path: str, scaler_path: str, columns_path: str):
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        with open(columns_path, 'r') as f:
            one_hot_columns = json.load(f)
        return model, scaler, one_hot_columns
    except Exception as e:
        print(f"Error loading resources: {e}")
        raise

def prepare_features(input_data: dict, scaler, one_hot_columns: List[str], features_num: List[str], features_cat: List[str]):
    # Prepare numerical features
    num_values = [input_data.get(f, 0) or 0 for f in features_num]
    num_df = pd.DataFrame([num_values], columns=features_num)
    num_scaled = scaler.transform(num_df)

    # Prepare categorical features
    cat_dict = {f: input_data.get(f, '') or '' for f in features_cat}
    cat_df = pd.DataFrame([cat_dict])
    cat_encoded = pd.get_dummies(cat_df)

    # Ensure all expected columns are present
    for col in one_hot_columns:
        if col not in cat_encoded.columns:
            cat_encoded[col] = 0
    cat_encoded = cat_encoded[one_hot_columns]

    # Combine numerical and categorical features
    X = np.concatenate([num_scaled, cat_encoded.values], axis=1)
    return X

def explain_prediction(model, scaler, one_hot_columns, input_data: dict, features_num: List[str], features_cat: List[str]) -> List[Tuple[str, float]]:
    try:
        X = prepare_features(input_data, scaler, one_hot_columns, features_num, features_cat)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        feature_names = features_num + one_hot_columns
        feature_contrib = dict(zip(feature_names, shap_values[0]))
        sorted_features = sorted(feature_contrib.items(), key=lambda x: abs(x[1]), reverse=True)
        return sorted_features
    except Exception as e:
        print(f"SHAP explanation error: {e}")
        return []

def format_explanation(shap_values: List[Tuple[str, float]], top_n: int = 5) -> List[str]:
    explanations = []
    for feat, val in shap_values[:top_n]:
        feat_readable = feat.replace('_', ' ').replace('Builtup area capped', 'Built-up area').capitalize()
        direction = "increased" if val > 0 else "decreased"
        amount = abs(val)
        explanations.append(f"{feat_readable} {direction} the predicted price by RM {amount:,.2f}.")
    return explanations

if __name__ == "__main__":
    model_path = 'xgb_model_cleaned.joblib'
    scaler_path = 'scaler_cleaned.joblib'
    columns_path = 'one_hot_columns.json'

    # IMPORTANT: Include location_score_capped here!
    features_num = [
        'Bedroom(s)_clean', 
        'Bathroom(s)_clean', 
        'Builtup_area_capped', 
        'CarParks_capped', 
        'price_per_sqft',
        'location_score_capped'   # <--- Added here
    ]
    features_cat = ['Lot type', 'Property type']

    model, scaler, one_hot_columns = load_resources(model_path, scaler_path, columns_path)

    sample_input = {
        "Bedroom(s)_clean": 4,
        "Bathroom(s)_clean": 3,
        "Builtup_area_capped": 2200,
        "CarParks_capped": 2,
        "price_per_sqft": 350,
        "location_score_capped": 0.95,  # example location score
        "Lot type": "Terrace",
        "Property type": "Condominium"
    }

    explanation = explain_prediction(model, scaler, one_hot_columns, sample_input, features_num, features_cat)
    explanations_formatted = format_explanation(explanation)

    print("Top feature contributions to prediction:")
    for feat, val in explanation[:10]:
        print(f"{feat}: {val:.2f}")

    print("\nUser-friendly explanation:")
    for line in explanations_formatted:
        print(line)
