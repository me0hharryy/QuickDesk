import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import { USER_ROLES, FILE_UPLOAD_CONFIG } from '../../utils/constants';

const AddComment = ({ ticketId, onCommentAdded }) => {
  const { user, hasRole } = useAuth();
  const { addComment } = useTickets();

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 3,
    maxSize: FILE_UPLOAD_CONFIG.maxSize,
    accept: FILE_UPLOAD_CONFIG.acceptedTypes,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
      
      if (rejectedFiles.length > 0) {
        setError('Some files were rejected. Please check file size and type.');
        setTimeout(() => setError(''), 5000);
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Comment message is required');
      return;
    }

    setLoading(true);
    setError('');

    const commentData = {
      message: message.trim(),
      isInternal: hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]) ? isInternal : false,
      attachments: files,
    };

    const result = await addComment(ticketId, commentData);

    if (result.success) {
      setMessage('');
      setIsInternal(false);
      setFiles([]);
      onCommentAdded(result.comment);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleFileRemove = (fileToRemove) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 36,
            height: 36,
          }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 1000 }}
            />

            {/* File Upload Area */}
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                p: 2,
                mb: 2,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isDragActive ? 'Drop files here' : 'Drag files here or click to upload'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max 3 files, 10MB each
              </Typography>
            </Box>

            {/* File List */}
            {files.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Attached Files ({files.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {files.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${formatFileSize(file.size)})`}
                      onDelete={() => handleFileRemove(file)}
                      deleteIcon={<CloseIcon />}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]) && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Internal Note (Only visible to agents)
                      </Typography>
                    }
                  />
                )}

                <Typography variant="caption" color="text.secondary">
                  {message.length}/1000 characters
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={loading || !message.trim()}
                sx={{ minWidth: 100 }}
              >
                {loading ? 'Posting...' : 'Post'}
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddComment;
