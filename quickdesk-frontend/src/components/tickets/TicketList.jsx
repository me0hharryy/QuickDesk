import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Pagination,
  Grid,
} from '@mui/material';
import TicketCard from './TicketCard';
import LoadingSpinner from '../common/LoadingSpinner';

const TicketList = ({ tickets, loading, pagination, onPageChange }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 6,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or create a new ticket
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Tickets Grid */}
      <Grid container spacing={2}>
        {tickets.map((ticket) => (
          <Grid item xs={12} key={ticket._id}>
            <TicketCard ticket={ticket} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(event, page) => onPageChange(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Results Summary */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {tickets.length} of {pagination.totalTickets} tickets
        </Typography>
      </Box>
    </Box>
  );
};

export default TicketList;
