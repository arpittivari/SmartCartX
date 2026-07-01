import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCart, RegisterCartData } from './cartApi';
import apiClient from './apiClient';

// Mock the apiClient
vi.mock('./apiClient', () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

describe('cartApi', () => {
  describe('registerCart', () => {
    beforeEach(() => {
      // Clear mock calls between tests
      vi.clearAllMocks();
    });

    it('should call apiClient.post with the correct parameters and return data', async () => {
      // Arrange
      const mockCartData: RegisterCartData = {
        cartId: 'cart-123',
        macAddress: '00:11:22:33:44:55',
        firmwareVersion: '1.0.0',
      };
      const mockToken = 'mock-jwt-token';
      const mockResponseData = {
        _id: 'db-id-123',
        cartId: 'cart-123',
        macAddress: '00:11:22:33:44:55',
        mqttUsername: 'user1',
        mqttPassword: 'password1',
        status: 'active',
        battery: 100,
        lastSeen: new Date().toISOString(),
      };

      // Mock the resolved value of apiClient.post
      (apiClient.post as any).mockResolvedValueOnce({ data: mockResponseData });

      // Act
      const result = await registerCart(mockCartData, mockToken);

      // Assert
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith('/carts', mockCartData, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error if the API call fails', async () => {
      // Arrange
      const mockCartData: RegisterCartData = {
        cartId: 'cart-123',
        macAddress: '00:11:22:33:44:55',
      };
      const mockToken = 'mock-jwt-token';
      const mockError = new Error('API Request Failed');

      // Mock the rejected value of apiClient.post
      (apiClient.post as any).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(registerCart(mockCartData, mockToken)).rejects.toThrow('API Request Failed');
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith('/carts', mockCartData, {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });
  });
});
