import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTicketData();
    }
  }, [id]);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading ticket ID:', id);
      
      const response = await api.get(`/api/tickets/${id}`);
      console.log('API Response:', response.data);
      
      if (response.data && response.data.ticket) {
        setTicket(response.data.ticket);
        console.log('Ticket set:', response.data.ticket);
      } else {
        setError('No ticket data received');
      }
      
    } catch (error) {
      console.error('Error loading ticket:', error);
      setError('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container maxWidth="lg">
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>
        <Alert severity="warning">Ticket not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        {/* Ticket Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {ticket.subject}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ticket #{ticket.ticketNumber} • Created {new Date(ticket.createdAt).toLocaleDateString()}
          </Typography>
          
          {/* Status and Priority */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={ticket.status}
              color="primary"
              variant="filled"
            />
            <Chip
              label={ticket.priority}
              color="secondary"
              variant="outlined"
            />
            {ticket.category && (
              <Chip
                label={ticket.category.name}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Ticket Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            {ticket.description}
          </Typography>
        </Box>

        {/* Created By */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Created By
          </Typography>
          <Typography variant="body1">
            {ticket.createdBy?.username} ({ticket.createdBy?.email})
          </Typography>
        </Box>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Attachments ({ticket.attachments.length})
            </Typography>
            {ticket.attachments.map((attachment, index) => (
              <Chip
                key={index}
                label={attachment.originalName}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Tags
            </Typography>
            {ticket.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Debug Info */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Debug Info: Ticket ID: {ticket._id}
          </Typography>
          <Typography variant="caption" display="block">
            Status: {ticket.status} | Priority: {ticket.priority}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TicketDetail;
