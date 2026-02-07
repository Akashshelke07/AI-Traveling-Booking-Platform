"""
Download and integrate Kaggle India Travel Dataset
===================================================
This script downloads the "Travel Dataset - Guide to India's Must See Places"
and integrates it with the existing destination database.
"""

import kagglehub
import os
import json
import pandas as pd

def download_dataset():
    """Download the Kaggle dataset."""
    print("[DOWNLOAD] Downloading India travel dataset from Kaggle...")
    path = kagglehub.dataset_download("saketk511/travel-dataset-guide-to-indias-must-see-places")
    print(f"[OK] Path to dataset files: {path}")
    return path

def load_existing_destinations():
    """Load existing destination data."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_category(place_type):
    """Map place types to categories."""
    type_lower = str(place_type).lower()
    if any(w in type_lower for w in ['beach', 'island']):
        return 'beach'
    elif any(w in type_lower for w in ['temple', 'religious', 'spiritual', 'shrine', 'mosque', 'church']):
        return 'religious'
    elif any(w in type_lower for w in ['hill', 'mountain', 'valley', 'nature', 'wildlife', 'park', 'forest']):
        return 'nature'
    elif any(w in type_lower for w in ['monument', 'fort', 'palace', 'historic', 'heritage']):
        return 'monument'
    elif any(w in type_lower for w in ['city', 'urban', 'metro']):
        return 'city'
    else:
        return 'cultural'

def get_moods(place_type, description=''):
    """Generate moods based on place type."""
    moods = []
    combined = f"{place_type} {description}".lower()
    
    if any(w in combined for w in ['romantic', 'honeymoon', 'couple']):
        moods.append('romantic')
    if any(w in combined for w in ['adventure', 'trek', 'hike', 'sport']):
        moods.append('adventure')
    if any(w in combined for w in ['peaceful', 'quiet', 'serene', 'calm']):
        moods.append('peaceful')
    if any(w in combined for w in ['spiritual', 'temple', 'religious', 'holy']):
        moods.append('spiritual')
    if any(w in combined for w in ['nature', 'scenic', 'natural', 'wildlife']):
        moods.append('nature')
    if any(w in combined for w in ['historic', 'heritage', 'ancient', 'history']):
        moods.append('historic')
    if any(w in combined for w in ['relax', 'spa', 'resort']):
        moods.append('relaxing')
    
    if not moods:
        moods = ['peaceful', 'nature']
    
    return moods[:4]

def process_kaggle_data(dataset_path, existing_data):
    """Process and integrate Kaggle data."""
    # Find CSV files in the dataset
    csv_files = []
    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith('.csv'):
                csv_files.append(os.path.join(root, file))
    
    if not csv_files:
        print("[ERROR] No CSV files found in dataset")
        return existing_data
    
    print(f"[INFO] Found CSV files: {csv_files}")
    
    # Get existing titles to avoid duplicates
    existing_titles = {d['title'].lower() for d in existing_data}
    
    next_id = len(existing_data) + 1
    new_destinations = []
    
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file, encoding='utf-8')
            print(f"[DATA] Processing {os.path.basename(csv_file)}: {len(df)} rows")
            print(f"   Columns: {df.columns.tolist()}")
            
            # Common column name mappings
            name_cols = ['name', 'place', 'destination', 'place_name', 'Name', 'Place']
            state_cols = ['state', 'location', 'State', 'Location', 'region']
            type_cols = ['type', 'category', 'Type', 'Category', 'place_type']
            desc_cols = ['description', 'about', 'Description', 'About', 'details']
            
            # Find matching columns
            name_col = next((c for c in name_cols if c in df.columns), None)
            state_col = next((c for c in state_cols if c in df.columns), None)
            type_col = next((c for c in type_cols if c in df.columns), None)
            desc_col = next((c for c in desc_cols if c in df.columns), None)
            
            if not name_col:
                print(f"   [WARN] No name column found, skipping")
                continue
            
            for _, row in df.iterrows():
                name = str(row.get(name_col, '')).strip()
                if not name or name.lower() == 'nan':
                    continue
                
                state = str(row.get(state_col, 'India')).strip() if state_col else 'India'
                if state.lower() == 'nan':
                    state = 'India'
                
                place_type = str(row.get(type_col, '')).strip() if type_col else ''
                description = str(row.get(desc_col, '')).strip() if desc_col else ''
                
                # Create title
                if state and state != 'India':
                    title = f"{name}, {state}"
                else:
                    title = name
                
                # Skip if already exists
                if title.lower() in existing_titles:
                    continue
                
                # Add new destination
                dest = {
                    'id': next_id,
                    'title': title,
                    'price': 3500,  # Default price for Indian destinations
                    'location': state,
                    'country': 'India',
                    'continent': 'Asia',
                    'category': get_category(place_type),
                    'moods': get_moods(place_type, description),
                    'activities': ['sightseeing', 'photography'],
                    'best_for': ['tourists', 'families'],
                    'season': ['year-round'],
                    'budget_tier': 'budget',
                    'description': description[:200] if description and description.lower() != 'nan' else f"Explore the beautiful {name} in {state}, India."
                }
                
                new_destinations.append(dest)
                existing_titles.add(title.lower())
                next_id += 1
                
        except Exception as e:
            print(f"   [ERROR] Error processing {csv_file}: {e}")
    
    print(f"\n[OK] Found {len(new_destinations)} new destinations to add")
    return existing_data + new_destinations

def save_destinations(data):
    """Save updated destinations."""
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'destinations_enriched.json')
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[SAVED] Saved {len(data)} destinations to {data_path}")

def main():
    print("=" * 60)
    print("[INFO] India Travel Dataset Integration")
    print("=" * 60)
    
    # Download dataset
    dataset_path = download_dataset()
    
    # Load existing data
    existing = load_existing_destinations()
    print(f"[DATA] Existing destinations: {len(existing)}")
    
    # Process and integrate
    updated = process_kaggle_data(dataset_path, existing)
    
    # Save
    if len(updated) > len(existing):
        save_destinations(updated)
        print(f"\n[SUCCESS] Added {len(updated) - len(existing)} new Indian destinations!")
        print(f"[DATA] Total destinations now: {len(updated)}")
    else:
        print("\n[INFO] No new unique destinations found to add.")

if __name__ == "__main__":
    main()
