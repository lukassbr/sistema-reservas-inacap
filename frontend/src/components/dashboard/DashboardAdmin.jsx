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
import authService from "../../services/authService"; // Importante para validar el rol real

const DashboardAdmin = () => {
    // --- ESTADOS ---
    const [kpis, setKpis] = useState({
        total: 0,
        aprobadas: 0,
        pendientes: 0,
        rechazadas: 0,
        tasa_aprobacion: 0
    });
    
    // Datos para los gráficos
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
    
    // Filtros de fecha (default: mes actual)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [filtros, setFiltros] = useState({
        start_date: firstDay,
        end_date: lastDay
    });

    const [eventosCalendario, setEventosCalendario] = useState([]);
    
    // ESTADO CLAVE: Diferencia entre el "Dios" (Admin) y el "Mortal con permisos" (Coordinador)
    const [esSuperAdmin, setEsSuperAdmin] = useState(false);

    const COLORES_CARRERAS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    useEffect(() => {
        // 1. Verificamos quién es para saber qué mostrar
        const user = authService.getCurrentUser();
        // Ojo aquí: validamos estricto. Solo 'admin' ve estadísticas.
        if (user && user.rol_slug === 'admin') {
            setEsSuperAdmin(true);
            cargarEstadisticas(); // Solo cargamos esto si es admin, ahorramos recursos
        }

        // 2. El calendario sí lo ven todos (Admin y Coord)
        cargarCalendarioGlobal();
    }, [filtros]); 

    // Llamada a la API para los KPIs
    const cargarEstadisticas = async () => {
        try {
            const response = await api.get(`/reservas/estadisticas/?start_date=${filtros.start_date}&end_date=${filtros.end_date}`);
            const data = response.data;
            setKpis(data.kpis);
            setGraficos(data.graficos);
            setAgendaHoy(data.agenda_hoy);
        } catch (error) {
            console.error("No se pudieron cargar las estadisticas", error);
        }
    };

    // Llamada para llenar el calendario
    const cargarCalendarioGlobal = async () => {
        try {
            const res = await api.get('/reservas/');
            // Mapeamos la data de Django al formato que pide FullCalendar
            const eventos = res.data.map(r => ({
                id: r.id,
                title: `${r.espacio_detalle?.nombre || 'Sala'} (${r.usuario_detalle?.apellido || 'User'})`,
                start: `${r.fecha_reserva}T${r.hora_inicio}`,
                end: `${r.fecha_reserva}T${r.hora_fin}`,
                // Colores semánticos: Verde (Ok), Rojo (Rechazada), Amarillo (Pendiente)
                color: r.estado === 'aprobada' ? '#198754' : (r.estado === 'rechazada' ? '#dc3545' : '#ffc107'),
                textColor: '#fff'
            }));
            setEventosCalendario(eventos);
        } catch (error) {
            console.error("Error cargando calendario", error);
        }
    };

    // Botones rápidos para filtrar fechas
    const aplicarFiltroRapido = (tipo) => {
        const hoy = new Date();
        let inicio = "", fin = "";

        if (tipo === 'hoy') {
            inicio = fin = hoy.toISOString().split('T')[0];
        } else if (tipo === 'semana') {
            const primerDia = hoy.getDate() - hoy.getDay() + 1; 
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

    // Exportar a PDF (Solo Admin)
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
            alert("Error al descargar. ¿Tienes permisos?");
        }
    };

    return (
        <div className="container-fluid mt-4 fade-in">
            {/* ENCABEZADO */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    {/* Título dinámico según quién sea */}
                    <h2 className="text-danger fw-bold m-0">
                        <i className={`bi ${esSuperAdmin ? 'bi-bar-chart-fill' : 'bi-calendar-check'} me-2`}></i>
                        {esSuperAdmin ? "Dashboard Analítico" : "Panel de Coordinación"}
                    </h2>
                    <p className="text-muted m-0">
                        {esSuperAdmin 
                            ? `Visualizando datos del ${filtros.start_date} al ${filtros.end_date}`
                            : "Gestión operativa de reservas y espacios"}
                    </p>
                </div>

                {/* Botón de reporte solo para el Admin */}
                {esSuperAdmin && (
                    <button onClick={handleExportarPDF} className="btn btn-danger shadow-sm">
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Descargar Reporte PDF
                    </button>
                )}
            </div>

            {/* BLOQUE DE ESTADÍSTICAS: Solo se renderiza si esSuperAdmin es TRUE */}
            {esSuperAdmin && (
                <>
                    {/* Filtros */}
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

                    {/* KPIs y Agenda */}
                    <div className="row g-4 mb-4">
                        {/* Widget Agenda Hoy (Solo Admin) */}
                        <div className="col-md-4">
                            <div className="card border-0 shadow h-100" style={{background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white'}}>
                                <div className="card-body">
                                    <h5 className="fw-bold border-bottom pb-2 border-white border-opacity-25"><i className="bi bi-calendar-event me-2"></i>Resumen Diario</h5>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <h2 className="display-4 fw-bold m-0">{agendaHoy.total_hoy}</h2>
                                            <small className="text-white-50">Reservas hoy</small>
                                        </div>
                                        <div className="text-end">
                                            <h4 className="m-0 fw-bold">{agendaHoy.pendientes_accion}</h4>
                                            <span className="badge bg-warning text-dark">Pendientes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjetas de números (Total, Aprobadas, Rechazadas) */}
                        <div className="col-md-8">
                            <div className="row g-3 h-100">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100 text-center py-3 border-top border-4 border-primary">
                                        <h6 className="text-muted text-uppercase small ls-1">Solicitudes</h6>
                                        <h2 className="fw-bold text-dark">{kpis.total}</h2>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm h-100 text-center py-3 border-top border-4 border-success">
                                        <h6 className="text-muted text-uppercase small ls-1">Aprobadas</h6>
                                        <h2 className="fw-bold text-success">{kpis.aprobadas}</h2>
                                        <small className="text-muted">{kpis.tasa_aprobacion}% Tasa Éxito</small>
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

                    {/* Gráficos */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-5">
                            <div className="card border-0 shadow h-100">
                                <div className="card-header bg-white fw-bold py-3">
                                    <i className="bi bi-pie-chart-fill me-2 text-primary"></i>Por Carrera
                                </div>
                                <div className="card-body" style={{ height: 300 }}>
                                    {graficos.carreras.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={graficos.carreras}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={80}
                                                    fill="#8884d8" paddingAngle={5}
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
                                        <p className="text-center mt-5 text-muted">Sin datos</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="card border-0 shadow h-100">
                                <div className="card-header bg-white fw-bold py-3">
                                    <i className="bi bi-bar-chart-line-fill me-2 text-success"></i>Ocupación Espacios
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
                </>
            )}

            {/* CALENDARIO GLOBAL: Esto es lo único que comparten Admin y Coordinador visualmente en esta pantalla */}
            <div className="card border-0 shadow mb-4">
                <div className="card-header bg-white fw-bold py-3">
                    <i className="bi bi-calendar3 me-2 text-danger"></i>
                    {esSuperAdmin ? "Calendario General de Ocupación" : "Calendario de Reservas (Vista Coordinador)"}
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