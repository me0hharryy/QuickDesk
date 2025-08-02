import React, { createContext, useContext, useState, useCallback } from 'react';
import ticketService from '../services/ticketService'; // Import your service
import { API_ENDPOINTS, ITEMS_PER_PAGE } from '../utils/constants';

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
  const [error, setError] = useState(null); // Added for error handling
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

  // --- CATEGORY LOGIC (CORRECTED) ---
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the ticketService to fetch categories
      const result = await ticketService.getCategories();
      
      if (result.success) {
        // The service returns data in the `data` property
        setCategories(result.data);
      } else {
        // Handle potential errors reported by the service
        setError(result.message);
        console.error('Error fetching categories:', result.message);
      }
    } catch (err) {
      // Handle unexpected network or server errors
      const message = 'An unexpected error occurred while fetching categories.';
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  }, []);


  // --- TICKET LOGIC (Refactored to use services for consistency) ---

  const fetchTickets = useCallback(async (page = 1, customFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, ...filters, ...customFilters };
      const result = await ticketService.getTickets(params);

      if (result.success) {
        setTickets(result.data.tickets);
        setPagination(result.data.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTicket = async (ticketData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.createTicket(ticketData);
      if (result.success) {
        fetchTickets(); // Refresh the list after creation
      } else {
        setError(result.message);
      }
      return result; // Return the result to the component
    } catch (err) {
      const message = 'An unexpected error occurred while creating the ticket.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id, updates) => {
    const result = await ticketService.updateTicket(id, updates);
    if (result.success) {
      setTickets(prev => prev.map(t => t._id === id ? result.data.ticket : t));
    }
    return result;
  };

  // ... (other functions like fetchTicketById, voteOnTicket, etc. can be refactored similarly)

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
    error, // Expose error state
    pagination,
    filters,
    fetchTickets,
    // fetchTicketById,
    createTicket,
    updateTicket,
    // voteOnTicket,
    // addComment,
    // assignTicket,
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
