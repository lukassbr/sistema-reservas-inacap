import axios from 'axios';

// 🔧 Configuración base de Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Asegúrate de que coincida con tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔓 Interceptor: Agregar token automáticamente a cada petición
api.interceptors.request.use(
  (config) => {
    // 1. Buscamos el token donde authService lo guardó
    const token = localStorage.getItem('token');
    
    // 2. Si existe, lo inyectamos en la cabecera
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;