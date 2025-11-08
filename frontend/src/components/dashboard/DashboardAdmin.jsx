import React, {useState} from "react";
// Importaciones reales de Recharts
import {BarChart, Bar, LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

const DATA_OCUPACION = [
    { name: 'Auditorio', horas: 65, reservas: 12 },
    { name: 'Laboratorio PC', horas: 80, reservas: 20 },
    { name: 'Sala Ejecutiva', horas: 45, reservas: 8 },
    { name: 'Sala de Creatividad', horas: 30, reservas: 5 },
];

const DATA_TENDENCIAS = [
    { name: 'Sem 1', solicitudes: 15, aprobadas: 10 },
    { name: 'Sem 2', solicitudes: 25, aprobadas: 18 },
    { name: 'Sem 3', solicitudes: 30, aprobadas: 22 },
    { name: 'Sem 4', solicitudes: 20, aprobadas: 15 },
];

// 1. Componente para las tarjetas KPI 
const KpiCard = ({ title, value, unit, icon, color }) => (
    <div className="card shadow border-0 h-100">
        <div className="card-body">
            <div className={`d-flex align-items-center p-3 rounded-3 text-white ${color} mb-3`}>
                <i className={`bi ${icon} display-6 me-3`}></i>
                <div>
                    <h5 className="mb-0 text-white">{title}</h5>
                </div>
            </div>
            <h2 className="mb-0 fw-bold text-dark">{value}</h2>
            <p className="text-muted small">{unit}</p>
        </div>
    </div>
);

const DashboardAdmin = () => {
    const [periodo, setPeriodo] = useState('30d'); // Estado para el periodo seleccionado

    return (
        <div className="container-fluid mt-4">
            <h1 className="text-danger mb-2"><i className="bi bi-speedometer2 me-2"></i> Dashboard de Gestión </h1>
            <p className="lead text-muted">Indicadores clave y estadísticas de uso de espacios.</p>

            {/* FILTROS DE PERÍODO  */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
                <div className="btn-group" role="group">
                    <button className={`btn ${periodo === '7d' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setPeriodo('7d')}>Últimos 7 Días</button>
                    <button className={`btn ${periodo === '30d' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setPeriodo('30d')}>Últimos 30 Días</button>
                    <button className={`btn ${periodo === 'custom' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setPeriodo('custom')}>Personalizado</button>
                </div>
                {periodo === 'custom' && (
                    <div className="d-flex align-items-center">
                        <input type="date" className="form-control me-2" />
                        a
                        <input type="date" className="form-control ms-2" />
                        <button className="btn btn-primary ms-2">Aplicar</button>
                    </div>
                )}
            </div>

            {/* TARJETAS KPI */}
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <KpiCard title="Ocupación Promedio" value="78%" unit="Tasa de uso de espacios activos" icon="bi-graph-up" color="bg-success" />
                </div>
                <div className="col-md-3">
                    <KpiCard title="Reservas Totales" value="155" unit="Solicitudes en el período" icon="bi-calendar-check" color="bg-danger" />
                </div>
                <div className="col-md-3">
                    <KpiCard title="Tasa de Aprobación" value="95%" unit="Reservas aceptadas / totales" icon="bi-check-circle-fill" color="bg-info" />
                </div>
                <div className="col-md-3">
                    <KpiCard title="Espacio Más Usado" value="Laboratorio B-102" unit="Con 88 horas de uso" icon="bi-building" color="bg-warning text-dark" />
                </div>
            </div>

            {/* GRÁFICOS */}
            <div className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-lg border-0 h-100">
                        <div className="card-header bg-white fw-bold">Ocupación por Espacio (Horas)</div>
                        <div className="card-body" style={{ height: 400 }}>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={DATA_OCUPACION} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="horas" fill="#dc3545" name="Horas Reservadas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-lg border-0 h-100">
                        <div className="card-header bg-white fw-bold">Tendencia de Solicitudes y Aprobaciones</div>
                        <div className="card-body" style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={DATA_TENDENCIAS} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="solicitudes" stroke="#0d6efd" name="Solicitadas" />
                                    <Line type="monotone" dataKey="aprobadas" stroke="#28a745" name="Aprobadas" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default DashboardAdmin;