import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Tab,
  Tabs,
} from '@mui/material';
import { Edit, Save, Cancel, Logout, Phone, Email, Diamond } from '@mui/icons-material';
import { useAuthStore } from '../../store';
import { bookingsService } from '../../services/firestore';
import { Booking } from '../../types';
import { formatCurrency, formatPhoneNumber } from '../../lib/utils';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#10b981',
  Cancelled: '#E63946',
  Completed: '#0066CC',
};

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, appUser, updateProfile, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(appUser?.name || '');
  const [email, setEmail] = useState(appUser?.email || '');
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!user) return;
    bookingsService.getByCustomer(user.uid).then((b) => {
      setBookings(b);
      setBookingsLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || !appUser) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Please login to view profile</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              {appUser.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {appUser.name}
            </Typography>
            <Chip label="Customer" color="primary" size="small" sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatPhoneNumber(appUser.phone)}
              </Typography>
            </Box>
            {appUser.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 2 }}>
                <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {appUser.email}
                </Typography>
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Member since {dayjs(appUser.createdAt).format('MMM YYYY')}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Box sx={{ flex: 1, background: alpha(theme.palette.primary.main, 0.08), borderRadius: 2, p: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {bookings.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Bookings</Typography>
              </Box>
              <Box sx={{ flex: 1, background: alpha(theme.palette.secondary.main, 0.08), borderRadius: 2, p: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                  {appUser.wishlist?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">Wishlist</Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<Logout />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Paper>
        </Grid>

        {/* Right Panel */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Edit Profile" />
              <Tab label={`Bookings (${bookings.length})`} />
            </Tabs>

            {/* Edit Profile Tab */}
            {tab === 0 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                  {!editing ? (
                    <Button startIcon={<Edit />} onClick={() => setEditing(true)}>Edit</Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button startIcon={<Cancel />} onClick={() => setEditing(false)} color="inherit">Cancel</Button>
                      <Button startIcon={<Save />} variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!editing}
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    value={appUser.phone}
                    disabled
                    fullWidth
                    helperText="Phone number cannot be changed"
                  />
                  <TextField
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!editing}
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            {/* Bookings Tab */}
            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                {bookingsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : bookings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Diamond sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No bookings yet</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Start browsing VIP numbers and book yours today!
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/search')}>
                      Browse Numbers
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {bookings.map((b) => (
                      <Paper
                        key={b.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {b.numberId}
                          </Typography>
                          <Chip
                            label={b.status}
                            size="small"
                            sx={{
                              background: alpha(STATUS_COLORS[b.status], 0.15),
                              color: STATUS_COLORS[b.status],
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(b.bookingDate).format('DD MMM YYYY, hh:mm A')}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrency(b.totalAmount)}
                          </Typography>
                        </Box>
                        {b.notes && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Note: {b.notes}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
