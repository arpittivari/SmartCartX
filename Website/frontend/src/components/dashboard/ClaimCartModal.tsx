import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { claimCart } from '../../api/cartApi'; // Using new API
import { useAuth } from '../../hooks/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  onCartClaimed: () => void;
  macAddress: string | null;
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

const ClaimCartModal = ({ open, onClose, onCartClaimed, macAddress }: Props) => {
  const [cartName, setCartName] = useState(''); // Changed from cartId to cartName for clarity
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Clear form when the modal opens/changes
  useEffect(() => {
    if (open) {
      setCartName('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user?.token || !macAddress) return;

    // We need mallId. If user is a Mall Admin, it's user.mallId.
    // If Company Impersonating, user.mallId is also set to the impersonated mall.
    const mallId = user.mallId;

    if (!mallId) {
        setError("Mall ID context missing. Please re-login.");
        return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Use the new Fleet Claim API
      await claimCart({
          mallId,
          cartName: cartName || `Cart-${macAddress.slice(-4)}`,
          macAddress
      }, user.token);

      onCartClaimed();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Claim New Cart (Provisioning)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Assign a friendly name to the cart with MAC address: <strong>{macAddress}</strong>
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          required
          fullWidth
          label="Cart Name (e.g., Green Cart 1)"
          value={cartName}
          onChange={(e) => setCartName(e.target.value)}
          autoFocus
          placeholder="Leave empty to auto-generate"
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Claim & Activate'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClaimCartModal;