import { jest } from '@jest/globals';

const mockInsertMany = jest.fn();
const mockFind = jest.fn();
const mockFindOneAndDelete = jest.fn();

jest.unstable_mockModule('../models/product.model.js', () => ({
  default: {
    insertMany: mockInsertMany,
    find: mockFind,
    findOneAndDelete: mockFindOneAndDelete,
  },
}));

// We need to dynamically import the module under test *after* defining the mocks.
const { uploadProducts } = await import('./product.controller.js');
const { default: Product } = await import('../models/product.model.js');

describe('uploadProducts', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { mallId: 'mall123' },
      body: {
        products: [
          { id: 'prod1', name: 'Product 1', category: 'Cat1', price: 10, weight: 1, quantity: 5 }
        ]
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if req.user or req.user.mallId is missing', async () => {
    req.user = null;
    await uploadProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: Mall ID not found.' });
  });

  it('should return 400 if products is not a non-empty array', async () => {
    req.body.products = [];
    await uploadProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product data must be a non-empty array.' });
  });

  it('should upload products successfully', async () => {
    mockInsertMany.mockResolvedValue({
      insertedIds: { 0: 'id1' },
      writeErrors: []
    });

    await uploadProducts(req, res);
    expect(mockInsertMany).toHaveBeenCalledWith([
      {
        mallId: 'mall123',
        productId: 'prod1',
        name: 'Product 1',
        category: 'Cat1',
        price: 10,
        weight: 1,
        quantity: 5
      }
    ], { ordered: false, rawResult: true });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: '1 products uploaded successfully.',
      insertedCount: 1,
      failedCount: 0
    }));
  });

  it('should return 409 for duplicate key error (code 11000)', async () => {
    const error = new Error('Duplicate key error');
    error.code = 11000;
    mockInsertMany.mockRejectedValue(error);

    await uploadProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'One or more products with existing IDs already exist in this mall.',
      details: error.message
    });
  });

  it('should return 500 for other server errors', async () => {
    const error = new Error('Server crash');
    mockInsertMany.mockRejectedValue(error);

    // Suppress console.error for this specific test so it doesn't clutter output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await uploadProducts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Server error during product upload.',
      error: error.message
    });

    consoleSpy.mockRestore();
  });
});
