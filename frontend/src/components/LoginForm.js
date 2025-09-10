import React, { useState } from 'react';
import styled from 'styled-components';
import { Bot, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FormContainer = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-decoration: underline;

  &:hover {
    color: #764ba2;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DemoCredentials = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin 
        ? await login(username, password)
        : await register(username, password);

      if (!result.success) {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <FormContainer>
      <Bot size={48} color="#667eea" style={{ marginBottom: '1rem' }} />
      <Title>{isLogin ? 'Welcome Back' : 'Create Account'}</Title>
      <Subtitle>
        {isLogin 
          ? 'Sign in to start chatting with our AI assistant' 
          : 'Join our platform and experience intelligent conversations'
        }
      </Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Icon>
            <User size={20} />
          </Icon>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Icon>
            <Lock size={20} />
          </Icon>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>

        <Button type="submit" disabled={loading}>
          {loading ? (
            'Please wait...'
          ) : (
            <>
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </>
          )}
        </Button>
      </Form>

      <ToggleButton type="button" onClick={toggleMode}>
        {isLogin 
          ? "Don't have an account? Sign up" 
          : "Already have an account? Sign in"
        }
      </ToggleButton>

      <DemoCredentials>
        <strong>Demo Credentials:</strong><br />
        Username: demo<br />
        Password: password123
      </DemoCredentials>
    </FormContainer>
  );
};

export default LoginForm;
