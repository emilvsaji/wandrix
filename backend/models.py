from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

class UserPreferences(BaseModel):
    """User travel preferences model"""
    budget: str = Field(..., description="Budget level: low, medium, high, luxury")
    travel_duration: int = Field(..., description="Number of days for the trip")
    interests: List[str] = Field(default=[], description="List of interests: adventure, culture, nature, food, etc.")
    season: str = Field(..., description="Preferred travel season: spring, summer, fall, winter")
    travel_type: str = Field(..., description="Type of travel: solo, couple, family, group")
    accessibility_needs: Optional[str] = Field(None, description="Any accessibility requirements")

class Destination(BaseModel):
    """Tourist destination model"""
    name: str
    country: str
    description: Optional[str] = None
    climate: Optional[str] = None
    best_season: Optional[List[str]] = None
    estimated_daily_cost: Optional[dict] = None  # {"low": 50, "medium": 100, "high": 200}
    attractions: Optional[List[str]] = None
    cuisine: Optional[List[str]] = None
    cultural_significance: Optional[str] = None
    unique_experiences: Optional[List[str]] = None
    accessibility: Optional[str] = None
    image_url: Optional[str] = None

class ComparisonRequest(BaseModel):
    """Request model for destination comparison"""
    destination1: str
    destination2: str
    preferences: UserPreferences

    @field_validator('destination1', 'destination2')
    @classmethod
    def validate_destination_name(cls, value: str):
        clean_value = value.strip()
        if len(clean_value) < 2:
            raise ValueError('Destination name must be at least 2 characters long')
        return clean_value

class ComparisonResult(BaseModel):
    """Result model for destination comparison"""
    destination1_analysis: dict
    destination2_analysis: dict
    recommended_destination: str
    recommendation_reasoning: str
    score_breakdown: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ItineraryDay(BaseModel):
    """Single day in the itinerary"""
    day_number: int
    title: str
    morning_activity: str
    afternoon_activity: str
    evening_activity: str
    meals: dict  # {"breakfast": "", "lunch": "", "dinner": ""}
    tips: List[str]
    estimated_cost: float

class Itinerary(BaseModel):
    """Complete travel itinerary model"""
    destination: str
    duration_days: int
    travel_type: str
    budget_level: str
    days: List[ItineraryDay]
    total_estimated_cost: float
    packing_suggestions: List[str]
    important_tips: List[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ItineraryGenerateRequest(BaseModel):
    destination: str
    preferences: UserPreferences

    @field_validator('destination')
    @classmethod
    def validate_destination(cls, value: str):
        clean_value = value.strip()
        if len(clean_value) < 2:
            raise ValueError('Destination name must be at least 2 characters long')
        return clean_value


class DestinationRequest(BaseModel):
    destination: str

    @field_validator('destination')
    @classmethod
    def validate_destination(cls, value: str):
        clean_value = value.strip()
        if len(clean_value) < 2:
            raise ValueError('Destination name must be at least 2 characters long')
        return clean_value


class WishlistDestination(BaseModel):
    name: str
    country: Optional[str] = None
    tagline: Optional[str] = None
    image: Optional[str] = None


class AddWishlistRequest(BaseModel):
    destination: WishlistDestination


class RemoveWishlistRequest(BaseModel):
    name: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, value: Optional[str]):
        if value is None:
            return value
        clean_value = value.strip()
        if len(clean_value) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(clean_value) > 80:
            raise ValueError('Name must be at most 80 characters long')
        return clean_value

    @field_validator('avatar_url')
    @classmethod
    def validate_avatar_url(cls, value: Optional[str]):
        if value is None:
            return value
        clean_value = value.strip()
        if not clean_value:
            return None
        if len(clean_value) > 2_000_000:
            raise ValueError('Avatar data is too large')
        return clean_value


class StandardSuccessResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any] = Field(default_factory=dict)
    message: str


class StandardErrorResponse(BaseModel):
    success: bool = False
    message: str
