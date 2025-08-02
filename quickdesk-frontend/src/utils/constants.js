export const TICKET_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const STATUS_COLORS = {
  [TICKET_STATUS.OPEN]: '#C1121F',
  [TICKET_STATUS.IN_PROGRESS]: '#F57C00',
  [TICKET_STATUS.RESOLVED]: '#669BBC',
  [TICKET_STATUS.CLOSED]: '#2E7D32',
};

export const PRIORITY_COLORS = {
  [TICKET_PRIORITY.LOW]: '#669BBC',
  [TICKET_PRIORITY.MEDIUM]: '#F57C00',
  [TICKET_PRIORITY.HIGH]: '#C1121F',
  [TICKET_PRIORITY.CRITICAL]: '#780000',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  TICKETS: {
    BASE: '/api/tickets',
    VOTE: (id) => `/api/tickets/${id}/vote`,
    COMMENTS: (id) => `/api/tickets/${id}/comments`,
    ASSIGN: (id) => `/api/tickets/${id}/assign`,
    STATISTICS: '/api/tickets/admin/statistics',
  },
  CATEGORIES: '/api/categories',
  USERS: {
    BASE: '/api/users',
    AGENTS: '/api/users/agents',
    TOGGLE_STATUS: (id) => `/api/users/${id}/toggle-status`,
    DASHBOARD: (id) => `/api/users/${id}/dashboard`,
  },
};

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'subject', label: 'Subject' },
];

export const ITEMS_PER_PAGE = 10;

export const FILE_UPLOAD_CONFIG = {
  maxFiles: 5,
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
  },
};
