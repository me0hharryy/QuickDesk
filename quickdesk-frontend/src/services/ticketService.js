import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const ticketService = {
  // Categories
  getCategories: async () => {
    try {
      console.log('Fetching categories from:', api.defaults.baseURL + API_ENDPOINTS.CATEGORIES);
      
      // Add isActive=all parameter to get all categories
      const response = await api.get(API_ENDPOINTS.CATEGORIES + '?isActive=all');
      
      console.log('Categories fetched successfully:', response.data.length, 'categories');
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to fetch categories:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
      };
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORIES, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create category',
      };
    }
  },

  // Tickets
  getTickets: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.TICKETS.BASE, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tickets',
      };
    }
  },

  getTicketById: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.TICKETS.BASE}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ticket',
      };
    }
  },

  createTicket: async (ticketData) => {
    try {
      const formData = new FormData();
      
      Object.keys(ticketData).forEach(key => {
        if (key !== 'attachments') {
          if (Array.isArray(ticketData[key])) {
            ticketData[key].forEach(item => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, ticketData[key]);
          }
        }
      });

      if (ticketData.attachments && ticketData.attachments.length > 0) {
        ticketData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post(API_ENDPOINTS.TICKETS.BASE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create ticket',
      };
    }
  },

  updateTicket: async (id, updates) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.TICKETS.BASE}/${id}`, updates);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update ticket',
      };
    }
  },

  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.TICKETS.BASE}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete ticket',
      };
    }
  },

  assignTicket: async (id, assignedTo) => {
    try {
      const response = await api.patch(API_ENDPOINTS.TICKETS.ASSIGN(id), {
        assignedTo,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign ticket',
      };
    }
  },

  voteOnTicket: async (id, voteType) => {
    try {
      const response = await api.post(API_ENDPOINTS.TICKETS.VOTE(id), {
        type: voteType,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to vote',
      };
    }
  },

  addComment: async (ticketId, commentData) => {
    try {
      const formData = new FormData();
      formData.append('message', commentData.message);
      
      if (commentData.isInternal) {
        formData.append('isInternal', commentData.isInternal);
      }

      if (commentData.attachments && commentData.attachments.length > 0) {
        commentData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post(
        API_ENDPOINTS.TICKETS.COMMENTS(ticketId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add comment',
      };
    }
  },

  getStatistics: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.TICKETS.STATISTICS);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  },
};

export default ticketService;
