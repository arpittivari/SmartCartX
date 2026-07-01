import { jest } from '@jest/globals';
import { getMallProducts, uploadProducts, deleteProduct } from './product.controller.js';
import Product from '../models/product.model.js';

jest.mock('../models/product.model.js', () => {
    return {
        __esModule: true,
        default: {
            find: jest.fn(),
            insertMany: jest.fn(),
            findOneAndDelete: jest.fn()
        }
    };
});

describe('Product Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            user: {
                mallId: 'test_mall_id'
            },
            body: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        // Suppress console error/warn in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMallProducts', () => {
        it('should handle errors when Product.find throws an exception', async () => {
            const errorMessage = 'Database error';

            // Mock Product.find().sort() to throw an error
            const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
            Product.find.mockReturnValue({ sort: mockSort });

            await getMallProducts(mockReq, mockRes);

            expect(Product.find).toHaveBeenCalledWith({ mallId: 'test_mall_id' });
            expect(console.error).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Server error fetching products.',
                error: errorMessage
            });
        });

        it('should successfully group and return products', async () => {
            const mockProducts = [
                { category: 'A', name: 'Product 1' },
                { category: 'B', name: 'Product 2' },
                { category: 'A', name: 'Product 3' }
            ];

            const mockSort = jest.fn().mockResolvedValue(mockProducts);
            Product.find.mockReturnValue({ sort: mockSort });

            await getMallProducts(mockReq, mockRes);

            expect(Product.find).toHaveBeenCalledWith({ mallId: 'test_mall_id' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                categories: [
                    { name: 'A', products: [mockProducts[0], mockProducts[2]] },
                    { name: 'B', products: [mockProducts[1]] }
                ]
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = undefined;
            await getMallProducts(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized: Mall ID not found.' });
        });
    });
});
