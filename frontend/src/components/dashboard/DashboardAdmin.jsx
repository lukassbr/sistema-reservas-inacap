import React, { useState, useEffect } from "react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import api from "../../services/api";

const DashboardAdmin = () => {
    // --- ESTADOS ---
    const [kpis, setKpis] = useState({
        total: 0,
        aprobadas: 0,
        pendientes: 0,
        rechazadas: 0,
        tasa_aprobacion: 0
    });
    const [graficos, setGraficos] = useState({
        carreras: [],
        espacios: [],
        diario: []
    });
    const [agendaHoy, setAgendaHoy] = useState({
        total_hoy: 0,
        eventos: [],
        pendientes_accion: 0
    });
    
    // Filtros de Fecha (Por defecto: Este Mes)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [filtros, setFiltros] = useState({
        start_date: firstDay,
        end_date: lastDay
    });

    // Estados para Calendario
    const [eventosCalendario, setEventosCalendario] = useState([]);
    const [esAdmin, setEsAdmin] = useState(false);

    // Colores para Gráficos
    const COLORES_CARRERAS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    useEffect(() => {
        verificarRol();
        cargarEstadisticas();
        cargarCalendarioGlobal();
    }, [filtros]); // Se recarga cuando cambian las fechas

    const verificarRol = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const u = JSON.parse(userStr);
                if (u.rol_slug === 'admin' || u.rol_slug === 'coordinador') setEsAdmin(true);
            } catch (e) {}
        }
    };

    const cargarEstadisticas = async () => {
        try {
            // Llamamos al nuevo endpoint inteligente
            const response = await api.get(`/reservas/estadisticas/?start_date=${filtros.start_date}&end_date=${filtros.end_date}`);
            const data = response.data;

            setKpis(data.kpis);
            setGraficos(data.graficos);
            setAgendaHoy(data.agenda_hoy);

        } catch (error) {
            console.error("Error cargando estadísticas", error);
        }
    };

    const cargarCalendarioGlobal = async () => {
        try {
            const res = await api.get('/reservas/');
            const eventos = res.data.map(r => ({
                id: r.id,
                title: `${r.espacio_detalle?.nombre || 'Sala'} (${r.usuario_detalle?.apellido || 'User'})`,
                start: `${r.fecha_reserva}T${r.hora_inicio}`,
                end: `${r.fecha_reserva}T${r.hora_fin}`,
                color: r.estado === 'aprobada' ? '#198754' : (r.estado === 'rechazada' ? '#dc3545' : '#ffc107'),
                textColor: '#fff'
            }));
            setEventosCalendario(eventos);
        } catch (error) {
            console.error("Error cargando calendario", error);
        }
    };

    // --- MANEJADORES DE FILTROS ---
    const aplicarFiltroRapido = (tipo) => {
        const hoy = new Date();
        let inicio = "";
        let fin = "";

        if (tipo === 'hoy') {
            inicio = fin = hoy.toISOString().split('T')[0];
        } else if (tipo === 'semana') {
            const primerDia = hoy.getDate() - hoy.getDay() + 1; // Lunes
            const diaInicio = new Date(hoy.setDate(primerDia));
            const diaFin = new Date(hoy.setDate(primerDia + 6));
            inicio = diaInicio.toISOString().split('T')[0];
            fin = diaFin.toISOString().split('T')[0];
        } else if (tipo === 'mes') {
            inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
            fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
        }

        setFiltros({ start_date: inicio, end_date: fin });
    };

    const handleFechaChange = (e) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    // --- DESCARGAR PDF ---
    const handleExportarPDF = async () => {
        try {
            const response = await api.get('/reservas/exportar_reporte/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_INACAP_${new Date().toLocaleDateString()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("Error al descargar el PDF. Verifica tus permisos.");
        }
    };

    return (
        <div className="container-fluid mt-4 fade-in">
            {/* ENCABEZADO Y FILTROS */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="text-danger fw-bold m-0"><i className="bi bi-bar-chart-fill me-2"></i>Dashboard Analítico</h2>
                    <p className="text-muted m-0">Visualizando datos del <b>{filtros.start_date}</b> al <b>{filtros.end_date}</b></p>
                </div>

                {esAdmin && (
                    <button onClick={handleExportarPDF} className="btn btn-danger shadow-sm">
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Descargar Reporte PDF
                    </button>
                )}
            </div>

            {/* BARRA DE HERRAMIENTAS DE FECHA */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body py-2 d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <div className="btn-group">
                        <button className="btn btn-outline-secondary btn-sm bg-white" onClick={() => aplicarFiltroRapido('hoy')}>Hoy</button>
                        <button className="btn btn-outline-secondary btn-sm bg-white" onClick={() => aplicarFiltroRapido('semana')}>Esta Semana</button>
                        <button className="btn btn-outline-secondary btn-sm bg-white" onClick={() => aplicarFiltroRapido('mes')}>Este Mes</button>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        <span className="small text-muted fw-bold">Desde:</span>
                        <input type="date" name="start_date" className="form-control form-control-sm" value={filtros.start_date} onChange={handleFechaChange} />
                        <span className="small text-muted fw-bold">Hasta:</span>
                        <input type="date" name="end_date" className="form-control form-control-sm" value={filtros.end_date} onChange={handleFechaChange} />
                    </div>
                </div>
            </div>

            {/* PRIMERA FILA: AGENDA HOY + KPIS */}
            <div className="row g-4 mb-4">
                {/* WIDGET AGENDA DE HOY */}
                <div className="col-md-4">
                    <div className="card border-0 shadow h-100" style={{background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white'}}>
                        <div className="card-body">
                            <h5 className="fw-bold border-bottom pb-2 border-white border-opacity-25"><i className="bi bi-calendar-event me-2"></i>Agenda de Hoy</h5>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <h2 className="display-4 fw-bold m-0">{agendaHoy.total_hoy}</h2>
                                    <small className="text-white-50">Eventos programados</small>
                                </div>
                                <div className="text-end">
                                    <h4 className="m-0 fw-bold">{agendaHoy.pendientes_accion}</h4>
                                    <span className="badge bg-warning text-dark">Pendientes</span>
                                </div>
                            </div>
                            <div className="mt-3 small">
                                {agendaHoy.eventos.length > 0 ? (
                                    agendaHoy.eventos.map((ev, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-1 text-white-50 border-bottom border-white border-opacity-10 pb-1">
                                            <span>{ev.hora_inicio.substring(0,5)} - {ev.espacio__nombre}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-white-50 fst-italic">No hay eventos aprobados para hoy.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIS GENERALES */}
                <div className="col-md-8">
                    <div className="row g-3 h-100">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center py-3 border-top border-4 border-primary">
                                <h6 className="text-muted text-uppercase small ls-1">Total Solicitudes</h6>
                                <h2 className="fw-bold text-dark">{kpis.total}</h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center py-3 border-top border-4 border-success">
                                <h6 className="text-muted text-uppercase small ls-1">Aprobadas</h6>
                                <h2 className="fw-bold text-success">{kpis.aprobadas}</h2>
                                <small className="text-muted">Tasa: {kpis.tasa_aprobacion}%</small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center py-3 border-top border-4 border-danger">
                                <h6 className="text-muted text-uppercase small ls-1">Rechazadas</h6>
                                <h2 className="fw-bold text-danger">{kpis.rechazadas}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEGUNDA FILA: GRÁFICOS */}
            <div className="row g-4 mb-5">
                {/* GRÁFICO DONA: CARRERAS */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow h-100">
                        <div className="card-header bg-white fw-bold py-3">
                            <i className="bi bi-pie-chart-fill me-2 text-primary"></i>Solicitudes por Carrera
                        </div>
                        <div className="card-body" style={{ height: 300 }}>
                            {graficos.carreras.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={graficos.carreras}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {graficos.carreras.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORES_CARRERAS[index % COLORES_CARRERAS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                    No hay datos de carreras en este periodo
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRÁFICO BARRAS: OCUPACIÓN ESPACIOS */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow h-100">
                        <div className="card-header bg-white fw-bold py-3">
                            <i className="bi bi-bar-chart-line-fill me-2 text-success"></i>Espacios Más Solicitados
                        </div>
                        <div className="card-body" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficos.espacios} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} />
                                    <Tooltip />
                                    <Bar dataKey="reservas" fill="#198754" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* TERCERA FILA: CALENDARIO */}
            <div className="card border-0 shadow mb-4">
                <div className="card-header bg-white fw-bold py-3">
                    <i className="bi bi-calendar3 me-2 text-danger"></i>Calendario General de Ocupación
                </div>
                <div className="card-body">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                        themeSystem='bootstrap5'
                        initialView='dayGridMonth'
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={eventosCalendario}
                        locale='es'
                        height="auto"
                        contentHeight={600}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;