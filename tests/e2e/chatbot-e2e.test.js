const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Chatbot E2E Tests', () => {
  let driver;
  const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  before(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .build();
    
    await driver.manage().window().setRect({ width: 1280, height: 720 });
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Login Flow', () => {
    it('should display login form by default', async () => {
      await driver.get(BASE_URL);
      
      await driver.wait(until.elementLocated(By.css('input[placeholder*="Username"]')), 10000);
      
      const usernameInput = await driver.findElement(By.css('input[placeholder*="Username"]'));
      const passwordInput = await driver.findElement(By.css('input[placeholder*="Password"]'));
      const loginButton = await driver.findElement(By.css('button'));
      
      expect(await usernameInput.isDisplayed()).to.be.true;
      expect(await passwordInput.isDisplayed()).to.be.true;
      expect(await loginButton.isDisplayed()).to.be.true;
    });

    it('should login with demo credentials', async () => {
      await driver.get(BASE_URL);
      
      const usernameInput = await driver.findElement(By.css('input[placeholder*="Username"]'));
      const passwordInput = await driver.findElement(By.css('input[placeholder*="Password"]'));
      const loginButton = await driver.findElement(By.css('button'));
      
      await usernameInput.clear();
      await usernameInput.sendKeys('demo');
      
      await passwordInput.clear();
      await passwordInput.sendKeys('password123');
      
      await loginButton.click();
      
      // Wait for chat interface to load
      await driver.wait(until.elementLocated(By.css('textarea[placeholder*="message"]')), 10000);
      
      const chatInput = await driver.findElement(By.css('textarea[placeholder*="message"]'));
      expect(await chatInput.isDisplayed()).to.be.true;
    });

    it('should display welcome message', async () => {
      await driver.get(BASE_URL);
      
      // Login
      await driver.findElement(By.css('input[placeholder*="Username"]')).sendKeys('demo');
      await driver.findElement(By.css('input[placeholder*="Password"]')).sendKeys('password123');
      await driver.findElement(By.css('button')).click();
      
      // Wait for welcome message
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Hello! I')]")), 10000);
      
      const welcomeMessage = await driver.findElement(By.xpath("//*[contains(text(), 'Hello! I')]"));
      expect(await welcomeMessage.isDisplayed()).to.be.true;
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(async () => {
      await driver.get(BASE_URL);
      
      // Login
      await driver.findElement(By.css('input[placeholder*="Username"]')).sendKeys('demo');
      await driver.findElement(By.css('input[placeholder*="Password"]')).sendKeys('password123');
      await driver.findElement(By.css('button')).click();
      
      // Wait for chat interface
      await driver.wait(until.elementLocated(By.css('textarea[placeholder*="message"]')), 10000);
    });

    it('should send message and receive response', async () => {
      const chatInput = await driver.findElement(By.css('textarea[placeholder*="message"]'));
      const sendButton = await driver.findElement(By.css('button[type="button"]'));
      
      await chatInput.sendKeys('Hello, how are you?');
      await sendButton.click();
      
      // Wait for bot response
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'How can I help')]")), 15000);
      
      const botResponse = await driver.findElement(By.xpath("//*[contains(text(), 'How can I help')]"));
      expect(await botResponse.isDisplayed()).to.be.true;
    });

    it('should send message with Enter key', async () => {
      const chatInput = await driver.findElement(By.css('textarea[placeholder*="message"]'));
      
      await chatInput.sendKeys('What can you do?');
      await chatInput.sendKeys('\n');
      
      // Wait for response
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'I can help')]")), 15000);
      
      const response = await driver.findElement(By.xpath("//*[contains(text(), 'I can help')]"));
      expect(await response.isDisplayed()).to.be.true;
    });

    it('should display suggestions when provided', async () => {
      const chatInput = await driver.findElement(By.css('textarea[placeholder*="message"]'));
      const sendButton = await driver.findElement(By.css('button[type="button"]'));
      
      await chatInput.sendKeys('Hello');
      await sendButton.click();
      
      // Wait for suggestions
      await driver.wait(until.elementLocated(By.css('button[style*="background: rgba"]')), 15000);
      
      const suggestions = await driver.findElements(By.css('button[style*="background: rgba"]'));
      expect(suggestions.length).to.be.greaterThan(0);
    });

    it('should click suggestion and populate input', async () => {
      const chatInput = await driver.findElement(By.css('textarea[placeholder*="message"]'));
      const sendButton = await driver.findElement(By.css('button[type="button"]'));
      
      await chatInput.sendKeys('Hello');
      await sendButton.click();
      
      // Wait for suggestions
      await driver.wait(until.elementLocated(By.css('button[style*="background: rgba"]')), 15000);
      
      const suggestion = await driver.findElement(By.css('button[style*="background: rgba"]'));
      await suggestion.click();
      
      const inputValue = await chatInput.getAttribute('value');
      expect(inputValue.length).to.be.greaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', async () => {
      await driver.manage().window().setRect({ width: 375, height: 667 });
      
      await driver.get(BASE_URL);
      
      const loginForm = await driver.findElement(By.css('form'));
      expect(await loginForm.isDisplayed()).to.be.true;
    });

    it('should work on tablet viewport', async () => {
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      
      await driver.get(BASE_URL);
      
      const loginForm = await driver.findElement(By.css('form'));
      expect(await loginForm.isDisplayed()).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should display error for invalid login', async () => {
      await driver.get(BASE_URL);
      
      const usernameInput = await driver.findElement(By.css('input[placeholder*="Username"]'));
      const passwordInput = await driver.findElement(By.css('input[placeholder*="Password"]'));
      const loginButton = await driver.findElement(By.css('button'));
      
      await usernameInput.sendKeys('invalid');
      await passwordInput.sendKeys('invalid');
      await loginButton.click();
      
      // Wait for error message
      await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Invalid credentials')]")), 10000);
      
      const errorMessage = await driver.findElement(By.xpath("//*[contains(text(), 'Invalid credentials')]"));
      expect(await errorMessage.isDisplayed()).to.be.true;
    });
  });
});
