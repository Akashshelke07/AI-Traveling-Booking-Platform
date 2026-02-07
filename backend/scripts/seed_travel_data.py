import kagglehub
import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from parent .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

def seed_database():
    print("🚀 Starting Data Seeding Process...")

    # 1. Download Dataset from Kaggle
    print("📥 Downloading 'traveler-trip-data' from Kaggle...")
    try:
        # Download latest version
        path = kagglehub.dataset_download("rkiattisak/traveler-trip-data")
        print("✅ Dataset downloaded to:", path)
        
        # Find the CSV file in the downloaded path
        csv_file = None
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(".csv"):
                    csv_file = os.path.join(root, file)
                    break
        
        if not csv_file:
            print("❌ No CSV file found in dataset")
            return

        print(f"📂 Found CSV file: {csv_file}")
        
    except Exception as e:
        print(f"❌ Error downloading/finding dataset: {e}")
        return

    # 2. Process Data with Pandas
    print("🔄 Processing data with Pandas...")
    try:
        df = pd.read_csv(csv_file)
        print(f"📊 Loaded {len(df)} records")
        
        # Clean/Transform data if necessary
        # Example: Convert column names to lowercase/snake_case for MongoDB
        df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('(', '').str.replace(')', '')
        
        # Convert DataFrame to dictionary records
        records = df.to_dict('records')
        print(f"📝 Prepared {len(records)} documents for insertion")
        
    except Exception as e:
        print(f"❌ Error processing CSV: {e}")
        return

    # 3. Connect to MongoDB
    print("🔌 Connecting to MongoDB...")
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("❌ MONGO_URI not found in .env file")
        return

    try:
        client = MongoClient(mongo_uri)
        db = client.get_database() # Gets database from URI
        collection_name = 'traveler_trips'
        collection = db[collection_name]
        
        # verify connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")

    except Exception as e:
        print(f"❌ MongoDB Connection Error: {e}")
        return

    # 4. Insert Data
    print(f"💾 Inserting data into collection '{collection_name}'...")
    try:
        # Optional: Clear existing data
        # collection.delete_many({}) 
        
        # Insert Many
        result = collection.insert_many(records)
        print(f"🎉 Successfully inserted {len(result.inserted_ids)} records!")
        print("✅ Data seeding complete.")

    except Exception as e:
        print(f"❌ Error inserting data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_database()
