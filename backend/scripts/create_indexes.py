from pymongo import MongoClient

from config import Config


def create_indexes():
    client = MongoClient(Config.MONGODB_URI)
    db = client.wandrix

    db.users.create_index("email", unique=True)
    db.comparisons.create_index([("user_id", 1), ("created_at", -1)])
    db.itineraries.create_index([("user_id", 1), ("created_at", -1)])

    print("Indexes ensured:")
    print("- users.email (unique)")
    print("- comparisons.user_id + created_at")
    print("- itineraries.user_id + created_at")


if __name__ == '__main__':
    create_indexes()
