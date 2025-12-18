import React, { useState, useEffect } from "react";
import api from "../../services/api";
import authService from "../../services/authService"; // Importamos authService
import Swal from 'sweetalert2';

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    
    // Estado para saber si es admin
    const [esAdmin, setEsAdmin] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        email: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rol: "",      
        carrera: "",  
        password: "" // Solo se enviará si se escribe algo
    });

    useEffect(() => {
        cargarDatos();
        // Verificar si el usuario actual es admin
        const user = authService.getCurrentUser();
        if (user && user.rol_slug === 'admin') {
            setEsAdmin(true);
        }
    }, []);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- PREPARAR EDICIÓN ---
    const prepararEdicion = (usuario) => {
        setModoEdicion(true);
        setFormData({
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono || "",
            rol: usuario.rol || "",
            carrera: usuario.carrera || "",
            password: "" // La contraseña se deja vacía al editar
        });
        setMostrarModal(true);
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setFormData({ id: null, email: "", nombre: "", apellido: "", telefono: "", rol: "", carrera: "", password: "" });
        setMostrarModal(true);
    };

    // --- ELIMINAR USUARIO ---
    const eliminarUsuario = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/usuarios/${id}/`);
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                cargarDatos();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                carrera: formData.carrera ? formData.carrera : null
            };
            
            // Si es edición y no escribieron password, la quitamos del payload para no enviarla vacía
            if (modoEdicion && !payload.password) {
                delete payload.password;
            }

            if (modoEdicion) {
                await api.put(`/usuarios/${formData.id}/`, payload);
                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            } else {
                await api.post("/usuarios/", payload);
                Swal.fire('Creado', 'Usuario creado correctamente', 'success');
            }
            
            setMostrarModal(false);
            cargarDatos(); 
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un error al guardar.', 'error');
        }
    };

    return (
        <div className="container mt-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger fw-bold"><i className="bi bi-people-fill me-2"></i>Gestión de Usuarios</h2>
                {/* SOLO EL ADMIN VE EL BOTÓN DE CREAR */}
                {esAdmin && (
                    <button className="btn btn-success shadow-sm" onClick={abrirModalCrear}>
                        <i className="bi bi-person-plus-fill me-2"></i>Nuevo Usuario
                    </button>
                )}
            </div>

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
                                    {/* SOLO ADMIN VE COLUMNA ACCIONES */}
                                    {esAdmin && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td className="fw-bold">{u.nombre} {u.apellido}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.rol_slug === 'admin' ? 'bg-danger' : (u.rol_slug === 'coordinador' ? 'bg-primary' : 'bg-secondary')}`}>
                                                {u.rol_nombre || 'Sin Rol'}
                                            </span>
                                        </td>
                                        <td>
                                            {u.carrera_nombre ? u.carrera_nombre : <span className="text-muted small">N/A</span>}
                                        </td>
                                        {/* SOLO ADMIN VE BOTONES DE ACCIÓN */}
                                        {esAdmin && (
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => prepararEdicion(u)}>
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarUsuario(u.id)}>
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {mostrarModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">{modoEdicion ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h5>
                                <button className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Nombre</label>
                                            <input type="text" className="form-control" name="nombre" value={formData.nombre} required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Apellido</label>
                                            <input type="text" className="form-control" name="apellido" value={formData.apellido} required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="email" value={formData.email} required onChange={handleChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Contraseña {modoEdicion && <span className="text-muted small">(Dejar en blanco para mantener actual)</span>}</label>
                                            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required={!modoEdicion} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Rol</label>
                                            <select className="form-select" name="rol" value={formData.rol} required onChange={handleChange}>
                                                <option value="">Seleccione Rol...</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">Carrera</label>
                                            <select className="form-select" name="carrera" value={formData.carrera || ""} onChange={handleChange}>
                                                <option value="">Ninguna / No aplica</option>
                                                {carreras.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success">{modoEdicion ? 'Actualizar' : 'Guardar'}</button>
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