
import api from './api';


const authService = {
  register: (userData) => apiService.post('/auth/register', userData),
  login: (credentials) => apiService.post('/auth/login', credentials),
  logout: () => apiService.get('/auth/logout'),
  getMe: () => apiService.get('/auth/me'),
  getTickets: () => apiService.get('/auth/tickets'),
  updateUser: (userId, updatedData) => apiService.put(`/auth/user/${userId}`, updatedData),
  deleteUser: (userId) => apiService.delete(`/auth/user/${userId}`),
};

export default authService;