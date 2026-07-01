import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    List, ListItem, ListItemText, Typography, Box, Chip, Alert, CircularProgress
} from '@mui/material';
import io from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/apiClient';
import { Cart, initiateCheckout } from '../../api/cartApi'; // 👈 Imported initiateCheckout

interface CartLiveViewModalProps {
    open: boolean;
    onClose: () => void;
    cart: Cart | null;
}

const CartLiveViewModal: React.FC<CartLiveViewModalProps> = ({ open, onClose, cart }) => {
    const [currentItems, setCurrentItems] = useState(cart?.currentItems || []);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (open && cart && user?.token) {
            setCurrentItems(cart.currentItems || []);

            // Connect to socket for live updates
            // Use window.location.hostname for local dev or configured env var
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const socket = io(socketUrl, {
                auth: { token: user.token }
            });

            socket.on('connect', () => {
                // Join the room for this specific cart
                // The backend emits to io.to(cart._id)
                socket.emit('joinCartRoom', cart._id);
            });

            socket.on('cartStateUpdate', (updatedCart: Cart) => {
                if (updatedCart._id === cart._id) {
                    setCurrentItems(updatedCart.currentItems || []);
                }
            });

            // 👈 New Listener for Payment Success
            socket.on('cartPaid', () => {
                setPaymentMessage({ type: 'success', text: 'Online Payment Confirmed! Cart Unlocked.' });

                // Speech Announcement
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance('Payment successful. Cart unlocked.');
                    window.speechSynthesis.speak(utterance);
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [open, cart, user]);

    const handleCashPayment = async () => {
        if (!cart?._id) return;

        const total = currentItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

        if (!window.confirm(`Process CASH payment of $${total.toFixed(2)} for ${cart.cartId}?`)) return;

        setPaymentLoading(true);
        setPaymentMessage(null);
        try {
            await apiClient.post(`/carts/${cart._id}/cash-payment`);
            setPaymentMessage({ type: 'success', text: 'Payment processed. Cart unlocked.' });
            // Optionally close after a delay or let user close
        } catch (error: any) {
            console.error("Payment failed", error);
            setPaymentMessage({ type: 'error', text: error.response?.data?.message || 'Payment failed' });
        } finally {
            setPaymentLoading(false);
        }
    };

    // 👈 New Handler for Online Checkout
    const handleOnlineCheckout = async () => {
        if (!cart?.cartId) return; // Note: using cartId string for public route if needed, or _id

        setPaymentLoading(true);
        try {
            // Initiate checkout
            const { pay_url } = await initiateCheckout(cart.cartId); // Expects custom ID "Cart 01"
            // Open simulator in new tab
            window.open(pay_url, '_blank');
            setPaymentMessage({ type: 'success', text: 'Checkout page opened. Waiting for payment...' });
        } catch (error: any) {
             console.error("Checkout init failed", error);
             setPaymentMessage({ type: 'error', text: 'Failed to initiate checkout.' });
        } finally {
            setPaymentLoading(false);
        }
    };

    const total = currentItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    const hasItems = currentItems.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Live View: {cart?.cartId}
                <Chip label={cart?.status || 'Offline'} color={cart?.status === 'Shopping' ? 'success' : 'default'} size="small" sx={{ ml: 2 }} />
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Real-time contents</Typography>
                </Box>

                {paymentMessage && (
                    <Alert severity={paymentMessage.type} sx={{ mb: 2 }}>{paymentMessage.text}</Alert>
                )}

                <List dense>
                    {currentItems.length === 0 ? (
                        <ListItem><ListItemText primary="Cart is empty" /></ListItem>
                    ) : currentItems.map((item, index) => (
                        <ListItem key={index} divider>
                            <ListItemText
                                primary={item.product_name}
                                secondary={`$${item.price?.toFixed(2)}`}
                            />
                            <Typography variant="body2">x{item.quantity || 1}</Typography>
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', pt: 2 }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                {hasItems && (
                    <>
                        {/* 👈 New Checkout Button */}
                        <Button
                            onClick={handleOnlineCheckout}
                            color="primary"
                            variant="outlined"
                            disabled={paymentLoading || cart?.status !== 'Shopping'}
                        >
                           Online Checkout
                        </Button>

                        <Button
                            onClick={handleCashPayment}
                            color="success"
                            variant="contained"
                            disabled={paymentLoading || cart?.status !== 'Shopping'}
                        >
                            {paymentLoading ? <CircularProgress size={24} color="inherit" /> : 'Cash Payment'}
                        </Button>
                    </>
                )}
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CartLiveViewModal;
