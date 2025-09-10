import logging
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    """Get database instance"""
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/chatbot_db")
        db.client = AsyncIOMotorClient(mongodb_uri)
        db.database = db.client.chatbot_db
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")
