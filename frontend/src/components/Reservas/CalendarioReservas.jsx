// src/components/reservas/CalendarioReservas.jsx

import React, { useState } from 'react';
// ⭐ IMPORTACIONES REALES DE FULLCALENDAR
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Para manejar clics y selección
import bootstrap5Plugin from '@fullcalendar/bootstrap5'; // Estilos de Bootstrap

// Asegúrate que esta ruta sea correcta
import FormularioReserva from '../FormularioReserva'; 

// MOCKUP: Simula los espacios disponibles (solo Temuco)
const MOCK_ESPACIOS = [
    { id: 1, nombre: 'Auditorio Principal', tipo: 'Auditorio' },
    { id: 2, nombre: 'Laboratorio B-102', tipo: 'Laboratorio' },
    { id: 3, nombre: 'Sala de Clases 401', tipo: 'Sala' },
    { id: 4, nombre: 'Patio Cubo', tipo: 'Evento' },
];

// MOCKUP: Simula eventos (reservas existentes)
const MOCK_EVENTOS = [
    // Reserva APROBADA (ROJO)
    { title: 'Reunión Decanato', start: '2025-11-08T14:00:00', end: '2025-11-08T16:00:00', color: '#dc3545', extendedProps: { estado: 'Aprobada' } }, // color: danger
    // Reserva PENDIENTE (AMARILLO)
    { title: 'Solicitud Taller', start: '2025-11-09T10:00:00', end: '2025-11-09T12:00:00', color: '#ffc107', textColor: '#000000', extendedProps: { estado: 'Pendiente' } }, // color: warning
];


const CalendarioReservas = () => {
    const [espacio, setEspacio] = useState(MOCK_ESPACIOS[0]);
    const [showFormulario, setShowFormulario] = useState(false);
    const [reservaProps, setReservaProps] = useState({});

    // Función que se llama cuando el usuario selecciona un bloque de tiempo
    const handleDateSelect = (selectInfo) => {
        // Formateamos las fechas y abrimos el formulario
        setReservaProps({ 
            espacioSeleccionado: espacio, 
            fechaInicio: selectInfo.startStr, // Formato ISO para el backend
            fechaFin: selectInfo.endStr,      // Formato ISO para el backend
        });
        setShowFormulario(true); // Abre el formulario de reserva
    };

    // Función que se llama cuando el usuario hace clic en un evento existente
    const handleEventClick = (clickInfo) => {
        // Aquí mostrarías un modal de detalles de reserva (HU03)
        const estado = clickInfo.event.extendedProps.estado;
        if (estado === 'Aprobada') {
            alert(`Reserva Aprobada: ${clickInfo.event.title} - Detalles: Solo Coordinador/Admin puede ver.`);
        } else if (estado === 'Pendiente') {
             alert(`Reserva Pendiente: ${clickInfo.event.title} - Detalles: Esperando validación.`);
        }
    };
    
    // Función para cerrar el formulario y volver al calendario
    const handleFormClose = () => {
        setShowFormulario(false);
        // Aquí se puede recargar la lista de eventos si la reserva fue enviada
    };

    // VISTA DEL FORMULARIO
    if (showFormulario) {
        // Usamos el componente FormularioReserva que diseñamos antes
        return (
             <FormularioReserva 
                espacioSeleccionado={reservaProps.espacioSeleccionado} 
                fechaInicio={reservaProps.fechaInicio} 
                fechaFin={reservaProps.fechaFin} 
                onClose={handleFormClose} 
            />
        );
    }
    
    // VISTA PRINCIPAL DEL CALENDARIO
    return (
        <div className="container-fluid mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="text-danger mb-2"><i className="bi bi-calendar-event me-2"></i> Nueva Reserva - {espacio.nombre}</h1>
                    <p className="lead text-muted">Selecciona un bloque de tiempo disponible (clic y arrastrar) en la malla inferior para iniciar tu solicitud.</p>
                </div>
            </div>

            <div className="row">
                {/* COLUMNA DE FILTROS Y LEYENDA */}
                <div className="col-md-3">
                    <div className="card shadow p-3 border-danger mb-4">
                        <label className="form-label fw-bold text-danger">Cambiar Espacio</label>
                        <select 
                            className="form-select" 
                            value={espacio.id} 
                            onChange={(e) => setEspacio(MOCK_ESPACIOS.find(e => e.id === Number(e.target.value)))}
                        >
                            {MOCK_ESPACIOS.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre} ({e.tipo})</option>
                            ))}
                        </select>
                        
                        <hr className='my-3' />
                        <h6 className='text-secondary'>Leyenda de Estado:</h6>
                        <ul className="list-unstyled small">
                            <li><span className="badge bg-success me-2"></span> Disponible (Clic y arrastrar)</li>
                            <li><span className="badge bg-warning text-dark me-2"></span> Pendiente (Revisión)</li>
                            <li><span className="badge bg-danger me-2"></span> Reservado (Ocupado)</li>
                            <li><span className="badge bg-secondary me-2"></span> Bloqueado/Mantención</li>
                        </ul>
                    </div>
                </div>
                
                {/* ÁREA PRINCIPAL DEL CALENDARIO */}
                <div className="col-md-9">
                    <div className="card shadow-lg border-0">
                        <div className="card-body p-3">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                                themeSystem='bootstrap5'
                                initialView='timeGridWeek' // Muestra las horas, ideal para reservas
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                // Propiedades de Interacción (para seleccionar el tiempo)
                                selectable={true} // Permite seleccionar arrastrando
                                selectMirror={true}
                                select={handleDateSelect} // Función que abre el formulario
                                eventClick={handleEventClick} // Función que muestra detalles de una reserva existente
                                
                                // Propiedades de Visualización
                                weekends={true}
                                locale='es' // Usar idioma español
                                slotMinTime="08:00:00" // Hora de inicio del día (INACAP)
                                slotMaxTime="22:00:00" // Hora de fin del día (INACAP)
                                
                                // MOCKUP de Eventos
                                events={MOCK_EVENTOS} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarioReservas;