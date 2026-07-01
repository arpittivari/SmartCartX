import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Create mocks
const mockFind = jest.fn();
const mockSort = jest.fn();

// Mock the model before importing controller
jest.unstable_mockModule('../../models/cart.model.js', () => ({
  default: {
    find: mockFind,
    countDocuments: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  }
}));

describe('cart.controller - getAdminCarts', () => {
  let req, res;
  let getAdminCartsModule;

  beforeAll(async () => {
    // Dynamically import after mocking
    getAdminCartsModule = (await import('../cart.controller.js')).getAdminCarts;
  });

  beforeEach(() => {
    const validObjectId = new mongoose.Types.ObjectId();
    req = {
      user: {
        _id: validObjectId
      }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up default chain
    mockFind.mockReturnValue({ sort: mockSort });
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should handle errors when Cart.find throws', async () => {
    const mockError = new Error('Database error');
    // For this test, make the sort method throw
    mockSort.mockRejectedValueOnce(mockError);

    await getAdminCartsModule(req, res);

    expect(console.error).toHaveBeenCalledWith('Error fetching carts:', mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching carts.' });
  });

  it('should return carts on success', async () => {
    const mockCarts = [{ _id: 'cart1' }, { _id: 'cart2' }];
    mockSort.mockResolvedValueOnce(mockCarts);

    await getAdminCartsModule(req, res);

    expect(mockFind).toHaveBeenCalledWith({ createdBy: req.user._id });
    expect(res.json).toHaveBeenCalledWith(mockCarts);
  });
});
