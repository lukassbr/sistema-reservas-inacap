import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import api from '../../services/api';
import authService from '../../services/authService';
import FormularioReserva from '../FormularioReserva';

const CalendarioReservas = () => {
    const [espacios, setEspacios] = useState([]);
    const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [reservaProps, setReservaProps] = useState({});

    // Cargar datos al iniciar
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // 1. Cargar Espacios
            const respEspacios = await api.get('/espacios/');
            if (respEspacios.data && respEspacios.data.length > 0) {
                setEspacios(respEspacios.data);
                setEspacioSeleccionado(respEspacios.data[0]); // Seleccionar el primero
            }

            // 2. Cargar Reservas
            const respReservas = await api.get('/reservas/');
            const eventosMapeados = respReservas.data.map(r => ({
                id: r.id,
                title: r.motivo,
                start: `${r.fecha_reserva}T${r.hora_inicio}`,
                end: `${r.fecha_reserva}T${r.hora_fin}`,
                color: r.estado === 'aprobada' ? '#198754' : '#ffc107',
                textColor: r.estado === 'aprobada' ? '#ffffff' : '#000000',
                resourceId: r.espacio,
                extendedProps: { espacioId: r.espacio, estado: r.estado }
            }));
            setEventos(eventosMapeados);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    // Filtrar eventos visualmente
    const eventosVisibles = espacioSeleccionado
        ? eventos.filter(ev => ev.extendedProps.espacioId === espacioSeleccionado.id)
        : [];

    const handleDateSelect = (selectInfo) => {
        if (!espacioSeleccionado) {
            alert("⚠️ Primero selecciona un espacio de la lista.");
            return;
        }
        setReservaProps({
            espacioSeleccionado: espacioSeleccionado,
            fechaInicio: selectInfo.startStr,
            fechaFin: selectInfo.endStr,
        });
        setShowFormulario(true);
    };

    // --- CORRECCIÓN DEL ERROR ---
    const handleEspacioChange = (e) => {
        // Validación de seguridad por si el evento llega mal
        if (!e || !e.target) return;
        
        const id = Number(e.target.value);
        const espacio = espacios.find(sp => sp.id === id);
        if (espacio) setEspacioSeleccionado(espacio);
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
                        <label className="form-label fw-bold text-danger">Seleccionar Espacio</label>
                        {espacios.length > 0 ? (
                            <select
                                className="form-select"
                                value={espacioSeleccionado?.id || ''}
                                onChange={handleEspacioChange}
                            >
                                {espacios.map(e => (
                                    <option key={e.id} value={e.id}>{e.nombre}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="alert alert-warning small">Cargando espacios...</div>
                        )}
                        <hr className='my-3' />
                        <div className="small text-muted">
                            <h6>Leyenda:</h6>
                            <div><span className="badge bg-success">●</span> Aprobada</div>
                            <div><span className="badge bg-warning text-dark">●</span> Pendiente</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-9">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-3">
                            <h3 className="mb-3 text-secondary">
                                {espacioSeleccionado ? espacioSeleccionado.nombre : 'Selecciona un Espacio'}
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