import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Search,
  Favorite,
  Person,
  DarkMode,
  LightMode,
  WhatsApp,
  Phone,
  Diamond,
  Close,
  Logout,
  History,
  Login,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useThemeStore, useWishlistStore } from '../../store';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
  { label: 'Home', icon: <Home />, path: '/' },
  { label: 'Search Numbers', icon: <Search />, path: '/search' },
  { label: 'Wishlist', icon: <Favorite />, path: '/wishlist' },
  { label: 'My Profile', icon: <Person />, path: '/profile' },
  { label: 'Booking History', icon: <History />, path: '/bookings' },
];

const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, appUser, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const { ids: wishlistIds } = useWishlistStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setAnchorEl(null);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Diamond sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>
              Ashish Enterprises
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Jio VIP Numbers
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
      {user && appUser ? (
        <Box
          sx={{
            mx: 2,
            mb: 2,
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {appUser.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                {appUser.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {appUser.phone}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mx: 2, mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Login />}
            onClick={() => { navigate('/login'); setDrawerOpen(false); }}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.4)',
              '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' },
            }}
          >
            Login / Register
          </Button>
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mx: 2, mb: 1 }} />

      {/* Nav Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{
                  borderRadius: 2,
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.1)' },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 40 }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { color: '#fff', fontWeight: isActive ? 700 : 400, fontSize: '0.9rem' } } }}
                />
                {item.path === '/wishlist' && wishlistIds.length > 0 && (
                  <Box
                    sx={{
                      background: theme.palette.secondary.main,
                      color: '#fff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {wishlistIds.length}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mx: 2, mb: 1 }} />

      {/* Contact */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => window.open('https://wa.me/917987666232', '_blank')}
          sx={{ color: '#25D366', background: 'rgba(37,211,102,0.1)', flex: 1, borderRadius: 2 }}
        >
          <WhatsApp />
        </IconButton>
        <IconButton
          onClick={() => window.open('tel:7987666232', '_self')}
          sx={{ color: '#fff', background: 'rgba(255,255,255,0.1)', flex: 1, borderRadius: 2 }}
        >
          <Phone />
        </IconButton>
      </Box>

      {user && (
        <Box sx={{ p: 2, pt: 0 }}>
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
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top AppBar */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <Diamond sx={{ fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  Jio VIP Numbers
                </Typography>
              </Box>
            )}

            {!isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton color="inherit" onClick={toggleMode}>
                  {mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Wishlist">
                <IconButton color="inherit" onClick={() => navigate('/wishlist')}>
                  <Badge badgeContent={wishlistIds.length} color="error">
                    <Favorite />
                  </Badge>
                </IconButton>
              </Tooltip>

              {user && appUser ? (
                <>
                  <Tooltip title="My Account">
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          background: 'rgba(255,255,255,0.2)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {appUser.name?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{ paper: { sx: { mt: 1, minWidth: 160 } } }}
                  >
                    <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={() => { navigate('/bookings'); setAnchorEl(null); }}>
                      Bookings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', ml: 1 }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, overflow: 'auto', background: theme.palette.background.default }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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

export default CustomerLayout;
