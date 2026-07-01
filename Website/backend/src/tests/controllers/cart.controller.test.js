import { jest } from '@jest/globals';
import { processCashPayment } from '../../controllers/cart.controller.js';
import Cart from '../../models/cart.model.js';
import Transaction from '../../models/transaction.model.js';
import User from '../../models/user.model.js';
import emailService from '../../services/email.service.js';

// Mock dependencies
jest.mock('../../models/cart.model.js');
jest.mock('../../models/transaction.model.js');
jest.mock('../../models/user.model.js');
jest.mock('../../services/email.service.js');

describe('Cart Controller - processCashPayment', () => {
    let req, res, mockCart, mockTransaction, mockMqttClient, mockSocketIo;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        mockMqttClient = { publish: jest.fn() };
        mockSocketIo = {
            emit: jest.fn(),
            to: jest.fn().mockReturnValue({ emit: jest.fn() })
        };

        // Setup request and response objects
        req = {
            params: { id: 'cart-123' },
            body: {},
            user: {
                _id: 'user-456',
                mallId: 'mall-789',
                mallName: 'Test Mall'
            },
            app: {
                get: jest.fn().mockImplementation((key) => {
                    if (key === 'mqttClient') return mockMqttClient;
                    if (key === 'socketio') return mockSocketIo;
                    return null;
                })
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Default mock cart
        mockCart = {
            _id: 'cart-123',
            createdBy: { toString: () => 'user-456' }, // Matches req.user._id
            currentItems: [
                { id: 'item1', price: 10, quantity: 2 },
                { id: 'item2', price: 5, quantity: 1 }
            ],
            macAddress: '00:11:22:33:44:55',
            status: 'Active',
            save: jest.fn().mockResolvedValue(true)
        };

        mockTransaction = {
            _id: 'tx-123',
            save: jest.fn().mockResolvedValue(true)
        };
        Transaction.mockImplementation(() => mockTransaction);

        // Setup common mock responses
        Cart.findById.mockResolvedValue(mockCart);
    });

    test('should return 404 if cart is not found', async () => {
        Cart.findById.mockResolvedValue(null);

        await processCashPayment(req, res);

        expect(Cart.findById).toHaveBeenCalledWith('cart-123');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });

    test('should return 401 if user is not authorized', async () => {
        mockCart.createdBy = { toString: () => 'different-user' };

        await processCashPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    test('should return 400 if cart is empty (no items array)', async () => {
        mockCart.currentItems = null;

        await processCashPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cart is empty' });
    });

    test('should return 400 if cart is empty (empty items array)', async () => {
        mockCart.currentItems = [];

        await processCashPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cart is empty' });
    });

    test('should process successful cash payment without user details', async () => {
        await processCashPayment(req, res);

        // Verify transaction was created and saved
        expect(Transaction).toHaveBeenCalledWith(expect.objectContaining({
            mallId: 'mall-789',
            cartId: 'cart-123',
            totalAmount: 25, // (10 * 2) + (5 * 1)
            paymentMethod: 'CASH'
        }));
        expect(mockTransaction.save).toHaveBeenCalled();

        // Verify cart state was cleared
        expect(mockCart.currentItems).toEqual([]);
        expect(mockCart.status).toBe('Idle');
        expect(mockCart.save).toHaveBeenCalled();

        // Verify MQTT unlock command was sent
        expect(mockMqttClient.publish).toHaveBeenCalledWith(
            'smartcart/00:11:22:33:44:55/commands',
            JSON.stringify({ command: 'unlock', reason: 'cash_payment_success' })
        );

        // Verify success response
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Bill sent to email!'
        }));
    });

    test('should handle user loyalty and history if user details are provided', async () => {
        req.body = { userEmail: 'test@example.com' };

        const mockShopper = {
            email: 'test@example.com',
            order_history: [],
            loyalty_points: 0,
            preferences: { avg_spend: 0 },
            save: jest.fn().mockResolvedValue(true)
        };
        User.findOne.mockResolvedValue(mockShopper);

        await processCashPayment(req, res);

        // Verify user was fetched with correct conditions
        expect(User.findOne).toHaveBeenCalledWith({
            $or: [{ email: 'test@example.com' }],
            role: 'shopper'
        });

        // Verify user loyalty and history were updated
        expect(mockShopper.order_history.length).toBe(1);
        expect(mockShopper.loyalty_points).toBe(2); // Math.floor(25 / 10)
        expect(mockShopper.preferences.avg_spend).toBe(25);
        expect(mockShopper.save).toHaveBeenCalled();

        // Verify email service was called
        expect(emailService.sendReceipt).toHaveBeenCalledWith(
            'test@example.com',
            expect.objectContaining({
                total: 25,
                mallName: 'Test Mall'
            })
        );
    });

    test('should handle database error during processing', async () => {
        Cart.findById.mockRejectedValue(new Error('Database error'));

        await processCashPayment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server error processing payment' });
    });
});
