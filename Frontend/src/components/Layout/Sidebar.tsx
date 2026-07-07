import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import InsightsIcon from '@mui/icons-material/Insights';

const DRAWER_WIDTH = 240;

export { DRAWER_WIDTH };

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: (t) => `1px solid ${t.palette.divider}`,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 1 }}>
        <List>
          <ListItemButton component={Link} to="/" selected={pathname === '/'}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/assigned"
            selected={pathname === '/assigned'}
          >
            <ListItemIcon>
              <AssignmentIndIcon />
            </ListItemIcon>
            <ListItemText primary="Assigned Issues" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/transitions"
            selected={pathname === '/transitions'}
          >
            <ListItemIcon>
              <PublishedWithChangesIcon />
            </ListItemIcon>
            <ListItemText primary="Transitions" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/analytics"
            selected={pathname === '/analytics'}
          >
            <ListItemIcon>
              <InsightsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
