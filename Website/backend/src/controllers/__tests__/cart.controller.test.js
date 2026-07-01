import { jest } from '@jest/globals';

const mockCart = {
  findById: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
};

jest.unstable_mockModule('../../models/cart.model.js', () => ({
  default: mockCart
}));

const { deleteCart } = await import('../cart.controller.js');
const Cart = (await import('../../models/cart.model.js')).default;

describe('cart controller - deleteCart', () => {
  let req;
  let res;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      params: { id: 'test-cart-id' },
      user: { _id: 'test-user-id' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    // Mock console.error to keep test output clean
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('should return 500 when Cart.findById throws an error', async () => {
    Cart.findById.mockRejectedValue(new Error('Database error'));

    await deleteCart(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while deleting cart.' });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return 404 when cart is not found', async () => {
    Cart.findById.mockResolvedValue(null);

    await deleteCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found.' });
  });

  it('should return 401 when user is not authorized', async () => {
    Cart.findById.mockResolvedValue({ createdBy: { toString: () => 'other-user-id' } });

    await deleteCart(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this cart.' });
  });

  it('should delete the cart successfully', async () => {
    Cart.findById.mockResolvedValue({ createdBy: { toString: () => 'test-user-id' } });
    Cart.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await deleteCart(req, res);

    expect(Cart.deleteOne).toHaveBeenCalledWith({ _id: 'test-cart-id' });
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart removed successfully.' });
  });
});
