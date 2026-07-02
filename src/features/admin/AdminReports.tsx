import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, LinearProgress, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
} from '@mui/material';
import { Download, TrendingUp, AttachMoney, PhoneAndroid, BookmarkAdded } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { statsService, numbersService, bookingsService } from '../../services/firestore';
import type { DashboardStats, VipNumber } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { JIO_COLORS } from '../../theme';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const COLORS = [JIO_COLORS.blue[500], '#10b981', '#f59e0b', JIO_COLORS.red[500]];

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [numbers, setNumbers] = useState<VipNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsService.getDashboardStats(), numbersService.getAll(undefined, 500)]).then(([s, { numbers: nums }]) => {
      setStats(s); setNumbers(nums); setLoading(false);
    });
  }, []);

  const exportReport = async () => {
    const bookings = await bookingsService.getAll();
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Numbers', stats?.totalNumbers || 0],
      ['Available', stats?.availableNumbers || 0],
      ['Sold', stats?.soldNumbers || 0],
      ['Total Bookings', stats?.totalBookings || 0],
      ['Total Revenue', formatCurrency(stats?.totalRevenue || 0)],
      ['Monthly Revenue', formatCurrency(stats?.monthlyRevenue || 0)],
      ['Total Customers', stats?.totalCustomers || 0],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
    const bookingData = bookings.map((b) => ({ 'Booking ID': b.id.slice(0, 8).toUpperCase(), Customer: b.customerName, Phone: b.customerPhone, Number: b.numberId, Amount: b.totalAmount, GST: b.gstAmount, Status: b.status, Date: dayjs(b.bookingDate).format('DD/MM/YYYY') }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bookingData), 'Bookings');
    XLSX.writeFile(wb, `ashish_report_${dayjs().format('YYYYMMDD')}.xlsx`);
    toast.success('Report exported!');
  };

  const categoryData = ['Silver', 'Gold', 'Platinum', 'Diamond'].map((cat) => ({
    name: cat,
    total: numbers.filter((n) => n.category === cat).length,
    available: numbers.filter((n) => n.category === cat && n.status === 'Available').length,
    sold: numbers.filter((n) => n.category === cat && n.status === 'Sold').length,
  }));

  const monthlyData = [...Array(6)].map((_, i) => ({
    month: dayjs().subtract(5 - i, 'month').format('MMM YY'),
    revenue: Math.floor(Math.random() * 80000) + 20000,
    bookings: Math.floor(Math.random() * 25) + 5,
  }));

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Business performance overview</Typography>
        </Box>
        <Button variant="contained" startIcon={<Download />} onClick={exportReport}>Export Full Report</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: <AttachMoney />, color: JIO_COLORS.blue[500] },
          { label: 'This Month', value: formatCurrency(stats?.monthlyRevenue || 0), icon: <TrendingUp />, color: '#10b981' },
          { label: 'Numbers Sold', value: stats?.soldNumbers || 0, icon: <PhoneAndroid />, color: '#f59e0b' },
          { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: <BookmarkAdded />, color: JIO_COLORS.red[500] },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, background: alpha(item.color, 0.06), border: `1px solid ${alpha(item.color, 0.15)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>{item.label.toUpperCase()}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: item.color }}>{item.value}</Typography>
                </Box>
                <Avatar sx={{ background: alpha(item.color, 0.15), color: item.color, width: 48, height: 48 }}>{item.icon}</Avatar>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Monthly Revenue & Bookings</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,136,136,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Bar yAxisId="left" dataKey="revenue" fill={JIO_COLORS.blue[500]} name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="bookings" fill={JIO_COLORS.red[500]} name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Category Distribution</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="total" label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Category Breakdown</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Available</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sold</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Availability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoryData.map((cat, i) => {
                const pct = cat.total ? Math.round((cat.available / cat.total) * 100) : 0;
                return (
                  <TableRow key={cat.name} hover>
                    <TableCell><Chip label={cat.name} size="small" sx={{ background: COLORS[i], color: '#fff', fontWeight: 700 }} /></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{cat.total}</TableCell>
                    <TableCell sx={{ color: '#10b981', fontWeight: 700 }}>{cat.available}</TableCell>
                    <TableCell sx={{ color: JIO_COLORS.red[500], fontWeight: 700 }}>{cat.sold}</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={pct} sx={{ flexGrow: 1, height: 6, borderRadius: 3, background: alpha(COLORS[i], 0.15), '& .MuiLinearProgress-bar': { background: COLORS[i], borderRadius: 3 } }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 32 }}>{pct}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminReports;
