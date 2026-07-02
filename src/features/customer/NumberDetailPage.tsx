import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  alpha,
  useTheme,
  Skeleton,
  Breadcrumbs,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  WhatsApp,
  Phone,
  Share,
  QrCode2,
  ArrowBack,
  LocationOn,
  Category,
  AttachMoney,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { numbersService, bookingsService } from '../../services/firestore';
import { VipNumber } from '../../types';
import {
  formatPhoneNumber,
  formatCurrency,
  calculateGST,
  generateWhatsAppLink,
} from '../../lib/utils';
import { CATEGORY_COLORS, STATUS_COLORS, JIO_COLORS } from '../../theme';
import { useAuthStore, useWishlistStore } from '../../store';
import toast from 'react-hot-toast';

const NumberDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, appUser } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const [number, setNumber] = useState<VipNumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [form, setForm] = useState({ name: appUser?.name || '', phone: appUser?.phone || '', notes: '' });

  const inWishlist = number ? isInWishlist(number.id) : false;

  useEffect(() => {
    if (!id) return;
    numbersService.getById(id).then((n) => {
      setNumber(n);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (appUser) setForm((f) => ({ ...f, name: appUser.name, phone: appUser.phone }));
  }, [appUser]);

  const handleWishlist = async () => {
    if (!user || !number) { navigate('/login'); return; }
    if (inWishlist) {
      removeFromWishlist(number.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(number.id);
      toast.success('Added to wishlist ❤️');
    }
  };

  const handleBook = async () => {
    if (!number || !form.name || !form.phone) return;
    setBookingLoading(true);
    try {
      const gstAmt = calculateGST(number.sellingPrice, number.gst);
      await bookingsService.create({
        numberId: number.id,
        customerName: form.name,
        customerPhone: form.phone,
        customerUID: user?.uid,
        status: 'Pending',
        bookingDate: new Date(),
        notes: form.notes,
        totalAmount: number.sellingPrice + gstAmt,
        gstAmount: gstAmt,
      });
      toast.success('Booking submitted! We will confirm shortly.');
      setBookingOpen(false);
      navigate('/bookings');
    } catch (err) {
      toast.error('Booking failed. Please try WhatsApp instead.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && number) {
      navigator.share({
        title: `VIP Number ${number.number}`,
        text: `Check out this VIP Jio number: ${formatPhoneNumber(number.number)} - ${formatCurrency(number.sellingPrice)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton height={300} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (!number) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Number not found</Typography>
        <Button onClick={() => navigate('/search')} sx={{ mt: 2 }}>Back to Search</Button>
      </Container>
    );
  }

  const catColors = CATEGORY_COLORS[number.category];
  const gstAmount = calculateGST(number.sellingPrice, number.gst);
  const totalAmount = number.sellingPrice + gstAmount;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Home
        </Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/search')}>
          Search
        </Link>
        <Typography color="text.primary">{formatPhoneNumber(number.number)}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left: Number Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Number Hero Card */}
            <Paper
              sx={{
                p: 4,
                mb: 3,
                background: `linear-gradient(135deg, ${JIO_COLORS.blue[700]} 0%, ${JIO_COLORS.blue[500]} 60%, ${JIO_COLORS.red[600]} 100%)`,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    background: catColors.gradient,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>
                    {number.category.toUpperCase()}
                  </Typography>
                </Box>
                <Chip
                  label={number.status}
                  size="small"
                  sx={{
                    background: alpha(STATUS_COLORS[number.status], 0.25),
                    color: STATUS_COLORS[number.status] === '#10b981' ? '#afffdc' : '#fff',
                    fontWeight: 700,
                    border: `1px solid ${STATUS_COLORS[number.status]}`,
                  }}
                />
              </Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 1,
                }}
              >
                {formatPhoneNumber(number.number)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2">{number.circle}</Typography>
              </Box>
            </Paper>

            {/* Patterns */}
            {number.patterns.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  ✨ Special Patterns
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {number.patterns.map((p) => (
                    <Chip
                      key={p}
                      label={`🔢 ${p}`}
                      sx={{
                        fontWeight: 700,
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* Details */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Number Details
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Mobile Number', value: number.number, icon: <Phone sx={{ fontSize: 18 }} /> },
                  { label: 'Category', value: number.category, icon: <Category sx={{ fontSize: 18 }} /> },
                  { label: 'Circle', value: number.circle, icon: <LocationOn sx={{ fontSize: 18 }} /> },
                  { label: 'Status', value: number.status, icon: <CheckCircle sx={{ fontSize: 18 }} /> },
                  ...(number.iccid ? [{ label: 'ICCID', value: number.iccid, icon: <Info sx={{ fontSize: 18 }} /> }] : []),
                ].map((item) => (
                  <Grid size={{ xs: 6 }} key={item.label}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, ml: 3.5 }}>
                      {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              {number.tags.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    TAGS
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {number.tags.map((t) => (
                      <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              {number.description && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2">{number.description}</Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Right: Pricing & Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 80 }}>
              {/* Price */}
              <Box
                sx={{
                  background: alpha(theme.palette.primary.main, 0.06),
                  borderRadius: 2,
                  p: 2.5,
                  mb: 3,
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
                  {formatCurrency(number.sellingPrice)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Base Price
                    </Typography>
                    <Typography variant="body2">{formatCurrency(number.sellingPrice)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      GST ({number.gst}%)
                    </Typography>
                    <Typography variant="body2">{formatCurrency(gstAmount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Primary Actions */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={number.status !== 'Available'}
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    setBookingOpen(true);
                  }}
                  sx={{ py: 1.5, fontWeight: 800, fontSize: '1rem' }}
                >
                  {number.status === 'Available' ? '📱 Book Now' : `Number ${number.status}`}
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<WhatsApp />}
                  onClick={() => window.open(generateWhatsAppLink(number), '_blank')}
                  sx={{
                    py: 1.5,
                    background: '#25D366',
                    color: '#fff',
                    fontWeight: 700,
                    '&:hover': { background: '#128C7E' },
                  }}
                >
                  Book via WhatsApp
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Phone />}
                  onClick={() => window.open('tel:7987666232', '_self')}
                  sx={{ py: 1.5 }}
                >
                  Call: 79876 66232
                </Button>
              </Box>

              {/* Secondary Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                  <IconButton
                    onClick={handleWishlist}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      color: inWishlist ? 'secondary.main' : 'text.secondary',
                    }}
                  >
                    {inWishlist ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Show QR Code">
                  <IconButton
                    onClick={() => setQrOpen(true)}
                    sx={{ flex: 1, borderRadius: 2, border: 1, borderColor: 'divider' }}
                  >
                    <QrCode2 />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton
                    onClick={handleShare}
                    sx={{ flex: 1, borderRadius: 2, border: 1, borderColor: 'divider' }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>

              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="caption">
                  Number will be reserved for 24 hours after booking confirmation
                </Typography>
              </Alert>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>📱 Book {formatPhoneNumber(number.number)}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Total payable: <strong>{formatCurrency(totalAmount)}</strong> (incl. {number.gst}% GST)
            </Alert>
            <TextField
              label="Your Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Phone Number"
              fullWidth
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              slotProps={{ htmlInput: { maxLength: 10 } }}
            />
            <TextField
              label="Additional Notes (optional)"
              fullWidth
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setBookingOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBook}
            disabled={!form.name || !form.phone || bookingLoading}
          >
            {bookingLoading ? 'Submitting…' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>QR Code</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
          <QRCodeSVG value={window.location.href} size={200} level="H" includeMargin />
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Scan to view this VIP number on any device
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {formatPhoneNumber(number.number)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NumberDetailPage;
