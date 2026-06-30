import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Typography, Tooltip, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Cart, deleteCart } from '../../api/cartApi';
import { useAuth } from '../../hooks/useAuth';

// This is the helper component to render the colored status dot
const StatusIndicator = ({ status }: { status: string }) => {
  const colorMap: { [key: string]: string } = {
    Idle: 'warning.main',
    Shopping: 'success.main',
    Payment: 'info.main',
    Offline: 'error.main',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        component="span"
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: colorMap[status] || 'grey.500',
          mr: 1,
          boxShadow: `0 0 8px ${colorMap[status] || 'grey.500'}`,
        }}
      />
      {status}
    </Box>
  );
};

interface Props {
  carts: Cart[];
  onCartDeleted: () => void;
  // This is the fix: The function now correctly expects to receive the full Cart object.
  onViewLive: (cart: Cart) => void;
  onViewHistory: (cart: Cart) => void;
}

const CartsTable = ({ carts, onCartDeleted, onViewLive, onViewHistory }: Props) => {
  const { user } = useAuth();

  const handleDelete = async (id: string) => {
    if (!user?.token || !window.confirm('Are you sure you want to permanently delete this cart?')) {
      return;
    }
    try {
      await deleteCart(id, user.token);
      onCartDeleted();
    } catch (error) {
      console.error("Failed to delete cart:", error);
      alert('Failed to delete cart.');
    }
  };

  if (carts.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No carts have been registered for this mall yet.</Typography>
      </Paper>
    );
  }

  // THE BUG IS REMOVED: The incorrect local "onViewLive" function is gone.

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Cart ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Battery</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell align="center">Live View</TableCell>
              <TableCell align="center">History</TableCell>
              <TableCell align="right">Actions</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {carts.map((cart) => (
              <TableRow key={cart._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{cart.cartId || 'Unknown ID'}</TableCell>
                <TableCell>
                  <StatusIndicator status={cart.status || 'Offline'} />
                </TableCell>
                <TableCell>{cart.battery ?? 0}%</TableCell>
                <TableCell>{cart.lastSeen ? new Date(cart.lastSeen).toLocaleString() : 'Never'}</TableCell>
                 <TableCell align="center">
                <Tooltip title="Live View">
                  <IconButton onClick={() => onViewLive(cart)} color="primary">
                    <LiveTvIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
                <TableCell align="center">
                  <Tooltip title="View History">
                    <IconButton onClick={() => onViewHistory(cart)} color="info">
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                 <TableCell align="right">
                <Tooltip title="Delete Cart">
                  <IconButton onClick={() => handleDelete(cart._id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
              
          </TableBody>
        </Table>
      </TableContainer>

    </>
  );
};

export default CartsTable;