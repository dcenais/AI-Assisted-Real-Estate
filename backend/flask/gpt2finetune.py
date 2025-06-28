from transformers import GPT2Tokenizer, GPTNeoForCausalLM, Trainer, TrainingArguments
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import datasets

# Step 1: Load and preprocess the dataset
df = pd.read_csv('backend/cleaned_real_estate_data.csv')

# Strip any whitespace in column names
df.columns = df.columns.str.strip()

# Check the columns to ensure that 'Property type' is present
print("Columns in the dataset:", df.columns)

# Feature columns from your ML model
features_num = [
    'Bedroom(s)_clean', 
    'Bathroom(s)_clean', 
    'Builtup_area_capped', 
    'CarParks_capped', 
    'price_per_sqft',
    'location_score_capped'
]

# Categorical features
features_cat = ['Lot type', 'Property type']

# Target variable
target = 'Price_capped'

# Drop rows with missing values in numerical or target columns
df_model = df.dropna(subset=features_num + [target])

# One-hot encode categorical variables
df_encoded = pd.get_dummies(df_model[features_cat], drop_first=True)

# Combine numerical and categorical features
X = pd.concat([df_model[features_num].reset_index(drop=True), df_encoded.reset_index(drop=True)], axis=1)
y = df_model[target]

# Scale numerical features
scaler = StandardScaler()
X[features_num] = scaler.fit_transform(X[features_num])

# Define the dataset for GPT-2
df_model["input"] = (
    "Property with " +
    df_model['Bedroom(s)_clean'].astype(str) + " bedrooms, " +
    df_model['Bathroom(s)_clean'].astype(str) + " bathrooms, " +
    df_model['Builtup_area_capped'].astype(str) + " sqft built-up area, " +
    "and " + df_model['CarParks_capped'].astype(str) + " carparks of type " +
    df_model['Property type'].astype(str) + "."
)

df_model["output"] = y.astype(str)  # Price as string for text generation

# Convert pandas dataframe to Hugging Face dataset
dataset = datasets.Dataset.from_pandas(df_model[["input", "output"]])

# Step 2: Preprocess the dataset for GPT-Neo
tokenizer = GPT2Tokenizer.from_pretrained("EleutherAI/gpt-neo-1.3B")

# Set pad_token to eos_token (since GPT-2/GPT-Neo does not have a pad_token)
tokenizer.pad_token = tokenizer.eos_token

def preprocess_function(examples):
    inputs = examples["input"]
    targets = examples["output"]

    # Tokenize inputs and targets with padding to max length 512
    model_inputs = tokenizer(inputs, max_length=512, padding='max_length', truncation=True)
    labels = tokenizer(targets, max_length=512, padding='max_length', truncation=True)

    # Set the labels correctly for causal language modeling (GPT-2 / GPT-Neo)
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Apply preprocessing to the dataset
tokenized_dataset = dataset.map(preprocess_function, batched=True)

# Step 3: Split the dataset into training and validation sets
train_test_split = tokenized_dataset.train_test_split(test_size=0.2)
train_dataset = train_test_split["train"]
val_dataset = train_test_split["test"]

# Step 4: Load the pre-trained GPT-Neo model
model = GPTNeoForCausalLM.from_pretrained("EleutherAI/gpt-neo-1.3B")

# Step 5: Define training arguments
training_args = TrainingArguments(
    output_dir="./results",  # Output directory to save the model
    learning_rate=2e-5,  # Learning rate
    per_device_train_batch_size=4,  # Reduced batch size for training
    per_device_eval_batch_size=4,  # Reduced batch size for evaluation
    num_train_epochs=3,  # Number of training epochs
    weight_decay=0.01,  # Weight decay for regularization
    logging_dir='./logs',  # Directory for logging
    logging_steps=10,  # Log metrics every 10 steps
    gradient_accumulation_steps=2,  # Gradient accumulation for larger batch sizes
    no_cuda=False  # Use CPU if no GPU is available
)

# Step 6: Define the Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
)

# Step 7: Fine-tune the pre-trained model
trainer.train()

# Step 8: Save the model and tokenizer
model.save_pretrained("./gptneo_finetuned")
tokenizer.save_pretrained("./gptneo_finetuned")

print("Fine-tuning GPT-Neo completed and model saved.")
