import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, TextField, InputAdornment,
  FormControl, Select, MenuItem, Chip, Slider, Paper, Button,
  Skeleton, Drawer, IconButton, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import { Search, FilterList, Close, Sort, TuneRounded } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { numbersService } from '../../services/firestore';
import type { VipNumber, SearchFilters, NumberCategory, NumberPattern } from '../../types';
import NumberCard from '../../components/common/NumberCard';
import { matchesSearch, sortNumbers, INDIAN_CIRCLES, PATTERN_LABELS } from '../../lib/utils';

const CATEGORIES: NumberCategory[] = ['Silver', 'Gold', 'Platinum', 'Diamond'];
const PATTERNS = Object.keys(PATTERN_LABELS) as NumberPattern[];

const SearchPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();

  const [allNumbers, setAllNumbers] = useState<VipNumber[]>([]);
  const [filteredNumbers, setFilteredNumbers] = useState<VipNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: (searchParams.get('category') as NumberCategory) || '',
    patterns: searchParams.get('pattern') ? [searchParams.get('pattern') as NumberPattern] : [],
    minPrice: 0,
    maxPrice: 100000,
    circle: '',
    sortBy: (searchParams.get('sortBy') as SearchFilters['sortBy']) || 'newest',
  });

  useEffect(() => {
    numbersService.getAll(undefined, 200).then(({ numbers }) => {
      setAllNumbers(numbers);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = allNumbers;
    if (filters.query) result = result.filter((n) => matchesSearch(n, filters.query!));
    if (filters.category) result = result.filter((n) => n.category === filters.category);
    if (filters.patterns && filters.patterns.length > 0) result = result.filter((n) => filters.patterns!.some((p) => n.patterns.includes(p)));
    if (filters.circle) result = result.filter((n) => n.circle === filters.circle);
    if (filters.minPrice !== undefined) result = result.filter((n) => n.sellingPrice >= filters.minPrice!);
    if (filters.maxPrice !== undefined) result = result.filter((n) => n.sellingPrice <= filters.maxPrice!);
    result = sortNumbers(result, filters.sortBy || 'newest');
    setFilteredNumbers(result);
  }, [allNumbers, filters]);

  const togglePattern = (pattern: NumberPattern) => {
    setFilters((f) => ({
      ...f,
      patterns: f.patterns?.includes(pattern) ? f.patterns.filter((p) => p !== pattern) : [...(f.patterns || []), pattern],
    }));
  };

  const clearFilters = () => setFilters({ query: '', category: '', patterns: [], minPrice: 0, maxPrice: 100000, circle: '', sortBy: 'newest' });

  const filterPanel = (
    <Box sx={{ p: 2, minWidth: { md: 280 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneRounded /> Filters
        </Typography>
        <Button size="small" onClick={clearFilters} color="secondary">Clear All</Button>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>CATEGORY</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
        {CATEGORIES.map((cat) => (
          <Chip key={cat} label={cat} clickable onClick={() => setFilters((f) => ({ ...f, category: f.category === cat ? '' : cat }))}
            color={filters.category === cat ? 'primary' : 'default'} variant={filters.category === cat ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>PATTERN</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
        {PATTERNS.map((p) => (
          <Chip key={p} label={PATTERN_LABELS[p]} clickable onClick={() => togglePattern(p)}
            color={filters.patterns?.includes(p) ? 'secondary' : 'default'} variant={filters.patterns?.includes(p) ? 'filled' : 'outlined'}
            size="small" sx={{ fontWeight: 600 }} />
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>PRICE RANGE</Typography>
      <Box sx={{ px: 1, mb: 3 }}>
        <Slider
          value={[filters.minPrice || 0, filters.maxPrice || 100000]}
          onChange={(_, val) => { const [min, max] = val as number[]; setFilters((f) => ({ ...f, minPrice: min, maxPrice: max })); }}
          min={0} max={100000} step={500} valueLabelDisplay="auto"
          valueLabelFormat={(v) => `₹${v.toLocaleString('en-IN')}`}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">₹{(filters.minPrice || 0).toLocaleString('en-IN')}</Typography>
          <Typography variant="caption" color="text.secondary">₹{(filters.maxPrice || 100000).toLocaleString('en-IN')}</Typography>
        </Box>
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>CIRCLE / STATE</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <Select value={filters.circle || ''} displayEmpty onChange={(e) => setFilters((f) => ({ ...f, circle: e.target.value }))}>
          <MenuItem value="">All Circles</MenuItem>
          {INDIAN_CIRCLES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`, py: 4, px: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 2 }}>Search VIP Numbers</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search number, pattern, circle…"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.95)', borderRadius: 2 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                },
              }}
            />
            <FormControl sx={{ minWidth: 160 }}>
              <Select
                value={filters.sortBy || 'newest'}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
                sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 2 }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
            {isMobile && (
              <Button variant="contained" startIcon={<FilterList />} onClick={() => setFilterDrawerOpen(true)}
                sx={{ background: 'rgba(255,255,255,0.2)', color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.3)' } }}>
                Filters
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {(filters.category || (filters.patterns && filters.patterns.length > 0) || filters.circle) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {filters.category && <Chip label={filters.category} onDelete={() => setFilters((f) => ({ ...f, category: '' }))} color="primary" size="small" />}
            {filters.patterns?.map((p) => <Chip key={p} label={PATTERN_LABELS[p]} onDelete={() => togglePattern(p)} color="secondary" size="small" />)}
            {filters.circle && <Chip label={filters.circle} onDelete={() => setFilters((f) => ({ ...f, circle: '' }))} size="small" />}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {!isMobile && (
            <Paper sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 80 }}>{filterPanel}</Paper>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
              {loading ? 'Loading…' : `${filteredNumbers.length} numbers found`}
            </Typography>
            {loading ? (
              <Grid container spacing={2}>
                {[...Array(8)].map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : filteredNumbers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🔍</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No numbers found</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Try different filters or contact us directly</Typography>
                <Button variant="contained" onClick={clearFilters}>Clear Filters</Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredNumbers.map((num) => (
                  <Grid key={num.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <NumberCard number={num} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>

      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: '16px 16px 0 0', maxHeight: '80vh' } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ overflowY: 'auto' }}>{filterPanel}</Box>
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="contained" onClick={() => setFilterDrawerOpen(false)} sx={{ py: 1.5 }}>
            Show {filteredNumbers.length} Results
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SearchPage;
