import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from main import app

client = TestClient(app)

@pytest.fixture
def mock_nlu_service():
    with patch('main.nlu_service') as mock:
        mock.initialize = AsyncMock()
        mock.log_classification = AsyncMock()
        yield mock

@pytest.fixture
def mock_intent_classifier():
    with patch('main.intent_classifier') as mock:
        mock.load_model = AsyncMock()
        mock.classify = AsyncMock()
        yield mock

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_classify_intent_success(mock_nlu_service, mock_intent_classifier):
    """Test successful intent classification"""
    mock_intent_classifier.classify.return_value = ("greeting", 0.95, {})
    
    response = client.post(
        "/api/nlu/classify",
        json={"message": "Hello there!"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "greeting"
    assert data["confidence"] == 0.95
    assert data["entities"] == {}

@pytest.mark.asyncio
async def test_classify_intent_with_entities(mock_nlu_service, mock_intent_classifier):
    """Test intent classification with entity extraction"""
    entities = {"email": ["test@example.com"], "phone": ["123-456-7890"]}
    mock_intent_classifier.classify.return_value = ("help", 0.87, entities)
    
    response = client.post(
        "/api/nlu/classify",
        json={"message": "Help me with my email test@example.com"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "help"
    assert data["confidence"] == 0.87
    assert "email" in data["entities"]

@pytest.mark.asyncio
async def test_classify_intent_error(mock_nlu_service, mock_intent_classifier):
    """Test intent classification error handling"""
    mock_intent_classifier.classify.side_effect = Exception("Classification error")
    
    response = client.post(
        "/api/nlu/classify",
        json={"message": "Test message"}
    )
    
    assert response.status_code == 500
    assert "Classification failed" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_intents(mock_nlu_service):
    """Test getting intents"""
    mock_intents = [
        {"name": "greeting", "description": "User greets"},
        {"name": "help", "description": "User asks for help"}
    ]
    mock_nlu_service.get_intents.return_value = mock_intents
    
    response = client.get("/api/nlu/intents")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["intents"]) == 2
    assert data["intents"][0]["name"] == "greeting"

@pytest.mark.asyncio
async def test_create_intent(mock_nlu_service):
    """Test creating a new intent"""
    mock_created_intent = {
        "_id": "507f1f77bcf86cd799439011",
        "name": "test_intent",
        "description": "Test intent"
    }
    mock_nlu_service.create_intent.return_value = mock_created_intent
    
    intent_data = {
        "name": "test_intent",
        "description": "Test intent",
        "examples": ["test message"]
    }
    
    response = client.post("/api/nlu/intents", json=intent_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "Intent created successfully" in data["message"]

@pytest.mark.asyncio
async def test_get_analytics(mock_nlu_service):
    """Test getting analytics"""
    mock_analytics = {
        "total_classifications": 100,
        "intent_distribution": [
            {"intent": "greeting", "count": 50},
            {"intent": "help", "count": 30}
        ],
        "average_confidence": 0.85
    }
    mock_nlu_service.get_analytics.return_value = mock_analytics
    
    response = client.get("/api/nlu/analytics")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_classifications"] == 100
    assert len(data["intent_distribution"]) == 2
    assert data["average_confidence"] == 0.85
