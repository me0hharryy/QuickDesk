import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Button,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  ThumbUp,
  ThumbDown,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import { STATUS_COLORS, PRIORITY_COLORS, USER_ROLES } from '../../utils/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { voteOnTicket, updateTicket } = useTickets();
  const [anchorEl, setAnchorEl] = useState(null);
  const [voting, setVoting] = useState(false);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    navigate(`/tickets/${ticket._id}`);
  };

  const handleVote = async (event, voteType) => {
    event.stopPropagation();
    setVoting(true);
    
    const result = await voteOnTicket(ticket._id, voteType);
    if (!result.success) {
      console.error('Voting failed:', result.message);
    }
    
    setVoting(false);
  };

  const handleStatusChange = async (event, newStatus) => {
    event.stopPropagation();
    handleMenuClose();
    
    const result = await updateTicket(ticket._id, { status: newStatus });
    if (!result.success) {
      console.error('Status update failed:', result.message);
    }
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#666666';
  };

  const getPriorityColor = (priority) => {
    return PRIORITY_COLORS[priority] || '#666666';
  };

  const canEdit = () => {
    return hasRole([USER_ROLES.ADMIN, USER_ROLES.AGENT]) || 
           (user._id === ticket.createdBy._id);
  };

  const getUserVote = () => {
    const userVote = ticket.votedBy?.find(vote => vote.user === user._id);
    return userVote?.voteType || null;
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Left Section - Ticket Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  fontSize: '0.875rem',
                }}
              >
                {ticket.createdBy?.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ticket.subject}
                </Typography>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {ticket.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    #{ticket.ticketNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Created {dayjs(ticket.createdAt).fromNow()}
                  </Typography>
                  {ticket.assignedTo && (
                    <Typography variant="caption" color="text.secondary">
                      • Assigned to {ticket.assignedTo.username}
                    </Typography>
                  )}
                </Box>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {ticket.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                    ))}
                    {ticket.tags.length > 3 && (
                      <Chip
                        label={`+${ticket.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: 20 }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Right Section - Status & Actions */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
              }}
            >
              {/* Status and Priority Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={ticket.status}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(ticket.status),
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={ticket.priority}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: getPriorityColor(ticket.priority),
                    color: getPriorityColor(ticket.priority),
                  }}
                />
                {ticket.category && (
                  <Chip
                    label={ticket.category.name}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'text.secondary' }}
                  />
                )}
              </Box>

              {/* Actions Row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* Vote Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Upvote">
                    <IconButton
                      size="small"
                      onClick={(e) => handleVote(e, 'up')}
                      disabled={voting}
                      sx={{
                        color: getUserVote() === 'up' ? 'success.main' : 'text.secondary',
                      }}
                    >
                      <ThumbUp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.upvotes || 0}
                  </Typography>
                  
                  <Tooltip title="Downvote">
                    <IconButton
                      size="small"
                      onClick={(e) => handleVote(e, 'down')}
                      disabled={voting}
                      sx={{
                        color: getUserVote() === 'down' ? 'error.main' : 'text.secondary',
                      }}
                    >
                      <ThumbDown fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {ticket.downvotes || 0}
                  </Typography>
                </Box>

                {/* Attachment Indicator */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <Tooltip title={`${ticket.attachments.length} attachment(s)`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {ticket.attachments.length}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Views */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {ticket.views || 0}
                  </Typography>
                </Box>

                {/* Quick Actions Menu */}
                {canEdit() && (
                  <>
                    <IconButton
                      size="small"
                      onClick={handleMenuOpen}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreIcon />
                    </IconButton>
                    
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]) && (
                        [
                          <MenuItem
                            key="in-progress"
                            onClick={(e) => handleStatusChange(e, 'In Progress')}
                            disabled={ticket.status === 'In Progress'}
                          >
                            Mark In Progress
                          </MenuItem>,
                          <MenuItem
                            key="resolved"
                            onClick={(e) => handleStatusChange(e, 'Resolved')}
                            disabled={ticket.status === 'Resolved'}
                          >
                            Mark Resolved
                          </MenuItem>,
                          <MenuItem
                            key="closed"
                            onClick={(e) => handleStatusChange(e, 'Closed')}
                            disabled={ticket.status === 'Closed'}
                          >
                            Close Ticket
                          </MenuItem>,
                        ]
                      )}
                      <MenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClose();
                        navigate(`/tickets/${ticket._id}`);
                      }}>
                        View Details
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
