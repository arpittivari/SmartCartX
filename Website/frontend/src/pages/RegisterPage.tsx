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

const RegisterPage = () => {
  const [registerType, setRegisterType] = useState<'mall' | 'company'>('mall');
  const [identifier, setIdentifier] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        password,
        recoveryEmail,
        role: registerType === 'company' ? 'company' : 'admin',
        ...(registerType === 'mall' ? { mallId: identifier } : { companyId: identifier })
      };

      const response = await apiClient.post('/admin/register', payload);
      login(response.data);
      navigate('/app/dashboard'); // Redirect to the secure admin dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
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
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Create Account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <ToggleButtonGroup
            color="primary"
            value={registerType}
            exclusive
            onChange={(_, newType) => { if (newType) setRegisterType(newType); }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="mall">Register Mall</ToggleButton>
            <ToggleButton value="company">Register Company</ToggleButton>
          </ToggleButtonGroup>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="identifier"
                label={registerType === 'mall' ? "Mall ID" : "Company ID"}
                name="identifier"
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth id="email" label="Recovery Email Address (Optional)" name="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="password" label="Password" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField required fullWidth name="confirmPassword" label="Confirm Password" type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;