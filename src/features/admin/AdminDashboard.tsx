import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Avatar, Chip, useTheme, CircularProgress, LinearProgress, alpha,
} from '@mui/material';
import {
  PhoneAndroid, BookmarkAdded, People, AttachMoney,
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { statsService, bookingsService } from '../../services/firestore';
import type { DashboardStats, Booking } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { JIO_COLORS } from '../../theme';
import dayjs from 'dayjs';

const COLORS = [JIO_COLORS.blue[500], '#10b981', '#f59e0b', JIO_COLORS.red[500]];

const StatCard: React.FC<{
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color: string; trend?: number;
}> = ({ title, value, subtitle, icon, color, trend }) => {
  const theme = useTheme();
  return (
    <Paper sx={{
      p: 3,
      background: theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
        : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            {title.toUpperCase()}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color, mb: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          {trend !== undefined && (
            <Chip label={`${trend >= 0 ? '+' : ''}${trend}%`} size="small"
              sx={{ mt: 1, background: alpha(trend >= 0 ? '#10b981' : JIO_COLORS.red[500], 0.15), color: trend >= 0 ? '#10b981' : JIO_COLORS.red[500], fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Avatar sx={{ background: alpha(color, 0.15), color, width: 52, height: 52 }}>{icon}</Avatar>
      </Box>
    </Paper>
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsService.getDashboardStats(), bookingsService.getAll()]).then(([s, bookings]) => {
      setStats(s);
      setRecentBookings(bookings.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><CircularProgress /></Box>;
  if (!stats) return null;

  const statusPieData = [
    { name: 'Available', value: stats.availableNumbers },
    { name: 'Sold', value: stats.soldNumbers },
    { name: 'Reserved', value: stats.reservedNumbers },
  ];

  const revenueTrend = [...Array(7)].map((_, i) => ({
    month: dayjs().subtract(6 - i, 'month').format('MMM'),
    revenue: Math.floor(Math.random() * 50000) + 10000,
  }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard Overview</Typography>
        <Typography variant="body2" color="text.secondary">{dayjs().format('dddd, MMMM D, YYYY')} • Real-time data</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Numbers" value={stats.totalNumbers} subtitle={`${stats.availableNumbers} available`} icon={<PhoneAndroid />} color={JIO_COLORS.blue[500]} trend={12} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Bookings" value={stats.totalBookings} subtitle={`${stats.pendingBookings} pending`} icon={<BookmarkAdded />} color="#10b981" trend={8} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Customers" value={stats.totalCustomers} subtitle="Registered users" icon={<People />} color="#f59e0b" trend={15} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue || 0)} subtitle={`Total: ${formatCurrency(stats.totalRevenue)}`} icon={<AttachMoney />} color={JIO_COLORS.red[500]} trend={22} />
        </Grid>
      </Grid>

      {/* Status Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Available', value: stats.availableNumbers, total: stats.totalNumbers, color: '#10b981' },
          { label: 'Reserved', value: stats.reservedNumbers, total: stats.totalNumbers, color: '#f59e0b' },
          { label: 'Sold', value: stats.soldNumbers, total: stats.totalNumbers, color: JIO_COLORS.red[500] },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: item.color }}>{item.value}</Typography>
              </Box>
              <LinearProgress variant="determinate" value={item.total ? (item.value / item.total) * 100 : 0}
                sx={{ height: 8, borderRadius: 4, background: alpha(item.color, 0.15), '& .MuiLinearProgress-bar': { background: item.color, borderRadius: 4 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {item.total ? Math.round((item.value / item.total) * 100) : 0}% of total
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Revenue Trend (Last 7 Months)</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={JIO_COLORS.blue[500]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={JIO_COLORS.blue[500]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,136,136,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip formatter={(v) => [formatCurrency(v as number), 'Revenue']} contentStyle={{ borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke={JIO_COLORS.blue[500]} fill="url(#revGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Number Status</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusPieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Bookings */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Recent Bookings</Typography>
        {recentBookings.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No bookings yet</Typography>
        ) : (
          <Box>
            {recentBookings.map((b) => {
              const statusColor = b.status === 'Completed' ? JIO_COLORS.blue[500] : b.status === 'Confirmed' ? '#10b981' : b.status === 'Pending' ? '#f59e0b' : JIO_COLORS.red[500];
              return (
                <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, background: alpha(JIO_COLORS.blue[500], 0.1), color: 'primary.main', fontSize: '0.8rem' }}>
                      {b.customerName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.customerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{dayjs(b.bookingDate).format('DD MMM YYYY')}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(b.totalAmount)}</Typography>
                    <Chip label={b.status} size="small" sx={{ fontWeight: 700, background: alpha(statusColor, 0.15), color: statusColor }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
