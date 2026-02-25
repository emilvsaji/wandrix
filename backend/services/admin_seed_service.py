from datetime import datetime

from werkzeug.security import generate_password_hash

from config import Config
from database import get_users_collection


def seed_admin_user():
    """Create or update the seeded admin user from environment variables."""
    admin_email = Config.ADMIN_EMAIL
    admin_password = Config.ADMIN_PASSWORD
    admin_name = Config.ADMIN_NAME or "Wandrix Admin"

    if not admin_email or not admin_password:
        print("[ADMIN_SEED] Skipping admin seed (ADMIN_EMAIL or ADMIN_PASSWORD missing)")
        return False

    users = get_users_collection()
    if users is None:
        print("[ADMIN_SEED] Skipping admin seed (users collection unavailable)")
        return False

    now = datetime.utcnow()
    existing_user = users.find_one({"email": admin_email})

    admin_fields = {
        "name": admin_name,
        "password": generate_password_hash(admin_password),
        "is_admin": True,
        "seeded_admin": True,
        "updated_at": now,
    }

    if existing_user:
        users.update_one({"_id": existing_user["_id"]}, {"$set": admin_fields})
        print(f"[ADMIN_SEED] Admin user updated: {admin_email}")
        return True

    users.insert_one(
        {
            "email": admin_email,
            "name": admin_name,
            "password": admin_fields["password"],
            "is_admin": True,
            "seeded_admin": True,
            "wishlist": [],
            "created_at": now,
            "updated_at": now,
            "avatar_url": None,
        }
    )
    print(f"[ADMIN_SEED] Admin user created: {admin_email}")
    return True
