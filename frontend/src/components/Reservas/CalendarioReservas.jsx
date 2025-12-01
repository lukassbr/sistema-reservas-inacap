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
    
    // Carga inicial de datos
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // 1. Obtener Espacios
            const respEspacios = await api.get('/espacios/');
            const listaEspacios = respEspacios.data;
            setEspacios(listaEspacios);
            
            // Seleccionar el primero por defecto SI existe la lista
            if (listaEspacios.length > 0) {
                setEspacioSeleccionado(listaEspacios[0]);
            }

            // 2. Obtener Reservas (Para pintar el calendario)
            const respReservas = await api.get('/reservas/');
            
            // Mapear reservas de Django a Eventos de FullCalendar
            const eventosCalendario = respReservas.data.map(r => ({
                id: r.id,
                title: r.motivo, // Título del evento
                start: `${r.fecha_reserva}T${r.hora_inicio}`,
                end: `${r.fecha_reserva}T${r.hora_fin}`,
                color: r.estado === 'aprobada' ? '#198754' : '#ffc107', // Verde o Amarillo
                textColor: r.estado === 'aprobada' ? '#ffffff' : '#000000',
                resourceId: r.espacio, // ID del espacio para filtrar
                extendedProps: { 
                    espacioId: r.espacio,
                    estado: r.estado
                }
            }));
            setEventos(eventosCalendario);

        } catch (error) {
            console.error("Error cargando sistema:", error);
        }
    };

    // Filtrar eventos para mostrar SOLO los del espacio que estás viendo
    const eventosVisibles = espacioSeleccionado 
        ? eventos.filter(ev => ev.extendedProps.espacioId === espacioSeleccionado.id)
        : [];

    // Manejar selección de fecha
    const handleDateSelect = (selectInfo) => {
        // VALIDACIÓN CLAVE: Si no hay espacio seleccionado, NO abrir formulario
        if (!espacioSeleccionado) {
            alert("⚠️ Error: No hay un espacio seleccionado. Si la lista está vacía, contacta al administrador.");
            return;
        }

        setReservaProps({ 
            espacioSeleccionado: espacioSeleccionado, 
            fechaInicio: selectInfo.startStr, 
            fechaFin: selectInfo.endStr, 
        });
        setShowFormulario(true);
    };

    // Manejar cambio en el dropdown
    const handleEspacioChange = (e) => {
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
                onClose={() => {
                    setShowFormulario(false);
                    cargarDatos(); // Recargar calendario al cerrar
                }} 
            />
        );
    }
    
    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* Panel Lateral */}
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
                
                {/* Calendario */}
                <div className="col-md-9">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-3">
                            <h3 className="mb-3 text-secondary">
                                {espacioSeleccionado ? espacioSeleccionado.nombre : 'Cargando...'}
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
                                events={eventosVisibles} // Solo mostramos los del espacio actual
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