"""Add missing Indian hill stations to destination database."""
import json

# Load existing data
with open('data/destinations_enriched.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get next ID
next_id = len(data) + 1

# New Indian destinations to add
new_destinations = [
    {'id': next_id, 'title': 'Shimla, Himachal Pradesh', 'price': 3500, 'location': 'Himachal Pradesh', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'romantic', 'adventure'], 'activities': ['hiking', 'sightseeing', 'snow'], 'best_for': ['couples', 'families'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'The Queen of Hills - beautiful colonial architecture and snow-capped mountains.'},
    {'id': next_id+1, 'title': 'Spiti Valley, Himachal Pradesh', 'price': 5000, 'location': 'Himachal Pradesh', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['adventure', 'peaceful', 'spiritual'], 'activities': ['hiking', 'trekking', 'monastery', 'camping'], 'best_for': ['solo', 'adventure seekers'], 'season': ['May-October'], 'budget_tier': 'budget', 'description': 'The cold desert mountain valley - rugged landscapes and ancient monasteries.'},
    {'id': next_id+2, 'title': 'Manali, Himachal Pradesh', 'price': 4000, 'location': 'Himachal Pradesh', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['adventure', 'romantic', 'peaceful'], 'activities': ['skiing', 'hiking', 'rafting', 'paragliding'], 'best_for': ['couples', 'adventure seekers'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Popular hill station with snow activities and adventure sports.'},
    {'id': next_id+3, 'title': 'Kullu Valley, Himachal Pradesh', 'price': 3500, 'location': 'Himachal Pradesh', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'nature', 'adventure'], 'activities': ['trekking', 'rafting', 'sightseeing'], 'best_for': ['families', 'nature lovers'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Valley of Gods with stunning apple orchards and Himalayan views.'},
    {'id': next_id+4, 'title': 'Dharamshala, Himachal Pradesh', 'price': 3000, 'location': 'Himachal Pradesh', 'country': 'India', 'continent': 'Asia', 'category': 'religious', 'moods': ['spiritual', 'peaceful', 'cultural'], 'activities': ['meditation', 'trekking', 'monastery'], 'best_for': ['spiritual seekers', 'solo'], 'season': ['March-June', 'Sept-Nov'], 'budget_tier': 'budget', 'description': 'Home of Dalai Lama - Tibetan culture and mountain spirituality.'},
    {'id': next_id+5, 'title': 'Mussoorie, Uttarakhand', 'price': 3500, 'location': 'Uttarakhand', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['romantic', 'peaceful'], 'activities': ['sightseeing', 'cable car', 'hiking'], 'best_for': ['couples', 'families'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Queen of the Hills - colonial charm with Himalayan views.'},
    {'id': next_id+6, 'title': 'Nainital, Uttarakhand', 'price': 3000, 'location': 'Uttarakhand', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'romantic', 'nature'], 'activities': ['boating', 'sightseeing', 'hiking'], 'best_for': ['couples', 'families'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Lake District of India with beautiful Naini Lake.'},
    {'id': next_id+7, 'title': 'Rishikesh, Uttarakhand', 'price': 2500, 'location': 'Uttarakhand', 'country': 'India', 'continent': 'Asia', 'category': 'religious', 'moods': ['spiritual', 'adventure', 'peaceful'], 'activities': ['rafting', 'yoga', 'bungee', 'meditation'], 'best_for': ['adventure seekers', 'spiritual'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Yoga capital of the world with adventure sports on the Ganges.'},
    {'id': next_id+8, 'title': 'Darjeeling, West Bengal', 'price': 4000, 'location': 'West Bengal', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'romantic', 'nature'], 'activities': ['tea gardens', 'toy train', 'trekking'], 'best_for': ['couples', 'nature lovers'], 'season': ['Oct-March'], 'budget_tier': 'budget', 'description': 'Tea capital with stunning views of Kanchenjunga.'},
    {'id': next_id+9, 'title': 'Leh Ladakh, India', 'price': 8000, 'location': 'Ladakh', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['adventure', 'spiritual', 'peaceful'], 'activities': ['biking', 'trekking', 'monastery', 'camping'], 'best_for': ['adventure seekers', 'bikers'], 'season': ['May-September'], 'budget_tier': 'mid-range', 'description': 'Land of high passes - stunning landscapes and Buddhist monasteries.'},
    {'id': next_id+10, 'title': 'Ooty, Tamil Nadu', 'price': 3500, 'location': 'Tamil Nadu', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'romantic', 'nature'], 'activities': ['tea gardens', 'boating', 'toy train'], 'best_for': ['couples', 'families'], 'season': ['year-round'], 'budget_tier': 'budget', 'description': 'Queen of Nilgiris with tea plantations and colonial charm.'},
    {'id': next_id+11, 'title': 'Munnar, Kerala', 'price': 4000, 'location': 'Kerala', 'country': 'India', 'continent': 'Asia', 'category': 'nature', 'moods': ['peaceful', 'romantic', 'nature'], 'activities': ['tea gardens', 'trekking', 'wildlife'], 'best_for': ['couples', 'honeymoon'], 'season': ['Sept-May'], 'budget_tier': 'budget', 'description': 'Emerald green tea estates in the Western Ghats.'},
]

data.extend(new_destinations)

with open('data/destinations_enriched.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'Added {len(new_destinations)} new destinations!')
print(f'Total destinations: {len(data)}')
print(f'New destinations: {[d["title"] for d in new_destinations]}')
