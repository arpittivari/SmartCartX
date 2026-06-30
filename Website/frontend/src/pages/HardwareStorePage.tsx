import React from 'react';
import { Box, Container, Typography, Grid, Button, Card, CardContent, CardMedia, CardActions, Chip, AppBar, Toolbar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const products = [
  {
    id: 1,
    name: 'SmartCart Model X',
    description: 'The flagship autonomous cart with 4K cameras and 24h battery life.',
    price: '$2,499',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Generic shopping cart image
    features: ['AI Vision', 'Weight Sensors', 'Indoor Nav']
  },
  {
    id: 2,
    name: 'SmartCart Lite',
    description: 'Perfect for smaller convenience stores. Lightweight and efficient.',
    price: '$1,299',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    features: ['Barcode Scanner', 'Basic Weight Sensor']
  },
  {
    id: 3,
    name: 'Docking Station Pro',
    description: 'Fast-charging docking station for up to 10 carts simultaneously.',
    price: '$899',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Generic tech image
    features: ['Fast Charge', 'Data Sync', 'Auto-Lock']
  }
];

const HardwareStorePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 8 }}>

      {/* --- Navigation --- */}
      <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              SmartCart Store
            </Typography>
            <Button variant="contained" color="primary" startIcon={<ShoppingCartIcon />}>
              Cart (0)
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Header --- */}
      <Box sx={{ py: 8, textAlign: 'center', backgroundColor: 'background.paper' }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Upgrade Your Fleet
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Purchase the world's most advanced autonomous shopping hardware directly from the source.
          </Typography>
        </Container>
      </Box>

      {/* --- Product Grid --- */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {product.features.map((feature) => (
                      <Chip key={feature} label={feature} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {product.price}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button fullWidth variant="contained" size="large">
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HardwareStorePage;
