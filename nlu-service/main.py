from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging
import os
from datetime import datetime
import uvicorn

from services.nlu_service import NLUService
from services.intent_classifier import IntentClassifier
from database.mongodb import get_database
from models.request_models import ClassificationRequest, ClassificationResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NLU Service",
    description="Natural Language Understanding Service for Conversational AI Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
nlu_service = NLUService()
intent_classifier = IntentClassifier()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting NLU Service...")
    await nlu_service.initialize()
    await intent_classifier.load_model()
    logger.info("NLU Service started successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/nlu/classify", response_model=ClassificationResponse)
async def classify_intent(request: ClassificationRequest):
    """
    Classify the intent of a user message
    """
    try:
        logger.info(f"Classifying message: {request.message}")
        
        # Classify intent
        intent, confidence, entities = await intent_classifier.classify(request.message)
        
        # Log the classification
        await nlu_service.log_classification(
            message=request.message,
            intent=intent,
            confidence=confidence,
            entities=entities
        )
        
        return ClassificationResponse(
            intent=intent,
            confidence=confidence,
            entities=entities
        )
        
    except Exception as e:
        logger.error(f"Error classifying message: {str(e)}")
        raise HTTPException(status_code=500, detail="Classification failed")

@app.get("/api/nlu/intents")
async def get_intents():
    """Get all available intents"""
    try:
        intents = await nlu_service.get_intents()
        return {"intents": intents}
    except Exception as e:
        logger.error(f"Error getting intents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get intents")

@app.post("/api/nlu/intents")
async def create_intent(intent_data: Dict[str, Any]):
    """Create a new intent"""
    try:
        result = await nlu_service.create_intent(intent_data)
        return {"message": "Intent created successfully", "intent": result}
    except Exception as e:
        logger.error(f"Error creating intent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create intent")

@app.get("/api/nlu/analytics")
async def get_analytics():
    """Get classification analytics"""
    try:
        analytics = await nlu_service.get_analytics()
        return analytics
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
