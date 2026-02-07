# 🤖 AI Travel Recommendation System

An ML-powered travel destination recommendation system that uses Natural Language Processing to understand user preferences and suggest the best travel destinations.

## Features

- **Natural Language Understanding**: Understands queries like "I want a romantic beach vacation" or "Looking for adventure in the mountains"
- **TF-IDF Vectorization**: Uses text processing to match user intent with destinations
- **Mood Detection**: Identifies user moods (romantic, adventure, peaceful, spiritual, etc.)
- **Smart Filtering**: Automatically filters by budget, continent, and category
- **Query Expansion**: Expands queries with synonyms for better matching
- **REST API**: Flask-based API for integration with the frontend

## Tech Stack

- **Python 3.9+**
- **scikit-learn**: TF-IDF vectorization and cosine similarity
- **Flask**: REST API framework
- **NumPy/Pandas**: Data processing

## Setup

### 1. Create Virtual Environment

```bash
cd ai
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the API Server

```bash
python app.py
```

The API will start on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /api/health
```

### Get Recommendations
```
POST /api/recommend
Content-Type: application/json

{
    "query": "I want a romantic beach vacation",
    "top_n": 5
}
```

Response:
```json
{
    "success": true,
    "query": "I want a romantic beach vacation",
    "recommendations": [
        {
            "id": 5,
            "title": "Maldives",
            "location": "Maldives",
            "price": 11800,
            "category": "beach",
            "moods": ["relaxing", "romantic", "peaceful", "luxury"],
            "score": 0.85
        }
    ],
    "count": 5
}
```

### Get All Destinations
```
GET /api/destinations
```

### Get Categories
```
GET /api/destinations/categories
```

### Get Available Moods
```
GET /api/destinations/moods
```

### Retrain Model
```
POST /api/retrain
```

## How It Works

1. **Data Loading**: Loads enriched destination data with categories, moods, activities, etc.

2. **Text Vectorization**: Creates TF-IDF vectors for each destination using all its attributes

3. **Query Processing**:
   - Expands query with mood/activity synonyms
   - Extracts filters (budget, continent, category)
   - Vectorizes the expanded query

4. **Similarity Matching**: Calculates cosine similarity between query and all destinations

5. **Score Adjustment**: Boosts/penalizes scores based on extracted filters

6. **Ranking**: Returns top N destinations sorted by adjusted score

## Folder Structure

```
ai/
├── app.py                 # Flask API server
├── recommender.py         # ML recommendation engine
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── .gitignore
├── data/
│   └── destinations_enriched.json  # Training data
└── models/
    └── recommender.pkl    # Trained model (auto-generated)
```

## Training Data Format

Each destination in `destinations_enriched.json` should have:

```json
{
    "id": 1,
    "title": "Destination Name",
    "price": 5000,
    "location": "City, Country",
    "country": "Country",
    "continent": "Continent",
    "category": "beach|nature|city|monument|religious|cultural",
    "moods": ["romantic", "adventure", "peaceful"],
    "activities": ["hiking", "beach", "sightseeing"],
    "best_for": ["couples", "families", "solo travelers"],
    "season": ["october", "november"],
    "budget_tier": "budget|mid-range|luxury",
    "description": "Description of the destination"
}
```

## Adding More Destinations

1. Edit `data/destinations_enriched.json`
2. Add new destinations following the format above
3. Call `/api/retrain` or restart the server

## Integration with Frontend

Update your chatbot to call the AI API:

```javascript
const getAIRecommendations = async (query) => {
    const response = await fetch('http://localhost:5001/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_n: 5 })
    });
    const data = await response.json();
    return data.recommendations;
};
```
