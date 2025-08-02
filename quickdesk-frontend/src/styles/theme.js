import { createTheme } from '@mui/material/styles';

const colors = {
  primary: '#780000',      // Dark red
  secondary: '#C1121F',    // Red
  background: '#FDFOD5',   // Light cream
  accent: '#003049',       // Dark blue
  info: '#669BBC',         // Light blue
  white: '#FFFFFF',
  gray: '#F5F5F5',
  darkGray: '#666666',
  lightGray: '#EEEEEE',
  error: '#D32F2F',
  warning: '#F57C00',
  success: '#2E7D32',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: '#A52A2A',
      dark: '#5A0000',
      contrastText: colors.white,
    },
    secondary: {
      main: colors.secondary,
      light: '#E63946',
      dark: '#8B0000',
      contrastText: colors.white,
    },
    background: {
      default: colors.background,
      paper: colors.white,
    },
    accent: {
      main: colors.accent,
      light: '#2A5A7A',
      dark: '#001A2B',
    },
    info: {
      main: colors.info,
      light: '#85C4D9',
      dark: '#4A7C9A',
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    success: {
      main: colors.success,
    },
    text: {
      primary: colors.accent,
      secondary: colors.darkGray,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: colors.accent,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.accent,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.accent,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: colors.accent,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: colors.accent,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: colors.accent,
    },
    body1: {
      fontSize: '1rem',
      color: colors.accent,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.darkGray,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        containedPrimary: {
          backgroundColor: colors.primary,
          color: colors.white,
          '&:hover': {
            backgroundColor: '#A52A2A',
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          color: colors.white,
          '&:hover': {
            backgroundColor: '#E63946',
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary,
          color: colors.primary,
          '&:hover': {
            backgroundColor: `${colors.primary}10`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export { colors };
export default theme;
