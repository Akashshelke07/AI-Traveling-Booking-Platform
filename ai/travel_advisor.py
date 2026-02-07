"""
Travel Advisor - Best Time to Visit Recommendations
====================================================
Provides intelligent recommendations on when to visit destinations
based on weather, crowds, events, and pricing.
"""

from datetime import datetime
from typing import Dict, List, Optional
import json
import os

# Seasonal data mappings for different destination types
SEASONAL_DATA = {
    # Beach destinations - avoid monsoon
    "beach": {
        "best_months": ["October", "November", "December", "January", "February", "March", "April"],
        "avoid_months": ["June", "July", "August", "September"],
        "peak_season": ["December", "January"],
        "off_season": ["May", "September"],
        "weather_pattern": "tropical"
    },
    # European destinations - summer best
    "europe_city": {
        "best_months": ["April", "May", "June", "September", "October"],
        "avoid_months": ["January", "February", "December"],
        "peak_season": ["July", "August"],
        "off_season": ["November", "February", "March"],
        "weather_pattern": "temperate"
    },
    # Mountain/Nature - varies by activity
    "mountain": {
        "best_months": ["March", "April", "May", "September", "October", "November"],
        "avoid_months": ["July", "August"],  # Monsoon in Asia
        "peak_season": ["October", "November"],
        "off_season": ["June", "July"],
        "weather_pattern": "alpine"
    },
    # Desert destinations
    "desert": {
        "best_months": ["October", "November", "December", "January", "February", "March"],
        "avoid_months": ["May", "June", "July", "August"],
        "peak_season": ["December", "January"],
        "off_season": ["April", "September"],
        "weather_pattern": "arid"
    },
    # Tropical destinations
    "tropical": {
        "best_months": ["December", "January", "February", "March", "April"],
        "avoid_months": ["June", "July", "August", "September"],
        "peak_season": ["December", "January", "February"],
        "off_season": ["May", "October"],
        "weather_pattern": "tropical_wet"
    }
}

# Continent-specific seasonal adjustments
CONTINENT_SEASONS = {
    "Asia": {
        "monsoon_months": ["June", "July", "August", "September"],
        "best_general": ["October", "November", "February", "March"]
    },
    "Europe": {
        "winter_months": ["December", "January", "February"],
        "best_general": ["May", "June", "September"]
    },
    "North America": {
        "winter_months": ["December", "January", "February"],
        "best_general": ["May", "June", "September", "October"]
    },
    "South America": {
        "winter_months": ["June", "July", "August"],  # Southern hemisphere
        "best_general": ["October", "November", "March", "April"]
    },
    "Africa": {
        "dry_season": ["June", "July", "August", "September"],
        "best_general": ["June", "July", "August", "September", "October"]
    },
    "Oceania": {
        "winter_months": ["June", "July", "August"],
        "best_general": ["October", "November", "March", "April"]
    },
    "Middle East": {
        "hot_months": ["June", "July", "August"],
        "best_general": ["October", "November", "February", "March", "April"]
    }
}

# Weather ratings by month
WEATHER_RATINGS = {
    "excellent": "☀️ Excellent - Perfect weather, ideal for all activities",
    "good": "🌤️ Good - Pleasant weather, minor chance of rain",
    "fair": "⛅ Fair - Mixed weather, pack layers",
    "poor": "🌧️ Poor - Frequent rain or extreme temperatures",
    "avoid": "⛈️ Avoid - Monsoon, extreme heat, or severe weather"
}

# Major events and festivals
MAJOR_EVENTS = {
    "India": [
        {"name": "Holi", "month": "March", "type": "Festival"},
        {"name": "Diwali", "month": "October/November", "type": "Festival"},
        {"name": "Durga Puja", "month": "October", "type": "Festival"}
    ],
    "Thailand": [
        {"name": "Songkran", "month": "April", "type": "Festival"},
        {"name": "Loy Krathong", "month": "November", "type": "Festival"}
    ],
    "Japan": [
        {"name": "Cherry Blossom", "month": "March/April", "type": "Natural"},
        {"name": "Autumn Leaves", "month": "November", "type": "Natural"}
    ],
    "Spain": [
        {"name": "La Tomatina", "month": "August", "type": "Festival"},
        {"name": "Running of Bulls", "month": "July", "type": "Festival"}
    ],
    "Brazil": [
        {"name": "Carnival", "month": "February", "type": "Festival"}
    ],
    "France": [
        {"name": "Bastille Day", "month": "July", "type": "National"},
        {"name": "Cannes Film Festival", "month": "May", "type": "Cultural"}
    ],
    "USA": [
        {"name": "Thanksgiving", "month": "November", "type": "National"},
        {"name": "Independence Day", "month": "July", "type": "National"}
    ],
    "Italy": [
        {"name": "Venice Carnival", "month": "February", "type": "Festival"},
        {"name": "Easter", "month": "March/April", "type": "Religious"}
    ],
    "Indonesia": [
        {"name": "Nyepi (Bali)", "month": "March", "type": "Religious"},
        {"name": "Galungan", "month": "Various", "type": "Religious"}
    ]
}


class TravelAdvisor:
    """AI-powered travel timing advisor."""
    
    def __init__(self):
        self.destinations = []
        self.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
    
    def load_destinations(self, filepath: str):
        """Load destination data."""
        with open(filepath, 'r', encoding='utf-8') as f:
            self.destinations = json.load(f)
        print(f"[INFO] Loaded {len(self.destinations)} destinations")
    
    def get_destination(self, name: str) -> Optional[Dict]:
        """Find a destination by name."""
        name_lower = name.lower()
        for dest in self.destinations:
            if name_lower in dest['title'].lower():
                return dest
        return None
    
    def get_seasonal_profile(self, destination: Dict) -> Dict:
        """Determine the seasonal profile for a destination."""
        category = destination.get('category', 'city')
        continent = destination.get('continent', 'Asia')
        title = destination.get('title', '').lower()
        
        # Determine base profile
        if category == 'beach' or 'island' in title or 'coast' in title:
            profile = SEASONAL_DATA['beach'].copy()
        elif 'desert' in title or 'sahara' in title:
            profile = SEASONAL_DATA['desert'].copy()
        elif category == 'nature' or 'mountain' in title or 'alps' in title:
            profile = SEASONAL_DATA['mountain'].copy()
        elif continent == 'Europe':
            profile = SEASONAL_DATA['europe_city'].copy()
        else:
            profile = SEASONAL_DATA['tropical'].copy()
        
        # Apply continent-specific adjustments
        continent_data = CONTINENT_SEASONS.get(continent, {})
        profile['continent_notes'] = continent_data
        
        return profile
    
    def get_weather_rating(self, destination: Dict, month: str) -> Dict:
        """Get weather rating for a specific month."""
        profile = self.get_seasonal_profile(destination)
        
        if month in profile.get('best_months', []):
            rating = "excellent" if month not in profile.get('peak_season', []) else "good"
        elif month in profile.get('avoid_months', []):
            rating = "avoid"
        elif month in profile.get('peak_season', []):
            rating = "good"
        elif month in profile.get('off_season', []):
            rating = "fair"
        else:
            rating = "fair"
        
        return {
            "rating": rating,
            "description": WEATHER_RATINGS[rating],
            "is_peak": month in profile.get('peak_season', []),
            "is_off_season": month in profile.get('off_season', [])
        }
    
    def get_price_indicator(self, destination: Dict, month: str) -> Dict:
        """Get price indicator for a specific month."""
        profile = self.get_seasonal_profile(destination)
        base_price = destination.get('price', 5000)
        
        if month in profile.get('peak_season', []):
            multiplier = 1.4
            level = "high"
            tip = "Book 2-3 months in advance for better rates"
        elif month in profile.get('off_season', []):
            multiplier = 0.7
            level = "low"
            tip = "Great time for budget travelers!"
        else:
            multiplier = 1.0
            level = "moderate"
            tip = "Standard pricing, book 1 month ahead"
        
        return {
            "level": level,
            "estimated_price": int(base_price * multiplier),
            "savings_percent": int((1 - multiplier) * 100) if multiplier < 1 else 0,
            "tip": tip
        }
    
    def get_events(self, destination: Dict, month: Optional[str] = None) -> List[Dict]:
        """Get events/festivals for a destination."""
        country = destination.get('country', '')
        
        # Extract country name
        for key in MAJOR_EVENTS.keys():
            if key.lower() in country.lower() or key.lower() in destination.get('title', '').lower():
                events = MAJOR_EVENTS[key]
                if month:
                    return [e for e in events if month.lower() in e['month'].lower()]
                return events
        
        return []
    
    def get_crowd_level(self, destination: Dict, month: str) -> Dict:
        """Estimate crowd levels for a month."""
        profile = self.get_seasonal_profile(destination)
        
        if month in profile.get('peak_season', []):
            level = "very_high"
            description = "🔴 Very High - Expect long queues and crowded attractions"
        elif month in profile.get('best_months', []) and month not in profile.get('off_season', []):
            level = "high"
            description = "🟠 High - Popular time, book accommodations early"
        elif month in profile.get('off_season', []):
            level = "low"
            description = "🟢 Low - Fewer tourists, more authentic experience"
        else:
            level = "moderate"
            description = "🟡 Moderate - Comfortable crowd levels"
        
        return {
            "level": level,
            "description": description
        }
    
    def get_best_time_recommendation(self, destination_name: str, preferred_month: Optional[str] = None) -> Dict:
        """Get comprehensive best time to visit recommendation."""
        destination = self.get_destination(destination_name)
        
        if not destination:
            return {
                "success": False,
                "error": f"Destination '{destination_name}' not found"
            }
        
        profile = self.get_seasonal_profile(destination)
        
        # Build recommendation
        result = {
            "success": True,
            "destination": destination['title'],
            "location": destination.get('location', ''),
            "continent": destination.get('continent', ''),
            "category": destination.get('category', ''),
            "best_months": profile.get('best_months', [])[:4],
            "avoid_months": profile.get('avoid_months', [])[:3],
            "peak_season": profile.get('peak_season', []),
            "off_season": profile.get('off_season', []),
            "events": self.get_events(destination),
            "base_price": destination.get('price', 0)
        }
        
        # If specific month requested, add detailed analysis
        if preferred_month:
            month = preferred_month.capitalize()
            if month in self.months:
                result["month_analysis"] = {
                    "month": month,
                    "weather": self.get_weather_rating(destination, month),
                    "pricing": self.get_price_indicator(destination, month),
                    "crowds": self.get_crowd_level(destination, month),
                    "events": self.get_events(destination, month)
                }
                
                # Generate recommendation text
                weather = result["month_analysis"]["weather"]
                pricing = result["month_analysis"]["pricing"]
                crowds = result["month_analysis"]["crowds"]
                
                if weather["rating"] == "excellent":
                    rec = f"✅ {month} is an EXCELLENT time to visit {destination['title']}!"
                elif weather["rating"] == "good":
                    rec = f"👍 {month} is a GOOD time to visit {destination['title']}."
                elif weather["rating"] == "fair":
                    rec = f"⚠️ {month} is OKAY, but not ideal for {destination['title']}."
                else:
                    rec = f"❌ {month} is NOT RECOMMENDED for {destination['title']}."
                
                if pricing["level"] == "low":
                    rec += f" Great news - prices are {pricing['savings_percent']}% lower!"
                elif pricing["level"] == "high":
                    rec += f" Note: This is peak season, expect higher prices."
                
                result["recommendation"] = rec
        else:
            # Generate general recommendation
            best = ", ".join(profile.get('best_months', [])[:3])
            result["recommendation"] = f"🌟 Best time to visit: {best}. These months offer ideal weather and reasonable prices."
        
        return result
    
    def compare_months(self, destination_name: str, months: List[str]) -> Dict:
        """Compare multiple months for a destination."""
        destination = self.get_destination(destination_name)
        
        if not destination:
            return {"success": False, "error": "Destination not found"}
        
        comparisons = []
        for month in months:
            month = month.capitalize()
            if month in self.months:
                comparisons.append({
                    "month": month,
                    "weather": self.get_weather_rating(destination, month),
                    "pricing": self.get_price_indicator(destination, month),
                    "crowds": self.get_crowd_level(destination, month),
                    "score": self._calculate_month_score(destination, month)
                })
        
        # Sort by score
        comparisons.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            "success": True,
            "destination": destination['title'],
            "comparisons": comparisons,
            "best_choice": comparisons[0]['month'] if comparisons else None
        }
    
    def _calculate_month_score(self, destination: Dict, month: str) -> int:
        """Calculate an overall score for visiting in a specific month."""
        score = 50  # Base score
        
        weather = self.get_weather_rating(destination, month)
        pricing = self.get_price_indicator(destination, month)
        crowds = self.get_crowd_level(destination, month)
        
        # Weather contribution (40 points max)
        weather_scores = {"excellent": 40, "good": 30, "fair": 15, "poor": 5, "avoid": 0}
        score += weather_scores.get(weather["rating"], 15)
        
        # Pricing contribution (30 points max)
        if pricing["level"] == "low":
            score += 30
        elif pricing["level"] == "moderate":
            score += 20
        else:
            score += 10
        
        # Crowds contribution (20 points max)
        crowd_scores = {"low": 20, "moderate": 15, "high": 10, "very_high": 5}
        score += crowd_scores.get(crowds["level"], 10)
        
        return min(score, 100)


# Test the advisor
if __name__ == "__main__":
    advisor = TravelAdvisor()
    
    # Load destinations
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
    advisor.load_destinations(data_path)
    
    # Test recommendations
    print("\n" + "="*60)
    print("🧪 Testing Best Time Recommendations")
    print("="*60)
    
    # Test 1: General recommendation
    result = advisor.get_best_time_recommendation("Bali")
    print(f"\n📍 {result.get('destination', 'Unknown')}")
    print(f"   Best months: {', '.join(result.get('best_months', []))}")
    print(f"   Avoid: {', '.join(result.get('avoid_months', []))}")
    print(f"   💡 {result.get('recommendation', '')}")
    
    # Test 2: Specific month
    result = advisor.get_best_time_recommendation("Paris", "June")
    print(f"\n📍 {result.get('destination', 'Unknown')} in June")
    if "month_analysis" in result:
        analysis = result["month_analysis"]
        print(f"   Weather: {analysis['weather']['description']}")
        print(f"   Pricing: {analysis['pricing']['level']} (₹{analysis['pricing']['estimated_price']:,})")
        print(f"   Crowds: {analysis['crowds']['description']}")
    print(f"   💡 {result.get('recommendation', '')}")
    
    # Test 3: Compare months
    comparison = advisor.compare_months("Maldives", ["March", "July", "December"])
    print(f"\n📊 Comparing months for Maldives:")
    for comp in comparison.get('comparisons', []):
        print(f"   {comp['month']}: Score {comp['score']}/100")
    print(f"   🏆 Best choice: {comparison.get('best_choice', 'Unknown')}")
