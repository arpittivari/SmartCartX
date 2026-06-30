import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Link,
  Paper, // 👈 Import Paper for the "island"
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

const LoginPage = () => {
  const [loginType, setLoginType] = useState<'mall' | 'company'>('mall');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        password,
        ...(loginType === 'mall' ? { mallId: identifier } : { companyId: identifier })
      };

      const response = await apiClient.post('/admin/login', payload);
      login(response.data);
      navigate('/app/dashboard'); // Redirect to the secure admin dashboard
    } catch (err: any)
    {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper 
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          minHeight: '500px', // Ensures the card is taller (length > width)
          justifyContent: 'center'
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          SmartCart Central
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Admin Portal
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <ToggleButtonGroup
            color="primary"
            value={loginType}
            exclusive
            onChange={(_, newType) => { if (newType) setLoginType(newType); }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="mall">Mall Login</ToggleButton>
            <ToggleButton value="company">Company Login</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            margin="normal"
            required
            fullWidth
            id="identifier"
            label={loginType === 'mall' ? "Mall ID" : "Company ID"}
            name="identifier"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item xs>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Register"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;