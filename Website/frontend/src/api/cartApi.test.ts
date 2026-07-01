import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCarts } from './cartApi';
import apiClient from './apiClient';

// Mock the apiClient module
vi.mock('./apiClient');

describe('cartApi', () => {
  describe('getCarts', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should fetch carts successfully', async () => {
      const mockToken = 'mock-token';
      const mockCarts = [
        { _id: '1', cartId: 'cart-1', macAddress: '00:11:22:33:44:55' },
        { _id: '2', cartId: 'cart-2', macAddress: 'aa:bb:cc:dd:ee:ff' }
      ];

      // Setup the mock response
      (apiClient.get as any).mockResolvedValue({ data: mockCarts });

      // Call the function
      const result = await getCarts(mockToken);

      // Verify the result
      expect(result).toEqual(mockCarts);

      // Verify apiClient.get was called correctly
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/carts', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it('should handle API errors', async () => {
      const mockToken = 'mock-token';
      const mockError = new Error('API Error');

      // Setup the mock to reject
      (apiClient.get as any).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(getCarts(mockToken)).rejects.toThrow('API Error');

      // Verify apiClient.get was called correctly
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/carts', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });
  });
});
