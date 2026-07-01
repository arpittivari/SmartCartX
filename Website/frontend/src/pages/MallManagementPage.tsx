import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Mall {
    _id: string;
    mallId: string;
    mallName: string;
    location: string;
}

const MallManagementPage = () => {
    const [malls, setMalls] = useState<Mall[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Form State
    const [mallId, setMallId] = useState('');
    const [password, setPassword] = useState('');
    const [mallName, setMallName] = useState('');
    const [location, setLocation] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Login as Mall State
    const [loginOpen, setLoginOpen] = useState(false);
    const [targetMallId, setTargetMallId] = useState('');
    const [targetPassword, setTargetPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Delete Mall State
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [mallToDelete, setMallToDelete] = useState<string | null>(null);
    const [companyPassword, setCompanyPassword] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const { user, impersonate } = useAuth();
    const navigate = useNavigate();

    const fetchMalls = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await apiClient.get('/admin/company/malls', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMalls(res.data);
        } catch (error) {
            console.error("Failed to load malls", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMalls();
    }, [fetchMalls]);

    const handleCreate = async () => {
        if (!user?.token) return;
        setFormError('');
        setSubmitting(true);
        try {
            await apiClient.post('/admin/company/malls', {
                mallId, password, mallName, location
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOpen(false);
            fetchMalls();
            // Reset form
            setMallId('');
            setPassword('');
            setMallName('');
            setLocation('');
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to create mall');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Mall Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Register New Mall
                </Button>
            </Box>

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mall ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {malls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No malls registered yet.</TableCell>
                                </TableRow>
                            ) : malls.map((mall) => (
                                <TableRow key={mall._id}>
                                    <TableCell>{mall.mallId}</TableCell>
                                    <TableCell>{mall.mallName}</TableCell>
                                    <TableCell>{mall.location}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="outlined" sx={{ mr: 1 }}>Details</Button>
                                        <Tooltip title="View Mall Dashboard">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<LoginIcon />}
                                                onClick={() => {
                                                    setTargetMallId(mall.mallId);
                                                    setLoginOpen(true);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                View Mall
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete Mall">
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    setMallToDelete(mall._id);
                                                    setTargetMallId(mall.mallId); // Just for display
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Register New Mall</DialogTitle>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Mall ID (Username)"
                        fullWidth
                        required
                        value={mallId}
                        onChange={(e) => setMallId(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Mall Name"
                        fullWidth
                        value={mallName}
                        onChange={(e) => setMallName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        fullWidth
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Register'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                        Are you sure you want to delete mall <strong>{targetMallId}</strong>? This cannot be undone.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Enter your COMPANY password to confirm.
                    </Typography>
                    {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Company Password"
                        type="password"
                        fullWidth
                        value={companyPassword}
                        onChange={(e) => setCompanyPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            setDeleteError('');
                            if (!companyPassword) {
                                setDeleteError('Password required');
                                return;
                            }
                            try {
                                // First verify company password by re-logging in
                                const verifyRes = await apiClient.post('/admin/login', {
                                    companyId: user?.companyId,
                                    password: companyPassword
                                });
                                // We are not using the response, just checking if it didn't throw
                                if (!verifyRes) {
                                    throw new Error("Verification failed");
                                }

                                // If login success (no error thrown), proceed to delete
                                await apiClient.delete(`/admin/company/malls/${mallToDelete}`, {
                                    headers: { Authorization: `Bearer ${user?.token}` }
                                });
                                setDeleteOpen(false);
                                fetchMalls();
                                setCompanyPassword('');
                            } catch (err: any) {
                                console.error(err);
                                setDeleteError('Incorrect password or delete failed');
                            }
                        }}
                        variant="contained"
                        color="error"
                    >
                        Delete Mall
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Login as Mall Modal */}
            <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Login to Mall Dashboard</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        To access the dashboard for <strong>{targetMallId}</strong>, please confirm credentials.
                    </Typography>
                    {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}
                    <TextField
                        margin="dense"
                        label="Mall ID"
                        fullWidth
                        disabled
                        value={targetMallId}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={targetPassword}
                        onChange={(e) => setTargetPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            setLoginError('');
                            try {
                                const response = await apiClient.post('/admin/login', { mallId: targetMallId, password: targetPassword });
                                // login(response.data); // OLD
                                impersonate(response.data); // NEW
                                navigate('/app/dashboard');
                            } catch (err: any) {
                                setLoginError(err.response?.data?.message || 'Login failed');
                            }
                        }}
                        variant="contained"
                        color="secondary"
                    >
                        Login & View
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MallManagementPage;
