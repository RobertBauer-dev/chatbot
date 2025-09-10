// MongoDB Initialization Script
db = db.getSiblingDB('chatbot_db');

// Create collections
db.createCollection('sessions');
db.createCollection('conversations');
db.createCollection('intents');
db.createCollection('analytics');

// Create indexes for better performance
db.sessions.createIndex({ "sessionId": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "createdAt": 1 });

db.conversations.createIndex({ "sessionId": 1 });
db.conversations.createIndex({ "timestamp": 1 });
db.conversations.createIndex({ "intent": 1 });

db.intents.createIndex({ "name": 1 }, { unique: true });

// Insert sample intents
db.intents.insertMany([
  {
    name: "greeting",
    description: "User greets the bot",
    examples: ["Hello", "Hi", "Good morning", "Hey there"],
    responses: ["Hello! How can I help you today?", "Hi there! What can I do for you?"]
  },
  {
    name: "goodbye",
    description: "User says goodbye",
    examples: ["Bye", "Goodbye", "See you later", "Have a nice day"],
    responses: ["Goodbye! Have a great day!", "See you later! Take care!"]
  },
  {
    name: "help",
    description: "User asks for help",
    examples: ["Help", "What can you do?", "I need assistance", "How does this work?"],
    responses: ["I can help you with various tasks. What would you like to know?", "I'm here to assist you. What do you need help with?"]
  },
  {
    name: "unknown",
    description: "Unknown or unclear intent",
    examples: [],
    responses: ["I'm not sure I understand. Could you please rephrase that?", "I didn't quite catch that. Can you help me understand what you need?"]
  }
]);

print("MongoDB initialization completed successfully!");
