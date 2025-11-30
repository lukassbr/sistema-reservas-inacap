import React, {useState} from "react";
import { Link } from "react-router-dom";

// 1. Componente ResetPassword
const ResetPassword = () => {
    const [fase, setFase] = useState("solicitud"); // "solicitud", "codigo", "exito"

    // 2. ESTADOS DE FORMULARIO
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
 
    // 3. ESTADOS DE UTILIDAD
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 4. MOCKUP: Simula el envio de correo
    const handleSolicitud = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.includes ("@inacapmail.cl") || !email.length < 5) {
            setError("Por favor, ingresa un correo válido de Inacap.");
            return;
        }
        setLoading (true);
        // aquí iría la llamada a la API de Django

        setTimeout(() => {
            setLoading(false);
            setFase("codigo");
            alert("Correo de restablecimiento enviado. Revisa tu bandeja de entrada.");
        }, 2000);
    };

    // 5. MOCKUP: Simula el restablecimiento de contraseña con token
    const handleRestablecer = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (newPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (!token) {
            setError("Por favor, ingresa el código recibido por correo.");
            return;
        }

        setLoading(true);
        // aquí iría la llamada a la API de Django

        setTimeout(() => {
            setLoading(false);
            setFase("exito");
            alert("Contraseña restablecida con éxito. Ahora puedes iniciar sesión.");
        }, 2000);

    };

    // 6. RENDERIZADO CONDICIONAL SEGÚN FASE
    const renderForm = () => {

        // PANTALLA 1: Solicitud de Email
        if (fase === 'solicitud') {
            return (
                <form onSubmit={handleSolicitud}>
                    <p className="text-muted mb-4">Ingresa tu correo institucional para enviarte un código de verificación.</p>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="tucorreo@inacapmail.cl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                        {loading ? 'Enviando...' : 'Solicitar Código'}
                    </button>
                    <Link to="/login" className="btn btn-link w-100 mt-2 text-decoration-none text-muted">
                         Volver al Login
                    </Link>
                </form>
            );
        }

        // PANTALLA 2: Ingreso de Código y Nueva Contraseña
        if (fase === 'codigo') {
             return (
                <form onSubmit={handleRestablecer}>
                    <p className="text-success mb-4 small fw-bold">Se ha enviado un código de seguridad a {email}.</p>
                    <div className="mb-3">
                        <label htmlFor="token" className="form-label">Código de Verificación</label>
                        <input
                            type="text"
                            className="form-control"
                            id="token"
                            placeholder="Ej: 123456"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                        />
                        <small className="form-text text-muted">El link/código expira en 1 hora.</small>
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            placeholder="Mínimo 8 caracteres"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                    <button type="button" className="btn btn-link w-100 mt-2 text-decoration-none text-muted" onClick={() => setFase('solicitud')}>
                         Volver a solicitar
                    </button>
                </form>
            );
        }
        
        // PANTALLA 3: Éxito
        if (fase === 'exito') {
            return (
                <div className="text-center p-4">
                    <i className="bi bi-shield-lock-fill text-success" style={{ fontSize: '3rem' }}></i>
                    <h4 className="mt-3 text-success">¡Contraseña Restablecida!</h4>
                    <p>Tu nueva contraseña ha sido guardada. Ahora puedes iniciar sesión con tus nuevas credenciales.</p>
                    <Link to="/login" className="btn btn-danger w-100 mt-3">
                        Ir al Login
                    </Link>
                </div>
            );
        }
    };  

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center">
            <div className="row 2-100 w-100">
                <div className="col-md-6 offset-md-3">
                    <div className="card shadow border-danger border-4">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h3 className="text-danger fw-bold">Restablecer Contraseña</h3>
                                <p className="text-muted">Sigue los pasos para recuperar tu cuenta.</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}

                            {renderForm()}
                        </div>
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default ResetPassword;