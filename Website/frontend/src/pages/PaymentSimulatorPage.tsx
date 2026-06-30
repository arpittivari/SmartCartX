import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { processPayment } from '../api/cartApi';

const PaymentSimulatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('id');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!paymentId) return;
        setLoading(true);
        setError(null);
        try {
            await processPayment(paymentId);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (!paymentId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <Alert severity="error">Invalid Payment Link (Missing ID)</Alert>
            </Box>
        );
    }

    if (success) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" gutterBottom>
                        Payment Successful!
                    </Typography>
                    <Typography variant="body1">
                        Your cart has been unlocked.
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        You can close this window now.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Secure Payment Gateway
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                    Simulator Mode
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 3 }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                        Payment Token
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {paymentId.slice(0, 10)}...{paymentId.slice(-10)}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
                </Button>
            </Paper>
        </Box>
    );
};

export default PaymentSimulatorPage;
