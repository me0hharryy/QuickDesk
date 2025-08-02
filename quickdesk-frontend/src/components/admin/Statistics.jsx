import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { colors } from '../../styles/theme';

const Statistics = () => {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: dayjs().subtract(30, 'day'),
    to: dayjs(),
  });
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    if (hasRole(['admin', 'agent'])) {
      fetchStatistics();
    }
  }, [dateRange, hasRole]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params = {
        dateFrom: dateRange.from.format('YYYY-MM-DD'),
        dateTo: dateRange.to.format('YYYY-MM-DD'),
      };

      const response = await api.get('/api/tickets/admin/statistics', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const now = dayjs();
    
    switch (newPeriod) {
      case '7days':
        setDateRange({ from: now.subtract(7, 'day'), to: now });
        break;
      case '30days':
        setDateRange({ from: now.subtract(30, 'day'), to: now });
        break;
      case '90days':
        setDateRange({ from: now.subtract(90, 'day'), to: now });
        break;
      case '1year':
        setDateRange({ from: now.subtract(1, 'year'), to: now });
        break;
      default:
        break;
    }
  };

  const chartColors = [
    colors.primary,
    colors.secondary,
    colors.info,
    colors.accent,
    '#2E7D32',
    '#F57C00',
    '#D32F2F',
    '#7B1FA2',
  ];

  const pieData = stats?.overview ? [
    { name: 'Open', value: stats.overview.openTickets, color: colors.secondary },
    { name: 'In Progress', value: stats.overview.inProgressTickets, color: '#F57C00' },
    { name: 'Resolved', value: stats.overview.resolvedTickets, color: colors.info },
    { name: 'Closed', value: stats.overview.closedTickets, color: '#2E7D32' },
  ] : [];

  if (loading || !stats) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4">Loading statistics...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Analytics & Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System performance and ticket analytics
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    label="Time Period"
                  >
                    <MenuItem value="7days">Last 7 Days</MenuItem>
                    <MenuItem value="30days">Last 30 Days</MenuItem>
                    <MenuItem value="90days">Last 90 Days</MenuItem>
                    <MenuItem value="1year">Last Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {period === 'custom' && (
                <>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="From Date"
                      value={dateRange.from}
                      onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="To Date"
                      value={dateRange.to}
                      onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  onClick={fetchStatistics}
                  disabled={loading}
                  fullWidth
                >
                  Refresh Data
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary }}>
                  {stats.overview?.totalTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.secondary }}>
                  {stats.overview?.openTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#F57C00' }}>
                  {stats.overview?.inProgressTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                  {stats.overview?.resolvedTickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Ticket Status Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ticket Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Priority Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Priority Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.priorityStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={colors.info} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Agent Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Agent Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.agentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalAssigned" fill={colors.primary} name="Assigned" />
                    <Bar dataKey="resolved" fill={colors.info} name="Resolved" />
                    <Bar dataKey="closed" fill="#2E7D32" name="Closed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default Statistics;
