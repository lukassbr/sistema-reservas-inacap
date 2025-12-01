import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GestionElementos = () => {
    const [elementos, setElementos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        categoria: 'tecnologia', // Valor por defecto
        stock_total: 1,
        stock_disponible: 1,
        unidad_medida: 'unidad',
        estado: 'disponible'
    });

    useEffect(() => {
        cargarElementos();
    }, []);

    const cargarElementos = async () => {
        try {
            const response = await api.get('/elementos/');
            setElementos(response.data);
        } catch (error) {
            console.error("Error al cargar elementos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            // Validar que stock disponible no sea mayor al total
            if (parseInt(formData.stock_disponible) > parseInt(formData.stock_total)) {
                alert("El stock disponible no puede ser mayor al total.");
                return;
            }

            if (formData.id) {
                // Editar
                await api.put(`/elementos/${formData.id}/`, formData);
                alert("Elemento actualizado correctamente ✅");
            } else {
                // Crear
                await api.post('/elementos/', formData);
                alert("Elemento creado correctamente ✅");
            }
            cargarElementos();
            setShowModal(false);
        } catch (error) {
            console.error("Error guardando:", error);
            alert("Error al guardar elemento. Revisa los datos.");
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este elemento?")) {
            try {
                await api.delete(`/elementos/${id}/`);
                cargarElementos();
            } catch (error) {
                alert("No se pudo eliminar.");
            }
        }
    };

    const abrirModal = (elemento = null) => {
        if (elemento) {
            setFormData(elemento);
        } else {
            setFormData({
                id: null,
                nombre: '',
                categoria: 'tecnologia',
                stock_total: 10,
                stock_disponible: 10, // Por defecto igual al total
                unidad_medida: 'unidad',
                estado: 'disponible'
            });
        }
        setShowModal(true);
    };

    if (loading) return <div className="p-5 text-center">Cargando inventario...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger">Gestión de Elementos</h1>
                <button className="btn btn-danger" onClick={() => abrirModal(null)}>
                    <i className="bi bi-plus-lg me-2"></i> Nuevo Elemento
                </button>
            </div>

            <div className="card shadow border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Stock (Disp / Total)</th>
                                <th>Estado</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {elementos.map(el => (
                                <tr key={el.id}>
                                    <td className="fw-bold">{el.nombre}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {el.categoria}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={el.stock_disponible === 0 ? "text-danger fw-bold" : "text-success"}>
                                            {el.stock_disponible}
                                        </span> 
                                        <span className="text-muted mx-1">/</span> 
                                        {el.stock_total} {el.unidad_medida}
                                    </td>
                                    <td>
                                        {el.estado === 'disponible' 
                                            ? <span className="badge bg-success">Disponible</span>
                                            : <span className="badge bg-warning text-dark">{el.estado}</span>
                                        }
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => abrirModal(el)}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(el.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">{formData.id ? 'Editar' : 'Crear'} Elemento</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label>Nombre del Elemento</label>
                                        <input type="text" className="form-control" required
                                            value={formData.nombre}
                                            onChange={e => setFormData({...formData, nombre: e.target.value})}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Categoría</label>
                                            <select className="form-select" value={formData.categoria}
                                                onChange={e => setFormData({...formData, categoria: e.target.value})}>
                                                <option value="mobiliario">Mobiliario</option>
                                                <option value="tecnologia">Tecnología</option>
                                                <option value="audio">Audio</option>
                                                <option value="decoracion">Decoración</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label>Unidad de Medida</label>
                                            <input type="text" className="form-control"
                                                value={formData.unidad_medida}
                                                onChange={e => setFormData({...formData, unidad_medida: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Stock Total</label>
                                            <input type="number" className="form-control" min="0" required
                                                value={formData.stock_total}
                                                onChange={e => setFormData({...formData, stock_total: e.target.value})}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label>Stock Disponible</label>
                                            <input type="number" className="form-control" min="0" required
                                                value={formData.stock_disponible}
                                                onChange={e => setFormData({...formData, stock_disponible: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label>Estado</label>
                                        <select className="form-select" value={formData.estado}
                                            onChange={e => setFormData({...formData, estado: e.target.value})}>
                                            <option value="disponible">Disponible</option>
                                            <option value="mantenimiento">En Mantenimiento</option>
                                            <option value="dado_baja">Dado de Baja</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionElementos;