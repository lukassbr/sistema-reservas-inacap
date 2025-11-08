import api from './api';

const authService = {
  //  Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error de conexión' };
    }
  },

  //  Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  },

  //  Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  //  Verificar si está autenticado
  isAuthenticated: () => {
    return true;
    // !!localStorage.getItem('token');
  },
};

// IMPORTANTE: descomentar la línea anterior y eliminar la línea de retorno TRUE 
// para producción, esto se hizo para poder acceder a la página sin necesidad del login, osea en retorno, cambiar el TRUE por la linea comentada

export default authService;