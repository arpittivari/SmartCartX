import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authClient } from './mqttAuth.controller.js';
import Cart from '../models/cart.model.js';
import config from '../config/index.js';

// Mock dependencies
vi.mock('../models/cart.model.js');
vi.mock('../config/index.js', () => ({
  default: {
    mqtt: {
      username: 'test_backend_user',
      password: 'test_backend_password'
    }
  }
}));

describe('MQTT Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup req and res mocks
    req = {
      body: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    };

    // Silence console logs during tests to keep output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('authClient', () => {
    it('should authenticate the backend user successfully', async () => {
      req.body = {
        username: 'test_backend_user',
        password: 'test_backend_password'
      };

      await authClient(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('ok');
      expect(Cart.findOne).not.toHaveBeenCalled();
    });

    it('should authenticate a valid cart successfully', async () => {
      req.body = {
        username: 'cart123',
        password: 'cart_password'
      };

      // Mock Cart.findOne to return a valid cart
      Cart.findOne.mockResolvedValue({
        cartId: 'cart_001',
        mqttUsername: 'cart123',
        mqttPassword: 'cart_password'
      });

      await authClient(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ mqttUsername: 'cart123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('ok');
    });

    it('should deny access if cart password is incorrect', async () => {
      req.body = {
        username: 'cart123',
        password: 'wrong_password'
      };

      // Mock Cart.findOne to return a valid cart
      Cart.findOne.mockResolvedValue({
        cartId: 'cart_001',
        mqttUsername: 'cart123',
        mqttPassword: 'cart_password'
      });

      await authClient(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ mqttUsername: 'cart123' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('unauthorized');
    });

    it('should deny access if cart does not exist and not backend user', async () => {
      req.body = {
        username: 'unknown_user',
        password: 'some_password'
      };

      // Mock Cart.findOne to return null (cart not found)
      Cart.findOne.mockResolvedValue(null);

      await authClient(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ mqttUsername: 'unknown_user' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith('unauthorized');
    });

    it('should return 500 server error if Cart.findOne throws an error', async () => {
      req.body = {
        username: 'error_user',
        password: 'any_password'
      };

      // Mock Cart.findOne to throw an error
      const mockError = new Error('Database connection failed');
      Cart.findOne.mockRejectedValue(mockError);

      await authClient(req, res);

      expect(Cart.findOne).toHaveBeenCalledWith({ mqttUsername: 'error_user' });
      expect(console.error).toHaveBeenCalledWith(
        '[MQTT Auth] ❌ Server error during authentication:',
        mockError
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('server_error');
    });
  });
});
