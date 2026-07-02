import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Dashboard,
  PhoneAndroid,
  BookmarkAdded,
  People,
  PersonAdd,
  BarChart,
  History,
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Logout,
  Diamond,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useThemeStore } from '../../store';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { label: 'VIP Numbers', icon: <PhoneAndroid />, path: '/admin/numbers' },
  { label: 'Bookings', icon: <BookmarkAdded />, path: '/admin/bookings' },
  { label: 'Customers', icon: <People />, path: '/admin/customers' },
  { label: 'Staff', icon: <PersonAdd />, path: '/admin/staff' },
  { label: 'Reports', icon: <BarChart />, path: '/admin/reports' },
  { label: 'Activity Logs', icon: <History />, path: '/admin/logs' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { appUser, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Diamond sx={{ color: '#FFD700', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: 1 }}>
              ADMIN PANEL
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800 }}>
              Ashish Enterprises
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box sx={{ mx: 2, mb: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              background: '#FFD700',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {appUser?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>
              {appUser?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {appUser?.role?.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2, mb: 1 }} />

      {/* Nav */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{
                  borderRadius: 2,
                  background: isActive
                    ? 'rgba(255,255,255,0.18)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #FFD700' : '3px solid transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? '#FFD700' : 'rgba(255,255,255,0.7)', minWidth: 38 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { color: isActive ? '#fff' : 'rgba(255,255,255,0.75)', fontWeight: isActive ? 700 : 400, fontSize: '0.875rem' } } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2, mb: 1 }} />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.2)',
            '&:hover': { borderColor: 'rgba(255,255,255,0.5)', color: '#fff' },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              background: `linear-gradient(180deg, #0d1528 0%, #111827 100%)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              background: `linear-gradient(180deg, #0d1528 0%, #111827 100%)`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: theme.palette.mode === 'dark' ? 'rgba(17,24,39,0.97)' : '#fff',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ color: 'text.primary', mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}>
              {NAV_ITEMS.find((n) =>
                n.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(n.path)
              )?.label || 'Admin Panel'}
            </Typography>
            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={toggleMode}>
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, background: theme.palette.background.default, overflow: 'auto' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
