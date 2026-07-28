from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["cap_detector"]
submissions_collection = db["submissions"]
problems_collection = db["problems"]