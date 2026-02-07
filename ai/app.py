"""
Flask API for AI Travel Recommendations
========================================
Exposes the ML recommender, travel advisor, flight search, and deals as a REST API.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from recommender import TravelRecommender
from travel_advisor import TravelAdvisor
from flight_search import FlightSearchEngine, DealsEngine

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"])

# Initialize all services
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'recommender.pkl')

recommender = TravelRecommender()
travel_advisor = TravelAdvisor()
flight_engine = FlightSearchEngine()
deals_engine = DealsEngine()

def initialize_model():
    """Initialize or load the trained model and travel services."""
    global recommender, travel_advisor
    
    # Try to load pre-trained model
    if os.path.exists(MODEL_PATH):
        print("[INFO] Loading pre-trained model...")
        recommender.load_model(MODEL_PATH)
    else:
        # Train new model
        print("[INFO] Training new model...")
        recommender.load_data(DATA_PATH)
        recommender.train()
        
        # Save model for future use
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        recommender.save_model(MODEL_PATH)
    
    # Initialize travel advisor
    print("[INFO] Loading travel advisor...")
    travel_advisor.load_destinations(DATA_PATH)
    print("[OK] All services initialized!")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_trained': recommender.is_trained,
        'destinations_count': len(recommender.destinations)
    })


@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """
    Get travel recommendations based on user query.
    
    Request body:
    {
        "query": "I want a romantic beach vacation",
        "top_n": 5  // optional, default 5
    }
    
    Response:
    {
        "success": true,
        "query": "...",
        "recommendations": [
            {
                "id": 1,
                "title": "Maldives",
                "location": "Maldives",
                "price": 11800,
                "category": "beach",
                "moods": ["relaxing", "romantic"],
                "description": "...",
                "score": 0.85
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Query is required'
            }), 400
        
        query = data['query']
        top_n = data.get('top_n', 5)
        
        # Get recommendations
        results = recommender.recommend(query, top_n=top_n)
        
        # Format response
        recommendations = []
        for result in results:
            dest = result['destination']
            recommendations.append({
                'id': dest.get('id'),
                'title': dest.get('title'),
                'location': dest.get('location'),
                'country': dest.get('country'),
                'price': dest.get('price'),
                'category': dest.get('category'),
                'moods': dest.get('moods', []),
                'activities': dest.get('activities', []),
                'best_for': dest.get('best_for', []),
                'season': dest.get('season', []),
                'budget_tier': dest.get('budget_tier'),
                'description': dest.get('description'),
                'score': result['score'],
                'matched_filters': result.get('matched_filters', {})
            })
        
        return jsonify({
            'success': True,
            'query': query,
            'recommendations': recommendations,
            'count': len(recommendations)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/destinations', methods=['GET'])
def get_all_destinations():
    """Get all destinations."""
    return jsonify({
        'success': True,
        'destinations': recommender.destinations,
        'count': len(recommender.destinations)
    })


@app.route('/api/destinations/categories', methods=['GET'])
def get_categories():
    """Get all destination categories."""
    categories = set()
    for dest in recommender.destinations:
        if 'category' in dest:
            categories.add(dest['category'])
    
    return jsonify({
        'success': True,
        'categories': list(categories)
    })


@app.route('/api/destinations/moods', methods=['GET'])
def get_moods():
    """Get all available moods."""
    moods = set()
    for dest in recommender.destinations:
        for mood in dest.get('moods', []):
            moods.add(mood)
    
    return jsonify({
        'success': True,
        'moods': list(moods)
    })


@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Retrain the model (admin endpoint)."""
    try:
        recommender.load_data(DATA_PATH)
        recommender.train()
        recommender.save_model(MODEL_PATH)
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'destinations_count': len(recommender.destinations)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# =============================================================================
# TRAVEL ADVISOR ENDPOINTS
# =============================================================================

@app.route('/api/best-time', methods=['POST'])
def get_best_time():
    """
    Get best time to visit a destination.
    
    Request: {"destination": "Bali", "month": "March"}  // month is optional
    """
    try:
        data = request.get_json()
        destination = data.get('destination')
        month = data.get('month')
        
        if not destination:
            return jsonify({'success': False, 'error': 'Destination required'}), 400
        
        result = travel_advisor.get_best_time_recommendation(destination, month)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/compare-months', methods=['POST'])
def compare_months():
    """Compare multiple months for a destination."""
    try:
        data = request.get_json()
        destination = data.get('destination')
        months = data.get('months', [])
        
        if not destination or not months:
            return jsonify({'success': False, 'error': 'Destination and months required'}), 400
        
        result = travel_advisor.compare_months(destination, months)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# =============================================================================
# FLIGHT SEARCH ENDPOINTS
# =============================================================================

@app.route('/api/flights/search', methods=['POST'])
def search_flights():
    """
    Search for flights.
    
    Request:
    {
        "from": "Delhi",
        "to": "Bali",
        "date": "2026-03-15",
        "return_date": "2026-03-22",  // optional
        "passengers": 2,  // optional, default 1
        "cabin_class": "economy"  // optional
    }
    """
    try:
        data = request.get_json()
        
        from_city = data.get('from')
        to_city = data.get('to')
        date = data.get('date')
        return_date = data.get('return_date')
        passengers = data.get('passengers', 1)
        cabin_class = data.get('cabin_class', 'economy')
        
        if not from_city or not to_city or not date:
            return jsonify({'success': False, 'error': 'From, to, and date are required'}), 400
        
        result = flight_engine.search_flights(
            from_city, to_city, date,
            return_date=return_date,
            passengers=passengers,
            cabin_class=cabin_class
        )
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/flights/airports', methods=['GET'])
def get_airports():
    """Get all supported airports."""
    airports = []
    for key, airport in flight_engine.airports.items():
        airports.append({
            'name': key,
            'code': airport['code'],
            'city': airport['city'],
            'country': airport['country']
        })
    
    return jsonify({
        'success': True,
        'airports': airports,
        'count': len(airports)
    })


# =============================================================================
# DEALS ENDPOINTS  
# =============================================================================

@app.route('/api/deals', methods=['GET', 'POST'])
def get_deals():
    """
    Get current flight deals.
    
    Query params or POST body:
    - from_city: Filter by origin city
    - destination: Filter by destination
    - max_budget: Maximum price filter
    - category: Deal category (flash_sale, promo_code, seasonal)
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = request.args.to_dict()
        
        from_city = data.get('from_city')
        destination = data.get('destination')
        max_budget = int(data.get('max_budget')) if data.get('max_budget') else None
        category = data.get('category')
        
        result = deals_engine.get_deals(
            from_city=from_city,
            destination=destination,
            max_budget=max_budget,
            category=category
        )
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/deals/trending', methods=['GET'])
def get_trending_deals():
    """Get top trending deals."""
    limit = request.args.get('limit', 5, type=int)
    deals = deals_engine.get_trending_deals(limit)
    
    return jsonify({
        'success': True,
        'trending_deals': deals,
        'count': len(deals)
    })


if __name__ == '__main__':
    print("[INFO] Starting AI Travel Assistant API...")
    print("   - Destination Recommendations")
    print("   - Best Time to Visit")
    print("   - Flight Search")
    print("   - Deals & Discounts")
    
    initialize_model()
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True
    )
