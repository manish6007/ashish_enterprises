import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  alpha,
  useTheme,
  Tooltip,
  Tabs,
  Tab,
  InputLabel,
} from '@mui/material';
import { Refresh, PictureAsPdf, WhatsApp, Phone, CheckCircle, Cancel, Edit } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { bookingsService } from '../../services/firestore';
import { Booking, BookingStatus } from '../../types';
import { formatCurrency, formatPhoneNumber } from '../../lib/utils';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  Confirmed: '#10b981',
  Cancelled: '#E63946',
  Completed: '#0066CC',
};

const AdminBookings: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState(0);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; bookingId: string; notes: string }>({
    open: false, bookingId: '', notes: '',
  });

  const load = async () => {
    setLoading(true);
    const data = await bookingsService.getAll();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter((b) => !statusFilter || b.status === statusFilter);

  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    try {
      await bookingsService.updateStatus(booking.id, newStatus, booking.numberId, user!.uid);
      toast.success(`Booking ${newStatus.toLowerCase()}`);
      load();
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  const generateInvoice = (booking: Booking) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ASHISH ENTERPRISES', 15, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Jio VIP Numbers | Phone: 7987666232', 15, 27);
    doc.text('TAX INVOICE', 150, 18);

    // Invoice details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Invoice Date: ${dayjs().format('DD/MM/YYYY')}`, 130, 55);
    doc.text(`Booking ID: ${booking.id.slice(0, 8).toUpperCase()}`, 130, 63);

    // Customer info
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(booking.customerName, 15, 63);
    doc.text(`Phone: ${booking.customerPhone}`, 15, 71);

    // Table
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Mobile Number', 'Amount']],
      body: [
        ['VIP Mobile Number (Jio)', booking.numberId, formatCurrency(booking.totalAmount - booking.gstAmount)],
        ['GST', '', formatCurrency(booking.gstAmount)],
        ['Total Amount', '', formatCurrency(booking.totalAmount)],
      ],
      headStyles: { fillColor: [0, 102, 204], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      footStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Thank you for choosing Ashish Enterprises!', 105, finalY, { align: 'center' });
    doc.text('For queries: 7987666232 | WhatsApp: 7987666232', 105, finalY + 7, { align: 'center' });

    doc.save(`invoice_${booking.id.slice(0, 8)}.pdf`);
    toast.success('Invoice downloaded!');
  };

  const whatsappConfirm = (booking: Booking) => {
    const msg = encodeURIComponent(
      `Hello ${booking.customerName}! 👋\n\nYour VIP number booking has been *confirmed*! 🎉\n\n📱 Number: ${booking.numberId}\n💰 Amount: ${formatCurrency(booking.totalAmount)}\n📅 Date: ${dayjs(booking.bookingDate).format('DD MMM YYYY')}\n\nThank you for choosing Ashish Enterprises!\n☎ 7987666232`
    );
    window.open(`https://wa.me/91${booking.customerPhone}?text=${msg}`, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Booking Management</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} bookings</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={load}><Refresh /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => {
          const count = bookings.filter((b) => b.status === s).length;
          return (
            <Chip
              key={s}
              label={`${s}: ${count}`}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              sx={{
                background: alpha(STATUS_COLORS[s], 0.15),
                color: STATUS_COLORS[s],
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === s ? `2px solid ${STATUS_COLORS[s]}` : 'none',
              }}
            />
          );
        })}
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Number ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((b, idx) => (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {b.id.slice(0, 6).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', background: alpha('#0066CC', 0.15), color: 'primary.main' }}>
                        {b.customerName?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {b.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {b.customerPhone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {b.numberId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatCurrency(b.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {dayjs(b.bookingDate).format('DD MMM YY')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" variant="standard">
                      <Select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}
                        disableUnderline
                        sx={{
                          '& .MuiSelect-select': {
                            py: 0.3,
                            px: 1,
                            borderRadius: 1,
                            background: alpha(STATUS_COLORS[b.status], 0.15),
                            color: STATUS_COLORS[b.status],
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          },
                        }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      <Tooltip title="WhatsApp Customer">
                        <IconButton size="small" sx={{ color: '#25D366' }} onClick={() => whatsappConfirm(b)}>
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Invoice">
                        <IconButton size="small" color="primary" onClick={() => generateInvoice(b)}>
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Call Customer">
                        <IconButton size="small" onClick={() => window.open(`tel:${b.customerPhone}`)}>
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
            <Typography color="text.secondary">No bookings found</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AdminBookings;
