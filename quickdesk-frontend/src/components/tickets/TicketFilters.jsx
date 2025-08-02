import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';
import { 
  TICKET_STATUS, 
  TICKET_PRIORITY, 
  SORT_OPTIONS,
  USER_ROLES 
} from '../../utils/constants';

const TicketFilters = ({ filters, onFilterChange }) => {
  const { user, hasRole } = useAuth();
  const { categories, clearFilters } = useTickets();

  const handleFilterChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleClearSearch = () => {
    handleFilterChange('search', '');
  };

  const handleToggleMyTickets = () => {
    handleFilterChange('myTickets', !filters.myTickets);
  };

  const handleSortOrderToggle = (event, newOrder) => {
    if (newOrder !== null) {
      handleFilterChange('sortOrder', newOrder);
    }
  };

  const handleClearAllFilters = () => {
    clearFilters();
  };

  const hasActiveFilters = () => {
    return filters.status || filters.category || filters.priority || 
           filters.search || filters.myTickets ||
           filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc';
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="action" />
          <Box>
            <Box sx={{ fontWeight: 600, mb: 0.5 }}>Filters</Box>
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              Refine your ticket search
            </Box>
          </Box>
        </Box>
        
        {hasActiveFilters() && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearAllFilters}
            startIcon={<ClearIcon />}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.values(TICKET_STATUS).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Priority Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              label="Priority"
            >
              <MenuItem value="">All Priorities</MenuItem>
              {Object.values(TICKET_PRIORITY).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Category Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              label="Sort By"
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Order */}
        <Grid item xs={12} sm={6} md={1}>
          <ToggleButtonGroup
            value={filters.sortOrder}
            exclusive
            onChange={handleSortOrderToggle}
            size="small"
            fullWidth
          >
            <ToggleButton value="asc" sx={{ fontSize: '0.75rem' }}>
              ASC
            </ToggleButton>
            <ToggleButton value="desc" sx={{ fontSize: '0.75rem' }}>
              DESC
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Additional Filters Row */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* My Tickets Toggle - Show for agents/admins */}
        {hasRole([USER_ROLES.AGENT, USER_ROLES.ADMIN]) && (
          <Chip
            label="My Tickets Only"
            clickable
            color={filters.myTickets ? 'primary' : 'default'}
            onClick={handleToggleMyTickets}
            variant={filters.myTickets ? 'filled' : 'outlined'}
          />
        )}

        {/* Active Filter Chips */}
        {filters.status && (
          <Chip
            label={`Status: ${filters.status}`}
            onDelete={() => handleFilterChange('status', '')}
            color="secondary"
            variant="outlined"
            size="small"
          />
        )}

        {filters.priority && (
          <Chip
            label={`Priority: ${filters.priority}`}
            onDelete={() => handleFilterChange('priority', '')}
            color="secondary"
            variant="outlined"
            size="small"
          />
        )}

        {filters.category && (
          <Chip
            label={`Category: ${categories.find(c => c._id === filters.category)?.name}`}
            onDelete={() => handleFilterChange('category', '')}
            color="secondary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    </Box>
  );
};

export default TicketFilters;
