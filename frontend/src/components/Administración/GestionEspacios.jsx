import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', tipo: 'salon', capacidad: 0, ubicacion: '' });

    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        try {
            const response = await api.get('/espacios/');
            setEspacios(response.data);
        } catch (error) {
            console.error("Error al cargar espacios", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Editar
                await api.put(`/espacios/${formData.id}/`, formData);
                alert("Espacio actualizado ✅");
            } else {
                // Crear
                await api.post('/espacios/', formData);
                alert("Espacio creado ✅");
            }
            cargarEspacios();
            setShowModal(false);
        } catch (error) {
            alert("Error al guardar: " + JSON.stringify(error.response?.data));
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este espacio?")) {
            try {
                await api.delete(`/espacios/${id}/`);
                cargarEspacios();
            } catch (error) {
                alert("No se pudo eliminar.");
            }
        }
    };

    const abrirModal = (espacio = null) => {
        if (espacio) {
            setFormData(espacio);
        } else {
            setFormData({ id: null, nombre: '', tipo: 'salon', capacidad: 20, ubicacion: '' });
        }
        setShowModal(true);
    };

    if (loading) return <div className="p-5 text-center">Cargando espacios...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger">Gestión de Espacios</h1>
                <button className="btn btn-danger" onClick={() => abrirModal(null)}>+ Nuevo Espacio</button>
            </div>

            <div className="card shadow border-0">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Capacidad</th>
                            <th>Ubicación</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {espacios.map(e => (
                            <tr key={e.id}>
                                <td className="fw-bold">{e.nombre}</td>
                                <td>{e.tipo}</td>
                                <td>{e.capacidad}</td>
                                <td>{e.ubicacion}</td>
                                <td className="text-center">
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => abrirModal(e)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(e.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORMULARIO */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">{formData.id ? 'Editar' : 'Crear'} Espacio</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleGuardar}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label>Nombre</label>
                                        <input type="text" className="form-control" required 
                                            value={formData.nombre} 
                                            onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label>Tipo</label>
                                        <select className="form-select" value={formData.tipo} 
                                            onChange={e => setFormData({...formData, tipo: e.target.value})}>
                                            <option value="salon">Salón</option>
                                            <option value="laboratorio">Laboratorio</option>
                                            <option value="auditorio">Auditorio</option>
                                            <option value="patio">Patio</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label>Capacidad</label>
                                        <input type="number" className="form-control" required 
                                            value={formData.capacidad} 
                                            onChange={e => setFormData({...formData, capacidad: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label>Ubicación</label>
                                        <input type="text" className="form-control" required 
                                            value={formData.ubicacion} 
                                            onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-danger">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEspacios;