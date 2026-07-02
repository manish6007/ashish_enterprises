import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, MenuItem, Alert, LinearProgress, Tooltip, alpha, useTheme,
} from '@mui/material';
import { Add, Edit, Delete, Search, Upload, Download, Refresh, CheckCircle } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { numbersService } from '../../services/firestore';
import type { VipNumber, NumberCategory, NumberStatus } from '../../types';
import { formatCurrency, formatPhoneNumber, INDIAN_CIRCLES } from '../../lib/utils';
import { CATEGORY_COLORS, STATUS_COLORS } from '../../theme';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const EMPTY_FORM = {
  number: '', iccid: '', circle: '', category: 'Silver' as NumberCategory,
  purchasePrice: 0, sellingPrice: 0, gst: 18, status: 'Available' as NumberStatus,
  tags: '', description: '',
};

const AdminNumbers: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [numbers, setNumbers] = useState<VipNumber[]>([]);
  const [filtered, setFiltered] = useState<VipNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingNumber, setEditingNumber] = useState<VipNumber | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [importData, setImportData] = useState<Record<string, unknown>[]>([]);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { numbers: nums } = await numbersService.getAll(undefined, 500);
    setNumbers(nums);
    setFiltered(nums);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = numbers;
    if (search) { const q = search.toLowerCase(); result = result.filter((n) => n.number.includes(q) || n.circle.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)); }
    if (statusFilter) result = result.filter((n) => n.status === statusFilter);
    if (categoryFilter) result = result.filter((n) => n.category === categoryFilter);
    setFiltered(result);
  }, [numbers, search, statusFilter, categoryFilter]);

  const openAdd = () => { setEditingNumber(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (n: VipNumber) => {
    setEditingNumber(n);
    setForm({ number: n.number, iccid: n.iccid || '', circle: n.circle, category: n.category, purchasePrice: n.purchasePrice, sellingPrice: n.sellingPrice, gst: n.gst, status: n.status, tags: n.tags.join(', '), description: n.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.number || form.number.length !== 10) { toast.error('Enter a valid 10-digit number'); return; }
    setSaving(true);
    try {
      const data = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), purchasePrice: Number(form.purchasePrice), sellingPrice: Number(form.sellingPrice), gst: Number(form.gst), isActive: true, addedBy: user!.uid, images: [] as string[] };
      if (editingNumber) { await numbersService.update(editingNumber.id, data, user!.uid); toast.success('Number updated!'); }
      else { await numbersService.add(data, user!.uid); toast.success('Number added!'); }
      setDialogOpen(false); load();
    } catch { toast.error('Failed to save number'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await numbersService.delete(deletingId, user!.uid); toast.success('Number deleted'); setDeleteDialogOpen(false); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
      setImportData(data); setImportDialogOpen(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleBulkImport = async () => {
    setImporting(true);
    try {
      const mapped = importData.map((row) => ({
        number: String(row['Mobile Number'] || row['number'] || ''),
        iccid: String(row['ICCID'] || row['iccid'] || ''),
        circle: String(row['Circle'] || row['circle'] || 'Maharashtra'),
        category: (String(row['Category'] || row['category'] || 'Silver')) as NumberCategory,
        purchasePrice: Number(row['Purchase Price'] || row['purchasePrice'] || 0),
        sellingPrice: Number(row['Selling Price'] || row['sellingPrice'] || 0),
        gst: Number(row['GST'] || row['gst'] || 18),
        status: 'Available' as NumberStatus,
        tags: String(row['Tags'] || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        description: String(row['Description'] || ''),
        isActive: true, images: [] as string[], addedBy: user!.uid,
      })).filter((r) => r.number.length === 10);
      const count = await numbersService.bulkImport(mapped, user!.uid);
      toast.success(`${count} numbers imported!`); setImportDialogOpen(false); load();
    } catch { toast.error('Import failed. Check file format.'); }
    finally { setImporting(false); }
  };

  const handleExport = () => {
    const data = filtered.map((n) => ({ 'Mobile Number': n.number, ICCID: n.iccid || '', Circle: n.circle, Category: n.category, 'Purchase Price': n.purchasePrice, 'Selling Price': n.sellingPrice, GST: n.gst, Status: n.status, Tags: n.tags.join(', '), Patterns: n.patterns.join(', '), 'Added Date': dayjs(n.createdAt).format('DD/MM/YYYY') }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'VIP Numbers');
    XLSX.writeFile(wb, `vip_numbers_${dayjs().format('YYYYMMDD')}.xlsx`);
    toast.success('Exported!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>VIP Numbers</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} numbers</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExport} size="small">Export</Button>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current?.click()} size="small">Import Excel</Button>
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Number</Button>
        </Box>
      </Box>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleExcelImport} />

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField placeholder="Search number, circle…" value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ flexGrow: 1, minWidth: 200 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
              <MenuItem value="Sold">Sold</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} displayEmpty>
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
              <MenuItem value="Platinum">Platinum</MenuItem>
              <MenuItem value="Diamond">Diamond</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh"><IconButton onClick={load} size="small"><Refresh /></IconButton></Tooltip>
        </Box>
      </Paper>

      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Circle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Patterns</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(0, 100).map((n) => (
                <TableRow key={n.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{formatPhoneNumber(n.number)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={n.category} size="small" sx={{ background: CATEGORY_COLORS[n.category]?.gradient, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell><Typography variant="caption">{n.circle}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                      {n.patterns.slice(0, 2).map((p) => <Chip key={p} label={p} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />)}
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(n.sellingPrice)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={n.status} size="small" sx={{ background: alpha(STATUS_COLORS[n.status], 0.15), color: STATUS_COLORS[n.status], fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(n)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { setDeletingId(n.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {filtered.length === 0 && !loading && <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No numbers found</Typography></Box>}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingNumber ? 'Edit VIP Number' : 'Add New VIP Number'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Mobile Number *" fullWidth value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value.replace(/\D/g, '').slice(0, 10) }))} helperText="10-digit mobile number" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="SIM ICCID" fullWidth value={form.iccid} onChange={(e) => setForm((f) => ({ ...f, iccid: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as NumberCategory }))} label="Category *">
                  {(['Silver', 'Gold', 'Platinum', 'Diamond'] as NumberCategory[]).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Circle *</InputLabel>
                <Select value={form.circle} onChange={(e) => setForm((f) => ({ ...f, circle: e.target.value }))} label="Circle *">
                  {INDIAN_CIRCLES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Purchase Price ₹ *" type="number" fullWidth value={form.purchasePrice} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: Number(e.target.value) }))} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Selling Price ₹ *" type="number" fullWidth value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: Number(e.target.value) }))} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="GST %" type="number" fullWidth value={form.gst} onChange={(e) => setForm((f) => ({ ...f, gst: Number(e.target.value) }))} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NumberStatus }))} label="Status">
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Reserved">Reserved</MenuItem>
                  <MenuItem value="Sold">Sold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Tags (comma separated)" fullWidth value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="fancy, lucky, trending" /></Grid>
            <Grid size={{ xs: 12 }}><TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editingNumber ? 'Update' : 'Add Number'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Number?</DialogTitle>
        <DialogContent><Typography color="text.secondary">This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Import Preview ({importData.length} rows)</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>Expected: <strong>Mobile Number, Category, Circle, Purchase Price, Selling Price, GST, Tags, Description</strong></Alert>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small">
              <TableHead>
                <TableRow>{importData[0] && Object.keys(importData[0]).slice(0, 6).map((k) => <TableCell key={k} sx={{ fontWeight: 700 }}>{k}</TableCell>)}</TableRow>
              </TableHead>
              <TableBody>
                {importData.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>{Object.values(row).slice(0, 6).map((val, j) => <TableCell key={j}>{String(val)}</TableCell>)}</TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {importing && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkImport} disabled={importing} startIcon={<CheckCircle />}>
            {importing ? 'Importing…' : `Import ${importData.length} Numbers`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNumbers;
