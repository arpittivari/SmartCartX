import { jest } from '@jest/globals';
import { deleteProduct } from '../src/controllers/product.controller.js';
import Product from '../src/models/product.model.js';

describe('Product Controller - deleteProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const req = {
      params: { id: 'prod123' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Mall ID not found.'
    });
  });

  it('should return 401 if user has no mallId', async () => {
    const req = {
      user: {},
      params: { id: 'prod123' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthorized: Mall ID not found.'
    });
  });

  it('should return 404 if product is not found', async () => {
    Product.findOneAndDelete = jest.fn().mockResolvedValue(null);

    const req = {
      user: { mallId: 'mall123' },
      params: { id: 'prod123' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteProduct(req, res);

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({ _id: 'prod123', mallId: 'mall123' });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Product not found or unauthorized to delete.'
    });
  });

  it('should return 200 on successful deletion', async () => {
    const mockProduct = { name: 'Apple' };
    Product.findOneAndDelete = jest.fn().mockResolvedValue(mockProduct);

    const req = {
      user: { mallId: 'mall123' },
      params: { id: 'prod123' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await deleteProduct(req, res);

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({ _id: 'prod123', mallId: 'mall123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product 'Apple' deleted successfully."
    });
  });

  it('should return 500 when database throws an error', async () => {
    const mockError = new Error('Database connection failed');
    Product.findOneAndDelete = jest.fn().mockRejectedValue(mockError);

    const req = {
      user: { mallId: 'mall123' },
      params: { id: 'prod123' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // spy on console.error to keep test output clean
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await deleteProduct(req, res);

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({ _id: 'prod123', mallId: 'mall123' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Server error deleting product.',
      error: mockError.message
    });

    consoleSpy.mockRestore();
  });
});
