import { createTheme } from '@mui/material/styles';

// Jio-inspired color palette
export const JIO_COLORS = {
  blue: {
    50: '#e3f0ff',
    100: '#b3d4ff',
    200: '#80b8ff',
    300: '#4d9bff',
    400: '#2685ff',
    500: '#0066CC',
    600: '#005ab8',
    700: '#004a99',
    800: '#003a7a',
    900: '#002a5c',
  },
  red: {
    50: '#fce8ea',
    100: '#f8c5c9',
    200: '#f39ea4',
    300: '#ed757f',
    400: '#e95563',
    500: '#E63946',
    600: '#d12f3b',
    700: '#b82430',
    800: '#9f1a26',
    900: '#7a0e18',
  },
  gold: '#FFD700',
  platinum: '#B0C4DE',
  diamond: '#B9F2FF',
  silver: '#C0C0C0',
};

const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: JIO_COLORS.blue[500],
        light: JIO_COLORS.blue[300],
        dark: JIO_COLORS.blue[700],
        contrastText: '#fff',
      },
      secondary: {
        main: JIO_COLORS.red[500],
        light: JIO_COLORS.red[300],
        dark: JIO_COLORS.red[700],
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#0a0e1a' : '#f5f7fa',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f0f4ff' : '#0d1117',
        secondary: mode === 'dark' ? '#8b9ab8' : '#4a5568',
      },
      success: { main: '#10b981', light: '#34d399', dark: '#059669' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
      error: { main: JIO_COLORS.red[500] },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,102,204,0.3)' },
          },
          contained: {
            background: `linear-gradient(135deg, ${JIO_COLORS.blue[500]} 0%, ${JIO_COLORS.blue[700]} 100%)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.4)'
                : '0 2px 16px rgba(0,102,204,0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow:
                mode === 'dark'
                  ? '0 8px 32px rgba(0,0,0,0.5)'
                  : '0 8px 32px rgba(0,102,204,0.16)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background:
              mode === 'dark'
                ? 'linear-gradient(180deg, #0d1528 0%, #111827 100%)'
                : 'linear-gradient(180deg, #0066CC 0%, #004a99 100%)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? 'rgba(17,24,39,0.95)'
                : `rgba(0,102,204,0.98)`,
            backdropFilter: 'blur(10px)',
            boxShadow:
              mode === 'dark'
                ? '0 1px 20px rgba(0,0,0,0.5)'
                : '0 1px 20px rgba(0,102,204,0.3)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4 },
          bar: {
            background: `linear-gradient(90deg, ${JIO_COLORS.blue[400]}, ${JIO_COLORS.red[500]})`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  });

export default getTheme;

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; gradient: string }> = {
  Silver: { bg: '#e8e8e8', text: '#555', gradient: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' },
  Gold: { bg: '#fff3cd', text: '#8b6914', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
  Platinum: { bg: '#e8f0ff', text: '#3a5a9f', gradient: 'linear-gradient(135deg, #B0C4DE, #6a8db5)' },
  Diamond: { bg: '#e0f7ff', text: '#006080', gradient: 'linear-gradient(135deg, #B9F2FF, #5cd8f0)' },
};

export const STATUS_COLORS: Record<string, string> = {
  Available: '#10b981',
  Reserved: '#f59e0b',
  Sold: '#E63946',
};
