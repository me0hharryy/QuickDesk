import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalTickets: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (!hasRole(['admin'])) {
      navigate('/dashboard');
      return;
    }
    fetchStats();
  }, [hasRole, navigate]);

  const fetchStats = async () => {
    try {
      // Fetch basic statistics
      const [usersRes, categoriesRes, ticketsRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/categories'),
        api.get('/api/tickets/admin/statistics'),
      ]);

      setStats({
        totalUsers: usersRes.data.pagination?.totalUsers || 0,
        totalCategories: categoriesRes.data.length || 0,
        totalTickets: ticketsRes.data.overview?.totalTickets || 0,
        activeUsers: usersRes.data.users?.filter(user => user.isActive).length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#780000',
      bgColor: 'rgba(120, 0, 0, 0.1)',
      path: '/admin/users',
      stat: `${stats.activeUsers}/${stats.totalUsers} Active Users`,
    },
    {
      title: 'Categories',
      description: 'Manage ticket categories and classifications',
      icon: <CategoryIcon sx={{ fontSize: 40 }} />,
      color: '#C1121F',
      bgColor: 'rgba(193, 18, 31, 0.1)',
      path: '/admin/categories',
      stat: `${stats.totalCategories} Categories`,
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: '#669BBC',
      bgColor: 'rgba(102, 155, 188, 0.1)',
      path: '/admin/analytics',
      stat: `${stats.totalTickets} Total Tickets`,
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: '#003049',
      bgColor: 'rgba(0, 48, 73, 0.1)',
      path: '/admin/settings',
      stat: 'System Configuration',
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your QuickDesk system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: card.bgColor,
                      borderRadius: '50%',
                      p: 2,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: card.color,
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {card.description}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: card.color,
                      backgroundColor: card.bgColor,
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {card.stat}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/users')}
            >
              Add New User
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/categories')}
            >
              Create Category
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/analytics')}
            >
              View Reports
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
