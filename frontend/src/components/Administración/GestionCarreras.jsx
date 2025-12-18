import React, { useState, useEffect } from "react";
import api from "../../services/api"; // El cliente axios que ya tiene el token pegado
import authService from "../../services/authService"; // Necesario para saber quién está conectado
import Swal from 'sweetalert2'; // Para que las alertas no se vean feas

const GestionCarreras = () => {
    // --- ESTADOS ---
    const [carreras, setCarreras] = useState([]); // Lista de datos que viene del back
    const [modoEdicion, setModoEdicion] = useState(false); // Switch para saber si guardamos o actualizamos
    
    // Estado clave: controla si mostramos los botones peligrosos o no
    const [esAdmin, setEsAdmin] = useState(false);

    // El objeto para el formulario. Lo inicializo vacío.
    const [carreraActual, setCarreraActual] = useState({
        id: null,
        nombre_carrera: "",
        codigo: "",
        area: ""
    });

    // --- CARGA INICIAL ---
    useEffect(() => {
        cargarCarreras();
        
        // Aquí validamos "quién soy" apenas entra a la pantalla.
        // Si el usuario guardado en el storage dice 'admin', le habilitamos los superpoderes.
        const user = authService.getCurrentUser();
        if (user && user.rol_slug === 'admin') {
            setEsAdmin(true);
        }
    }, []);

    // --- FUNCIONES LÓGICAS ---

    // Traerse todo de la BD
    const cargarCarreras = async () => {
        try {
            const res = await api.get("/carreras/");
            setCarreras(res.data);
        } catch (error) {
            console.error("Fallo al traer las carreras, revisar conexión", error);
        }
    };

    // Manejo genérico de inputs para no hacer una función por cada campo
    const handleInputChange = (e) => {
        setCarreraActual({ ...carreraActual, [e.target.name]: e.target.value });
    };

    // Función principal de guardado (sirve para Crear y Editar)
    const guardarCarrera = async (e) => {
        e.preventDefault(); // Que no se recargue la página
        try {
            if (modoEdicion) {
                // Si estamos editando, mandamos PUT con el ID
                await api.put(`/carreras/${carreraActual.id}/`, carreraActual);
                Swal.fire('Listo', 'Carrera actualizada', 'success');
            } else {
                // Si es nueva, POST normal
                await api.post("/carreras/", carreraActual);
                Swal.fire('Creado', 'Carrera guardada con éxito', 'success');
            }
            
            // Limpiamos la casa después de operar
            setModoEdicion(false);
            setCarreraActual({ id: null, nombre_carrera: "", codigo: "", area: "" });
            cargarCarreras(); // Refrescamos la tabla al toque
        } catch (error) {
            // Error típico: nombre duplicado o validación del back
            Swal.fire('Ups', 'No se pudo guardar. Revisa que el nombre no esté repetido.', 'error');
        }
    };

    // Borrado con confirmación (solo lo va a poder llamar el admin)
    const eliminarCarrera = async (id) => {
        const result = await Swal.fire({
            title: '¿Seguro jefe?',
            text: "Si borras esto y tiene alumnos asociados, va a fallar por seguridad.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/carreras/${id}/`);
                Swal.fire('Borrado', 'La carrera ya no existe.', 'success');
                cargarCarreras();
            } catch (error) {
                // Integridad referencial de la BD protegiéndonos
                Swal.fire('Error', 'No se puede borrar: hay usuarios o reservas vinculados a esta carrera.', 'error');
            }
        }
    };

    // Cargar los datos en el form para editar
    const prepararEdicion = (carrera) => {
        setModoEdicion(true);
        setCarreraActual(carrera);
    };

    return (
        <div className="container mt-4 fade-in">
            <h2 className="mb-4 text-danger fw-bold"><i className="bi bi-mortarboard-fill me-2"></i>Gestión de Carreras</h2>
            
            <div className="row">
                {/* LÓGICA VISUAL IMPORTANTE:
                    Si es admin -> Muestro el formulario a la izquierda (col-4) y tabla a la derecha (col-8).
                    Si NO es admin (Coordinador) -> Oculto formulario y la tabla ocupa todo el ancho (col-12).
                */}

                {esAdmin && (
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm border-0">
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
                                            {modoEdicion ? 'Actualizar Datos' : 'Guardar Carrera'}
                                        </button>
                                        
                                        {modoEdicion && (
                                            <button type="button" className="btn btn-secondary" onClick={() => {
                                                setModoEdicion(false);
                                                setCarreraActual({ id: null, nombre_carrera: "", codigo: "", area: "" });
                                            }}>Cancelar Edición</button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* La tabla se adapta al ancho disponible */}
                <div className={esAdmin ? "col-md-8" : "col-md-12"}>
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Código</th>
                                            <th>Área</th>
                                            {/* La columna de acciones solo la ve el admin */}
                                            {esAdmin && <th>Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carreras.map(c => (
                                            <tr key={c.id}>
                                                <td className="fw-bold">{c.nombre_carrera}</td>
                                                <td><span className="badge bg-light text-dark border">{c.codigo || 'N/A'}</span></td>
                                                <td>{c.area || '-'}</td>
                                                
                                                {/* Botones de acción solo para admin */}
                                                {esAdmin && (
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => prepararEdicion(c)} title="Editar">
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarCarrera(c.id)} title="Borrar">
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        
                                        {carreras.length === 0 && (
                                            <tr><td colSpan={esAdmin ? "4" : "3"} className="text-center text-muted py-4">
                                                No hay carreras registradas todavía.
                                            </td></tr>
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