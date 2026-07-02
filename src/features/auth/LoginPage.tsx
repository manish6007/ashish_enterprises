import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Tab, Tabs, InputAdornment, Alert, CircularProgress, Divider, useTheme } from '@mui/material';
import { Phone, Lock, Diamond, WhatsApp, AdminPanelSettings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store';
import { JIO_COLORS } from '../../theme';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, loginWithEmail } = useAuthStore();

  const [tab, setTab] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setError(''); setLoading(true);
    try { await sendOTP(phone); setOtpSent(true); toast.success(`OTP sent to +91 ${phone}`); }
    catch { setError('Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try { await verifyOTP(otp); toast.success('Login successful! Welcome! 🎉'); navigate('/'); }
    catch { setError('Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleAdminLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError(''); setLoading(true);
    try { await loginWithEmail(email, password); toast.success('Login successful!'); }
    catch (err) { setError((err as Error).message || 'Login failed. Check credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${JIO_COLORS.blue[700]} 0%, ${JIO_COLORS.blue[500]} 50%, ${JIO_COLORS.red[600]} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, position: 'relative', overflow: 'hidden',
    }}>
      {[...Array(5)].map((_, i) => (
        <Box key={i} sx={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', width: `${150 + i * 120}px`, height: `${150 + i * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      ))}

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: 3, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, border: '1px solid rgba(255,255,255,0.2)' }}>
            <Diamond sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>Ashish Enterprises</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Jio VIP Numbers</Typography>
        </Box>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setOtpSent(false); }} variant="fullWidth"
            sx={{ background: 'rgba(0,102,204,0.05)', '& .MuiTab-root': { fontWeight: 600, py: 1.5 } }}>
            <Tab icon={<Phone sx={{ fontSize: 18 }} />} iconPosition="start" label="Customer" />
            <Tab icon={<AdminPanelSettings sx={{ fontSize: 18 }} />} iconPosition="start" label="Admin / Staff" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {tab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Customer Login</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Sign in with your mobile number via OTP</Typography>
                <TextField
                  label="Mobile Number" fullWidth value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={otpSent || loading}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>+91</Typography></InputAdornment> } }}
                  sx={{ mb: 2 }}
                />
                {!otpSent ? (
                  <Button variant="contained" fullWidth size="large" onClick={handleSendOTP} disabled={loading || phone.length !== 10} sx={{ py: 1.5, fontWeight: 700 }}>
                    {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Send OTP'}
                  </Button>
                ) : (
                  <Box>
                    <TextField label="Enter OTP" fullWidth value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: '0.3em', fontSize: '1.2rem' } } }} sx={{ mb: 2 }} />
                    <Button variant="contained" fullWidth size="large" onClick={handleVerifyOTP} disabled={loading || otp.length !== 6} sx={{ py: 1.5, fontWeight: 700, mb: 1.5 }}>
                      {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify & Login'}
                    </Button>
                    <Button fullWidth size="small" onClick={() => { setOtpSent(false); setOtp(''); }} color="inherit">Change Number</Button>
                  </Box>
                )}
                <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">OR</Typography></Divider>
                <Button variant="outlined" fullWidth size="large" startIcon={<WhatsApp sx={{ color: '#25D366' }} />}
                  onClick={() => window.open('https://wa.me/917987666232?text=Hello, I want to browse VIP numbers', '_blank')} sx={{ py: 1.5, fontWeight: 600 }}>
                  Continue via WhatsApp
                </Button>
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Admin / Staff Login</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Authorized personnel only</Typography>
                <TextField label="Email Address" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
                <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                  sx={{ mb: 3 }} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />
                <Button variant="contained" fullWidth size="large" onClick={handleAdminLogin} disabled={loading} color="secondary" sx={{ py: 1.5, fontWeight: 700 }}>
                  {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Login to Panel'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', display: 'block', mt: 2 }}>
          Ashish Enterprises · Jio VIP Numbers · ☎ 79876 66232
        </Typography>
      </motion.div>

      <div id="recaptcha-container" />
    </Box>
  );
};

export default LoginPage;
