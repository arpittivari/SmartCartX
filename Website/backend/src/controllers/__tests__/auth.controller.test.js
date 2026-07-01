import { jest } from '@jest/globals';
import { registerAdmin } from '../auth.controller.js';
import User from '../../models/user.model.js';

// Mock dependencies
jest.mock('../../models/user.model.js');
jest.mock('../../utils/sendEmail.js');

describe('Auth Controller', () => {
  describe('registerAdmin', () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          mallId: 'mall-123',
          password: 'password123',
          role: 'admin'
        }
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      jest.clearAllMocks();
    });

    it('should return 500 when database operation throws an error', async () => {
      // Setup our test conditions
      // Simulate that the user doesn't exist yet, so we get past the first check
      User.findOne.mockResolvedValue(null);

      // Force User.create to throw an error
      const errorMessage = 'Database connection error during creation';
      User.create.mockRejectedValue(new Error(errorMessage));

      // Suppress the console.error from our test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Execute the controller function
      await registerAdmin(req, res);

      // Verify it called what we expected
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();

      // Verify the catch block was executed correctly
      expect(consoleSpy).toHaveBeenCalledWith('🔥🔥 REGISTRATION ERROR 🔥🔥:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error. Check server logs for details.' });

      // Clean up the spy
      consoleSpy.mockRestore();
    });
  });
});
