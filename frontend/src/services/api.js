import axios from 'axios';

// 🔧 Configuración base de Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // URL del backend Django
  headers: {
    'Content-Type': 'application/json',
  },
});

//  Interceptor: Agregar token automáticamente a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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