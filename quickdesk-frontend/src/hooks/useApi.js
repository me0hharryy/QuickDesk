import { useState, useCallback } from 'react';
import api from '../services/api'; // Assuming you have an api service configured

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await api.get(url, config);
          break;
        case 'post':
          response = await api.post(url, data, config);
          break;
        case 'put':
          response = await api.put(url, data, config);
          break;
        case 'patch':
          response = await api.patch(url, data, config);
          break;
        case 'delete':
          response = await api.delete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Corrected return statement: The response data is now correctly keyed.
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config) => request('get', url, null, config), [request]);
  const post = useCallback((url, data, config) => request('post', url, data, config), [request]);
  const put = useCallback((url, data, config) => request('put', url, data, config), [request]);
  const patch = useCallback((url, data, config) => request('patch', url, data, config), [request]);
  const del = useCallback((url, config) => request('delete', url, null, config), [request]);

  return {
    loading,
    error,
    setError,
    get,
    post,
    put,
    patch,
    delete: del,
    request,
  };
};

export default useApi;
