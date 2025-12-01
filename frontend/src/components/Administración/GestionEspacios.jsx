import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GestionEspacios = () => {
    const [espacios, setEspacios] = useState([]);
    const [loading, setLoading] = useState(true);
    // Estados auxiliares para UI
    const [showModal, setShowModal] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarEspacios();
    }, []);

    const cargarEspacios = async () => {
        try {
            const response = await api.get('/espacios/');
            setEspacios(response.data);
        } catch (error) {
            alert("Error cargando espacios desde el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (window.confirm(`¿Eliminar ${nombre}?`)) {
            try {
                await api.delete(`/espacios/${id}/`);
                setEspacios(espacios.filter(e => e.id !== id));
                alert("Eliminado correctamente.");
            } catch (error) {
                alert("No se pudo eliminar.");
            }
        }
    };

    if (loading) return <div className="p-5 text-center">Cargando datos reales...</div>;

    return (
        <div className="container mt-5">
            <h2 className="text-danger mb-4">Gestión de Espacios (Base de Datos Real)</h2>
            <div className="card shadow border-0">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Capacidad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {espacios.map(e => (
                            <tr key={e.id}>
                                <td className="fw-bold">{e.nombre}</td>
                                <td>{e.tipo}</td>
                                <td>{e.capacidad}</td>
                                <td><span className="badge bg-success">{e.estado}</span></td>
                                <td>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id, e.nombre)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionEspacios;