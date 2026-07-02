import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  useTheme,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Search,
  Diamond,
  TrendingUp,
  NewReleases,
  Phone,
  WhatsApp,
  ArrowForward,
  Shield,
  Speed,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { numbersService } from '../../services/firestore';
import type { VipNumber } from '../../types';
import NumberCard from '../../components/common/NumberCard';
import { CATEGORY_COLORS, JIO_COLORS } from '../../theme';

const CATEGORIES = [
  { label: 'Silver', icon: '🥈', desc: 'Entry level fancy numbers' },
  { label: 'Gold', icon: '🥇', desc: 'Premium golden numbers' },
  { label: 'Platinum', icon: '💎', desc: 'Exclusive platinum series' },
  { label: 'Diamond', icon: '💠', desc: 'Ultra rare diamond picks' },
];

const PATTERNS = [
  { label: '786 Lucky', value: '786', emoji: '🕌' },
  { label: 'Quad 9s', value: '9999', emoji: '🔢' },
  { label: 'Sequential', value: '1234', emoji: '📈' },
  { label: 'Quad 0s', value: '0000', emoji: '⭕' },
  { label: 'Mirror', value: 'Mirror', emoji: '🪞' },
  { label: 'Double Pair', value: 'AABB', emoji: '♻️' },
];

const FEATURES = [
  { icon: <Shield />, title: 'Genuine Numbers', desc: 'All numbers verified and authentic' },
  { icon: <Speed />, title: 'Fast Delivery', desc: 'SIM delivered at your doorstep' },
  { icon: <EmojiEvents />, title: '5000+ VIP Numbers', desc: 'Largest collection in your area' },
];

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredNumbers, setFeaturedNumbers] = useState<VipNumber[]>([]);
  const [newNumbers, setNewNumbers] = useState<VipNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, newNums] = await Promise.all([
          numbersService.getFeatured(),
          numbersService.getNew(),
        ]);
        setFeaturedNumbers(featured.slice(0, 8));
        setNewNumbers(newNums.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Box>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${JIO_COLORS.blue[700]} 0%, ${JIO_COLORS.blue[500]} 50%, ${JIO_COLORS.red[600]} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 6, md: 8 },
          pb: { xs: 10, md: 12 },
        }}
      >
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.08)',
              width: `${100 + i * 100}px`,
              height: `${100 + i * 100}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse ${3 + i * 0.5}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: '#fff' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Chip
                label="🎉 India's #1 Jio VIP Number Store"
                sx={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, mb: 2, backdropFilter: 'blur(10px)' }}
              />
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3.5rem' }, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                Find Your{' '}
                <Box component="span" sx={{ color: '#FFD700' }}>Perfect</Box>{' '}
                VIP Number
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 500, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
                Premium Jio VIP & Fancy mobile numbers — Silver, Gold, Platinum & Diamond categories
              </Typography>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Box component="form" onSubmit={handleSearch} sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                <Paper sx={{ display: 'flex', alignItems: 'center', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  <TextField
                    fullWidth
                    placeholder="Search by number, pattern (786, 9999, 1234)…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: JIO_COLORS.blue[500] }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 0, '& fieldset': { border: 'none' }, background: '#fff' },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: 0,
                      px: 4,
                      py: 1.8,
                      height: '100%',
                      background: `linear-gradient(135deg, ${JIO_COLORS.red[500]}, ${JIO_COLORS.red[700]})`,
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' },
                    }}
                  >
                    Search
                  </Button>
                </Paper>
              </Box>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {PATTERNS.map((p) => (
                  <Chip
                    key={p.value}
                    label={`${p.emoji} ${p.label}`}
                    clickable
                    onClick={() => navigate(`/search?pattern=${p.value}`)}
                    sx={{
                      background: 'rgba(255,255,255,0.12)',
                      color: '#fff',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: 600,
                      '&:hover': { background: 'rgba(255,255,255,0.25)' },
                    }}
                  />
                ))}
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Stats Strip */}
      <Box sx={{ background: theme.palette.background.paper, py: 2, boxShadow: '0 4px 20px rgba(0,102,204,0.1)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {[
              { value: '5,000+', label: 'VIP Numbers' },
              { value: '2,000+', label: 'Happy Customers' },
              { value: '4', label: 'Categories' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Categories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Browse by Category</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Choose your preferred tier of VIP numbers</Typography>
          <Grid container spacing={2}>
            {CATEGORIES.map((cat) => {
              const colors = CATEGORY_COLORS[cat.label];
              return (
                <Grid key={cat.label} size={{ xs: 6, sm: 3 }}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Paper
                      onClick={() => navigate(`/search?category=${cat.label}`)}
                      sx={{ p: 3, textAlign: 'center', cursor: 'pointer', background: colors.gradient, border: 'none', '&:hover': { transform: 'none' } }}
                    >
                      <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{cat.icon}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>{cat.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>{cat.desc}</Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Trending Numbers */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TrendingUp sx={{ color: 'secondary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Trending Numbers</Typography>
                <Typography variant="body2" color="text.secondary">Most wishlisted this week</Typography>
              </Box>
            </Box>
            <Button endIcon={<ArrowForward />} onClick={() => navigate('/search?sortBy=popular')} sx={{ display: { xs: 'none', sm: 'flex' } }}>View All</Button>
          </Box>
          <Grid container spacing={2}>
            {loading
              ? [...Array(4)].map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              : featuredNumbers.map((num) => (
                  <Grid key={num.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <NumberCard number={num} />
                  </Grid>
                ))}
          </Grid>
        </Box>

        {/* New Arrivals */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <NewReleases sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>New Arrivals</Typography>
                <Typography variant="body2" color="text.secondary">Freshly added VIP numbers</Typography>
              </Box>
            </Box>
            <Button endIcon={<ArrowForward />} onClick={() => navigate('/search?sortBy=newest')} sx={{ display: { xs: 'none', sm: 'flex' } }}>View All</Button>
          </Box>
          <Grid container spacing={2}>
            {loading
              ? [...Array(4)].map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              : newNumbers.map((num) => (
                  <Grid key={num.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <NumberCard number={num} />
                  </Grid>
                ))}
          </Grid>
        </Box>

        {/* Why Us */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>Why Choose Us?</Typography>
          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center', background: 'rgba(0,102,204,0.04)', border: '1px solid rgba(0,102,204,0.1)' }}>
                  <Avatar sx={{ mx: 'auto', mb: 2, width: 56, height: 56, background: `linear-gradient(135deg, ${JIO_COLORS.blue[500]}, ${JIO_COLORS.blue[700]})` }}>
                    {f.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact CTA */}
        <Box sx={{ background: `linear-gradient(135deg, ${JIO_COLORS.blue[700]}, ${JIO_COLORS.red[600]})`, borderRadius: 4, p: { xs: 3, md: 5 }, textAlign: 'center', color: '#fff' }}>
          <Diamond sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Can't find what you need?</Typography>
          <Typography sx={{ mb: 3, opacity: 0.9 }}>Contact us directly — we have thousands more numbers not listed online</Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<WhatsApp />} onClick={() => window.open('https://wa.me/917987666232', '_blank')} sx={{ background: '#25D366', color: '#fff', '&:hover': { background: '#128C7E' }, px: 3 }}>
              WhatsApp Us
            </Button>
            <Button variant="outlined" startIcon={<Phone />} onClick={() => window.open('tel:7987666232')} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', px: 3 }}>
              Call 79876 66232
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
