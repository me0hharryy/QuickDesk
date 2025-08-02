import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import TicketStats from './TicketStats';
import TicketFilters from './TicketFilters';
import TicketList from './TicketList';
import LoadingSpinner from '../common/LoadingSpinner';

const TicketDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    tickets, 
    loading, 
    pagination,
    filters,
    fetchTickets,
    fetchCategories,
    updateFilters,
  } = useTickets();

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [fetchTickets, fetchCategories]);

  useEffect(() => {
    // Calculate stats from tickets
    const newStats = {
      total: pagination.totalTickets,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      closed: tickets.filter(t => t.status === 'Closed').length,
    };
    setStats(newStats);
  }, [tickets, pagination.totalTickets]);

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handlePageChange = (page) => {
    fetchTickets(page);
  };

  const handleCreateTicket = () => {
    navigate('/tickets/create');
  };

  if (loading && tickets.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your support tickets efficiently
            </Typography>
          </Box>
          
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
              sx={{ height: 'fit-content' }}
            >
              Create Ticket
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        <TicketStats stats={stats} />
      </Box>

      {/* Filters and Tickets */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TicketFilters
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TicketList
            tickets={tickets}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </Grid>
      </Grid>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add ticket"
          onClick={handleCreateTicket}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default TicketDashboard;
