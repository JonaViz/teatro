
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Asegúrate de definir REACT_APP_API_URL en tu archivo .env
  withCredentials: true, // Para manejar las cookies
});

export default api;








