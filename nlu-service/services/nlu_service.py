import logging
from typing import Dict, List, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os

logger = logging.getLogger(__name__)

class NLUService:
    def __init__(self):
        self.mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/chatbot_db")
        self.client = None
        self.db = None

    async def initialize(self):
        """Initialize MongoDB connection"""
        try:
            self.client = AsyncIOMotorClient(self.mongodb_uri)
            self.db = self.client.chatbot_db
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise

    async def log_classification(self, message: str, intent: str, confidence: float, entities: Dict[str, Any]):
        """Log classification result to MongoDB"""
        try:
            classification_log = {
                "message": message,
                "intent": intent,
                "confidence": confidence,
                "entities": entities,
                "timestamp": datetime.now(),
                "service": "nlu-service"
            }
            
            await self.db.analytics.insert_one(classification_log)
            logger.debug(f"Logged classification: {intent} ({confidence:.2f})")
            
        except Exception as e:
            logger.error(f"Failed to log classification: {str(e)}")

    async def get_intents(self) -> List[Dict[str, Any]]:
        """Get all available intents from MongoDB"""
        try:
            intents = []
            async for intent in self.db.intents.find():
                intent["_id"] = str(intent["_id"])
                intents.append(intent)
            return intents
        except Exception as e:
            logger.error(f"Failed to get intents: {str(e)}")
            return []

    async def create_intent(self, intent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new intent"""
        try:
            intent_data["created_at"] = datetime.now()
            result = await self.db.intents.insert_one(intent_data)
            intent_data["_id"] = str(result.inserted_id)
            return intent_data
        except Exception as e:
            logger.error(f"Failed to create intent: {str(e)}")
            raise

    async def get_analytics(self) -> Dict[str, Any]:
        """Get classification analytics"""
        try:
            # Get total classifications
            total_classifications = await self.db.analytics.count_documents({})
            
            # Get intent distribution
            pipeline = [
                {"$group": {"_id": "$intent", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            intent_distribution = []
            async for doc in self.db.analytics.aggregate(pipeline):
                intent_distribution.append({
                    "intent": doc["_id"],
                    "count": doc["count"]
                })
            
            # Get average confidence
            pipeline = [{"$group": {"_id": None, "avg_confidence": {"$avg": "$confidence"}}}]
            avg_confidence = 0
            async for doc in self.db.analytics.aggregate(pipeline):
                avg_confidence = doc.get("avg_confidence", 0)
            
            return {
                "total_classifications": total_classifications,
                "intent_distribution": intent_distribution,
                "average_confidence": round(avg_confidence, 3)
            }
            
        except Exception as e:
            logger.error(f"Failed to get analytics: {str(e)}")
            return {
                "total_classifications": 0,
                "intent_distribution": [],
                "average_confidence": 0
            }
