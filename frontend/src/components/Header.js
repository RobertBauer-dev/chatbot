import React from 'react';
import styled from 'styled-components';
import { LogOut, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <HeaderContainer>
      <Logo>
        <Bot size={24} />
        Conversational AI Platform
      </Logo>
      
      {isAuthenticated && (
        <UserSection>
          <span>Welcome, {user?.username}</span>
          <LogoutButton onClick={logout}>
            <LogOut size={16} />
            Logout
          </LogoutButton>
        </UserSection>
      )}
    </HeaderContainer>
  );
};

export default Header;
