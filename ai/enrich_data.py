"""
Script to enrich destination data from the frontend with AI-compatible metadata.
Run this script to update the AI destination database.
"""

import json
import os
import re

# Category mappings based on keywords in destination names
CATEGORY_MAPPINGS = {
    'beach': ['beach', 'island', 'coast', 'bay', 'sea', 'ocean', 'coral', 'reef', 'maldives', 'bora bora', 'caribbean', 'hawaii', 'bahamas', 'fiji', 'seychelles', 'phuket', 'boracay', 'zanzibar', 'mauritius'],
    'nature': ['national park', 'rainforest', 'forest', 'canyon', 'waterfall', 'falls', 'river', 'lake', 'volcano', 'mountain', 'alps', 'glacier', 'fjord', 'valley', 'desert', 'safari', 'wildlife', 'jungle', 'aurora'],
    'city': ['city', 'metro', 'urban', 'downtown', 'london', 'paris', 'tokyo', 'new york', 'dubai', 'singapore', 'hong kong', 'barcelona', 'amsterdam', 'berlin', 'sydney', 'rome', 'bangkok', 'istanbul'],
    'monument': ['temple', 'castle', 'palace', 'tower', 'monument', 'statue', 'museum', 'pyramid', 'ruins', 'fort', 'cathedral', 'church', 'mosque', 'colosseum', 'acropolis', 'taj mahal', 'great wall', 'angkor'],
    'religious': ['temple', 'shrine', 'mosque', 'cathedral', 'church', 'monastery', 'pilgrimage', 'holy', 'sacred', 'spiritual', 'vatican', 'mecca', 'jerusalem', 'varanasi', 'bodh gaya', 'golden temple'],
    'cultural': ['old town', 'historic', 'heritage', 'cultural', 'ancient', 'traditional', 'market', 'bazaar', 'festival', 'art', 'wine region', 'village']
}

# Mood mappings based on destination characteristics
MOOD_MAPPINGS = {
    'romantic': ['maldives', 'paris', 'venice', 'santorini', 'bora bora', 'amalfi', 'cinque terre', 'tuscany', 'kyoto', 'prague', 'bruges', 'vienna', 'lake como', 'swiss alps', 'tahiti', 'seychelles', 'fiji', 'hawaii', 'maui'],
    'adventure': ['himalaya', 'everest', 'safari', 'amazon', 'antarctica', 'patagonia', 'alaska', 'queenstown', 'costa rica', 'galapagos', 'iceland', 'norway', 'nepal', 'peru', 'new zealand', 'canyon', 'volcano', 'trekking', 'diving', 'rafting'],
    'peaceful': ['lake', 'mountain', 'countryside', 'village', 'monastery', 'spa', 'retreat', 'garden', 'scenic', 'serene', 'quiet', 'bhutan', 'maldives', 'bali', 'tuscany', 'provence', 'cotswolds'],
    'spiritual': ['temple', 'shrine', 'monastery', 'pilgrimage', 'varanasi', 'bodh gaya', 'rishikesh', 'jerusalem', 'vatican', 'lhasa', 'tibet', 'bali', 'angkor', 'golden temple', 'sacred'],
    'party': ['ibiza', 'vegas', 'miami', 'bangkok', 'rio', 'amsterdam', 'berlin', 'cancun', 'phuket', 'goa', 'mykonos', 'barcelona'],
    'luxury': ['dubai', 'monaco', 'maldives', 'bora bora', 'st tropez', 'aspen', 'swiss', 'beverly hills', 'singapore', 'hong kong', 'seychelles'],
    'family': ['disney', 'theme park', 'zoo', 'aquarium', 'beach', 'resort', 'orlando', 'san diego', 'gold coast', 'bali', 'phuket', 'hawaii'],
    'historic': ['ancient', 'ruins', 'castle', 'palace', 'museum', 'heritage', 'medieval', 'roman', 'greek', 'egyptian', 'mayan', 'inca', 'colonial']
}

# Activity mappings  
ACTIVITY_MAPPINGS = {
    'hiking': ['mountain', 'trek', 'trail', 'national park', 'canyon', 'alps', 'himalaya', 'patagonia'],
    'beach': ['beach', 'island', 'coast', 'bay', 'resort'],
    'diving': ['reef', 'coral', 'maldives', 'great barrier', 'red sea', 'caribbean'],
    'safari': ['safari', 'serengeti', 'kruger', 'masai mara', 'wildlife', 'national park africa'],
    'skiing': ['alps', 'aspen', 'whistler', 'zermatt', 'chamonix', 'ski'],
    'sightseeing': ['city', 'museum', 'monument', 'palace', 'temple', 'cathedral'],
    'shopping': ['dubai', 'hong kong', 'singapore', 'tokyo', 'paris', 'milan', 'new york'],
    'food_wine': ['wine region', 'tuscany', 'bordeaux', 'champagne', 'tokyo', 'paris', 'bangkok', 'italy'],
    'water_sports': ['beach', 'island', 'bay', 'coast', 'caribbean', 'hawaii', 'bali']
}

# Country/Continent mappings
CONTINENT_MAPPINGS = {
    'Asia': ['india', 'thailand', 'japan', 'china', 'vietnam', 'cambodia', 'indonesia', 'bali', 'singapore', 'malaysia', 'philippines', 'nepal', 'bhutan', 'sri lanka', 'maldives', 'myanmar', 'laos', 'korea', 'taiwan', 'hong kong', 'mongolia', 'uzbekistan'],
    'Europe': ['france', 'italy', 'spain', 'germany', 'uk', 'england', 'scotland', 'ireland', 'portugal', 'greece', 'croatia', 'austria', 'switzerland', 'netherlands', 'belgium', 'czech', 'poland', 'hungary', 'sweden', 'norway', 'denmark', 'finland', 'iceland', 'romania', 'turkey'],
    'North America': ['usa', 'canada', 'mexico', 'alaska', 'hawaii', 'california', 'new york', 'florida', 'texas', 'colorado', 'arizona', 'utah'],
    'South America': ['brazil', 'argentina', 'peru', 'chile', 'colombia', 'ecuador', 'bolivia', 'venezuela', 'patagonia'],
    'Africa': ['south africa', 'kenya', 'tanzania', 'morocco', 'egypt', 'namibia', 'botswana', 'zambia', 'zimbabwe', 'ethiopia', 'madagascar', 'mauritius', 'seychelles', 'zanzibar'],
    'Oceania': ['australia', 'new zealand', 'fiji', 'tahiti', 'polynesia', 'samoa', 'cook islands'],
    'Middle East': ['uae', 'dubai', 'qatar', 'israel', 'jordan', 'oman', 'saudi', 'lebanon']
}

def get_category(title):
    title_lower = title.lower()
    for category, keywords in CATEGORY_MAPPINGS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return category
    return 'city'  # default

def get_moods(title):
    title_lower = title.lower()
    moods = []
    for mood, keywords in MOOD_MAPPINGS.items():
        for keyword in keywords:
            if keyword in title_lower:
                if mood not in moods:
                    moods.append(mood)
                break
    return moods if moods else ['relaxing']

def get_activities(title):
    title_lower = title.lower()
    activities = []
    for activity, keywords in ACTIVITY_MAPPINGS.items():
        for keyword in keywords:
            if keyword in title_lower:
                if activity not in activities:
                    activities.append(activity)
                break
    return activities if activities else ['sightseeing', 'photography']

def get_continent(title):
    title_lower = title.lower()
    for continent, keywords in CONTINENT_MAPPINGS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return continent
    return 'Asia'  # default for Indian travel site

def get_budget_tier(price):
    if price < 5000:
        return 'budget'
    elif price < 8000:
        return 'mid-range'
    else:
        return 'luxury'

def get_best_for(moods, activities):
    best_for = []
    if 'romantic' in moods:
        best_for.append('couples')
    if 'adventure' in moods:
        best_for.extend(['solo travelers', 'groups'])
    if 'family' in moods:
        best_for.append('families')
    if 'party' in moods:
        best_for.append('friends')
    if 'peaceful' in moods or 'spiritual' in moods:
        best_for.append('solo travelers')
    if not best_for:
        best_for = ['couples', 'families', 'solo travelers']
    return list(set(best_for))

def enrich_destination(dest, id_num):
    title = dest['title']
    price = dest['price']
    
    # Extract location from title
    location_match = re.search(r',\s*([^,]+)$', title)
    location = location_match.group(1) if location_match else title.split(',')[0]
    
    category = get_category(title)
    moods = get_moods(title)
    activities = get_activities(title)
    continent = get_continent(title)
    budget_tier = get_budget_tier(price)
    best_for = get_best_for(moods, activities)
    
    return {
        'id': id_num,
        'title': title,
        'price': price,
        'location': location.strip(),
        'country': location.strip(),
        'continent': continent,
        'category': category,
        'moods': moods,
        'activities': activities,
        'best_for': best_for,
        'season': ['year-round'],
        'budget_tier': budget_tier,
        'description': f"Explore the beautiful {title}. A perfect destination for {', '.join(moods[:2])} experiences."
    }

def main():
    # Read source data
    source_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'component', 'Booking', 'data', 'destinationsData.json')
    output_path = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
    
    print(f"Reading from: {source_path}")
    
    with open(source_path, 'r', encoding='utf-8') as f:
        destinations = json.load(f)
    
    print(f"Found {len(destinations)} destinations")
    
    # Enrich each destination
    enriched = []
    for i, dest in enumerate(destinations, 1):
        enriched.append(enrich_destination(dest, i))
    
    # Save enriched data
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(enriched)} enriched destinations to: {output_path}")
    print("\nSample output:")
    print(json.dumps(enriched[0], indent=2))

if __name__ == '__main__':
    main()
