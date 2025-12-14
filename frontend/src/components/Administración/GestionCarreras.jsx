import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Mi cliente Axios configurado
import Swal from 'sweetalert2'; // Para las alertas bonitas

const GestionCarreras = () => {
    // --- ESTADOS ---
    // Aquí guardo la lista completa de carreras que traigo del backend
    const [carreras, setCarreras] = useState([]);
    
    // Este booleano me sirve para saber si el formulario debe CREAR (false) o EDITAR (true)
    const [modoEdicion, setModoEdicion] = useState(false);
    
    // Objeto temporal para manejar los inputs del formulario.
    // Lo inicio vacío para cuando sea una carrera nueva.
    const [carreraActual, setCarreraActual] = useState({
        id: null,
        nombre_carrera: "",
        codigo: "",
        area: ""
    });

    // --- EFECTOS ---
    // useEffect con array vacío [] significa: "Ejecútate solo una vez al montar el componente".
    // Ideal para cargar los datos iniciales.
    useEffect(() => {
        cargarCarreras();
    }, []);

    // --- FUNCIONES LOGICAS ---

    // Llamada asíncrona a la API para refrescar la tabla
    const cargarCarreras = async () => {
        try {
            const res = await api.get("/carreras/");
            setCarreras(res.data); // Actualizo el estado con lo que me respondió Django
        } catch (error) {
            console.error("Error al cargar carreras", error);
        }
    };

    // Manejador genérico para los inputs. 
    // Uso [e.target.name] para que sirva para 'nombre', 'codigo' y 'area' a la vez.
    const handleInputChange = (e) => {
        setCarreraActual({ ...carreraActual, [e.target.name]: e.target.value });
    };

    // Función principal para guardar (sirve tanto para Crear como para Editar)
    const guardarCarrera = async (e) => {
        e.preventDefault(); // Evito que se recargue la página al enviar el form
        try {
            if (modoEdicion) {
                // Si estoy editando, uso PUT y le paso el ID específico
                await api.put(`/carreras/${carreraActual.id}/`, carreraActual);
                Swal.fire('Actualizado', 'La carrera se actualizó correctamente', 'success');
            } else {
                // Si es nuevo, uso POST a la raíz
                await api.post("/carreras/", carreraActual);
                Swal.fire('Creado', 'La carrera se creó correctamente', 'success');
            }
            // Limpieza después de guardar:
            setModoEdicion(false);
            setCarreraActual({ id: null, nombre_carrera: "", codigo: "", area: "" });
            cargarCarreras(); // Recargo la lista para ver el cambio al tiro
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al guardar (¿Quizás el nombre ya existe?)', 'error');
        }
    };

    // Función para borrar. Importante: Preguntar antes de borrar.
    const eliminarCarrera = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/carreras/${id}/`);
                Swal.fire('Eliminado', 'La carrera ha sido eliminada.', 'success');
                cargarCarreras();
            } catch (error) {
                // Si falla, probablemente es porque hay alumnos ligados a esta carrera (Integridad referencial)
                Swal.fire('Error', 'No se puede eliminar (tiene alumnos asociados).', 'error');
            }
        }
    };

    // Prepara el formulario con los datos de la fila que seleccioné para editar
    const prepararEdicion = (carrera) => {
        setModoEdicion(true);
        setCarreraActual(carrera);
    };

    return (
        <div className="container mt-4 fade-in">
            <h2 className="mb-4 text-danger fw-bold"><i className="bi bi-mortarboard-fill me-2"></i>Gestión de Carreras</h2>
            
            <div className="row">
                {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0">
                        {/* Cambio el título dinámicamente según el modo */}
                        <div className="card-header bg-danger text-white fw-bold">
                            {modoEdicion ? 'Editar Carrera' : 'Nueva Carrera'}
                        </div>
                        <div className="card-body">
                            <form onSubmit={guardarCarrera}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre Carrera</label>
                                    <input type="text" className="form-control" name="nombre_carrera" 
                                        value={carreraActual.nombre_carrera} onChange={handleInputChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Código (Opcional)</label>
                                    <input type="text" className="form-control" name="codigo" 
                                        value={carreraActual.codigo} onChange={handleInputChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Área Académica</label>
                                    <input type="text" className="form-control" name="area" 
                                        value={carreraActual.area} onChange={handleInputChange} placeholder="Ej: Tecnología" />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className={`btn ${modoEdicion ? 'btn-warning' : 'btn-success'}`}>
                                        {modoEdicion ? 'Actualizar' : 'Guardar'}
                                    </button>
                                    {/* Botón cancelar solo si estoy editando */}
                                    {modoEdicion && (
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                            setModoEdicion(false);
                                            setCarreraActual({ id: null, nombre_carrera: "", codigo: "", area: "" });
                                        }}>Cancelar</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: TABLA DE DATOS --- */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Código</th>
                                            <th>Área</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carreras.map(c => (
                                            <tr key={c.id}>
                                                <td className="fw-bold">{c.nombre_carrera}</td>
                                                <td><span className="badge bg-light text-dark border">{c.codigo || 'N/A'}</span></td>
                                                <td>{c.area || '-'}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => prepararEdicion(c)}>
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarCarrera(c.id)}>
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {carreras.length === 0 && (
                                            <tr><td colSpan="4" className="text-center text-muted">No hay carreras registradas.</td></tr>
                                        )}
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

export default GestionCarreras;