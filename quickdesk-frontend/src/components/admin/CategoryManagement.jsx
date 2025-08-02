import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import api from '../../services/api';

const CategoryManagement = () => {
  const { hasRole } = useAuth();
  const { fetchCategories } = useTickets();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#780000',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const colorOptions = [
    '#780000', // Primary
    '#C1121F', // Secondary
    '#003049', // Accent
    '#669BBC', // Info
    '#2E7D32', // Success
    '#F57C00', // Warning
    '#D32F2F', // Error
    '#7B1FA2', // Purple
  ];

  useEffect(() => {
    if (hasRole(['admin'])) {
      loadCategories();
    }
  }, [hasRole]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleDialogOpen = (type, category = null) => {
    setDialogType(type);
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#780000',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#780000',
      });
    }
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#780000',
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (dialogType === 'create') {
        await api.post('/api/categories', formData);
        setSuccess('Category created successfully');
      } else if (dialogType === 'edit') {
        await api.put(`/api/categories/${selectedCategory._id}`, formData);
        setSuccess('Category updated successfully');
      } else if (dialogType === 'delete') {
        await api.delete(`/api/categories/${selectedCategory._id}`);
        setSuccess('Category deleted successfully');
      }

      loadCategories();
      handleDialogClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await api.patch(`/api/categories/${category._id}/toggle-status`);
      setSuccess(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      loadCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle category status');
    }
    handleMenuClose();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Category Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage ticket categories and classifications
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen('create')}
          >
            Add Category
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Categories Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: category.color || '#780000',
                            width: 40,
                            height: 40,
                          }}
                        >
                          <CategoryIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {category.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={category.color}
                            sx={{
                              bgcolor: category.color,
                              color: 'white',
                              fontSize: '0.75rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {category.createdBy?.username || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, category)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {categories.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No categories found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first category to start organizing tickets
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen('create')}
              >
                Add Category
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('edit', selectedCategory)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Category
        </MenuItem>
        <MenuItem onClick={() => handleToggleStatus(selectedCategory)}>
          <BlockIcon sx={{ mr: 1 }} fontSize="small" />
          {selectedCategory?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem 
          onClick={() => handleDialogOpen('delete', selectedCategory)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Category
        </MenuItem>
      </Menu>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'create' && 'Add New Category'}
          {dialogType === 'edit' && 'Edit Category'}
          {dialogType === 'delete' && 'Delete Category'}
        </DialogTitle>
        
        <DialogContent>
          {dialogType === 'delete' ? (
            <Typography>
              Are you sure you want to delete category "{selectedCategory?.name}"? 
              This action cannot be undone and may affect existing tickets.
            </Typography>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  placeholder="e.g., Technical Support, Bug Reports"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Describe what types of tickets belong to this category..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Category Color
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {colorOptions.map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleFormChange('color', color)}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid' : '2px solid',
                        borderColor: formData.color === color ? 'primary.main' : 'grey.300',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected: {formData.color}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={dialogType === 'delete' ? 'error' : 'primary'}
          >
            {dialogType === 'create' && 'Create Category'}
            {dialogType === 'edit' && 'Update Category'}
            {dialogType === 'delete' && 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManagement;
