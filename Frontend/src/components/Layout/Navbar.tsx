import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useColorMode } from '../../theme/ColorModeContext';

export default function Navbar() {
  const { mode, toggle } = useColorMode();
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar>
        <InsightsIcon color="primary" sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Developer Activity Reporting
        </Typography>
        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton onClick={toggle} color="inherit">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
        <Box sx={{ width: 8 }} />
      </Toolbar>
    </AppBar>
  );
}
