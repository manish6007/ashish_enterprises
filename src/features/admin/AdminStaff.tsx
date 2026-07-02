import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, LinearProgress, alpha, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import type { AppUser } from '../../types';
import { usersService } from '../../services/firestore';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const AdminStaff: React.FC = () => {
  const [staff, setStaff] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const load = async () => {
    setLoading(true);
    const data = await usersService.getByRole('staff');
    setStaff(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAddStaff = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) { toast.error('All fields are required'); return; }
    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid, name: form.name, email: form.email, phone: form.phone,
        role: 'staff', wishlist: [], isActive: true, createdAt: serverTimestamp(),
      });
      toast.success('Staff member added!');
      setDialogOpen(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      load();
    } catch (err) { toast.error((err as Error).message || 'Failed to add staff'); }
    finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Staff Management</Typography>
          <Typography variant="body2" color="text.secondary">{staff.length} staff members</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={load}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Add Staff</Button>
        </Box>
      </Box>

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Staff Member</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.uid} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, background: '#FFD700', color: '#000', fontSize: '0.8rem', fontWeight: 800 }}>{s.name?.[0]?.toUpperCase()}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="caption">{s.email}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{s.phone}</Typography></TableCell>
                  <TableCell><Typography variant="caption">{dayjs(s.createdAt).format('DD MMM YYYY')}</Typography></TableCell>
                  <TableCell>
                    <Chip label={s.isActive ? 'Active' : 'Inactive'} size="small"
                      sx={{ background: alpha(s.isActive ? '#10b981' : '#E63946', 0.15), color: s.isActive ? '#10b981' : '#E63946', fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {staff.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No staff members yet.</Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}><TextField label="Full Name *" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Email Address *" type="email" fullWidth value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Phone Number *" fullWidth value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Password *" type="password" fullWidth value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} helperText="Minimum 6 characters" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStaff} disabled={saving}>{saving ? 'Creating…' : 'Add Staff'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStaff;
