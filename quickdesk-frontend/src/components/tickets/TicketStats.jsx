import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import {
  ConfirmationNumber,
  Schedule,
  Assignment,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const TicketStats = ({ stats }) => {
  const theme = useTheme();

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: <ConfirmationNumber />,
      color: theme.palette.info.main,
      bgColor: `${theme.palette.info.main}15`,
    },
    {
      title: 'Open',
      value: stats.open,
      icon: <Schedule />,
      color: theme.palette.secondary.main,
      bgColor: `${theme.palette.secondary.main}15`,
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: <Assignment />,
      color: theme.palette.warning.main,
      bgColor: `${theme.palette.warning.main}15`,
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      bgColor: `${theme.palette.success.main}15`,
    },
    {
      title: 'Closed',
      value: stats.closed,
      icon: <Cancel />,
      color: theme.palette.text.secondary,
      bgColor: `${theme.palette.text.secondary}15`,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statCards.map((stat, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: stat.bgColor,
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ color: stat.color, fontSize: '1.5rem' }}>
                    {stat.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TicketStats;
