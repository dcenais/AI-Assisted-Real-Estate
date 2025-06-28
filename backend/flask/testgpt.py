import requests
import json

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": "Bearer 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",
    "Content-Type": "application/json",
}

payload = {
    "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
    "messages": [
        {
            "role": "user",
            "content": "What is the meaning of life?"
        }
    ]
}

response = requests.post(url, headers=headers, data=json.dumps(payload))

# Print the response in a readable format
try:
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error decoding response:", e)
    print("Raw response:", response.text)