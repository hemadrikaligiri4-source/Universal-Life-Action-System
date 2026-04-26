import requests
import json

def test_api():
    api_key = "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"
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "google/gemini-2.0-flash-001",
        "messages": [
            {"role": "user", "content": "Return a JSON object with one key 'test': 'ok'"}
        ],
        "response_format": { "type": "json_object" }
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
