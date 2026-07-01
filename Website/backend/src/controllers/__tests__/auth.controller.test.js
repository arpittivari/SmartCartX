import { jest } from '@jest/globals';
import { registerAdmin } from '../auth.controller.js';
import User from '../../models/user.model.js';

describe('registerAdmin Error Handling', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle errors thrown during registration', async () => {
        const req = {
            body: {
                mallId: 'MALL123',
                password: 'password123',
                role: 'admin'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        const mockError = new Error('Database Error');
        jest.spyOn(User, 'findOne').mockRejectedValue(mockError);

        // Mock console.error to avoid test output noise
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await registerAdmin(req, res);

        expect(consoleSpy).toHaveBeenCalledWith('🔥🔥 REGISTRATION ERROR 🔥🔥:', mockError);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error. Check server logs for details.' });
    });
});
