import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api'; // Assuming you have an api service configured
import { API_ENDPOINTS, ITEMS_PER_PAGE } from '../utils/constants'; // Assuming you have these constants

const TicketContext = createContext();

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    myTickets: false,
  });

  const fetchTickets = useCallback(async (page = 1, customFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...filters,
        ...customFilters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get(API_ENDPOINTS.TICKETS.BASE, { params });
      
      setTickets(response.data.tickets);
      setPagination(response.data.pagination);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchTicketById = async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.TICKETS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  };

  const createTicket = async (ticketData) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(ticketData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, ticketData[key]);
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

      // Refresh tickets list
      fetchTickets();

      return { success: true, ticket: response.data.ticket };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create ticket';
      return { success: false, message };
    }
  };

  const updateTicket = async (id, updates) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.TICKETS.BASE}/${id}`, updates);
      
      // Update local ticket in the list
      setTickets(prev => prev.map(ticket => 
        ticket._id === id ? response.data.ticket : ticket
      ));

      return { success: true, ticket: response.data.ticket };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update ticket';
      return { success: false, message };
    }
  };

  const voteOnTicket = async (ticketId, voteType) => {
    try {
      const response = await api.post(API_ENDPOINTS.TICKETS.VOTE(ticketId), {
        type: voteType,
      });

      // Update local ticket votes
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketId 
          ? { 
              ...ticket, 
              upvotes: response.data.upvotes,
              downvotes: response.data.downvotes 
            }
          : ticket
      ));

      // Corrected return statement
      return { success: true, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to vote';
      return { success: false, message };
    }
  };

  const addComment = async (ticketId, commentData) => {
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

      return { success: true, comment: response.data.comment };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      return { success: false, message };
    }
  };

  const assignTicket = async (ticketId, assignedTo) => {
    try {
      const response = await api.patch(API_ENDPOINTS.TICKETS.ASSIGN(ticketId), {
        assignedTo,
      });

      // Update local ticket
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketId ? response.data.ticket : ticket
      ));

      return { success: true, ticket: response.data.ticket };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign ticket';
      return { success: false, message };
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      setCategories(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }, []);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      myTickets: false,
    });
  };

  const value = {
    tickets,
    categories,
    loading,
    pagination,
    filters,
    fetchTickets,
    fetchTicketById,
    createTicket,
    updateTicket,
    voteOnTicket,
    addComment,
    assignTicket,
    fetchCategories,
    updateFilters,
    clearFilters,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
};
