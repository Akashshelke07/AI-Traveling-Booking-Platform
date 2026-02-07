"""
Flight Search Engine - Mock Flight Data & Search
=================================================
Provides realistic flight search with routes, prices, and deal scoring.
Can be upgraded to use real APIs (Amadeus, Skyscanner) later.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random
import json

# Major airports with codes
AIRPORTS = {
    # India
    "Delhi": {"code": "DEL", "city": "New Delhi", "country": "India"},
    "Mumbai": {"code": "BOM", "city": "Mumbai", "country": "India"},
    "Bangalore": {"code": "BLR", "city": "Bengaluru", "country": "India"},
    "Chennai": {"code": "MAA", "city": "Chennai", "country": "India"},
    "Kolkata": {"code": "CCU", "city": "Kolkata", "country": "India"},
    "Hyderabad": {"code": "HYD", "city": "Hyderabad", "country": "India"},
    
    # Southeast Asia
    "Bali": {"code": "DPS", "city": "Denpasar", "country": "Indonesia"},
    "Bangkok": {"code": "BKK", "city": "Bangkok", "country": "Thailand"},
    "Singapore": {"code": "SIN", "city": "Singapore", "country": "Singapore"},
    "Phuket": {"code": "HKT", "city": "Phuket", "country": "Thailand"},
    "Kuala Lumpur": {"code": "KUL", "city": "Kuala Lumpur", "country": "Malaysia"},
    "Manila": {"code": "MNL", "city": "Manila", "country": "Philippines"},
    "Hanoi": {"code": "HAN", "city": "Hanoi", "country": "Vietnam"},
    "Tokyo": {"code": "NRT", "city": "Tokyo", "country": "Japan"},
    "Hong Kong": {"code": "HKG", "city": "Hong Kong", "country": "China"},
    
    # Middle East
    "Dubai": {"code": "DXB", "city": "Dubai", "country": "UAE"},
    "Male": {"code": "MLE", "city": "Malé", "country": "Maldives"},
    "Doha": {"code": "DOH", "city": "Doha", "country": "Qatar"},
    "Abu Dhabi": {"code": "AUH", "city": "Abu Dhabi", "country": "UAE"},
    
    # Europe
    "Paris": {"code": "CDG", "city": "Paris", "country": "France"},
    "London": {"code": "LHR", "city": "London", "country": "UK"},
    "Rome": {"code": "FCO", "city": "Rome", "country": "Italy"},
    "Barcelona": {"code": "BCN", "city": "Barcelona", "country": "Spain"},
    "Amsterdam": {"code": "AMS", "city": "Amsterdam", "country": "Netherlands"},
    "Zurich": {"code": "ZRH", "city": "Zurich", "country": "Switzerland"},
    "Athens": {"code": "ATH", "city": "Athens", "country": "Greece"},
    "Istanbul": {"code": "IST", "city": "Istanbul", "country": "Turkey"},
    
    # Americas
    "New York": {"code": "JFK", "city": "New York", "country": "USA"},
    "Los Angeles": {"code": "LAX", "city": "Los Angeles", "country": "USA"},
    "San Francisco": {"code": "SFO", "city": "San Francisco", "country": "USA"},
    
    # Africa & Oceania
    "Cairo": {"code": "CAI", "city": "Cairo", "country": "Egypt"},
    "Cape Town": {"code": "CPT", "city": "Cape Town", "country": "South Africa"},
    "Sydney": {"code": "SYD", "city": "Sydney", "country": "Australia"},
    "Melbourne": {"code": "MEL", "city": "Melbourne", "country": "Australia"}
}

# Airlines with base info
AIRLINES = {
    "AI": {"name": "Air India", "type": "full-service", "rating": 3.5},
    "6E": {"name": "IndiGo", "type": "low-cost", "rating": 4.0},
    "SG": {"name": "SpiceJet", "type": "low-cost", "rating": 3.5},
    "UK": {"name": "Vistara", "type": "full-service", "rating": 4.2},
    "EK": {"name": "Emirates", "type": "premium", "rating": 4.7},
    "SQ": {"name": "Singapore Airlines", "type": "premium", "rating": 4.8},
    "TG": {"name": "Thai Airways", "type": "full-service", "rating": 4.0},
    "QR": {"name": "Qatar Airways", "type": "premium", "rating": 4.6},
    "EY": {"name": "Etihad Airways", "type": "premium", "rating": 4.5},
    "BA": {"name": "British Airways", "type": "full-service", "rating": 4.0},
    "LH": {"name": "Lufthansa", "type": "full-service", "rating": 4.2},
    "AF": {"name": "Air France", "type": "full-service", "rating": 4.0}
}

# Base prices for routes (one-way, economy)
ROUTE_PRICES = {
    # From Delhi
    ("DEL", "DPS"): 15000,  # Delhi to Bali
    ("DEL", "BKK"): 12000,  # Delhi to Bangkok
    ("DEL", "SIN"): 14000,  # Delhi to Singapore
    ("DEL", "DXB"): 10000,  # Delhi to Dubai
    ("DEL", "MLE"): 18000,  # Delhi to Maldives
    ("DEL", "CDG"): 32000,  # Delhi to Paris
    ("DEL", "LHR"): 30000,  # Delhi to London
    ("DEL", "NRT"): 35000,  # Delhi to Tokyo
    ("DEL", "JFK"): 55000,  # Delhi to New York
    
    # From Mumbai
    ("BOM", "DPS"): 16000,
    ("BOM", "BKK"): 13000,
    ("BOM", "DXB"): 8000,
    ("BOM", "MLE"): 15000,
    ("BOM", "CDG"): 33000,
    ("BOM", "LHR"): 28000,
    
    # From Bangalore
    ("BLR", "SIN"): 11000,
    ("BLR", "BKK"): 14000,
    ("BLR", "DXB"): 12000,
    ("BLR", "MLE"): 14000,
}

# Flight duration estimates (hours)
FLIGHT_DURATIONS = {
    ("DEL", "DPS"): 8.5,
    ("DEL", "BKK"): 4.5,
    ("DEL", "SIN"): 5.5,
    ("DEL", "DXB"): 3.5,
    ("DEL", "MLE"): 5.0,
    ("DEL", "CDG"): 9.0,
    ("DEL", "LHR"): 9.5,
    ("DEL", "NRT"): 8.0,
    ("DEL", "JFK"): 16.0,
    ("BOM", "DPS"): 9.0,
    ("BOM", "BKK"): 5.0,
    ("BOM", "DXB"): 3.0,
    ("BOM", "MLE"): 4.0,
}


class FlightSearchEngine:
    """Mock flight search engine with realistic pricing."""
    
    def __init__(self):
        self.airports = AIRPORTS
        self.airlines = AIRLINES
        self.base_prices = ROUTE_PRICES
        self.durations = FLIGHT_DURATIONS
    
    def find_airport(self, query: str) -> Optional[Dict]:
        """Find airport by city name or code."""
        query_lower = query.lower()
        
        for key, airport in self.airports.items():
            if (query_lower in key.lower() or 
                query_lower in airport['city'].lower() or
                query_lower == airport['code'].lower()):
                return {"key": key, **airport}
        
        return None
    
    def get_base_price(self, from_code: str, to_code: str) -> int:
        """Get base price for a route."""
        # Check direct route
        if (from_code, to_code) in self.base_prices:
            return self.base_prices[(from_code, to_code)]
        if (to_code, from_code) in self.base_prices:
            return int(self.base_prices[(to_code, from_code)] * 0.95)  # Slight discount for reverse
        
        # Estimate based on regions
        return self._estimate_price(from_code, to_code)
    
    def _estimate_price(self, from_code: str, to_code: str) -> int:
        """Estimate price for routes not in database."""
        # Get countries
        from_country = None
        to_country = None
        
        for airport in self.airports.values():
            if airport['code'] == from_code:
                from_country = airport['country']
            if airport['code'] == to_code:
                to_country = airport['country']
        
        # Regional pricing
        if from_country == to_country:
            return 5000  # Domestic
        
        regional_prices = {
            ("India", "Thailand"): 12000,
            ("India", "Indonesia"): 15000,
            ("India", "UAE"): 10000,
            ("India", "Maldives"): 16000,
            ("India", "Singapore"): 14000,
            ("India", "France"): 32000,
            ("India", "UK"): 30000,
            ("India", "USA"): 50000,
        }
        
        for (c1, c2), price in regional_prices.items():
            if (from_country == c1 and to_country == c2) or (from_country == c2 and to_country == c1):
                return price
        
        return 25000  # Default international
    
    def get_flight_duration(self, from_code: str, to_code: str) -> float:
        """Get flight duration in hours."""
        if (from_code, to_code) in self.durations:
            return self.durations[(from_code, to_code)]
        if (to_code, from_code) in self.durations:
            return self.durations[(to_code, from_code)]
        
        # Estimate based on base price (rough correlation)
        base_price = self.get_base_price(from_code, to_code)
        return max(2, min(18, base_price / 4000))
    
    def _get_price_factors(self, date_str: str) -> Dict:
        """Calculate pricing factors based on date."""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
        except:
            date = datetime.now() + timedelta(days=30)
        
        factors = {"multiplier": 1.0, "reasons": []}
        
        # Days until departure
        days_ahead = (date - datetime.now()).days
        if days_ahead < 7:
            factors["multiplier"] *= 1.5
            factors["reasons"].append("Last minute booking (+50%)")
        elif days_ahead < 14:
            factors["multiplier"] *= 1.25
            factors["reasons"].append("Short notice (+25%)")
        elif days_ahead > 60:
            factors["multiplier"] *= 0.9
            factors["reasons"].append("Early booking discount (-10%)")
        
        # Weekend travel
        if date.weekday() in [4, 5, 6]:  # Fri, Sat, Sun
            factors["multiplier"] *= 1.1
            factors["reasons"].append("Weekend travel (+10%)")
        
        # Holiday seasons
        month = date.month
        if month in [12, 1]:  # Peak holiday
            factors["multiplier"] *= 1.3
            factors["reasons"].append("Holiday season (+30%)")
        elif month in [3, 4]:  # Spring break
            factors["multiplier"] *= 1.15
            factors["reasons"].append("Spring season (+15%)")
        elif month in [6, 7, 8]:  # Summer
            factors["multiplier"] *= 1.2
            factors["reasons"].append("Summer season (+20%)")
        
        return factors
    
    def search_flights(
        self,
        from_city: str,
        to_city: str,
        date: str,
        return_date: Optional[str] = None,
        passengers: int = 1,
        cabin_class: str = "economy"
    ) -> Dict:
        """Search for flights."""
        # Find airports
        from_airport = self.find_airport(from_city)
        to_airport = self.find_airport(to_city)
        
        if not from_airport:
            return {"success": False, "error": f"Origin airport not found: {from_city}"}
        if not to_airport:
            return {"success": False, "error": f"Destination airport not found: {to_city}"}
        
        from_code = from_airport['code']
        to_code = to_airport['code']
        
        # Get base price and factors
        base_price = self.get_base_price(from_code, to_code)
        factors = self._get_price_factors(date)
        duration = self.get_flight_duration(from_code, to_code)
        
        # Cabin class multipliers
        cabin_multipliers = {
            "economy": 1.0,
            "premium_economy": 1.5,
            "business": 3.0,
            "first": 5.0
        }
        cabin_mult = cabin_multipliers.get(cabin_class, 1.0)
        
        # Generate flight options
        flights = []
        
        # Select relevant airlines
        if base_price > 25000:  # Long haul - premium airlines
            airline_codes = ["EK", "SQ", "QR", "AI", "BA", "LH"]
        elif base_price > 15000:  # Medium haul
            airline_codes = ["AI", "6E", "EK", "SQ", "TG"]
        else:  # Short haul
            airline_codes = ["6E", "SG", "AI", "UK"]
        
        # Generate 4-6 flight options
        departure_times = ["06:00", "09:30", "14:00", "17:30", "21:00", "23:30"]
        random.shuffle(departure_times)
        
        for i, airline_code in enumerate(airline_codes[:4]):
            airline = self.airlines[airline_code]
            
            # Price variation by airline type
            type_mult = {"low-cost": 0.8, "full-service": 1.0, "premium": 1.3}
            airline_mult = type_mult.get(airline["type"], 1.0)
            
            # Random variation
            variation = random.uniform(0.9, 1.15)
            
            final_price = int(base_price * factors["multiplier"] * cabin_mult * airline_mult * variation)
            
            # Calculate stops
            if duration > 10:
                stops = random.choice([1, 2])
            elif duration > 6:
                stops = random.choice([0, 1])
            else:
                stops = 0
            
            # Add layover time
            actual_duration = duration + (stops * random.uniform(1.5, 3))
            
            # Departure and arrival times
            dep_time = departure_times[i % len(departure_times)]
            dep_hour = int(dep_time.split(":")[0])
            arr_hour = (dep_hour + int(actual_duration)) % 24
            arr_time = f"{arr_hour:02d}:{random.choice(['00', '15', '30', '45'])}"
            
            # Deal score (higher is better)
            deal_score = max(0, min(100, 100 - (final_price / base_price - 0.8) * 50))
            
            flights.append({
                "airline": airline["name"],
                "airline_code": airline_code,
                "airline_rating": airline["rating"],
                "flight_type": airline["type"],
                "price": final_price,
                "price_per_person": final_price,
                "total_price": final_price * passengers,
                "duration": f"{int(actual_duration)}h {int((actual_duration % 1) * 60)}m",
                "duration_hours": round(actual_duration, 1),
                "stops": stops,
                "stop_cities": self._get_layover_cities(from_code, to_code, stops),
                "departure": dep_time,
                "arrival": arr_time,
                "departure_airport": from_code,
                "arrival_airport": to_code,
                "deal_score": int(deal_score),
                "cabin_class": cabin_class,
                "baggage": "15kg" if airline["type"] == "low-cost" else "23kg",
                "meal_included": airline["type"] != "low-cost"
            })
        
        # Sort by price
        flights.sort(key=lambda x: x["price"])
        
        # Mark cheapest and fastest
        if flights:
            flights[0]["is_cheapest"] = True
            fastest = min(flights, key=lambda x: x["duration_hours"])
            fastest["is_fastest"] = True
        
        # Calculate return flights if needed
        return_flights = None
        if return_date:
            return_search = self.search_flights(to_city, from_city, return_date, passengers=passengers, cabin_class=cabin_class)
            if return_search["success"]:
                return_flights = return_search["flights"]
        
        # Price trend analysis
        trend = self._analyze_price_trend(date)
        
        return {
            "success": True,
            "route": f"{from_airport['city']} → {to_airport['city']}",
            "route_codes": f"{from_code} → {to_code}",
            "date": date,
            "return_date": return_date,
            "passengers": passengers,
            "cabin_class": cabin_class,
            "flights": flights,
            "return_flights": return_flights,
            "price_factors": factors["reasons"],
            "price_trend": trend,
            "cheapest_price": flights[0]["price"] if flights else None,
            "booking_tip": self._get_booking_tip(factors, trend)
        }
    
    def _get_layover_cities(self, from_code: str, to_code: str, stops: int) -> List[str]:
        """Get potential layover cities."""
        if stops == 0:
            return []
        
        hub_cities = ["Dubai", "Singapore", "Bangkok", "Doha", "Abu Dhabi"]
        random.shuffle(hub_cities)
        return hub_cities[:stops]
    
    def _analyze_price_trend(self, date_str: str) -> Dict:
        """Analyze price trends."""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
        except:
            return {"trend": "stable", "advice": "Prices are typical for this route."}
        
        days_ahead = (date - datetime.now()).days
        
        if days_ahead > 45:
            return {
                "trend": "likely_to_rise",
                "icon": "📈",
                "advice": "Prices may increase as the date approaches. Book now for best rates!"
            }
        elif days_ahead > 21:
            return {
                "trend": "stable",
                "icon": "➡️",
                "advice": "Prices are stable. You have time but don't wait too long."
            }
        else:
            return {
                "trend": "volatile",
                "icon": "⚡",
                "advice": "Prices are volatile close to departure. Book immediately if the price looks good!"
            }
    
    def _get_booking_tip(self, factors: Dict, trend: Dict) -> str:
        """Generate a booking tip."""
        tips = []
        
        if "Early booking discount" in str(factors.get("reasons", [])):
            tips.append("✅ Great timing! Early booking discount applied.")
        elif "Last minute" in str(factors.get("reasons", [])):
            tips.append("⚠️ Last minute booking - prices are higher than usual.")
        
        if "Tuesday" in datetime.now().strftime("%A"):
            tips.append("💡 Tuesdays often have the best flight deals!")
        
        if trend["trend"] == "likely_to_rise":
            tips.append("🎯 Book now - prices tend to increase.")
        
        return " ".join(tips) if tips else "💡 Compare multiple dates for the best prices."


class DealsEngine:
    """Flight deals and discount finder."""
    
    def __init__(self):
        self.deals = self._generate_deals()
    
    def _generate_deals(self) -> List[Dict]:
        """Generate current deals."""
        deals = [
            {
                "id": 1,
                "destination": "Maldives",
                "from_city": "Delhi",
                "airline": "Air India Express",
                "original_price": 25000,
                "deal_price": 18999,
                "discount_percent": 24,
                "promo_code": "FLY2026",
                "valid_until": "2026-02-15",
                "category": "flash_sale",
                "seats_left": 12
            },
            {
                "id": 2,
                "destination": "Bali",
                "from_city": "Mumbai",
                "airline": "IndiGo",
                "original_price": 18000,
                "deal_price": 14499,
                "discount_percent": 19,
                "promo_code": None,
                "valid_until": "2026-02-28",
                "category": "special_fare",
                "seats_left": 25
            },
            {
                "id": 3,
                "destination": "Dubai",
                "from_city": "Delhi",
                "airline": "Emirates",
                "original_price": 15000,
                "deal_price": 11999,
                "discount_percent": 20,
                "promo_code": "EMIRATES20",
                "valid_until": "2026-02-10",
                "category": "promo_code",
                "seats_left": 50
            },
            {
                "id": 4,
                "destination": "Thailand",
                "from_city": "Any Indian City",
                "airline": "Thai Airways",
                "original_price": 16000,
                "deal_price": 12800,
                "discount_percent": 20,
                "promo_code": "THAILAND20",
                "valid_until": "2026-03-31",
                "category": "seasonal",
                "seats_left": 100
            },
            {
                "id": 5,
                "destination": "Singapore",
                "from_city": "Bangalore",
                "airline": "Singapore Airlines",
                "original_price": 14000,
                "deal_price": 10500,
                "discount_percent": 25,
                "promo_code": "SGFLASH",
                "valid_until": "2026-02-05",
                "category": "flash_sale",
                "seats_left": 8
            },
            {
                "id": 6,
                "destination": "Paris",
                "from_city": "Delhi",
                "airline": "Air France",
                "original_price": 45000,
                "deal_price": 36000,
                "discount_percent": 20,
                "promo_code": "ROMANTIC20",
                "valid_until": "2026-02-14",
                "category": "valentines",
                "seats_left": 20
            }
        ]
        return deals
    
    def get_deals(
        self,
        from_city: Optional[str] = None,
        destination: Optional[str] = None,
        max_budget: Optional[int] = None,
        category: Optional[str] = None
    ) -> Dict:
        """Get current deals with filters."""
        filtered = self.deals.copy()
        
        if from_city:
            filtered = [d for d in filtered if from_city.lower() in d["from_city"].lower() or d["from_city"] == "Any Indian City"]
        
        if destination:
            filtered = [d for d in filtered if destination.lower() in d["destination"].lower()]
        
        if max_budget:
            filtered = [d for d in filtered if d["deal_price"] <= max_budget]
        
        if category:
            filtered = [d for d in filtered if d["category"] == category]
        
        # Sort by discount
        filtered.sort(key=lambda x: x["discount_percent"], reverse=True)
        
        return {
            "success": True,
            "total_deals": len(filtered),
            "deals": filtered,
            "best_deal": filtered[0] if filtered else None,
            "promo_codes": [d["promo_code"] for d in filtered if d["promo_code"]]
        }
    
    def get_trending_deals(self, limit: int = 5) -> List[Dict]:
        """Get top trending deals."""
        # Sort by discount and urgency (seats left)
        trending = sorted(
            self.deals,
            key=lambda x: (x["discount_percent"], -x["seats_left"]),
            reverse=True
        )
        return trending[:limit]


# Test
if __name__ == "__main__":
    # Test flight search
    engine = FlightSearchEngine()
    
    print("\n" + "="*60)
    print("✈️ Testing Flight Search Engine")
    print("="*60)
    
    result = engine.search_flights("Delhi", "Bali", "2026-03-15", passengers=2)
    
    if result["success"]:
        print(f"\n🛫 Route: {result['route']}")
        print(f"📅 Date: {result['date']}")
        print(f"👥 Passengers: {result['passengers']}")
        print(f"\n📊 Price Factors: {', '.join(result['price_factors'])}")
        print(f"📈 Trend: {result['price_trend']['advice']}")
        
        print(f"\n✈️ Found {len(result['flights'])} flights:")
        for flight in result['flights'][:3]:
            flags = []
            if flight.get("is_cheapest"):
                flags.append("💰 CHEAPEST")
            if flight.get("is_fastest"):
                flags.append("⚡ FASTEST")
            
            print(f"\n   {flight['airline']} ({flight['airline_code']})")
            print(f"   ₹{flight['price']:,} | {flight['duration']} | {flight['stops']} stops")
            print(f"   {flight['departure']} → {flight['arrival']}")
            print(f"   Deal Score: {flight['deal_score']}/100 {' '.join(flags)}")
    
    # Test deals
    deals_engine = DealsEngine()
    
    print("\n" + "="*60)
    print("🏷️ Testing Deals Engine")
    print("="*60)
    
    deals = deals_engine.get_deals(max_budget=20000)
    print(f"\n💰 Deals under ₹20,000: {deals['total_deals']}")
    
    for deal in deals['deals'][:3]:
        print(f"\n   ✈️ {deal['destination']} ({deal['airline']})")
        print(f"   ₹{deal['original_price']:,} → ₹{deal['deal_price']:,} ({deal['discount_percent']}% OFF)")
        if deal['promo_code']:
            print(f"   🎟️ Code: {deal['promo_code']}")
        print(f"   ⏰ Valid until: {deal['valid_until']} | {deal['seats_left']} seats left")
