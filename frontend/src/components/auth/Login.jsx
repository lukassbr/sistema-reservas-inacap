import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row h-100 g-0">
        
        {/* === ZONA IZQUIERDA: BRANDING (Solo visible en PC/Tablet) === */}
        <div className="col-lg-7 d-none d-lg-flex flex-column justify-content-center align-items-center text-white position-relative"
             style={{
               background: 'linear-gradient(135deg, #E30613 0%, #8a040b 100%)', // Degradado Rojo INACAP
               boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.1)'
             }}>
          
          {/* Patrón de fondo tecnológico sutil */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0.1,
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>

          <div className="text-center position-relative" style={{zIndex: 2}}>
             {/* Círculo decorativo detrás del logo */}
             <div className="rounded-circle bg-white d-flex align-items-center justify-content-center mx-auto mb-4 shadow-lg" 
                  style={{width: '120px', height: '120px', opacity: 0.95}}>
                <i className="bi bi-building text-danger" style={{fontSize: '3.5rem'}}></i>
             </div>
             
             <h1 className="display-4 fw-bold mb-2">Portal de Reservas</h1>
             <p className="lead px-5 opacity-75">
               Gestión eficiente de espacios y recursos académicos.<br/>
               Sede Temuco.
             </p>
          </div>

          <div className="position-absolute bottom-0 w-100 text-center pb-4 opacity-50 small">
            © 2025 INACAP - Subdirección Vespertina
          </div>
        </div>

        {/* === ZONA DERECHA: FORMULARIO === */}
        <div className="col-lg-5 d-flex align-items-center justify-content-center bg-white">
          <div className="w-100 p-5" style={{maxWidth: '450px'}}>
            
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark mb-1">Bienvenido</h2>
              <p className="text-muted">Ingresa tus credenciales para acceder</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 animate__animated animate__shakeX" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control bg-light border-0"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{height: '55px'}}
                />
                <label htmlFor="email" className="text-muted">Correo Institucional</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control bg-light border-0"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{height: '55px'}}
                />
                <label htmlFor="password" className="text-muted">Contraseña</label>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="remember" />
                  <label className="form-check-label small text-muted" htmlFor="remember">Recuérdame</label>
                </div>
                <a href="/reset-password" className="text-decoration-none small text-danger fw-bold">
                  ¿Olvidaste tu clave?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-danger w-100 py-3 fw-bold rounded-3 shadow-sm transition-all"
                disabled={loading}
                style={{letterSpacing: '0.5px'}}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Validando...
                  </>
                ) : (
                  <>Ingresar al Sistema <i className="bi bi-arrow-right ms-2"></i></>
                )}
              </button>
            </form>
            
            <div className="mt-5 text-center text-muted small">
              ¿Problemas de acceso? Contacta a <a href="#" className="text-dark fw-bold text-decoration-none">Soporte TI</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;