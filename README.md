
# AI-Assisted Real Estate Web Application

## Overview

The **AI-Assisted Real Estate Web Application** is a machine learning-driven platform that helps users predict property prices and receive personalized property recommendations. This application leverages various AI models to analyze real estate data and provide insights for potential buyers and sellers.

- **Technologies Used**: Python, React.js, Flask, XGBoost, scikit-learn, Google Maps API, HuggingFace Transformers, SQLite
- **Purpose**: To streamline property transactions and assist users in making data-driven real estate decisions through AI-powered features.

## Features

1. **User Authentication**: Secure login and registration process for buyers and sellers.
2. **Property Listings**: Users can browse properties for sale or rent, with detailed information and AI-powered price predictions.
3. **AI-Powered Recommendations**: Personalized property recommendations based on user preferences and behavior.
4. **Market Analytics**: Real-time market trends and price analysis for users to make informed decisions.
5. **Property Management (Seller)**: Sellers can list properties, manage their listings, and view market analytics.
6. **Chat and Messaging**: Buyers and sellers can communicate directly through an integrated chat system.

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/AI-Assisted-Real-Estate.git
```

### 2. Set up the Backend
- Navigate to the **backend** directory.
- Create a virtual environment (recommended):
```bash
python -m venv env
```
- Install the required dependencies:
```bash
pip install -r requirements.txt
```

### 3. Set up the Frontend
- Navigate to the **frontend** directory.
- Install **React.js** dependencies:
```bash
npm install
```

### 4. Run the Application
- Start the Flask server from the backend directory:
```bash
python appfinal.py
```
- Start the React development server from the frontend directory:
```bash
npm start
```

### 5. Access the Application
Once both servers are running, open your browser and go to:
```
http://localhost:3000
```

## Usage

1. **Login/Registration**: Users can log in or register by providing their email, username, and selecting a role (Buyer/Seller).
2. **Browse Properties**: Buyers can search and filter properties based on location, price, and type.
3. **AI Predictions**: Property pages display AI-generated price predictions and recommendations for similar properties.
4. **Market Analytics**: Users can view trends and data visualizations about the real estate market.

## Data Sources
The application uses datasets that include real estate listings, market analytics, and user-submitted property data. These datasets are stored in CSV files and are preprocessed for use with machine learning models.

## Machine Learning Models
- **XGBoost** for property price prediction.
- **Random Forest** for feature importance analysis.
- **Sentiment Analysis** on property descriptions using HuggingFace Transformers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Authors

- **Your Name** – *Developer* – [YourGitHub](https://github.com/your-username)

## Acknowledgements

- **Google Maps API** – For location-based features.
- **OpenRouter, Inc** – For AI-powered recommendations and price predictions.
- **scikit-learn**, **XGBoost**, and **HuggingFace** – For machine learning and natural language processing tasks.
