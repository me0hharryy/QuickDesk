import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CommentsList = ({ comments, ticketId, onCommentsUpdate }) => {
  const { user, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const canEditComment = (comment) => {
    return comment.user._id === user._id || hasRole([USER_ROLES.ADMIN]);
  };

  const canViewInternalComment = (comment) => {
    return !comment.isInternal || hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]);
  };

  const handleDownloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = `/uploads/${attachment.filename}`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredComments = comments.filter(canViewInternalComment);

  if (filteredComments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No comments yet. Be the first to comment!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {filteredComments.map((comment) => (
        <Paper
          key={comment._id}
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: comment.isInternal ? 'rgba(255, 193, 7, 0.05)' : 'transparent',
            borderLeft: comment.isInternal ? '4px solid #FFC107' : 'none',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: comment.user._id === user._id ? 'primary.main' : 'secondary.main',
                  width: 36,
                  height: 36,
                }}
              >
                {comment.user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {comment.user?.username}
                  </Typography>
                  {comment.isInternal && (
                    <Chip
                      icon={<LockIcon />}
                      label="Internal"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                  {comment.isEdited && (
                    <Chip
                      label="Edited"
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(comment.createdAt).fromNow()}
                  {comment.isEdited && comment.editedAt && (
                    <> • Edited {dayjs(comment.editedAt).fromNow()}</>
                  )}
                </Typography>
              </Box>
            </Box>

            {canEditComment(comment) && (
              <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment)}>
                <MoreIcon />
              </IconButton>
            )}
          </Box>

          {/* Comment Content */}
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              pl: 6, // Align with avatar
            }}
          >
            {comment.message}
          </Typography>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <Box sx={{ pl: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Attachments:
              </Typography>
              <Grid container spacing={1}>
                {comment.attachments.map((attachment, index) => (
                  <Grid item key={index}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadAttachment(attachment)}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {attachment.originalName}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      ))}

      {/* Comment Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Comment
        </MenuItem>
        {hasRole([USER_ROLES.ADMIN]) && (
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete Comment
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default CommentsList;
