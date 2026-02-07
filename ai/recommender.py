"""
AI Travel Recommendation Engine
================================
Uses TF-IDF and cosine similarity to match user queries with destinations.
"""

import json
import os
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

class TravelRecommender:
    """
    AI-powered travel destination recommendation system.
    Uses NLP techniques to understand user preferences and match with destinations.
    """
    
    def __init__(self, data_path=None):
        self.destinations = []
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )
        self.destination_vectors = None
        self.is_trained = False
        
        # Mood synonyms for better matching
        self.mood_synonyms = {
            'romantic': ['love', 'honeymoon', 'couple', 'anniversary', 'valentine', 'romantic', 'intimate'],
            'adventure': ['adventure', 'exciting', 'thrill', 'explore', 'hiking', 'trekking', 'adrenaline', 'extreme'],
            'peaceful': ['peace', 'peaceful', 'calm', 'quiet', 'relax', 'serene', 'tranquil', 'zen'],
            'spiritual': ['spiritual', 'temple', 'church', 'prayer', 'holy', 'religious', 'divine', 'sacred', 'meditation'],
            'nature': ['nature', 'green', 'mountains', 'beach', 'forest', 'hills', 'natural', 'scenic', 'wildlife'],
            'historic': ['history', 'historic', 'ancient', 'old', 'heritage', 'monument', 'ruins', 'archaeological'],
            'relaxing': ['relax', 'relaxing', 'vacation', 'holiday', 'rest', 'chill', 'spa', 'unwind', 'leisure'],
            'cultural': ['culture', 'cultural', 'art', 'museum', 'traditional', 'local', 'authentic', 'heritage'],
            'luxury': ['luxury', 'premium', 'expensive', 'five star', '5 star', 'lavish', 'upscale', 'posh'],
            'budget': ['budget', 'cheap', 'affordable', 'low cost', 'backpacker', 'economical'],
            'party': ['party', 'nightlife', 'club', 'fun', 'dancing', 'music', 'vibrant'],
            'family': ['family', 'kids', 'children', 'family friendly', 'safe']
        }
        
        # Activity keywords
        self.activity_keywords = {
            'beach': ['beach', 'sun', 'sand', 'swimming', 'sunbathing', 'coastal'],
            'hiking': ['hiking', 'trekking', 'walking', 'trails', 'mountains'],
            'diving': ['diving', 'snorkeling', 'scuba', 'underwater', 'marine'],
            'skiing': ['skiing', 'snowboarding', 'winter sports', 'snow'],
            'sightseeing': ['sightseeing', 'tour', 'visit', 'explore', 'see'],
            'photography': ['photography', 'photos', 'pictures', 'instagram', 'scenic'],
            'food': ['food', 'cuisine', 'dining', 'restaurants', 'culinary', 'foodie'],
            'shopping': ['shopping', 'markets', 'malls', 'souvenirs']
        }
        
        if data_path:
            self.load_data(data_path)
    
    def load_data(self, data_path):
        """Load destination data from JSON file."""
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                self.destinations = json.load(f)
            print(f"[OK] Loaded {len(self.destinations)} destinations")
            return True
        except Exception as e:
            print(f"[ERROR] Error loading data: {e}")
            return False
    
    def _create_destination_text(self, dest):
        """Create a rich text representation of a destination for vectorization."""
        parts = []
        
        # Title and location
        parts.append(dest.get('title', ''))
        parts.append(dest.get('location', ''))
        parts.append(dest.get('country', ''))
        parts.append(dest.get('continent', ''))
        
        # Category (repeated for emphasis)
        category = dest.get('category', '')
        parts.extend([category] * 3)
        
        # Moods (expanded with synonyms)
        moods = dest.get('moods', [])
        for mood in moods:
            parts.append(mood)
            if mood in self.mood_synonyms:
                parts.extend(self.mood_synonyms[mood][:3])
        
        # Activities
        activities = dest.get('activities', [])
        parts.extend(activities)
        
        # Best for
        best_for = dest.get('best_for', [])
        parts.extend(best_for)
        
        # Season
        seasons = dest.get('season', [])
        parts.extend(seasons)
        
        # Budget tier (repeated for emphasis)
        budget = dest.get('budget_tier', '')
        parts.extend([budget] * 2)
        
        # Description
        parts.append(dest.get('description', ''))
        
        return ' '.join(parts).lower()
    
    def train(self):
        """Train the recommendation model on loaded destinations."""
        if not self.destinations:
            print("[ERROR] No destinations loaded. Please load data first.")
            return False
        
        print("[INFO] Training recommendation model...")
        
        # Create text representations
        destination_texts = [self._create_destination_text(d) for d in self.destinations]
        
        # Fit and transform
        self.destination_vectors = self.vectorizer.fit_transform(destination_texts)
        
        self.is_trained = True
        print(f"[OK] Model trained on {len(self.destinations)} destinations")
        print(f"   Vocabulary size: {len(self.vectorizer.vocabulary_)}")
        
        return True
    
    def _expand_query(self, query):
        """Expand user query with synonyms for better matching."""
        query_lower = query.lower()
        expanded_terms = [query_lower]
        
        # Add mood synonyms
        for mood, synonyms in self.mood_synonyms.items():
            for synonym in synonyms:
                if synonym in query_lower:
                    expanded_terms.extend(self.mood_synonyms[mood])
                    break
        
        # Add activity keywords
        for activity, keywords in self.activity_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    expanded_terms.extend(self.activity_keywords[activity])
                    break
        
        return ' '.join(list(set(expanded_terms)))
    
    def _extract_filters(self, query):
        """Extract specific filters from query (budget, continent, etc.)."""
        filters = {}
        query_lower = query.lower()
        
        # Budget filter
        if any(word in query_lower for word in ['cheap', 'budget', 'affordable', 'low cost']):
            filters['budget_tier'] = 'budget'
        elif any(word in query_lower for word in ['luxury', 'expensive', 'premium', 'five star']):
            filters['budget_tier'] = 'luxury'
        
        # Continent filter
        continents = {
            'europe': ['europe', 'european'],
            'asia': ['asia', 'asian'],
            'north america': ['america', 'usa', 'canada', 'mexico'],
            'south america': ['south america', 'latin america'],
            'africa': ['africa', 'african'],
            'oceania': ['australia', 'oceania', 'new zealand']
        }
        
        for continent, keywords in continents.items():
            if any(word in query_lower for word in keywords):
                filters['continent'] = continent
                break
        
        # Category filter
        categories = {
            'beach': ['beach', 'sea', 'ocean', 'coastal', 'island'],
            'nature': ['nature', 'mountain', 'forest', 'wildlife', 'natural'],
            'city': ['city', 'urban', 'metropolitan'],
            'religious': ['temple', 'church', 'mosque', 'religious', 'spiritual'],
            'monument': ['monument', 'historic', 'ancient', 'ruins'],
            'cultural': ['culture', 'art', 'museum']
        }
        
        for category, keywords in categories.items():
            if any(word in query_lower for word in keywords):
                filters['category'] = category
                break
        
        return filters
    
    def recommend(self, query, top_n=5, min_score=0.1):
        """
        Get destination recommendations based on user query.
        
        Args:
            query: Natural language query from user
            top_n: Number of recommendations to return
            min_score: Minimum similarity score threshold
            
        Returns:
            List of recommended destinations with scores
        """
        if not self.is_trained:
            print("[ERROR] Model not trained. Please train first.")
            return []
        
        # Expand query with synonyms
        expanded_query = self._expand_query(query)
        
        # Extract filters
        filters = self._extract_filters(query)
        
        # Vectorize query
        query_vector = self.vectorizer.transform([expanded_query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.destination_vectors).flatten()
        
        # Apply filters and boost scores
        results = []
        for idx, score in enumerate(similarities):
            dest = self.destinations[idx]
            adjusted_score = score
            
            # Apply filter boosts/penalties
            if filters:
                if 'budget_tier' in filters:
                    if dest.get('budget_tier') == filters['budget_tier']:
                        adjusted_score *= 1.5
                    else:
                        adjusted_score *= 0.7
                
                if 'continent' in filters:
                    if filters['continent'].lower() in dest.get('continent', '').lower():
                        adjusted_score *= 1.5
                    else:
                        adjusted_score *= 0.8
                
                if 'category' in filters:
                    if dest.get('category') == filters['category']:
                        adjusted_score *= 1.5
                    else:
                        adjusted_score *= 0.8
            
            if adjusted_score >= min_score:
                results.append({
                    'destination': dest,
                    'score': round(adjusted_score, 4),
                    'matched_filters': filters
                })
        
        # Sort by score and return top N
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_n]
    
    def save_model(self, path):
        """Save trained model to disk."""
        if not self.is_trained:
            print("[ERROR] Model not trained. Nothing to save.")
            return False
        
        model_data = {
            'vectorizer': self.vectorizer,
            'destinations': self.destinations,
            'destination_vectors': self.destination_vectors
        }
        
        with open(path, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"[OK] Model saved to {path}")
        return True
    
    def load_model(self, path):
        """Load trained model from disk."""
        try:
            with open(path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.vectorizer = model_data['vectorizer']
            self.destinations = model_data['destinations']
            self.destination_vectors = model_data['destination_vectors']
            self.is_trained = True
            
            print(f"[OK] Model loaded from {path}")
            return True
        except Exception as e:
            print(f"[ERROR] Error loading model: {e}")
            return False


# Quick test
if __name__ == "__main__":
    # Initialize recommender
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
    recommender = TravelRecommender(data_path)
    
    # Train model
    recommender.train()
    
    # Test queries
    test_queries = [
        "I want a romantic beach vacation",
        "Looking for adventure in nature",
        "Spiritual places in India",
        "Budget friendly travel in Asia",
        "Luxury honeymoon destination",
        "I'm feeling stressed and need peace"
    ]
    
    print("\n" + "="*60)
    print("[TEST] TESTING RECOMMENDATIONS")
    print("="*60)
    
    for query in test_queries:
        print(f"\n[QUERY] Query: '{query}'")
        print("-" * 40)
        
        recommendations = recommender.recommend(query, top_n=3)
        
        for i, rec in enumerate(recommendations, 1):
            dest = rec['destination']
            print(f"  {i}. {dest['title']}")
            print(f"     Location: {dest['location']} | Price: Rs.{dest['price']}/day")
            print(f"     Score: {rec['score']}")
