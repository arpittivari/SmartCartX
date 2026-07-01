import { getCartHistory } from './cart.controller.js';
import Cart from '../models/cart.model.js';
import Transaction from '../models/transaction.model.js';
import httpMocks from 'node-mocks-http';

jest.mock('../models/cart.model.js');
jest.mock('../models/transaction.model.js');

describe('getCartHistory', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if cart is not found', async () => {
        const req = httpMocks.createRequest({
            params: { id: 'nonexistentId' }
        });
        const res = httpMocks.createResponse();

        Cart.findById.mockResolvedValue(null);

        await getCartHistory(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData()).toEqual({ message: 'Cart not found' });
    });

    it('should return 401 if user is not authorized', async () => {
        const req = httpMocks.createRequest({
            params: { id: 'someId' },
            user: { _id: 'userId1' }
        });
        const res = httpMocks.createResponse();

        Cart.findById.mockResolvedValue({
            _id: 'someId',
            createdBy: 'userId2'
        });

        await getCartHistory(req, res);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Unauthorized' });
    });

    it('should return cart history successfully', async () => {
        const req = httpMocks.createRequest({
            params: { id: 'someId' },
            user: { _id: 'userId1' }
        });
        const res = httpMocks.createResponse();

        Cart.findById.mockResolvedValue({
            _id: 'someId',
            createdBy: {
                toString: () => 'userId1'
            }
        });

        const mockHistory = [
            { _id: 'trans1', cartId: 'someId', totalAmount: 100 },
            { _id: 'trans2', cartId: 'someId', totalAmount: 200 }
        ];

        Transaction.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockHistory)
        });

        await getCartHistory(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockHistory);
    });

    it('should handle errors thrown by Cart.findById', async () => {
        const req = httpMocks.createRequest({
            params: { id: 'someId' }
        });
        const res = httpMocks.createResponse();

        Cart.findById.mockRejectedValue(new Error('Database error'));

        // Mock console.error to avoid spamming the test output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await getCartHistory(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ message: 'Server error fetching history' });

        consoleSpy.mockRestore();
    });
});
