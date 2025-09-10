import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatInterface from './components/ChatInterface';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const LoginContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const ChatContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <AppContainer>
      <Header />
      <MainContent>
        {!isAuthenticated ? (
          <LoginContainer>
            <LoginForm />
          </LoginContainer>
        ) : (
          <ChatContainer>
            <ChatInterface />
          </ChatContainer>
        )}
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
