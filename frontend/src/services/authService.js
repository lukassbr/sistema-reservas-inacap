import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      // 1. Obtener Token Real
      const response = await api.post('/token/', { email, password });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        
        // 2. Obtener datos del usuario (Nombre y Rol)
        try {
            const meResponse = await api.get('/usuarios/me/');
            // Guardamos el usuario real en el navegador
            localStorage.setItem('user', JSON.stringify(meResponse.data));
        } catch (error) {
            console.error("Error obteniendo datos de usuario", error);
            // Fallback para que no se rompa si falla /me/
            localStorage.setItem('user', JSON.stringify({ email, nombre: 'Usuario', rol_slug: 'solicitante' }));
        }
      }
      return response.data;
    } catch (error) {
        console.error("Login error", error);
        throw error.response?.data || { error: 'Credenciales inválidas' };
    }
  },

  logout: () => {
    localStorage.clear(); // Borra todo al salir
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token'); 
  }
};

export default authService;