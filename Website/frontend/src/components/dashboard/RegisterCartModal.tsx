import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { registerCart } from '../../api/cartApi';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  onCartRegistered: () => void;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const RegisterCartModal = ({ open, onClose, onCartRegistered }: Props) => {
  const [cartId, setCartId] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setCartId('');
      setMacAddress('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user?.token) return;
    setIsSubmitting(true);
    setError('');
    try {
      await registerCart({ cartId, macAddress }, user.token);
      onCartRegistered();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Register New SmartCart</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <TextField margin="normal" required fullWidth label="Cart ID (e.g., CART-101)" value={cartId} onChange={(e) => setCartId(e.target.value)} autoFocus />
        <TextField margin="normal" required fullWidth label="MAC Address" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Register cart'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RegisterCartModal;
