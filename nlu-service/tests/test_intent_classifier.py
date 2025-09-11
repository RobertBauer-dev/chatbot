import pytest
import asyncio
from services.intent_classifier import IntentClassifier

@pytest.fixture
def intent_classifier():
    classifier = IntentClassifier()
    return classifier

@pytest.mark.asyncio
async def test_classify_greeting(intent_classifier):
    """Test greeting intent classification"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("Hello there!")
    
    assert intent == "greeting"
    assert confidence > 0.8
    assert isinstance(entities, dict)

@pytest.mark.asyncio
async def test_classify_goodbye(intent_classifier):
    """Test goodbye intent classification"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("Goodbye, see you later!")
    
    assert intent == "goodbye"
    assert confidence > 0.8

@pytest.mark.asyncio
async def test_classify_help(intent_classifier):
    """Test help intent classification"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("Can you help me?")
    
    assert intent == "help"
    assert confidence > 0.7

@pytest.mark.asyncio
async def test_classify_question(intent_classifier):
    """Test question intent classification"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("What is the weather like?")
    
    assert intent == "question"
    assert confidence > 0.6

@pytest.mark.asyncio
async def test_classify_unknown(intent_classifier):
    """Test unknown intent classification"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("asdfghjkl")
    
    assert intent == "unknown"
    assert confidence == 0.0

@pytest.mark.asyncio
async def test_extract_entities(intent_classifier):
    """Test entity extraction"""
    await intent_classifier.load_model()
    
    intent, confidence, entities = await intent_classifier.classify("My email is test@example.com and my phone is 123-456-7890")
    
    assert "email" in entities
    assert "phone" in entities
    assert "test@example.com" in entities["email"]
    assert "123-456-7890" in entities["phone"]

@pytest.mark.asyncio
async def test_confidence_scoring(intent_classifier):
    """Test confidence scoring for different message types"""
    await intent_classifier.load_model()
    
    # Exact match should have high confidence
    intent1, confidence1, _ = await intent_classifier.classify("hello")
    assert confidence1 > 0.9
    
    # Pattern match should have good confidence
    intent2, confidence2, _ = await intent_classifier.classify("hi there")
    assert confidence2 > 0.8
    
    # Question word should have moderate confidence
    intent3, confidence3, _ = await intent_classifier.classify("what time is it")
    assert confidence3 > 0.6
