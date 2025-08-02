import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TICKET_STATUS, TICKET_PRIORITY } from './constants';

dayjs.extend(relativeTime);

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  return dayjs(date).format('MMM DD, YYYY HH:mm');
};

export const getRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    [TICKET_STATUS.OPEN]: '#C1121F',
    [TICKET_STATUS.IN_PROGRESS]: '#F57C00',
    [TICKET_STATUS.RESOLVED]: '#669BBC',
    [TICKET_STATUS.CLOSED]: '#2E7D32',
  };
  return colors[status] || '#666666';
};

export const getPriorityColor = (priority) => {
  const colors = {
    [TICKET_PRIORITY.LOW]: '#669BBC',
    [TICKET_PRIORITY.MEDIUM]: '#F57C00',
    [TICKET_PRIORITY.HIGH]: '#C1121F',
    [TICKET_PRIORITY.CRITICAL]: '#780000',
  };
  return colors[priority] || '#666666';
};

export const getPriorityWeight = (priority) => {
  const weights = {
    [TICKET_PRIORITY.LOW]: 1,
    [TICKET_PRIORITY.MEDIUM]: 2,
    [TICKET_PRIORITY.HIGH]: 3,
    [TICKET_PRIORITY.CRITICAL]: 4,
  };
  return weights[priority] || 0;
};

export const sortTicketsByPriority = (tickets) => {
  return tickets.sort((a, b) => {
    return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
  });
};

export const filterTicketsByStatus = (tickets, status) => {
  if (!status) return tickets;
  return tickets.filter(ticket => ticket.status === status);
};

export const searchTickets = (tickets, searchTerm) => {
  if (!searchTerm) return tickets;
  
  const term = searchTerm.toLowerCase();
  return tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(term) ||
    ticket.description.toLowerCase().includes(term) ||
    ticket.ticketNumber.toLowerCase().includes(term) ||
    ticket.createdBy?.username?.toLowerCase().includes(term) ||
    ticket.category?.name?.toLowerCase().includes(term)
  );
};

export const getTicketStats = (tickets) => {
  const stats = {
    total: tickets.length,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    byPriority: {
      [TICKET_PRIORITY.LOW]: 0,
      [TICKET_PRIORITY.MEDIUM]: 0,
      [TICKET_PRIORITY.HIGH]: 0,
      [TICKET_PRIORITY.CRITICAL]: 0,
    },
    byCategory: {},
  };

  tickets.forEach(ticket => {
    // Count by status
    switch (ticket.status) {
      case TICKET_STATUS.OPEN:
        stats.open++;
        break;
      case TICKET_STATUS.IN_PROGRESS:
        stats.inProgress++;
        break;
      case TICKET_STATUS.RESOLVED:
        stats.resolved++;
        break;
      case TICKET_STATUS.CLOSED:
        stats.closed++;
        break;
      default:
        break;
    }

    // Count by priority
    if (stats.byPriority.hasOwnProperty(ticket.priority)) {
      stats.byPriority[ticket.priority]++;
    }

    // Count by category
    const categoryName = ticket.category?.name || 'Uncategorized';
    if (!stats.byCategory[categoryName]) {
      stats.byCategory[categoryName] = 0;
    }
    stats.byCategory[categoryName]++;
  });

  return stats;
};

export const generateRandomColor = () => {
  const colors = [
    '#780000', '#C1121F', '#003049', '#669BBC',
    '#2E7D32', '#F57C00', '#D32F2F', '#7B1FA2',
    '#1976D2', '#388E3C', '#F57C00', '#5D4037',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const downloadAsCSV = (data, filename = 'export.csv') => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    errors: password.length < 6 ? ['Password must be at least 6 characters'] : [],
  };
};

export const generateTicketNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};
