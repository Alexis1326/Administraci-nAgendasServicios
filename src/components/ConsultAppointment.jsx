import { useState, useEffect } from "react";

// Definir el orden deseado de los días de la semana
const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const ConsultAppointment = () => {

    const [data, setData] = useState([]);
    const [citasFiltradas, setCitasFiltradas] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState("Seleccion");
    const [slotsAvailable, setSlotsAvailable] = useState([]);

    useEffect(() => {
        if (diaSeleccionado === "Seleccion") {
            setCitasFiltradas([]);
            setSlotsAvailable([]);
        } else {
            const citas = data.filter(appointment => appointment.Day.toLowerCase() === diaSeleccionado.toLowerCase());
            setCitasFiltradas(citas);
            filterAvailableSlots(citas);
        }
    }, [diaSeleccionado, data]);

    const fetchData = async () => {
        try {
            const response = await fetch('https://luegopago.blob.core.windows.net/luegopago-uploads/Pruebas%20LuegoPago/data.json');
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (diaSeleccionado === "Seleccion") {
            setCitasFiltradas([]);
        } else {
            const citas = data.filter(appointment => appointment.Day === diaSeleccionado);
            setCitasFiltradas(citas);
        }
    }, [diaSeleccionado, data]);

    const handleChangeDia = (event) => {
        setDiaSeleccionado(event.target.value);
    };

    // Obtener los días disponibles para el filtro
    const diasDisponibles = data.map(appointment => appointment.Day);

    // Eliminar duplicados y ordenar alfabéticamente los días disponibles
    const diasUnicos = [...new Set(diasDisponibles)].sort((a, b) => {
        return ordenDias.indexOf(a) - ordenDias.indexOf(b);
    });

    const filterAvailableSlots = (citas) => {
        const citasSortedByHour = citas.sort((a, b) => {
            return new Date(`1970/01/01 ${a.Hour}`) - new Date(`1970/01/01 ${b.Hour}`);
        });

        const workingHoursStart = new Date(`1970/01/01 09:00`);
        const workingHoursEnd = new Date(`1970/01/01 17:00`);
        const minSlotDuration = 30;
        const maxSlotDuration = 90;

        const takenSlots = citasSortedByHour.map(cita => {
            const citaTime = new Date(`1970/01/01 ${cita.Hour}`);
            return {
                startTime: citaTime,
                endTime: new Date(citaTime.getTime() + cita.Duration * 60000)
            };
        });

        let availableSlots = [];

        let currentSlotStart = workingHoursStart;

        for (const slot of takenSlots) {
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;

            if (slotStart > currentSlotStart && (slotStart - currentSlotStart) / (1000 * 60) >= minSlotDuration) {
                if ((slotStart - currentSlotStart) / (1000 * 60) <= maxSlotDuration) {
                    availableSlots.push({
                        startTime: currentSlotStart.toLocaleTimeString('en-US', { hour12: false }),
                        endTime: slotStart.toLocaleTimeString('en-US', { hour12: false })
                    });
                }
            }

            currentSlotStart = slotEnd;
        }

        if (currentSlotStart < workingHoursEnd && (workingHoursEnd - currentSlotStart) / (1000 * 60) >= minSlotDuration) {
            if ((workingHoursEnd - currentSlotStart) / (1000 * 60) <= maxSlotDuration) {
                availableSlots.push({
                    startTime: currentSlotStart.toLocaleTimeString('en-US', { hour12: false }),
                    endTime: workingHoursEnd.toLocaleTimeString('en-US', { hour12: false })
                });
            }
        }

        // Filtrar para asegurar que los slots estén separados por al menos la duración mínima
        availableSlots = availableSlots.filter(slot => {
            const slotStartTime = new Date(`1970/01/01 ${slot.startTime}`);
            const slotEndTime = new Date(`1970/01/01 ${slot.endTime}`);
            return (
                slotEndTime - slotStartTime >= minSlotDuration * 60000 &&
                slotStartTime >= workingHoursStart &&
                slotEndTime <= workingHoursEnd
            );
        });

        setSlotsAvailable(availableSlots);
    };

    return (
        <>
            <div className="bg-gray-200">

            <div className="p-4 shadow-md rounded-lg">
                <h1 className="text-3xl font-bold mb-4 text-center text-black">Consultar Citas por Día</h1>
                <div className="flex items-center justify-center mb-4">
                    <label htmlFor="dia" className="mr-2 text-black">Selecciona un día:</label>
                    <select
                        id="dia"
                        value={diaSeleccionado}
                        onChange={handleChangeDia}
                        className="border border-gray-300 p-2 rounded-md bg-black text-yellow-400 shadow-md"
                    >
                        <option value="Seleccion" className="text-yellow-400">Seleccione</option>
                        {diasUnicos.map((dia, index) => (
                            <option key={index} value={dia} className="text-yellow-400">
                                {dia}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-black text-center">Lista de Citas</h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {citasFiltradas.map((appointment, index) => (
                        <div key={index} className="bg-black text-yellow-400 rounded-lg shadow-md border border-gray-300">
                            <div className="text-center p-6">
                                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Cita {index + 1}</h3>
                                <p className="text-gray-300"><strong>Día:</strong> {appointment.Day}</p>
                                <p className="text-gray-300"><strong>Hora:</strong> {appointment.Hour}</p>
                                <p className="text-gray-300"><strong>Duración:</strong> {appointment.Duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-black text-center">Horarios Disponibles</h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {slotsAvailable.map((slot, index) => (
                        <div key={index} className="bg-black text-yellow-400 rounded-lg shadow-md border border-gray-300">
                            <div className="text-center p-6">
                                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Horario {index + 1}</h3>
                                <p className="text-gray-300"><strong>Inicio:</strong> {slot.startTime}</p>
                                <p className="text-gray-300"><strong>Fin:</strong> {slot.endTime}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </>
    )
}