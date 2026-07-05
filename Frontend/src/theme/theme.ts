import { createTheme, type PaletteMode } from '@mui/material';

export function buildTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' },
      secondary: { main: '#7c3aed' },
      success: { main: '#16a34a' },
      warning: { main: '#d97706' },
      error: { main: '#dc2626' },
      ...(mode === 'light'
        ? { background: { default: '#f4f6fb', paper: '#ffffff' } }
        : { background: { default: '#0f172a', paper: '#1e293b' } }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
    },
  });
}
