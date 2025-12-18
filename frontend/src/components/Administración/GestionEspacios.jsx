import React, { useState, useEffect } from "react";
import api from "../../services/api";
import authService from "../../services/authService";
import Swal from 'sweetalert2';

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [esAdmin, setEsAdmin] = useState(false);

    // CORRECCIÓN: Agregamos 'tipo' que es obligatorio en el modelo
    const [espacioActual, setEspacioActual] = useState({
        id: null,
        nombre: "",
        tipo: "salon", // Valor por defecto obligatorio
        capacidad: "",
        ubicacion: "",
        estado: "disponible"
    });

    useEffect(() => {
        cargarEspacios();
        const user = authService.getCurrentUser();
        if (user && user.rol_slug === 'admin') {
            setEsAdmin(true);
        }
    }, []);

    const cargarEspacios = async () => {
        try {
            const res = await api.get("/espacios/");
            setEspacios(res.data);
        } catch (error) {
            console.error("Error cargando espacios", error);
        }
    };

    const handleInputChange = (e) => {
        setEspacioActual({ ...espacioActual, [e.target.name]: e.target.value });
    };

    const guardarEspacio = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                await api.put(`/espacios/${espacioActual.id}/`, espacioActual);
                Swal.fire('Actualizado', 'Espacio modificado correctamente', 'success');
            } else {
                await api.post("/espacios/", espacioActual);
                Swal.fire('Creado', 'Nuevo espacio registrado', 'success');
            }
            limpiarFormulario();
            cargarEspacios();
        } catch (error) {
            console.error(error); // Para ver el detalle en consola
            Swal.fire('Error', 'No se pudo guardar. Revisa que el nombre sea único.', 'error');
        }
    };

    const eliminarEspacio = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar espacio?',
            text: "Esto podría afectar a las reservas históricas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/espacios/${id}/`);
                Swal.fire('Eliminado', 'El espacio ha sido borrado.', 'success');
                cargarEspacios();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    };

    const prepararEdicion = (espacio) => {
        setModoEdicion(true);
        setEspacioActual({
            id: espacio.id,
            nombre: espacio.nombre,
            tipo: espacio.tipo, // Cargamos el tipo
            capacidad: espacio.capacidad,
            ubicacion: espacio.ubicacion,
            estado: espacio.estado || "disponible"
        });
    };

    const limpiarFormulario = () => {
        setModoEdicion(false);
        setEspacioActual({ id: null, nombre: "", tipo: "salon", capacidad: "", ubicacion: "", estado: "disponible" });
    };

    return (
        <div className="container mt-4 fade-in">
            <h2 className="mb-4 text-danger fw-bold"><i className="bi bi-building-fill me-2"></i>Gestión de Espacios</h2>
            
            <div className="row">
                {/* FORMULARIO (SOLO ADMIN) */}
                {esAdmin && (
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-danger text-white fw-bold">
                                {modoEdicion ? 'Editar Espacio' : 'Nuevo Espacio'}
                            </div>
                            <div className="card-body">
                                <form onSubmit={guardarEspacio}>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre del Espacio</label>
                                        <input type="text" className="form-control" name="nombre" 
                                            value={espacioActual.nombre} onChange={handleInputChange} required placeholder="Ej: Lab 1" />
                                    </div>

                                    {/* CORRECCIÓN: SELECTOR DE TIPO (Obligatorio en modelo) */}
                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Espacio</label>
                                        <select className="form-select" name="tipo" value={espacioActual.tipo} onChange={handleInputChange} required>
                                            <option value="salon">Salón de Clases</option>
                                            <option value="laboratorio">Laboratorio</option>
                                            <option value="auditorio">Auditorio</option>
                                            <option value="cancha">Cancha Deportiva</option>
                                            <option value="hall">Hall</option>
                                            <option value="patio">Patio</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Capacidad</label>
                                        <input type="number" className="form-control" name="capacidad" 
                                            value={espacioActual.capacidad} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ubicación</label>
                                        <input type="text" className="form-control" name="ubicacion" 
                                            value={espacioActual.ubicacion} onChange={handleInputChange} required />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Estado</label>
                                        <select className="form-select" name="estado" value={espacioActual.estado} onChange={handleInputChange}>
                                            <option value="disponible">🟢 Disponible</option>
                                            <option value="mantenimiento">🟠 En Mantenimiento</option>
                                            <option value="bloqueado">🔴 Bloqueado</option>
                                        </select>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn ${modoEdicion ? 'btn-warning' : 'btn-success'}`}>
                                            {modoEdicion ? 'Guardar Cambios' : 'Registrar Espacio'}
                                        </button>
                                        {modoEdicion && (
                                            <button type="button" className="btn btn-secondary" onClick={limpiarFormulario}>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLA */}
                <div className={esAdmin ? "col-md-8" : "col-md-12"}>
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Tipo</th>
                                            <th>Capacidad</th>
                                            <th>Estado</th>
                                            {esAdmin && <th>Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {espacios.map(e => (
                                            <tr key={e.id}>
                                                <td className="fw-bold">{e.nombre}</td>
                                                <td>{e.tipo_display || e.tipo}</td>
                                                <td>{e.capacidad} pers.</td>
                                                <td>
                                                    <span className={`badge ${e.estado === 'disponible' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                        {e.estado}
                                                    </span>
                                                </td>
                                                {esAdmin && (
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => prepararEdicion(e)}>
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarEspacio(e.id)}>
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
                </div>
            </div>
        </div>
    );
};

export default GestionEspacios;