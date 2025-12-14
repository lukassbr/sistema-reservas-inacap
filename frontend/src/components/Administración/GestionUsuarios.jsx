import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from 'sweetalert2';

const GestionUsuarios = () => {
    // --- ESTADOS ---
    // Necesito varias listas para que los selectores funcionen
    const [usuarios, setUsuarios] = useState([]); // La lista principal de la tabla
    const [roles, setRoles] = useState([]);       // Para el <select> de Rol
    const [carreras, setCarreras] = useState([]); // Para el <select> de Carrera
    
    // Controla si se muestra el popup (modal) de creación
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // El estado del formulario. Incluye 'carrera' y 'rol' como IDs.
    const [formData, setFormData] = useState({
        email: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rol: "",      
        carrera: "",  
        password: ""
    });

    // --- CARGA INICIAL ---
    useEffect(() => {
        cargarDatos();
    }, []);

    // Esta función es clave: Uso Promise.all para cargar las 3 cosas en paralelo.
    // Así no tengo que esperar a que termine una para pedir la otra.
    const cargarDatos = async () => {
        try {
            const [resUsers, resRoles, resCarreras] = await Promise.all([
                api.get("/usuarios/"),
                api.get("/roles/"),
                api.get("/carreras/")
            ]);
            setUsuarios(resUsers.data);
            setRoles(resRoles.data);
            setCarreras(resCarreras.data);
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    // Actualiza el estado formData cuando escribo en los inputs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- ENVIAR FORMULARIO ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // LÓGICA IMPORTANTE: 
            // Si el usuario seleccionó "Ninguna" en carrera, formData.carrera vendrá vacío "".
            // Pero el backend espera null si no hay carrera, así que hago esa conversión aquí.
            const payload = {
                ...formData,
                carrera: formData.carrera ? formData.carrera : null
            };

            await api.post("/usuarios/", payload);
            
            // Si todo sale bien: aviso, cierro modal, limpio form y recargo la tabla
            Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
            setMostrarModal(false);
            setFormData({ email: "", nombre: "", apellido: "", telefono: "", rol: "", carrera: "", password: "" });
            cargarDatos(); 
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear el usuario. Revisa si el correo ya existe.', 'error');
        }
    };

    return (
        <div className="container mt-4 fade-in">
            {/* Cabecera con botón de crear */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger fw-bold"><i className="bi bi-people-fill me-2"></i>Gestión de Usuarios</h2>
                <button className="btn btn-success shadow-sm" onClick={() => setMostrarModal(true)}>
                    <i className="bi bi-person-plus-fill me-2"></i>Nuevo Usuario
                </button>
            </div>

            {/* --- TABLA PRINCIPAL --- */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Carrera</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td className="fw-bold">{u.nombre} {u.apellido}</td>
                                        <td>{u.email}</td>
                                        {/* Coloreo el badge según el rol para identificar rápido */}
                                        <td>
                                            <span className={`badge ${u.rol_slug === 'admin' ? 'bg-danger' : (u.rol_slug === 'coordinador' ? 'bg-primary' : 'bg-secondary')}`}>
                                                {u.rol_nombre || 'Sin Rol'}
                                            </span>
                                        </td>
                                        {/* Muestro la carrera si tiene, sino N/A */}
                                        <td>
                                            {u.carrera_nombre ? (
                                                <span className="text-primary fw-bold"><i className="bi bi-mortarboard me-1"></i>{u.carrera_nombre}</span>
                                            ) : (
                                                <span className="text-muted small">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${u.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {u.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL (POPUP) PARA CREAR --- */}
            {/* Solo se renderiza si mostrarModal es true */}
            {mostrarModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Registrar Nuevo Usuario</h5>
                                <button className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* Campos básicos */}
                                        <div className="col-md-6">
                                            <label className="form-label">Nombre</label>
                                            <input type="text" className="form-control" name="nombre" required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Apellido</label>
                                            <input type="text" className="form-control" name="apellido" required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="email" required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Contraseña</label>
                                            <input type="password" className="form-control" name="password" required onChange={handleChange} />
                                        </div>
                                        
                                        {/* SELECTOR DE ROL: Itero sobre la lista de roles que cargué al inicio */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Rol de Usuario</label>
                                            <select className="form-select" name="rol" required onChange={handleChange}>
                                                <option value="">Seleccione Rol...</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* SELECTOR DE CARRERA: Clave para el nuevo requerimiento de estadísticas */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold text-primary">Carrera (Solo estudiantes)</label>
                                            <select className="form-select border-primary" name="carrera" onChange={handleChange}>
                                                <option value="">Ninguna / No aplica</option>
                                                {carreras.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                                ))}
                                            </select>
                                            <small className="text-muted">Dejar vacío si es Administrativo o Mantenimiento</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success">Guardar Usuario</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionUsuarios;