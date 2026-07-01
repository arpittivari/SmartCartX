import { jest } from '@jest/globals';
import { registerCart } from './cart.controller.js';
import Cart from '../models/cart.model.js';
import UnclaimedCart from '../models/unclaimedCart.model.js';

describe('cart.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerCart', () => {
    it('should return 500 if Cart.countDocuments throws an error', async () => {
      const req = {
        body: { macAddress: '00:11:22:33:44:55' },
        user: { mallId: 'mall123', _id: 'user123' },
        app: { get: jest.fn() }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const error = new Error('Database connection failed');
      const spy = jest.spyOn(Cart, 'countDocuments').mockRejectedValue(error);

      // Disable console.error for this test to keep output clean
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await registerCart(req, res);

      expect(spy).toHaveBeenCalledWith({ mallId: 'mall123' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while registering cart.' });

      spy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
