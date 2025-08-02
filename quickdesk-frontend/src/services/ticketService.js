import api from './api'; // Assuming you have an api service configured
import { API_ENDPOINTS } from '../utils/constants'; // Assuming you have these constants

export const ticketService = {
  getTickets: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.TICKETS.BASE, { params });
      // Corrected: Keyed the response data
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
      // Corrected: Keyed the response data
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
      
      // Append text fields
      Object.keys(ticketData).forEach(key => {
        if (key !== 'attachments') {
          if (Array.isArray(ticketData[key])) {
            ticketData[key].forEach(item => formData.append(`${key}[]`, item));
          } else {
            formData.append(key, ticketData[key]);
          }
        }
      });

      // Append files
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

      // Corrected: Keyed the response data
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
      // Corrected: Keyed the response data
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
      return { success: true, data: response.data }; // This was already correct
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
      // Corrected: Keyed the response data
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
      // Corrected: Keyed the response data
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

      // Add attachments if any
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

      // Corrected: Keyed the response data
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
      return { success: true, data: response.data }; // This was already correct
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  },
};

export default ticketService;
