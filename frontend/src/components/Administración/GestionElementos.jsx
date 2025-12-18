import React, { useState, useEffect } from "react";
import api from "../../services/api";
import authService from "../../services/authService"; 
import Swal from 'sweetalert2';

const GestionElementos = () => {
    const [elementos, setElementos] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [esAdmin, setEsAdmin] = useState(false); 

    // CORRECCIÓN: Nombres de campos deben coincidir con models.py
    const [elementoActual, setElementoActual] = useState({
        id: null,
        nombre: "",
        categoria: "tecnologia", // Antes 'tipo'
        stock_total: "",         // Antes 'cantidad'
        stock_disponible: "",    // Nuevo campo requerido
        estado: "disponible"
    });

    useEffect(() => {
        cargarElementos();
        const user = authService.getCurrentUser();
        if (user && user.rol_slug === 'admin') {
            setEsAdmin(true);
        }
    }, []);

    const cargarElementos = async () => {
        try {
            const res = await api.get("/elementos/");
            setElementos(res.data);
        } catch (error) {
            console.error("Error al cargar elementos", error);
        }
    };

    const handleInputChange = (e) => {
        setElementoActual({ ...elementoActual, [e.target.name]: e.target.value });
    };

    const guardarElemento = async (e) => {
        e.preventDefault();
        try {
            // LÓGICA DE NEGOCIO:
            // Al crear, asumimos que stock_disponible = stock_total.
            // Al editar, hay que tener cuidado. En este caso simple, enviamos el mismo valor si el usuario no tiene control fino.
            // Para el MVP, igualaremos disponible al total si es nuevo.
            
            const payload = { ...elementoActual };
            
            if (!modoEdicion) {
                // Si es nuevo, el disponible es igual al total
                payload.stock_disponible = payload.stock_total;
            } else {
                // Si editamos, por seguridad para el MVP, si no controlamos préstamos aquí,
                // mantenemos el disponible actual o lo actualizamos proporcionalmente.
                // Para evitar errores 400 por constraints, aseguramos que disponible <= total
                if (parseInt(payload.stock_disponible) > parseInt(payload.stock_total)) {
                     payload.stock_disponible = payload.stock_total;
                }
            }

            if (modoEdicion) {
                await api.put(`/elementos/${elementoActual.id}/`, payload);
                Swal.fire('Éxito', 'Elemento actualizado', 'success');
            } else {
                await api.post("/elementos/", payload);
                Swal.fire('Éxito', 'Elemento agregado', 'success');
            }
            limpiarFormulario();
            cargarElementos();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar. Revisa los datos.', 'error');
        }
    };

    const eliminarElemento = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/elementos/${id}/`);
                Swal.fire('Eliminado', 'Elemento eliminado.', 'success');
                cargarElementos();
            } catch (error) {
                Swal.fire('Error', 'No se puede eliminar.', 'error');
            }
        }
    };

    const prepararEdicion = (elem) => {
        setModoEdicion(true);
        // Mapeamos los datos que vienen del back al formulario
        setElementoActual({
            id: elem.id,
            nombre: elem.nombre,
            categoria: elem.categoria,      // Coincide con backend
            stock_total: elem.stock_total,  // Coincide con backend
            stock_disponible: elem.stock_disponible, // Necesario para no perder el dato al guardar
            estado: elem.estado || "disponible"
        });
    };

    const limpiarFormulario = () => {
        setModoEdicion(false);
        setElementoActual({ id: null, nombre: "", categoria: "tecnologia", stock_total: "", stock_disponible: "", estado: "disponible" });
    };

    return (
        <div className="container mt-4 fade-in">
            <h2 className="mb-4 text-danger fw-bold"><i className="bi bi-box-seam-fill me-2"></i>Inventario de Elementos</h2>
            
            <div className="row">
                {/* FORMULARIO (SOLO ADMIN) */}
                {esAdmin && (
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-danger text-white fw-bold">
                                {modoEdicion ? 'Editar Elemento' : 'Nuevo Elemento'}
                            </div>
                            <div className="card-body">
                                <form onSubmit={guardarElemento}>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input type="text" className="form-control" name="nombre" 
                                            value={elementoActual.nombre} onChange={handleInputChange} required />
                                    </div>
                                    
                                    {/* CORRECCIÓN: name="categoria" y valores correctos */}
                                    <div className="mb-3">
                                        <label className="form-label">Categoría</label>
                                        <select className="form-select" name="categoria" value={elementoActual.categoria} onChange={handleInputChange}>
                                            <option value="tecnologia">Tecnología</option>
                                            <option value="mobiliario">Mobiliario</option>
                                            <option value="audio">Audio y Sonido</option>
                                            <option value="iluminacion">Iluminación</option>
                                            <option value="decoracion">Decoración</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>

                                    {/* CORRECCIÓN: name="stock_total" */}
                                    <div className="mb-3">
                                        <label className="form-label">Stock Total</label>
                                        <input type="number" className="form-control" name="stock_total" 
                                            value={elementoActual.stock_total} onChange={handleInputChange} required min="0" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Estado</label>
                                        <select className="form-select" name="estado" value={elementoActual.estado} onChange={handleInputChange}>
                                            <option value="disponible">🟢 Disponible</option>
                                            <option value="mantenimiento">🟠 En Mantenimiento</option>
                                            <option value="dado_baja">🔴 Dado de Baja</option>
                                        </select>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn ${modoEdicion ? 'btn-warning' : 'btn-success'}`}>
                                            {modoEdicion ? 'Actualizar' : 'Agregar'}
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
                                            <th>Categoría</th>
                                            <th>Stock (Disp/Total)</th>
                                            <th>Estado</th>
                                            {esAdmin && <th>Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {elementos.map(el => (
                                            <tr key={el.id}>
                                                <td className="fw-bold">{el.nombre}</td>
                                                <td><span className="badge bg-light text-dark border">{el.categoria_display || el.categoria}</span></td>
                                                <td className="fw-bold text-primary">
                                                    {el.stock_disponible} / {el.stock_total}
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        el.estado === 'disponible' ? 'bg-success' : 
                                                        (el.estado === 'dado_baja' ? 'bg-danger' : 'bg-warning text-dark')
                                                    }`}>
                                                        {el.estado_display || el.estado}
                                                    </span>
                                                </td>
                                                {esAdmin && (
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => prepararEdicion(el)}>
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarElemento(el.id)}>
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

export default GestionElementos;