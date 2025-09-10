from pydantic import BaseModel
from typing import Dict, Any, Optional

class ClassificationRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ClassificationResponse(BaseModel):
    intent: str
    confidence: float
    entities: Dict[str, Any]
