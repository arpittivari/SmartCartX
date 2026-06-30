import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { CssBaseline } from '@mui/material';

// --- Public Pages ---
import LandingPage from './pages/LandingPage';
import HardwareStorePage from './pages/HardwareStorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PaymentSimulatorPage from './pages/PaymentSimulatorPage'; // 👈 New Import

// --- Product/Solutions Pages (New) ---
import SmartCartX1Page from './pages/product/SmartCartX1Page';
import ShopperOSPage from './pages/product/ShopperOSPage';
import SolutionsPage from './pages/solutions/SolutionsPage';

// --- Protected Admin Pages ---
import AppLayout from './components/common/AppLayout';
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import CartManagementPage from './pages/CartManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import MallManagementPage from './pages/MallManagementPage';

function App() {
  const { user } = useAuth();

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />

            {/* New Product Routes */}
            <Route path="/product/x1" element={<SmartCartX1Page />} />
            <Route path="/product/shopper-os" element={<ShopperOSPage />} />

            {/* Solutions Routes (All solutions on one overview page or specific ones mapping to sections) */}
            <Route path="/solutions/security" element={<SolutionsPage />} />
            <Route path="/solutions/media" element={<SolutionsPage />} />
            <Route path="/solutions/speed" element={<SolutionsPage />} />

            {/* Legacy Store Route (Accessories) */}
            <Route path="/store" element={<HardwareStorePage />} />
          </Route>

          {/* Payment Simulator Route (Outside PublicLayout for cleaner UI) */}
          <Route path="/pay" element={<PaymentSimulatorPage />} /> {/* 👈 New Route */}

          {/* Public auth routes. If the user is logged in, redirect them to their dashboard. */}
          <Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/app/dashboard" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/app/dashboard" /> : <ForgotPasswordPage />} />
          <Route path="/resetpassword/:token" element={user ? <Navigate to="/app/dashboard" /> : <ResetPasswordPage />} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          {/* All your private app pages now live under the '/app' path */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Child routes that will render inside the AppLayout */}
            <Route index element={<Navigate to="/app/dashboard" replace />} /> 
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="carts" element={<CartManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="products" element={<ProductsPage />} /> 
            <Route path="profile" element={<ProfilePage />} />
            <Route path="malls" element={<MallManagementPage />} />
          </Route>
          
          {/* Fallback route: If no other route matches, redirect to the public landing page */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;