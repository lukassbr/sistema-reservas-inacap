import React, { useState, useEffect } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import api from "../../services/api";

const ReportesAvanzados = () => {
    // Estados de Filtros
    const [filtros, setFiltros] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // 1ro del mes
        end_date: new Date().toISOString().split('T')[0],
        carrera: "",
        area: ""
    });

    // Estados de Datos (Listas para selectores)
    const [listas, setListas] = useState({ carreras: [], areas: [] });
    
    // Estados de Métricas (Gráficos)
    const [metricas, setMetricas] = useState({
        kpis: { total: 0, tasa_aprobacion: 0 },
        graficos: { carreras: [], espacios: [], elementos: [] }
    });

    // Colores
    const COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#D7263D'];

    useEffect(() => {
        cargarListas();
    }, []);

    useEffect(() => {
        cargarReporte();
    }, [filtros]);

    const cargarListas = async () => {
        try {
            const res = await api.get('/carreras/');
            // Extraer áreas únicas
            const areasUnicas = [...new Set(res.data.map(c => c.area).filter(Boolean))];
            setListas({ carreras: res.data, areas: areasUnicas });
        } catch (error) { console.error("Error cargando listas", error); }
    };

    const cargarReporte = async () => {
        try {
            // Construir Query String
            const query = new URLSearchParams(filtros).toString();
            const res = await api.get(`/reservas/estadisticas/?${query}`);
            setMetricas(res.data);
        } catch (error) { console.error("Error cargando reporte", error); }
    };

    const handleFiltroChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    const descargarPDF = async () => {
        try {
            const query = new URLSearchParams(filtros).toString();
            const response = await api.get(`/reservas/exportar_reporte/?${query}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Personalizado_${new Date().toLocaleDateString()}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) { alert("Error al descargar reporte"); }
    };

    return (
        <div className="container-fluid mt-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger fw-bold"><i className="bi bi-graph-up-arrow me-2"></i>Centro de Reportes Avanzados</h2>
                <button className="btn btn-dark shadow" onClick={descargarPDF}>
                    <i className="bi bi-file-earmark-pdf-fill me-2"></i>Exportar Vista Actual
                </button>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Desde:</label>
                            <input type="date" name="start_date" className="form-control" value={filtros.start_date} onChange={handleFiltroChange} />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold small">Hasta:</label>
                            <input type="date" name="end_date" className="form-control" value={filtros.end_date} onChange={handleFiltroChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Filtrar por Área:</label>
                            <select name="area" className="form-select" value={filtros.area} onChange={handleFiltroChange}>
                                <option value="">Todas las Áreas</option>
                                {listas.areas.map((a, i) => <option key={i} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold small">Filtrar por Carrera:</label>
                            <select name="carrera" className="form-select" value={filtros.carrera} onChange={handleFiltroChange} disabled={!!filtros.area}>
                                <option value="">Todas las Carreras</option>
                                {listas.carreras.map(c => <option key={c.id} value={c.id}>{c.nombre_carrera}</option>)}
                            </select>
                            {filtros.area && <small className="text-muted d-block mt-1">* Desactivado por filtro de Área</small>}
                        </div>
                        <div className="col-md-2 text-end">
                            <button className="btn btn-outline-secondary w-100" onClick={() => setFiltros({
                                start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                end_date: new Date().toISOString().split('T')[0],
                                carrera: "", area: ""
                            })}>Limpiar Filtros</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPIS DE RESUMEN */}
            <div className="row mb-4 text-center">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm py-3 border-start border-4 border-primary">
                        <h3 className="fw-bold m-0">{metricas.kpis.total}</h3>
                        <small className="text-muted">Total Solicitudes</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm py-3 border-start border-4 border-success">
                        <h3 className="fw-bold m-0">{metricas.kpis.tasa_aprobacion}%</h3>
                        <small className="text-muted">Tasa de Aprobación</small>
                    </div>
                </div>
            </div>

            {/* GRÁFICOS */}
            <div className="row g-4">
                {/* 1. TOP ELEMENTOS (Nuevo) */}
                <div className="col-md-6">
                    <div className="card shadow border-0 h-100">
                        <div className="card-header bg-white fw-bold">Top Insumos/Elementos Solicitados</div>
                        <div className="card-body" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metricas.graficos.elementos} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}}/>
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#D7263D" name="Unidades Solicitadas" radius={[0, 5, 5, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 2. SOLICITUDES POR CARRERA */}
                <div className="col-md-6">
                    <div className="card shadow border-0 h-100">
                        <div className="card-header bg-white fw-bold">Distribución por Carrera</div>
                        <div className="card-body" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metricas.graficos.carreras}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {metricas.graficos.carreras.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesAvanzados;