import requests
import json
import os

class ULASEngine:
    def __init__(self, api_key):
        self.api_key = api_key
        self.url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ulas.system", # Optional, for OpenRouter rankings
            "X-Title": "ULAS Universal Life Action System",
        }

    def analyze(self, sector, query):
        prompt = f"""
        You are the ULAS (Universal Life Action System) Core Engine. 
        Analyze the following request for the {sector} sector: "{query}"
        
        You MUST provide a structured JSON response covering EXACTLY these 7 layers:
        
        1. intent_detection: {{ "classification": "Problem type", "confidence": 0.98 }}
        2. knowledge: {{ "explanation": "Simple explanation of the concept" }}
        3. decision: {{ "best_option": "Recommended action path", "reasoning": "Why this is best" }}
        4. cost_time: {{ 
            "cost": {{ "low": "min value", "high": "max value", "hidden": "possible extra costs", "govt_vs_private": "difference", "chart_data": [low_val, high_val, avg_val] }},
            "time": {{ "min": "days/hours", "avg": "days/hours", "delays": "common issues", "chart_data": [min_val, avg_val, max_val] }},
            "difficulty": "Easy/Medium/Hard"
        }}
        5. execution: {{ "steps": ["Step 1", "Step 2", "Step 3"] }}
        6. resources: {{ "portals": [{{ "name": "Official Site", "url": "link" }}], "apps": [] }}
        7. real_world: {{ 
            "nearby": [
                {{ 
                    "name": "Service Provider Name", 
                    "address": "Approx address", 
                    "rating": 4.8, 
                    "contact": "+91-XXXXX-XXXXX", 
                    "link": "Maps link", 
                    "type": "office/home",
                    "profile_desc": "Highly rated professional service."
                }}
            ],
            "profile_suggestions": [
                {{
                    "name": "Expert Profile",
                    "location": "Nearby Area",
                    "cost": "Estimated Charge",
                    "contact": "Phone/Email",
                    "experience": "Years of experience",
                    "bio": "Brief professional bio"
                }}
            ]
        }}

        Format: Return ONLY valid JSON.
        Context: Provide 3+ detailed profile suggestions based on the user's location. Ensure 'cost' and 'contact' are specific.
        """

        payload = {
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                {"role": "system", "content": "You are a production-grade AI engine for ULAS. Always return structured JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": { "type": "json_object" }
        }

        try:
            response = requests.post(self.url, headers=self.headers, data=json.dumps(payload))
            response.raise_for_status()
            ai_content = response.json()['choices'][0]['message']['content']
            
            # Clean possible markdown formatting
            ai_content = ai_content.strip()
            if ai_content.startswith('```json'):
                ai_content = ai_content[7:-3].strip()
            elif ai_content.startswith('```'):
                ai_content = ai_content[3:-3].strip()
            
            data = json.loads(ai_content)
            
            # Handle list-wrapped responses
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
            
            return data
        except Exception as e:
            print(f"ENGINE ERROR: {str(e)}")
            return {
                "error": str(e),
                "knowledge": {"explanation": "The intelligence engine is currently warming up. Please try again in a moment."},
                "decision": {"best_option": "Waiting...", "reasoning": "System is optimizing."},
                "cost_time": {"cost": {"low": "--", "high": "--", "govt_vs_private": "--"}, "time": {"min": "--", "avg": "--", "delays": "--"}},
                "execution": {"steps": ["Initialization..."]},
                "resources": {"portals": []},
                "real_world": {"nearby": []}
            }

# Testing script (optional)
if __name__ == "__main__":
    engine = ULASEngine("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")
    # result = engine.analyze("Government", "Apply for PAN Card")
    # print(json.dumps(result, indent=2))
