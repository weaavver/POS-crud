import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.pos_shop

users_collection = db.users
products_collection = db.products
orders_collection = db.orders
# Special Offers: the daily random pair, and the games the admin hand-picked
deals_collection = db.deals
manual_deals_collection = db.manual_deals