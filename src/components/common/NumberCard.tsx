import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Chip,
  Typography,
  Box,
  IconButton,
  Button,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  WhatsApp,
  Phone,
  Visibility,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VipNumber } from '../../types';
import { formatPhoneNumber, formatCurrency, generateWhatsAppLink } from '../../lib/utils';
import { CATEGORY_COLORS, STATUS_COLORS } from '../../theme';
import { useAuthStore, useWishlistStore } from '../../store';
import { usersService } from '../../services/firestore';
import toast from 'react-hot-toast';

interface NumberCardProps {
  number: VipNumber;
  compact?: boolean;
}

const NumberCard: React.FC<NumberCardProps> = ({ number, compact = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(number.id);
  const catColors = CATEGORY_COLORS[number.category];

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      if (inWishlist) {
        removeFromWishlist(number.id);
        await usersService.toggleWishlist(user.uid, number.id, false);
        toast.success('Removed from wishlist');
      } else {
        addToWishlist(number.id);
        await usersService.toggleWishlist(user.uid, number.id, true);
        toast.success('Added to wishlist ❤️');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(generateWhatsAppLink(number), '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open('tel:7987666232', '_self');
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
        onClick={() => navigate(`/number/${number.id}`)}
      >
        {/* Category Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: 16,
            px: 1.5,
            py: 0.4,
            borderRadius: '0 0 8px 8px',
            background: catColors.gradient,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.65rem' }}>
            {number.category.toUpperCase()}
          </Typography>
        </Box>

        {/* Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: STATUS_COLORS[number.status],
            boxShadow: `0 0 6px ${STATUS_COLORS[number.status]}`,
          }}
        />

        <CardContent sx={{ pt: 3.5, pb: 1, flexGrow: 1 }}>
          {/* Phone Number */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.05em',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            {formatPhoneNumber(number.number)}
          </Typography>

          {/* Circle */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            📍 {number.circle}
          </Typography>

          {/* Patterns */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {number.patterns.slice(0, 3).map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              />
            ))}
          </Box>

          {!compact && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ fontSize: 14, color: '#FFD700' }} />
              <Typography variant="caption" color="text.secondary">
                {number.wishlistCount || 0} wishlisted
              </Typography>
              <Visibility sx={{ fontSize: 14, color: 'text.disabled', ml: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {number.views || 0}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Price */}
        <Box sx={{ px: 2, pb: 1 }}>
          <Box
            sx={{
              background: alpha(theme.palette.primary.main, 0.06),
              borderRadius: 2,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {formatCurrency(number.sellingPrice)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                +{number.gst}% GST
              </Typography>
            </Box>
            <Chip
              label={number.status}
              size="small"
              sx={{
                background: alpha(STATUS_COLORS[number.status], 0.15),
                color: STATUS_COLORS[number.status],
                fontWeight: 700,
                fontSize: '0.65rem',
              }}
            />
          </Box>
        </Box>

        <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={number.status !== 'Available'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/number/${number.id}`);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {number.status === 'Available' ? 'Book Now' : number.status}
          </Button>
          <Tooltip title="WhatsApp">
            <IconButton
              size="small"
              onClick={handleWhatsApp}
              sx={{
                color: '#25D366',
                background: alpha('#25D366', 0.1),
                '&:hover': { background: alpha('#25D366', 0.2) },
              }}
            >
              <WhatsApp fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Call">
            <IconButton
              size="small"
              onClick={handleCall}
              sx={{
                color: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { background: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <Phone fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}>
            <IconButton
              size="small"
              onClick={handleWishlist}
              sx={{
                color: inWishlist ? theme.palette.secondary.main : 'text.secondary',
                background: inWishlist ? alpha(theme.palette.secondary.main, 0.1) : 'transparent',
              }}
            >
              {inWishlist ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default NumberCard;
