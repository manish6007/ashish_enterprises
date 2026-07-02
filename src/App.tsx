import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Theme
import getTheme from './theme';
import { useThemeStore, useAuthStore, useWishlistStore } from './store';

// Guards
import { AuthGuard, GuestGuard } from './components/common/AuthGuard';

// Layouts
import CustomerLayout from './components/customer/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';

// Customer Pages
import HomePage from './features/customer/HomePage';
import SearchPage from './features/customer/SearchPage';
import NumberDetailPage from './features/customer/NumberDetailPage';
import WishlistPage from './features/customer/WishlistPage';
import ProfilePage from './features/customer/ProfilePage';

// Auth Pages
import LoginPage from './features/auth/LoginPage';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard';
import AdminNumbers from './features/admin/AdminNumbers';
import AdminBookings from './features/admin/AdminBookings';
import AdminCustomers from './features/admin/AdminCustomers';
import AdminStaff from './features/admin/AdminStaff';
import AdminReports from './features/admin/AdminReports';
import AdminLogs from './features/admin/AdminLogs';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

const AppContent: React.FC = () => {
  const { mode } = useThemeStore();
  const { initAuth, appUser } = useAuthStore();
  const { setWishlist } = useWishlistStore();
  const theme = getTheme(mode);

  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, []);

  // Sync wishlist from Firestore user
  useEffect(() => {
    if (appUser?.wishlist) {
      setWishlist(appUser.wishlist);
    }
  }, [appUser]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 12,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
          },
          success: { style: { background: '#10b981', color: '#fff' } },
          error: { style: { background: '#E63946', color: '#fff' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/search"
            element={
              <CustomerLayout>
                <SearchPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/number/:id"
            element={
              <CustomerLayout>
                <NumberDetailPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <CustomerLayout>
                <WishlistPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <CustomerLayout>
                <ProfilePage />
              </CustomerLayout>
            }
          />
          <Route
            path="/bookings"
            element={
              <CustomerLayout>
                <ProfilePage />
              </CustomerLayout>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/numbers"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminNumbers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AuthGuard allowedRoles={['admin', 'staff']}>
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminCustomers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminStaff />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AuthGuard allowedRoles={['admin']}>
                <AdminLayout>
                  <AdminLogs />
                </AdminLayout>
              </AuthGuard>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff"
            element={
              <AuthGuard allowedRoles={['staff']}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/staff/numbers"
            element={
              <AuthGuard allowedRoles={['staff']}>
                <AdminLayout>
                  <AdminNumbers />
                </AdminLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <AuthGuard allowedRoles={['staff']}>
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </AuthGuard>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
