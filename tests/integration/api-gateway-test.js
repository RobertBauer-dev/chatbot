const axios = require('axios');
const { expect } = require('chai');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

describe('API Gateway Integration Tests', () => {
  let authToken;

  before(async () => {
    // Login to get authentication token
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'demo',
      password: 'password123'
    });
    
    authToken = loginResponse.data.accessToken;
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: 'demo',
        password: 'password123'
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('accessToken');
      expect(response.data).to.have.property('tokenType', 'Bearer');
    });

    it('should fail login with invalid credentials', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/login`, {
          username: 'demo',
          password: 'wrongpassword'
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });

    it('should register new user successfully', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username: `testuser${Date.now()}`,
        password: 'password123'
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.equal('User registered successfully');
    });
  });

  describe('Chat API', () => {
    it('should send message and receive response', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/chat/message`, {
        message: 'Hello, how are you?'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('sessionId');
      expect(response.data).to.have.property('response');
      expect(response.data).to.have.property('intent');
      expect(response.data).to.have.property('confidence');
      expect(response.data.confidence).to.be.a('number');
    });

    it('should handle public chat endpoint', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/chat/message/public`, {
        message: 'Hello'
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('response');
    });

    it('should require authentication for protected endpoints', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/chat/message`, {
          message: 'Hello'
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  describe('Session Management', () => {
    it('should create new session', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/sessions`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('sessionId');
      expect(response.data).to.have.property('userId', 'demo');
      expect(response.data).to.have.property('status', 'ACTIVE');
    });

    it('should get user sessions', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('array');
    });
  });

  describe('Health Checks', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${API_BASE_URL}/actuator/health`);

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('UP');
    });
  });
});
