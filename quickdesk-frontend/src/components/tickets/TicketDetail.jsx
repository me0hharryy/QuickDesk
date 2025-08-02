import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  ThumbUp,
  ThumbDown,
  Edit as EditIcon,
  Assignment as AssignIcon,
  Download as DownloadIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import { STATUS_COLORS, PRIORITY_COLORS, USER_ROLES, TICKET_STATUS } from '../../utils/constants';
import CommentsList from '../comments/CommentsList';
import AddComment from '../comments/AddComment';
import LoadingSpinner from '../common/LoadingSpinner';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { fetchTicketById, updateTicket, voteOnTicket, assignTicket } = useTickets();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicketData();
    if (hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN])) {
      loadAgents();
    }
  }, [id]);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      const data = await fetchTicketById(id);
      setTicket(data.ticket);
      setComments(data.comments || []);
    } catch (error) {
      setError('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/users/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleVote = async (voteType) => {
    setVoting(true);
    const result = await voteOnTicket(ticket._id, voteType);
    
    if (result.success) {
      setTicket(prev => ({
        ...prev,
        upvotes: result.data.upvotes,
        downvotes: result.data.downvotes,
      }));
    } else {
      setError(result.message);
    }
    
    setVoting(false);
  };

  const handleStatusChange = async (newStatus) => {
    const result = await updateTicket(ticket._id, { status: newStatus });
    
    if (result.success) {
      setTicket(result.ticket);
      handleMenuClose();
    } else {
      setError(result.message);
    }
  };

  const handleAssignSubmit = async () => {
    const result = await assignTicket(ticket._id, selectedAgent || null);
    
    if (result.success) {
      setTicket(result.ticket);
      setAssignDialogOpen(false);
      setSelectedAgent('');
    } else {
      setError(result.message);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = `/uploads/${attachment.filename}`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#666666';
  };

  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || '#666666';
  };

  const canEdit = () => {
    return hasRole([USER_ROLES.ADMIN, USER_ROLES.AGENT]) || 
           (user._id === ticket?.createdBy._id);
  };

  const getUserVote = () => {
    const userVote = ticket?.votedBy?.find(vote => vote.user === user._id);
    return userVote?.voteType || null;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Ticket not found</Alert>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Ticket Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {ticket.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ticket #{ticket.ticketNumber} • Created {dayjs(ticket.createdAt).fromNow()}
                </Typography>
                
                {/* Status and Priority */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={ticket.status}
                    sx={{
                      bgcolor: getStatusColor(ticket.status),
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    label={ticket.priority}
                    variant="outlined"
                    sx={{
                      borderColor: getPriorityColor(ticket.priority),
                      color: getPriorityColor(ticket.priority),
                    }}
                  />
                  {ticket.category && (
                    <Chip
                      label={ticket.category.name}
                      variant="outlined"
                      sx={{ color: 'text.secondary' }}
                    />
                  )}
                </Box>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {ticket.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Actions Menu */}
              {canEdit() && (
                <Box>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    {hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]) && [
                      <MenuItem key="assign" onClick={() => {
                        setAssignDialogOpen(true);
                        handleMenuClose();
                      }}>
                        <AssignIcon sx={{ mr: 1 }} />
                        Assign Ticket
                      </MenuItem>,
                      ...Object.values(TICKET_STATUS)
                        .filter(status => status !== ticket.status)
                        .map(status => (
                          <MenuItem
                            key={status}
                            onClick={() => handleStatusChange(status)}
                          >
                            Mark as {status}
                          </MenuItem>
                        ))
                    ]}
                    <MenuItem onClick={handleMenuClose}>
                      <EditIcon sx={{ mr: 1 }} />
                      Edit Ticket
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Ticket Description */}
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
              {ticket.description}
            </Typography>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AttachIcon sx={{ mr: 1 }} />
                  Attachments ({ticket.attachments.length})
                </Typography>
                <Grid container spacing={1}>
                  {ticket.attachments.map((attachment, index) => (
                    <Grid item key={index}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        {attachment.originalName}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Voting */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Was this helpful?
              </Typography>
              <Button
                variant={getUserVote() === 'up' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => handleVote('up')}
                disabled={voting}
                color={getUserVote() === 'up' ? 'success' : 'primary'}
              >
                {ticket.upvotes || 0}
              </Button>
              <Button
                variant={getUserVote() === 'down' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<ThumbDown />}
                onClick={() => handleVote('down')}
                disabled={voting}
                color={getUserVote() === 'down' ? 'error' : 'primary'}
              >
                {ticket.downvotes || 0}
              </Button>
            </Box>
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Comments ({comments.length})
            </Typography>
            
            <CommentsList 
              comments={comments} 
              ticketId={ticket._id}
              onCommentsUpdate={setComments}
            />
            
            <Divider sx={{ my: 3 }} />
            
            <AddComment 
              ticketId={ticket._id} 
              onCommentAdded={(newComment) => {
                setComments(prev => [...prev, newComment]);
              }}
            />
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Ticket Details
            </Typography>

            {/* Creator Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created By
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  {ticket.createdBy?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ticket.createdBy?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.createdBy?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Assigned To */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Assigned To
              </Typography>
              {ticket.assignedTo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    {ticket.assignedTo?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.assignedTo?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.assignedTo?.email}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
            </Box>

            {/* Timestamps */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Timeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Created:</strong> {dayjs(ticket.createdAt).format('MMM DD, YYYY HH:mm')}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Updated:</strong> {dayjs(ticket.updatedAt).format('MMM DD, YYYY HH:mm')}
                </Typography>
                {ticket.resolvedAt && (
                  <Typography variant="body2">
                    <strong>Resolved:</strong> {dayjs(ticket.resolvedAt).format('MMM DD, YYYY HH:mm')}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Stats */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Views:</strong> {ticket.views || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Comments:</strong> {comments.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Upvotes:</strong> {ticket.upvotes || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Downvotes:</strong> {ticket.downvotes || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assign to Agent</InputLabel>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              label="Assign to Agent"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>
                  {agent.username} ({agent.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketDetail;
