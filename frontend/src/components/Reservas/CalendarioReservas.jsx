import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import api from '../../services/api';
import authService from '../../services/authService'; // Para verificar rol si quisieras
import FormularioReserva from '../FormularioReserva';

const CalendarioReservas = () => {
    const [espacios, setEspacios] = useState([]);
    const [espacioSeleccionado, setEspacioSeleccionado] = useState(null); // null o objeto espacio
    const [verTodos, setVerTodos] = useState(false); // Nuevo estado para "Ver Todos"
    const [eventos, setEventos] = useState([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [reservaProps, setReservaProps] = useState({});

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // 1. Cargar Espacios
            const respEspacios = await api.get('/espacios/');
            if (Array.isArray(respEspacios.data)) {
                setEspacios(respEspacios.data);
                // Por defecto seleccionamos el primero si hay
                if (respEspacios.data.length > 0) {
                    setEspacioSeleccionado(respEspacios.data[0]);
                }
            }

            // 2. Cargar Reservas
            const respReservas = await api.get('/reservas/');
            if (Array.isArray(respReservas.data)) {
                const eventosMapeados = respReservas.data.map(r => ({
                    id: r.id,
                    // Si vemos todos, es útil ver el nombre del espacio en el título
                    title: `${r.espacio_detalle?.nombre || 'Sala'} - ${r.motivo}`,
                    start: `${r.fecha_reserva}T${r.hora_inicio}`,
                    end: `${r.fecha_reserva}T${r.hora_fin}`,
                    color: r.estado === 'aprobada' ? '#198754' : (r.estado === 'rechazada' ? '#dc3545' : '#ffc107'),
                    textColor: r.estado === 'aprobada' || r.estado === 'rechazada' ? '#ffffff' : '#000000',
                    resourceId: r.espacio,
                    extendedProps: { 
                        espacioId: r.espacio,
                        estado: r.estado 
                    }
                }));
                setEventos(eventosMapeados);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    // LÓGICA DE FILTRADO: Si verTodos es true, muestra todo. Si no, filtra por ID.
    const eventosVisibles = verTodos 
        ? eventos 
        : (espacioSeleccionado ? eventos.filter(ev => Number(ev.extendedProps.espacioId) === Number(espacioSeleccionado.id)) : []);

    const handleDateSelect = (selectInfo) => {
        // VALIDACIÓN: No se puede reservar en modo "Todos" porque no sabríamos en qué sala ponerla
        if (verTodos) {
            alert("⚠️ Estás viendo 'Todos los Espacios'. \nPor favor, selecciona un espacio específico en la lista desplegable para crear una reserva.");
            return;
        }
        if (!espacioSeleccionado) {
            alert("⚠️ Selecciona un espacio primero.");
            return;
        }

        setReservaProps({
            espacioSeleccionado: espacioSeleccionado,
            fechaInicio: selectInfo.startStr,
            fechaFin: selectInfo.endStr,
        });
        setShowFormulario(true);
    };

    const handleEspacioChange = (e) => {
        const val = e.target.value;
        if (val === 'todos') {
            setVerTodos(true);
            setEspacioSeleccionado(null); // Ninguno específico seleccionado
        } else {
            setVerTodos(false);
            const id = Number(val);
            const espacio = espacios.find(sp => sp.id === id);
            if (espacio) setEspacioSeleccionado(espacio);
        }
    };

    if (showFormulario) {
        return (
            <FormularioReserva
                espacioSeleccionado={reservaProps.espacioSeleccionado}
                fechaInicio={reservaProps.fechaInicio}
                fechaFin={reservaProps.fechaFin}
                onClose={(recargar) => {
                    setShowFormulario(false);
                    if (recargar) cargarDatos();
                }}
            />
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-md-3">
                    <div className="card shadow p-3 border-danger mb-4">
                        <label className="form-label fw-bold text-danger">Seleccionar Vista</label>
                        
                        <select
                            className="form-select"
                            value={verTodos ? 'todos' : (espacioSeleccionado?.id || '')}
                            onChange={handleEspacioChange}
                        >
                            {/* OPCIÓN PARA VER TODO */}
                            <option value="todos" className="fw-bold">Todos los Espacios</option>
                            <option disabled>-------------------</option>
                            {espacios.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>

                        <hr className='my-3' />
                        <div className="small text-muted">
                            <h6>Leyenda:</h6>
                            <div><span className="badge bg-success me-1">●</span> Aprobada</div>
                            <div><span className="badge bg-warning text-dark me-1">●</span> Pendiente</div>
                            <div><span className="badge bg-danger me-1">●</span> Rechazada</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-9">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-3">
                            <h3 className="mb-3 text-secondary">
                                {verTodos ? '📅 Vista General (Todos los Espacios)' : (espacioSeleccionado?.nombre || 'Selecciona un Espacio')}
                            </h3>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                initialView='timeGridWeek'
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridWeek,dayGridDay'
                                }}
                                selectable={true}
                                selectMirror={true}
                                select={handleDateSelect}
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

export default CalendarioReservas;