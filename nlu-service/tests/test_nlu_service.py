import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from services.nlu_service import NLUService

@pytest.fixture
def nlu_service():
    service = NLUService()
    return service

@pytest.mark.asyncio
async def test_initialize(nlu_service):
    """Test NLU service initialization"""
    with patch('motor.motor_asyncio.AsyncIOMotorClient') as mock_client:
        mock_client.return_value = AsyncMock()
        
        await nlu_service.initialize()
        
        assert nlu_service.client is not None
        assert nlu_service.db is not None

@pytest.mark.asyncio
async def test_log_classification(nlu_service):
    """Test classification logging"""
    nlu_service.db = AsyncMock()
    nlu_service.db.analytics = AsyncMock()
    nlu_service.db.analytics.insert_one = AsyncMock()
    
    await nlu_service.log_classification(
        message="Hello",
        intent="greeting",
        confidence=0.95,
        entities={"test": "value"}
    )
    
    nlu_service.db.analytics.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_get_intents(nlu_service):
    """Test getting intents from database"""
    mock_intent = {
        "_id": "507f1f77bcf86cd799439011",
        "name": "greeting",
        "description": "User greets the bot",
        "examples": ["Hello", "Hi"]
    }
    
    nlu_service.db = AsyncMock()
    nlu_service.db.intents = AsyncMock()
    nlu_service.db.intents.find = AsyncMock()
    nlu_service.db.intents.find.return_value = [mock_intent]
    
    intents = await nlu_service.get_intents()
    
    assert len(intents) == 1
    assert intents[0]["name"] == "greeting"

@pytest.mark.asyncio
async def test_create_intent(nlu_service):
    """Test creating a new intent"""
    mock_result = AsyncMock()
    mock_result.inserted_id = "507f1f77bcf86cd799439011"
    
    nlu_service.db = AsyncMock()
    nlu_service.db.intents = AsyncMock()
    nlu_service.db.intents.insert_one = AsyncMock(return_value=mock_result)
    
    intent_data = {
        "name": "test_intent",
        "description": "Test intent",
        "examples": ["test message"]
    }
    
    result = await nlu_service.create_intent(intent_data)
    
    assert result["_id"] == "507f1f77bcf86cd799439011"
    assert result["name"] == "test_intent"

@pytest.mark.asyncio
async def test_get_analytics(nlu_service):
    """Test getting analytics data"""
    mock_analytics_data = [
        {"_id": "greeting", "count": 10},
        {"_id": "help", "count": 5}
    ]
    
    mock_avg_data = [{"_id": None, "avg_confidence": 0.85}]
    
    nlu_service.db = AsyncMock()
    nlu_service.db.analytics = AsyncMock()
    nlu_service.db.analytics.count_documents = AsyncMock(return_value=15)
    nlu_service.db.analytics.aggregate = AsyncMock()
    
    # Mock the aggregate pipeline results
    async def mock_aggregate(pipeline):
        if pipeline[0]["$group"].get("_id") == "$intent":
            for item in mock_analytics_data:
                yield item
        else:
            for item in mock_avg_data:
                yield item
    
    nlu_service.db.analytics.aggregate = mock_aggregate
    
    analytics = await nlu_service.get_analytics()
    
    assert analytics["total_classifications"] == 15
    assert len(analytics["intent_distribution"]) == 2
    assert analytics["average_confidence"] == 0.85
