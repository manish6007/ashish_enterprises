import React from 'react';
import { Box, Container, Typography, Grid, Button, useTheme } from '@mui/material';
import { Favorite, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { numbersService } from '../../services/firestore';
import type { VipNumber } from '../../types';
import NumberCard from '../../components/common/NumberCard';
import { useWishlistStore } from '../../store';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { ids } = useWishlistStore();
  const [numbers, setNumbers] = React.useState<VipNumber[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (ids.length === 0) { setLoading(false); return; }
      const results = await Promise.all(ids.map((id) => numbersService.getById(id)));
      setNumbers(results.filter(Boolean) as VipNumber[]);
      setLoading(false);
    };
    load();
  }, [ids]);

  if (!loading && ids.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Favorite sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Your wishlist is empty</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Browse and save your favourite VIP numbers here</Typography>
        <Button variant="contained" size="large" startIcon={<Search />} onClick={() => navigate('/search')}>Browse Numbers</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Favorite sx={{ color: 'secondary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>My Wishlist</Typography>
          <Typography variant="body2" color="text.secondary">{ids.length} saved numbers</Typography>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {numbers.map((n) => (
          <Grid key={n.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <NumberCard number={n} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WishlistPage;
