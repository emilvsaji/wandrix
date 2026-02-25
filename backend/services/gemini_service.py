import json
import logging
import re
import time
import warnings
from typing import Any, Dict, List, Optional

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning, module="google")

import google.generativeai as genai
from google.api_core.exceptions import NotFound, ResourceExhausted, GoogleAPICallError

from config import Config


logger = logging.getLogger(__name__)


class GeminiService:
    """Service for interacting with Gemini using google-generativeai SDK."""

    PREFERRED_MODELS = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest",
    ]

    def __init__(self):
        self.model_name: Optional[str] = None
        self.model = None

        if not Config.GEMINI_API_KEY:
            logger.warning("[GeminiService] GEMINI_API_KEY is not configured.")
            return

        try:
            genai.configure(api_key=Config.GEMINI_API_KEY)
            self.model_name = self._select_supported_model()
            if self.model_name:
                self.model = genai.GenerativeModel(self.model_name)
                logger.info("[GeminiService] Initialized model: %s", self.model_name)
            else:
                logger.error("[GeminiService] No generateContent-compatible Gemini model found.")
        except Exception as exc:
            logger.exception("[GeminiService] Initialization failed: %s", exc)
            self.model = None
            self.model_name = None

    def debug_list_available_models(self) -> List[Dict[str, Any]]:
        """Return list of available models for debugging."""
        if not Config.GEMINI_API_KEY:
            return []

        models = []
        try:
            for model in genai.list_models():
                methods = list(getattr(model, "supported_generation_methods", []) or [])
                models.append(
                    {
                        "name": getattr(model, "name", ""),
                        "display_name": getattr(model, "display_name", ""),
                        "supported_generation_methods": methods,
                    }
                )
        except Exception as exc:
            logger.warning("[GeminiService] Failed to list models: %s", exc)

        return models

    def _select_supported_model(self) -> Optional[str]:
        """Select a model that supports generateContent."""
        available = self.debug_list_available_models()
        if not available:
            return None

        supported = []
        for item in available:
            methods = item.get("supported_generation_methods", [])
            if any(method.lower() == "generatecontent" for method in methods if isinstance(method, str)):
                name = item.get("name", "")
                if name.startswith("models/"):
                    name = name.split("/", 1)[1]
                if name:
                    supported.append(name)

        if not supported:
            return None

        supported_set = set(supported)
        for candidate in self.PREFERRED_MODELS:
            if candidate in supported_set:
                return candidate

        return supported[0]

    @staticmethod
    def _clean_json_response(response_text: str) -> str:
        cleaned = response_text or ""
        cleaned = re.sub(r"```json\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"```\s*", "", cleaned)
        return cleaned.strip()

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        cleaned = self._clean_json_response(response_text)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            first = cleaned.find("{")
            last = cleaned.rfind("}")
            if first != -1 and last != -1 and last > first:
                snippet = cleaned[first : last + 1]
                try:
                    return json.loads(snippet)
                except json.JSONDecodeError as exc:
                    logger.warning("[GeminiService] JSON parse failed after extraction: %s", exc)

            logger.warning("[GeminiService] JSON parse failed. Raw preview: %s", cleaned[:300])
            return {"error": "Failed to parse AI response as JSON"}

    def _generate(self, prompt: str, retries: int = 3) -> str:
        if self.model is None:
            raise RuntimeError("Gemini model is not initialized. Check GEMINI_API_KEY and model availability.")

        last_error: Optional[Exception] = None
        for attempt in range(retries):
            try:
                response = self.model.generate_content(prompt)
                text = getattr(response, "text", None)
                if not text:
                    raise RuntimeError("Gemini returned empty response")
                return text
            except NotFound as exc:
                logger.error("[GeminiService] Model not found: %s", exc)
                self.model_name = self._select_supported_model()
                if not self.model_name:
                    raise RuntimeError("No supported Gemini model available for generateContent") from exc
                self.model = genai.GenerativeModel(self.model_name)
                last_error = exc
            except ResourceExhausted as exc:
                last_error = exc
                wait_time = 2 * (attempt + 1)
                logger.warning("[GeminiService] Rate limit hit, retrying in %ss", wait_time)
                time.sleep(wait_time)
            except GoogleAPICallError as exc:
                last_error = exc
                logger.error("[GeminiService] Google API call error: %s", exc)
                if attempt < retries - 1:
                    time.sleep(1.5 * (attempt + 1))
                else:
                    raise
            except Exception as exc:
                last_error = exc
                logger.exception("[GeminiService] Unexpected error while generating content: %s", exc)
                if attempt < retries - 1:
                    time.sleep(1)
                else:
                    raise

        raise RuntimeError(str(last_error) if last_error else "Gemini request failed")

    def _build_json_prompt(self, instruction: str, schema: str) -> str:
        return (
            f"{instruction}\n\n"
            "Return response as STRICT JSON only.\n"
            "No markdown. No prose outside JSON.\n"
            f"JSON schema expectation:\n{schema}\n"
        )

    async def get_destination_info(self, destination: str) -> Dict[str, Any]:
        prompt = self._build_json_prompt(
            instruction=(
                f"Provide detailed tourist information for {destination}. Keep responses concise and factual."
            ),
            schema=(
                '{"name":"","description":"","category":"","state":"","country":"",'
                '"coordinates":{"lat":0,"lng":0},'
                '"top_attractions":[{"name":"","description":"","entry_fee":"","timings":"","distance_from_main_place":""}],'
                '"unique_experiences":[],"best_time_to_visit":{"seasonal_breakdown":[],"weather_info":""},'
                '"how_to_reach":{"nearest_airport":"","airport_distance":"","nearest_railway_station":"","road_connectivity":""},'
                '"accommodation_options":{"luxury":"","mid_range":"","budget":"","average_price_range":""},'
                '"local_cuisine":[],"travel_tips":[],'
                'nearby_places":[{"name":"","distance":"","travel_time":""}],'
                '"suggested_itinerary":{"one_day":[],"two_day":[]},'
                '"climate":"","best_seasons":[],"estimated_daily_cost":{"budget":"","mid_range":"","luxury":""},'
                '"cultural_significance":"","accessibility":"","safety_rating":"","tourist_friendliness":""}'
            ),
        )

        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as exc:
            logger.error("[GeminiService] get_destination_info failed: %s", exc)
            return {"error": str(exc)}

    async def compare_destinations(self, dest1: str, dest2: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_json_prompt(
            instruction=(
                "You are an expert travel advisor. Compare two destinations based on user preferences. "
                f"Destination 1: {dest1}. Destination 2: {dest2}. "
                f"Preferences: {json.dumps(preferences, ensure_ascii=False)}"
            ),
            schema=(
                '{"destination1":{"name":"","scores":{"budget_match":0,"weather_suitability":0,'
                '"attractions_match":0,"accessibility":0,"unique_experiences":0,"safety":0},'
                '"total_score":0,"pros":[],"cons":[],"estimated_total_cost":"",'
                '"best_time_to_visit":"","highlights":[]},'
                '"destination2":{"name":"","scores":{"budget_match":0,"weather_suitability":0,'
                '"attractions_match":0,"accessibility":0,"unique_experiences":0,"safety":0},'
                '"total_score":0,"pros":[],"cons":[],"estimated_total_cost":"",'
                '"best_time_to_visit":"","highlights":[]},'
                '"recommendation":{"winner":"","reasoning":"","key_deciding_factors":[]}}'
            ),
        )

        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as exc:
            logger.error("[GeminiService] compare_destinations failed: %s", exc)
            return {"error": str(exc)}

    async def generate_itinerary(self, destination: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_json_prompt(
            instruction=(
                f"Generate a practical travel itinerary for {destination} using preferences: "
                f"{json.dumps(preferences, ensure_ascii=False)}"
            ),
            schema=(
                '{"destination":"","duration_days":0,"overview":"","best_time_to_visit":"",'
                '"days":[{"day_number":1,"title":"","morning":{"activity":"","location":"","duration":"","tips":""},'
                '"afternoon":{"activity":"","location":"","duration":"","tips":""},'
                '"evening":{"activity":"","location":"","duration":"","tips":""},'
                '"meals":{"breakfast":"","lunch":"","dinner":""},"estimated_daily_cost":""}],'
                '"total_estimated_cost":"","packing_list":[],"important_tips":[],'
                '"local_phrases":[],"emergency_contacts":{"police":"","ambulance":"","tourist_helpline":""}}'
            ),
        )

        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as exc:
            logger.error("[GeminiService] generate_itinerary failed: %s", exc)
            return {"error": str(exc)}

    async def get_destination_highlights(self, destination: str) -> Dict[str, Any]:
        prompt = self._build_json_prompt(
            instruction=f"Provide tourist highlights for {destination}.",
            schema=(
                '{"destination":"","tagline":"","cultural_highlights":{"history":"",'
                '"traditions":[],"festivals":[],"art_and_architecture":""},'
                '"famous_attractions":[],"culinary_experiences":{"must_try_dishes":[],"food_markets":[],"dining_experiences":[]},'
                '"exclusive_experiences":[],"hidden_gems":[],"photo_spots":[],"local_tips":[]}'
            ),
        )

        try:
            response_text = self._generate(prompt)
            return self._parse_json_response(response_text)
        except Exception as exc:
            logger.error("[GeminiService] get_destination_highlights failed: %s", exc)
            return {"error": str(exc)}


gemini_service = GeminiService()
