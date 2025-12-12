import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import api from "../../services/api"; // Asegúrate de que la ruta sea correcta

const DashboardAdmin = () => {
    // Estados para Estadísticas
    const [stats, setStats] = useState({
        totalReservas: 0,
        tasaAprobacion: 0,
        espacioMasUsado: "Cargando...",
        ocupacionData: []
    });
    
    // Estados para el Calendario de Gestión
    const [espacios, setEspacios] = useState([]);
    const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
    const [verTodos, setVerTodos] = useState(false);
    const [eventos, setEventos] = useState([]);

    // Estado para controlar la visibilidad del botón (solo Admin)
    const [esAdmin, setEsAdmin] = useState(false);

    useEffect(() => {
        cargarDatos();
        
        // --- VALIDACIÓN DE ROL CORREGIDA ---
        const userStr = localStorage.getItem('user'); // Tu authService usa 'user'
        if (userStr) {
            try {
                const usuario = JSON.parse(userStr);
                // Tu serializer envía 'rol_slug' con el valor 'admin'
                if (usuario.rol_slug === 'admin') {
                    setEsAdmin(true);
                }
            } catch (e) {
                console.error("Error al leer usuario del localStorage", e);
            }
        }
    }, []);

    const cargarDatos = async () => {
        try {
            const [resReservas, resEspacios] = await Promise.all([
                api.get('/reservas/'),
                api.get('/espacios/')
            ]);

            const reservas = resReservas.data;
            const listaEspacios = resEspacios.data;

            // --- 1. LÓGICA DE ESTADÍSTICAS (KPIs) ---
            const total = reservas.length;
            const aprobadas = reservas.filter(r => r.estado === 'aprobada').length;
            const tasa = total > 0 ? Math.round((aprobadas / total) * 100) : 0;

            const conteoPorEspacio = {};
            reservas.forEach(r => {
                const nombre = r.espacio_detalle?.nombre || "Desconocido";
                conteoPorEspacio[nombre] = (conteoPorEspacio[nombre] || 0) + 1;
            });

            const dataGrafico = Object.keys(conteoPorEspacio).map(key => ({
                name: key,
                reservas: conteoPorEspacio[key]
            }));

            let masUsado = "N/A";
            let maxCount = 0;
            Object.entries(conteoPorEspacio).forEach(([nombre, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    masUsado = nombre;
                }
            });

            setStats({
                totalReservas: total,
                tasaAprobacion: tasa,
                espacioMasUsado: masUsado,
                ocupacionData: dataGrafico
            });

            // --- 2. LÓGICA DEL CALENDARIO ---
            setEspacios(listaEspacios);
            
            // Por defecto seleccionamos el primero si existe
            if (listaEspacios.length > 0) {
                setEspacioSeleccionado(listaEspacios[0]);
            }

            // Mapear reservas para el calendario
            const eventosMapeados = reservas.map(r => ({
                id: r.id,
                title: `${r.espacio_detalle?.nombre || 'Sala'} - ${r.motivo}`,
                start: `${r.fecha_reserva}T${r.hora_inicio}`,
                end: `${r.fecha_reserva}T${r.hora_fin}`,
                color: r.estado === 'aprobada' ? '#198754' : (r.estado === 'rechazada' ? '#dc3545' : '#ffc107'),
                textColor: r.estado === 'aprobada' || r.estado === 'rechazada' ? '#ffffff' : '#000000',
                extendedProps: { 
                    espacioId: r.espacio, 
                    estado: r.estado 
                }
            }));
            setEventos(eventosMapeados);

        } catch (error) {
            console.error("Error cargando dashboard", error);
        }
    };

    // FILTRO VISUAL
    const eventosVisibles = verTodos 
        ? eventos 
        : (espacioSeleccionado ? eventos.filter(ev => Number(ev.extendedProps.espacioId) === Number(espacioSeleccionado.id)) : []);

    // Manejador del Selector
    const handleEspacioChange = (e) => {
        const val = e.target.value;
        if (val === 'todos') {
            setVerTodos(true);
            setEspacioSeleccionado(null);
        } else {
            setVerTodos(false);
            const id = Number(val);
            const espacio = espacios.find(s => s.id === id);
            if (espacio) setEspacioSeleccionado(espacio);
        }
    };

    // --- FUNCIÓN PARA EXPORTAR CSV ---
    const handleExportarCSV = async () => {
        try {
            const response = await api.get('/reservas/exportar_csv/', {
                responseType: 'blob', // Importante para manejar archivos binarios
            });
            
            // Crear link temporal para descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Reporte_Reservas_Completo.csv');
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error al exportar", error);
            if (error.response && error.response.status === 403) {
                alert("⛔ ACCESO DENEGADO: Solo el usuario Administrador puede descargar este reporte.");
            } else {
                alert("Hubo un error al intentar descargar el historial.");
            }
        }
    };

    return (
        <div className="container-fluid mt-4">
            
            {/* CABECERA: TÍTULO Y BOTÓN DE EXPORTAR */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-danger m-0">
                    <i className="bi bi-speedometer2 me-2"></i> Dashboard de Gestión
                </h1>
                
                {/* Renderizado condicional del botón */}
                {esAdmin && (
                    <button 
                        className="btn btn-success px-4 py-2 shadow-sm fw-bold" 
                        onClick={handleExportarCSV}
                    >
                        <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>
                        Exportar Historial CSV
                    </button>
                )}
            </div>

            {/* TARJETAS KPI */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 border-start border-4 border-danger">
                        <div className="card-body">
                            <h5 className="text-muted">Total Solicitudes</h5>
                            <h2 className="display-4 fw-bold text-dark">{stats.totalReservas}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 border-start border-4 border-success">
                        <div className="card-body">
                            <h5 className="text-muted">Tasa de Aprobación</h5>
                            <h2 className="display-4 fw-bold text-dark">{stats.tasaAprobacion}%</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 border-start border-4 border-warning">
                        <div className="card-body">
                            <h5 className="text-muted">Espacio Más Solicitado</h5>
                            <h3 className="fw-bold text-dark mt-2">{stats.espacioMasUsado}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRÁFICO DE OCUPACIÓN */}
            <div className="card shadow-lg border-0 mb-5">
                <div className="card-header bg-white fw-bold">Estadísticas de Ocupación</div>
                <div className="card-body" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.ocupacionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="reservas" fill="#dc3545" name="Cantidad de Reservas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CALENDARIO GENERAL CON FILTRO "VER TODOS" */}
            <div className="row">
                <div className="col-12">
                    <h3 className="text-secondary mb-3">
                        <i className="bi bi-calendar3 me-2"></i> 
                        {verTodos ? 'Calendario Global (Todos los Espacios)' : `Calendario: ${espacioSeleccionado?.nombre || 'Cargando...'}`}
                    </h3>
                </div>
                
                {/* Selector de Espacio */}
                <div className="col-md-3">
                    <div className="card shadow p-3 border-0 bg-light mb-3">
                        <label className="form-label fw-bold text-danger">Filtrar Calendario:</label>
                        <select 
                            className="form-select"
                            value={verTodos ? 'todos' : (espacioSeleccionado?.id || '')}
                            onChange={handleEspacioChange}
                        >
                            <option value="todos" className="fw-bold">Todos los Espacios</option>
                            <option disabled>-------------------</option>
                            {espacios.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                        
                        <div className="mt-4 small text-muted">
                            <h6 className="fw-bold">Referencias:</h6>
                            <div className="d-flex align-items-center mb-1">
                                <div style={{width: 12, height: 12, backgroundColor: '#198754', borderRadius: '50%', marginRight: 8}}></div>
                                Aprobada
                            </div>
                            <div className="d-flex align-items-center mb-1">
                                <div style={{width: 12, height: 12, backgroundColor: '#ffc107', borderRadius: '50%', marginRight: 8}}></div>
                                Pendiente
                            </div>
                            <div className="d-flex align-items-center">
                                <div style={{width: 12, height: 12, backgroundColor: '#dc3545', borderRadius: '50%', marginRight: 8}}></div>
                                Rechazada
                            </div>
                        </div>
                    </div>
                </div>

                {/* Componente Calendario */}
                <div className="col-md-9">
                    <div className="card shadow border-0">
                        <div className="card-body p-2">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                themeSystem='bootstrap5'
                                initialView='timeGridWeek'
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={eventosVisibles}
                                locale='es'
                                slotMinTime="08:00:00"
                                slotMaxTime="22:00:00"
                                allDaySlot={false}
                                height="auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;