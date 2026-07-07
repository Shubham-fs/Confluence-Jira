import { useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  type PaletteMode,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { buildTheme } from './theme/theme';
import { ColorModeContext } from './theme/ColorModeContext';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import PresentationPage from './pages/PresentationPage';

export default function App() {
  const [mode, setMode] = useState<PaletteMode>('light');
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const colorMode = useMemo(
    () => ({
      mode,
      toggle: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/assigned" element={<DashboardPage />} />
              <Route path="/transitions" element={<DashboardPage />} />
              <Route path="/presentation" element={<PresentationPage />} />
              <Route path="/analytics" element={<DashboardPage />} />
            </Routes>
          </Layout>
        </LocalizationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
