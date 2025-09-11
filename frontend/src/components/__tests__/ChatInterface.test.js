import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from '../ChatInterface';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

// Mock the services
jest.mock('../../services/chatService');
jest.mock('../../contexts/AuthContext');

describe('ChatInterface', () => {
  const mockSendMessage = jest.fn();
  const mockSendMessagePublic = jest.fn();

  beforeEach(() => {
    chatService.sendMessage = mockSendMessage;
    chatService.sendMessagePublic = mockSendMessagePublic;
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'testuser' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface with welcome message', () => {
    render(<ChatInterface />);
    
    expect(screen.getByText(/Hello! I'm your AI assistant/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    const mockResponse = {
      messageId: '123',
      response: 'Hello! How can I help you?',
      intent: 'greeting',
      confidence: 0.95,
      entities: {},
      timestamp: new Date().toISOString(),
      suggestions: ['Help', 'What can you do?']
    };

    mockSendMessage.mockResolvedValue(mockResponse);

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello', null);
    });

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    });
  });

  test('handles message sending error', async () => {
    mockSendMessage.mockRejectedValue(new Error('Network error'));

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I encountered an error/i)).toBeInTheDocument();
    });
  });

  test('sends message on Enter key press', async () => {
    const mockResponse = {
      messageId: '123',
      response: 'Response',
      intent: 'greeting',
      confidence: 0.95,
      entities: {},
      timestamp: new Date().toISOString(),
      suggestions: []
    };

    mockSendMessage.mockResolvedValue(mockResponse);

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello', null);
    });
  });

  test('displays suggestions when provided', async () => {
    const mockResponse = {
      messageId: '123',
      response: 'Hello! How can I help you?',
      intent: 'greeting',
      confidence: 0.95,
      entities: {},
      timestamp: new Date().toISOString(),
      suggestions: ['Help me', 'What can you do?']
    };

    mockSendMessage.mockResolvedValue(mockResponse);

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Help me')).toBeInTheDocument();
      expect(screen.getByText('What can you do?')).toBeInTheDocument();
    });
  });

  test('clicking suggestion sets input value', async () => {
    const mockResponse = {
      messageId: '123',
      response: 'Hello! How can I help you?',
      intent: 'greeting',
      confidence: 0.95,
      entities: {},
      timestamp: new Date().toISOString(),
      suggestions: ['Help me', 'What can you do?']
    };

    mockSendMessage.mockResolvedValue(mockResponse);

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const suggestion = screen.getByText('Help me');
      fireEvent.click(suggestion);
    });

    expect(input.value).toBe('Help me');
  });

  test('uses public endpoint when not authenticated', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    const mockResponse = {
      messageId: '123',
      response: 'Response',
      intent: 'greeting',
      confidence: 0.95,
      entities: {},
      timestamp: new Date().toISOString(),
      suggestions: []
    };

    mockSendMessagePublic.mockResolvedValue(mockResponse);

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessagePublic).toHaveBeenCalledWith('Hello', null);
    });
  });
});
