import json
import re
import time
from config import Config
from typing import Dict, Any

try:
    from google import genai as new_genai
except Exception:
    new_genai = None

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.client = None
        self.legacy_model = None
        self.provider = None
        self.model_name = "gemini-2.5-flash"

        if not Config.GEMINI_API_KEY:
            print("[GeminiService] GEMINI_API_KEY not set. AI endpoints will return an error.")
            return

        if new_genai is not None:
            self.client = new_genai.Client(api_key=Config.GEMINI_API_KEY)
            self.provider = "new"
            return

        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=Config.GEMINI_API_KEY)
            self.legacy_model = legacy_genai.GenerativeModel("gemini-1.5-flash")
            self.provider = "legacy"
            return
        except Exception:
            pass

        print("[GeminiService] No Gemini SDK installed. Install google-genai or google-generativeai.")
    
    def _clean_json_response(self, response_text: str) -> str:
        """Clean and extract JSON from response"""
        # Remove markdown code blocks if present
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*', '', response_text)
        return response_text.strip()
    
    def _parse_json_response(self, response_text: str) -> Dict[Any, Any]:
        """Parse JSON from response text"""
        cleaned = self._clean_json_response(response_text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Raw response: {cleaned[:500]}")
            return {"error": "Failed to parse response", "raw": cleaned}
    
    def _generate(self, prompt: str, retries: int = 3) -> str:
        """Generate content using Gemini API with retry logic"""
        if self.provider is None:
            raise RuntimeError(
                "Gemini SDK not configured. Install google-genai or google-generativeai and set GEMINI_API_KEY."
            )

        last_error = None
        for attempt in range(retries):
            try:
                if self.provider == "new":
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt
                    )
                    return response.text

                response = self.legacy_model.generate_content(prompt)
                return response.text
            except Exception as e:
                last_error = e
                error_str = str(e)
                print(f"Gemini API error (attempt {attempt + 1}/{retries}): {error_str}")
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                    wait_time = 30 * (attempt + 1)
                    print(f"Rate limited. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    raise e
        
        raise last_error if last_error else Exception("Failed after retries")
    
    async def get_destination_info(self, destination: str) -> Dict[Any, Any]:
        """Get detailed information about a tourist destination"""
        prompt = f"""
        Provide detailed tourist information about {destination} in JSON format.
        Include the following fields:
        {{
            "name": "destination name",
            "country": "country name",
            "description": "brief description (2-3 sentences)",
            "climate": "climate description",
            "best_seasons": ["list of best seasons to visit"],
            "estimated_daily_cost": {{
                "budget": "estimated cost in USD for budget travelers",
                "mid_range": "estimated cost in USD for mid-range travelers",
                "luxury": "estimated cost in USD for luxury travelers"
            }},
            "top_attractions": ["list of 5-7 top attractions"],
            "local_cuisine": ["list of 5 famous local dishes"],
            "cultural_significance": "cultural importance and history",
            "unique_experiences": ["list of 5 unique experiences"],
            "accessibility": "accessibility information for travelers",
            "safety_rating": "safety level (1-10)",
            "tourist_friendliness": "how tourist-friendly the destination is"
        }}
        Return ONLY valid JSON, no additional text.
        """
        
        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {"error": str(e)}
    
    async def compare_destinations(
        self, 
        dest1: str, 
        dest2: str, 
        preferences: Dict[str, Any]
    ) -> Dict[Any, Any]:
        """Compare two destinations based on user preferences"""
        prompt = f"""
        You are an expert travel advisor. Compare these two tourist destinations based on the user's preferences.
        
        Destination 1: {dest1}
        Destination 2: {dest2}
        
        User Preferences:
        - Budget: {preferences.get('budget', 'medium')}
        - Travel Duration: {preferences.get('travel_duration', 7)} days
        - Interests: {', '.join(preferences.get('interests', ['general tourism']))}
        - Preferred Season: {preferences.get('season', 'any')}
        - Travel Type: {preferences.get('travel_type', 'solo')}
        - Accessibility Needs: {preferences.get('accessibility_needs', 'none')}
        
        Provide a comprehensive comparison in the following JSON format:
        {{
            "destination1": {{
                "name": "{dest1}",
                "scores": {{
                    "budget_match": 0-10,
                    "weather_suitability": 0-10,
                    "attractions_match": 0-10,
                    "accessibility": 0-10,
                    "unique_experiences": 0-10,
                    "safety": 0-10
                }},
                "total_score": 0-60,
                "pros": ["list of 3-4 advantages"],
                "cons": ["list of 2-3 disadvantages"],
                "estimated_total_cost": "estimated total trip cost in USD",
                "best_time_to_visit": "best time based on preferences",
                "highlights": ["3 must-do activities"]
            }},
            "destination2": {{
                "name": "{dest2}",
                "scores": {{
                    "budget_match": 0-10,
                    "weather_suitability": 0-10,
                    "attractions_match": 0-10,
                    "accessibility": 0-10,
                    "unique_experiences": 0-10,
                    "safety": 0-10
                }},
                "total_score": 0-60,
                "pros": ["list of 3-4 advantages"],
                "cons": ["list of 2-3 disadvantages"],
                "estimated_total_cost": "estimated total trip cost in USD",
                "best_time_to_visit": "best time based on preferences",
                "highlights": ["3 must-do activities"]
            }},
            "recommendation": {{
                "winner": "name of recommended destination",
                "reasoning": "detailed explanation (3-4 sentences) of why this destination is better suited for the user",
                "key_deciding_factors": ["list of 3 main factors that led to this recommendation"]
            }}
        }}
        
        Consider all user preferences carefully and provide honest, helpful recommendations.
        Return ONLY valid JSON, no additional text.
        """
        
        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {"error": str(e)}
    
    async def generate_itinerary(
        self, 
        destination: str, 
        preferences: Dict[str, Any]
    ) -> Dict[Any, Any]:
        """Generate a personalized day-wise travel itinerary"""
        duration = preferences.get('travel_duration', 7)
        budget = preferences.get('budget', 'medium')
        interests = preferences.get('interests', ['general tourism'])
        travel_type = preferences.get('travel_type', 'solo')
        
        prompt = f"""
        Create a detailed {duration}-day travel itinerary for {destination}.
        
        User Preferences:
        - Budget Level: {budget}
        - Interests: {', '.join(interests)}
        - Travel Type: {travel_type}
        - Duration: {duration} days
        
        Generate a comprehensive itinerary in the following JSON format:
        {{
            "destination": "{destination}",
            "duration_days": {duration},
            "overview": "Brief trip overview (2-3 sentences)",
            "best_time_to_visit": "recommended time to visit",
            "days": [
                {{
                    "day_number": 1,
                    "title": "Day theme/title",
                    "morning": {{
                        "activity": "activity description",
                        "location": "specific location/attraction",
                        "duration": "estimated time",
                        "tips": "helpful tip"
                    }},
                    "afternoon": {{
                        "activity": "activity description",
                        "location": "specific location/attraction",
                        "duration": "estimated time",
                        "tips": "helpful tip"
                    }},
                    "evening": {{
                        "activity": "activity description",
                        "location": "specific location/attraction",
                        "duration": "estimated time",
                        "tips": "helpful tip"
                    }},
                    "meals": {{
                        "breakfast": "restaurant/food recommendation",
                        "lunch": "restaurant/food recommendation",
                        "dinner": "restaurant/food recommendation"
                    }},
                    "estimated_daily_cost": "cost in USD"
                }}
            ],
            "total_estimated_cost": "total trip cost in USD",
            "packing_list": ["list of 8-10 essential items to pack"],
            "important_tips": ["list of 5-6 important travel tips"],
            "local_phrases": [
                {{"phrase": "local greeting", "meaning": "English meaning"}},
                {{"phrase": "thank you in local language", "meaning": "Thank you"}}
            ],
            "emergency_contacts": {{
                "police": "emergency number",
                "ambulance": "emergency number",
                "tourist_helpline": "tourist helpline if available"
            }}
        }}
        
        Make the itinerary realistic, practical, and aligned with the user's interests and budget.
        Include specific place names, restaurants, and activities.
        Return ONLY valid JSON, no additional text.
        """
        
        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {"error": str(e)}
    
    async def get_destination_highlights(self, destination: str) -> Dict[Any, Any]:
        """Get special highlights and unique features of a destination"""
        prompt = f"""
        Provide the special highlights and unique features of {destination} as a tourist destination.
        
        Return the information in the following JSON format:
        {{
            "destination": "{destination}",
            "tagline": "catchy tagline for the destination",
            "cultural_highlights": {{
                "history": "brief historical significance",
                "traditions": ["list of 3-4 unique traditions"],
                "festivals": ["list of 3 major festivals with brief descriptions"],
                "art_and_architecture": "notable art and architectural features"
            }},
            "famous_attractions": [
                {{
                    "name": "attraction name",
                    "description": "brief description",
                    "why_visit": "why it's special",
                    "best_time": "best time to visit"
                }}
            ],
            "culinary_experiences": {{
                "must_try_dishes": ["list of 5 must-try local dishes with descriptions"],
                "food_markets": ["list of 2-3 famous food markets"],
                "dining_experiences": ["list of 2-3 unique dining experiences"]
            }},
            "exclusive_experiences": [
                {{
                    "experience": "unique experience name",
                    "description": "what makes it special",
                    "best_for": "type of traveler it suits"
                }}
            ],
            "hidden_gems": ["list of 3-4 lesser-known attractions"],
            "photo_spots": ["list of 4-5 best photography locations"],
            "local_tips": ["list of 5 insider tips from locals"]
        }}
        
        Return ONLY valid JSON, no additional text.
        """
        
        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {"error": str(e)}

# Create singleton instance
gemini_service = GeminiService()
