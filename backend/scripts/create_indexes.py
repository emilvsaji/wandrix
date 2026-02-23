from pymongo import MongoClient

from config import Config


def create_indexes():
    client = MongoClient(Config.MONGODB_URI)
    db = client.wandrix

    db.users.create_index("email", unique=True)
    db.comparisons.create_index("user_id")
    db.comparisons.create_index([("user_id", 1), ("created_at", -1)])
    db.comparisons.create_index([("comparison_key", 1), ("created_at", -1)])
    db.comparisons.create_index([("user_id", 1), ("comparison_key", 1), ("preferences_key", 1), ("created_at", -1)])
    db.itineraries.create_index("user_id")
    db.itineraries.create_index([("user_id", 1), ("created_at", -1)])
    db.itineraries.create_index([("user_id", 1), ("destination_normalized", 1), ("preferences_key", 1), ("created_at", -1)])
    db.destinations.create_index("name_lower", unique=True)
    db.destinations.create_index([("updated_at", -1)])

    print("Indexes ensured:")
    print("- users.email (unique)")
    print("- comparisons.user_id")
    print("- comparisons.user_id + created_at")
    print("- comparisons.comparison_key + created_at")
    print("- comparisons.user_id + comparison_key + preferences_key + created_at")
    print("- itineraries.user_id")
    print("- itineraries.user_id + created_at")
    print("- itineraries.user_id + destination_normalized + preferences_key + created_at")
    print("- destinations.name_lower (unique)")
    print("- destinations.updated_at")


if __name__ == '__main__':
    create_indexes()
