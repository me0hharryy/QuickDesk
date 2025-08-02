import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  ConfirmationNumber,
  Add,
  Assignment,
  Category,
  People,
  Analytics,
  Settings,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

const Sidebar = ({ drawerWidth, mobileOpen, onDrawerToggle, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.ADMIN],
    },
    {
      text: 'All Tickets',
      icon: <ConfirmationNumber />,
      path: '/tickets',
      roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.ADMIN],
    },
    {
      text: 'Create Ticket',
      icon: <Add />,
      path: '/tickets/create',
      roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.ADMIN],
    },
    {
      text: 'My Assignments',
      icon: <Assignment />,
      path: '/assignments',
      roles: [USER_ROLES.AGENT, USER_ROLES.ADMIN],
    },
  ];

  const adminItems = [
    {
      text: 'User Management',
      icon: <People />,
      path: '/admin/users',
      roles: [USER_ROLES.ADMIN],
    },
    {
      text: 'Categories',
      icon: <Category />,
      path: '/admin/categories',
      roles: [USER_ROLES.ADMIN],
    },
    {
      text: 'Analytics',
      icon: <Analytics />,
      path: '/admin/analytics',
      roles: [USER_ROLES.ADMIN, USER_ROLES.AGENT],
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      roles: [USER_ROLES.ADMIN],
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          QuickDesk
        </Typography>
      </Toolbar>
      
      <Divider />
      
      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
          {user?.username}
        </Typography>
        <Chip 
          label={user?.role?.toUpperCase()} 
          size="small"
          color={user?.role === 'admin' ? 'primary' : user?.role === 'agent' ? 'secondary' : 'default'}
          sx={{ fontSize: '0.75rem' }}
        />
      </Box>
      
      <Divider />

      {/* Main Menu */}
      <List>
        {menuItems
          .filter(item => hasRole(item.roles))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(120, 0, 0, 0.1)',
                    borderRight: '3px solid',
                    borderRightColor: 'primary.main',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive(item.path) ? 600 : 400,
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      {/* Admin Menu */}
      {hasRole([USER_ROLES.ADMIN, USER_ROLES.AGENT]) && (
        <>
          <Divider />
          <List>
            <ListItem>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                Administration
              </Typography>
            </ListItem>
            {adminItems
              .filter(item => hasRole(item.roles))
              .map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(120, 0, 0, 0.1)',
                        borderRight: '3px solid',
                        borderRightColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive(item.path) ? 600 : 400,
                          color: isActive(item.path) ? 'primary.main' : 'inherit',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
