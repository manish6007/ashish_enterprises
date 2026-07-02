import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Avatar, Button, LinearProgress, alpha, useTheme, TextField,
  InputAdornment, Tooltip, IconButton,
} from '@mui/material';
import { Search, Phone, WhatsApp, Block, CheckCircle, Refresh } from '@mui/icons-material';
import { usersService } from '../../services/firestore';
import { AppUser } from '../../types';
import dayjs from 'dayjs';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await usersService.getByRole('customer');
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} customers</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
          />
          <Tooltip title="Refresh"><IconButton onClick={load}><Refresh /></IconButton></Tooltip>
        </Box>
      </Box>
      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Wishlist</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.uid} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', background: alpha('#0066CC', 0.15), color: 'primary.main' }}>
                        {c.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                        {c.email && <Typography variant="caption" color="text.secondary">{c.email}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2">{c.phone}</Typography></TableCell>
                  <TableCell>
                    <Chip label={`${c.wishlist?.length || 0} items`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{dayjs(c.createdAt).format('DD MMM YYYY')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.isActive ? 'Active' : 'Blocked'}
                      size="small"
                      sx={{
                        background: alpha(c.isActive ? '#10b981' : '#E63946', 0.15),
                        color: c.isActive ? '#10b981' : '#E63946',
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      <Tooltip title="WhatsApp">
                        <IconButton size="small" sx={{ color: '#25D366' }} onClick={() => window.open(`https://wa.me/91${c.phone}`, '_blank')}>
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Call">
                        <IconButton size="small" onClick={() => window.open(`tel:${c.phone}`)}>
                          <Phone fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filtered.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No customers found</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminCustomers;
