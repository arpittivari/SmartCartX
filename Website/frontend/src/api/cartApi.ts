import apiClient from './apiClient';

// --- Interfaces for Type Safety ---

// This is the full Cart object we GET from the server
export interface Cart {
  _id: string;
  cartId: string;
  macAddress: string;
  mqttUsername: string;
  mqttPassword: string;
  firmwareVersion?: string;
  status: string;
  battery: number;
  lastSeen: string;
  // This is the critical new field for the Live View
  currentItems?: { 
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
  }[];
}
// This is the data we POST to the server to create a new cart
// It should only contain the fields we are actually sending.
export interface RegisterCartData {
  cartId: string;
  macAddress: string;
  firmwareVersion?: string;
}

// Data for Claiming a Device (V4 Fleet API)
export interface ClaimCartData {
    mallId: string;
    cartName: string;
    macAddress: string;
}

// --- API Functions ---

/**
 * Fetches all carts associated with the authenticated admin.
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves to an array of Cart objects.
 */
export const getCarts = async (token: string): Promise<Cart[]> => {
  const response = await apiClient.get('/carts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Registers a new cart for the authenticated admin (Legacy/Simple).
 * @param cartData The data for the new cart (cartId, macAddress).
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves to the newly created Cart object.
 */
export const registerCart = async (cartData: RegisterCartData, token: string): Promise<Cart> => {
  const response = await apiClient.post('/carts', cartData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Claims a pending device using the new Fleet Provisioning API.
 * @param claimData The claim details (mallId, cartName, macAddress).
 * @param token The authenticated user's token.
 */
export const claimCart = async (claimData: ClaimCartData, token: string): Promise<any> => {
    const response = await apiClient.post('/v1/fleet/claim', claimData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

/**
 * Deletes a specific cart by its unique ID.
 * @param id The MongoDB _id of the cart to be deleted.
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteCart = async (id: string, token: string): Promise<void> => {
  await apiClient.delete(`/carts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Initiates the checkout process for a cart.
 * @param cartId The custom ID of the cart (e.g., 'Cart 01').
 * @returns Promise containing the payment URL.
 */
export const initiateCheckout = async (cartId: string): Promise<{ pay_url: string }> => {
    // Note: This endpoint is public, so no token needed theoretically,
    // but axios instance might attach one if logged in. Backend allows public access.
    const response = await apiClient.post(`/cart/checkout/${cartId}`);
    return response.data;
};

/**
 * Simulates a payment webhook call (for the Payment Simulator UI).
 * @param paymentId The payment ID to confirm.
 */
export const processPayment = async (paymentId: string): Promise<void> => {
    await apiClient.post('/payment/webhook', {
        payment_id: paymentId,
        status: 'paid'
    });
};
