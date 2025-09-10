import logging
import re
from typing import Tuple, Dict, Any
import asyncio

logger = logging.getLogger(__name__)

class IntentClassifier:
    def __init__(self):
        self.intent_patterns = {}
        self.entity_patterns = {}

    async def load_model(self):
        """Load intent classification model (rule-based for demo)"""
        logger.info("Loading intent classification model...")
        
        # Define intent patterns (rule-based approach for demo)
        self.intent_patterns = {
            "greeting": [
                r"\b(hello|hi|hey|good morning|good afternoon|good evening)\b",
                r"\b(howdy|greetings|what's up)\b"
            ],
            "goodbye": [
                r"\b(bye|goodbye|see you|farewell|take care)\b",
                r"\b(see you later|until next time|have a good day)\b"
            ],
            "help": [
                r"\b(help|assist|support|how to|what can you do)\b",
                r"\b(guide|instructions|tutorial|explain)\b"
            ],
            "thanks": [
                r"\b(thank you|thanks|appreciate|grateful)\b",
                r"\b(much obliged|cheers|thx)\b"
            ],
            "complaint": [
                r"\b(problem|issue|error|bug|broken|not working)\b",
                r"\b(complaint|frustrated|angry|disappointed)\b"
            ],
            "question": [
                r"\b(what|how|when|where|why|who|which)\b",
                r"\b(can you|could you|would you|is it possible)\b"
            ]
        }
        
        # Define entity patterns
        self.entity_patterns = {
            "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "phone": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
            "number": r"\b\d+\b",
            "url": r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
        }
        
        logger.info("Intent classification model loaded successfully")

    async def classify(self, message: str) -> Tuple[str, float, Dict[str, Any]]:
        """
        Classify the intent of a message and extract entities
        Returns: (intent, confidence, entities)
        """
        try:
            message_lower = message.lower().strip()
            
            # Extract entities first
            entities = self._extract_entities(message)
            
            # Classify intent
            intent, confidence = self._classify_intent(message_lower)
            
            logger.debug(f"Classified '{message}' as '{intent}' with confidence {confidence:.2f}")
            
            return intent, confidence, entities
            
        except Exception as e:
            logger.error(f"Error classifying message: {str(e)}")
            return "unknown", 0.0, {}

    def _classify_intent(self, message: str) -> Tuple[str, float]:
        """Classify intent using pattern matching"""
        best_intent = "unknown"
        best_confidence = 0.0
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message, re.IGNORECASE):
                    # Calculate confidence based on pattern match strength
                    confidence = 0.8  # Base confidence for pattern match
                    
                    # Boost confidence for exact matches
                    if any(exact in message for exact in ["hello", "hi", "bye", "goodbye", "help", "thanks"]):
                        confidence = 0.95
                    
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_intent = intent
        
        # If no pattern matches, check for question words
        if best_intent == "unknown" and re.search(r"\b(what|how|when|where|why|who|which)\b", message):
            best_intent = "question"
            best_confidence = 0.6
        
        return best_intent, best_confidence

    def _extract_entities(self, message: str) -> Dict[str, Any]:
        """Extract named entities from the message"""
        entities = {}
        
        for entity_type, pattern in self.entity_patterns.items():
            matches = re.findall(pattern, message)
            if matches:
                entities[entity_type] = matches
        
        return entities
