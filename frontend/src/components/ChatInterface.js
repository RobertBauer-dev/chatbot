import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader } from 'lucide-react';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8f9fa;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  ${props => props.isUser ? 'flex-direction: row-reverse;' : ''}
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#667eea' : '#e9ecef'};
  color: ${props => props.isUser ? 'white' : '#666'};
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 70%;
  background: ${props => props.isUser ? '#667eea' : 'white'};
  color: ${props => props.isUser ? 'white' : '#333'};
  padding: 0.75rem 1rem;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
`;

const MessageMeta = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  opacity: 0.7;
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: 2px solid #e1e5e9;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  resize: none;
  max-height: 120px;
  min-height: 44px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SendButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5a6fd8;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SuggestionChip = styled.button`
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  margin: 2rem 0;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-style: italic;
`;

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['What can you do?', 'Help me with something', 'Tell me about yourself']
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = isAuthenticated 
        ? await chatService.sendMessage(inputMessage, sessionId)
        : await chatService.sendMessagePublic(inputMessage, sessionId);

      const botMessage = {
        id: response.messageId,
        content: response.response,
        sender: 'bot',
        timestamp: new Date(response.timestamp),
        intent: response.intent,
        confidence: response.confidence,
        suggestions: response.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
      setSessionId(response.sessionId);
      setSuggestions(response.suggestions || []);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} isUser={message.sender === 'user'}>
            <MessageAvatar isUser={message.sender === 'user'}>
              {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
            </MessageAvatar>
            <MessageContent isUser={message.sender === 'user'}>
              {message.content}
              <MessageMeta>
                {message.timestamp.toLocaleTimeString()}
                {message.intent && ` • ${message.intent} (${(message.confidence * 100).toFixed(0)}%)`}
              </MessageMeta>
              {message.suggestions && message.suggestions.length > 0 && (
                <Suggestions>
                  {message.suggestions.map((suggestion, index) => (
                    <SuggestionChip
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </SuggestionChip>
                  ))}
                </Suggestions>
              )}
            </MessageContent>
          </Message>
        ))}
        
        {isLoading && (
          <Message>
            <MessageAvatar>
              <Bot size={20} />
            </MessageAvatar>
            <MessageContent>
              <LoadingMessage>
                <Loader size={16} className="animate-spin" />
                AI is thinking...
              </LoadingMessage>
            </MessageContent>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <MessageInput
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
        />
        <SendButton onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
          <Send size={20} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;
