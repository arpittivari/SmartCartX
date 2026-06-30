import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';
import apiClient from '../../api/apiClient';

interface Transaction {
    _id: string;
    createdAt: string;
    totalAmount: number;
    items: {
        name: string;
        price: number;
        quantity: number;
    }[];
}

interface CartHistoryModalProps {
    open: boolean;
    onClose: () => void;
    cartId: string;
}

const CartHistoryModal: React.FC<CartHistoryModalProps> = ({ open, onClose, cartId }) => {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && cartId) {
            setLoading(true);
            apiClient.get(`/api/carts/${cartId}/history`)
                .then(res => setHistory(res.data))
                .catch(err => console.error("Failed to load history", err))
                .finally(() => setLoading(false));
        }
    }, [open, cartId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Shopping History</DialogTitle>
            <DialogContent>
                {loading ? <Typography>Loading...</Typography> : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No history found.</TableCell>
                                    </TableRow>
                                ) : history.map((txn) => (
                                    <TableRow key={txn._id}>
                                        <TableCell>{new Date(txn.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {txn.items.map((i, idx) => (
                                                <div key={idx}>{i.quantity}x {i.name}</div>
                                            ))}
                                        </TableCell>
                                        <TableCell align="right">${txn.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell align="right" style={{ color: 'green' }}>Paid</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CartHistoryModal;
