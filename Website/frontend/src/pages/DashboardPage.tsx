import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Grid, Box, CircularProgress, Alert, Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CartsTable from '../components/dashboard/CartsTable';
import CartLiveViewModal from '../components/cart/CartLiveViewModal';
import CartHistoryModal from '../components/cart/CartHistoryModal';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CableIcon from '@mui/icons-material/Cable';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../hooks/useAuth';
import { getCarts, Cart } from '../api/cartApi';
import apiClient from '../api/apiClient'; // Import apiClient for company fetching
import { useSocket } from '../hooks/useSocket';

const DashboardPage = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [mallsCount, setMallsCount] = useState(0); // For company view
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveViewCart, setLiveViewCart] = useState<Cart | null>(null);
  const [historyCart, setHistoryCart] = useState<Cart | null>(null);
  const { user } = useAuth();

  const isCompany = user?.role === 'company';

  const handleCartUpdate = useCallback((updatedCart: Cart) => {
    if (isCompany) return; // Companies don't track live carts on main dash
    setCarts(prevCarts => 
      prevCarts.map(cart => cart._id === updatedCart._id ? updatedCart : cart)
    );
  }, [setCarts, isCompany]);

  useSocket('cartUpdate', handleCartUpdate);

  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
        if (isCompany) {
            // Fetch company specific stats (e.g. number of malls)
            const res = await apiClient.get('/admin/company/malls', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMallsCount(res.data.length);
        } else {
            // Fetch mall specific stats (carts)
            const initialCarts = await getCarts(user.token);
            setCarts(initialCarts);
        }
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [user, isCompany]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HOOKS MUST BE UNCONDITIONAL ---
  // We calculate these even if we don't render them, to preserve hook order
  // Ensure carts is an array before processing
  const safeCarts = useMemo(() => Array.isArray(carts) ? carts : [], [carts]);

  const totalCarts = safeCarts.length;
  const activeCarts = safeCarts.filter(c => c.status === 'Shopping' || c.status === 'Payment').length;
  const idleCarts = safeCarts.filter(c => c.status === 'Idle').length;
  const offlineCarts = safeCarts.filter(c => c.status === 'Offline').length;

  const filteredCarts = useMemo(() => {
    return safeCarts.filter(cart => {
      if (!cart) return false;
      const id = cart.cartId || '';
      const mac = cart.macAddress || '';
      return id.toLowerCase().includes(searchQuery.toLowerCase()) ||
             mac.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [safeCarts, searchQuery]);

  // --- RENDER LOGIC ---

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // --- COMPANY DASHBOARD VIEW ---
  if (isCompany) {
      return (
        <>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Company Overview
          </Typography>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardWidget title="Total Malls" value={mallsCount} icon={<BusinessIcon sx={{ fontSize: 48 }} />} color="primary.main" />
            </Grid>
            {/* Future aggregated stats can go here */}
          </Grid>

          <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                  Manage your malls from the "Mall Management" tab.
              </Typography>
          </Paper>
        </>
      );
  }

  // --- MALL ADMIN DASHBOARD VIEW (Existing Logic) ---
  return (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Live Fleet Monitor
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Total Carts" value={totalCarts} icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts In Use" value={activeCarts} icon={<RadioButtonCheckedIcon sx={{ fontSize: 48 }} />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts Idle" value={idleCarts} icon={<PauseCircleOutlineIcon sx={{ fontSize: 48 }} />} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts Offline" value={offlineCarts} icon={<CableIcon sx={{ fontSize: 48 }} />} color="error.main" />
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Live Fleet Status</Typography>
          <TextField
            size="small"
            placeholder="Search Cart ID or MAC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
        <CartsTable 
          carts={filteredCarts}
          onCartDeleted={fetchData}
          onViewLive={(cart: Cart) => setLiveViewCart(cart)}
          onViewHistory={(cart: Cart) => setHistoryCart(cart)}
        />
      
      </Paper>

      <CartLiveViewModal
        open={!!liveViewCart}
        onClose={() => setLiveViewCart(null)}
        cart={liveViewCart}
      />

      <CartHistoryModal
        open={!!historyCart}
        onClose={() => setHistoryCart(null)}
        cartId={historyCart?._id || ''}
      />
    </>
  );
};

export default DashboardPage;
