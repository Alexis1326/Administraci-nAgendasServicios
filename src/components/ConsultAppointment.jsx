import { useState, useEffect } from "react";

// Definir el orden deseado de los días de la semana
const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const ConsultAppointment = () => {

    const [data, setData] = useState([]);
    const [citasFiltradas, setCitasFiltradas] = useState([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState("Seleccion");

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

    return (
        <>
            <div className="p-4 bg-gray-200">
                <h1 className="text-3xl font-bold mb-4 text-center text-blue-900">Consultar Citas por Día</h1>
                <div className="flex items-center justify-center mb-4">
                    <label htmlFor="dia" className="mr-2 text-blue-900">Selecciona un día:</label>
                    <select
                        id="dia"
                        value={diaSeleccionado}
                        onChange={handleChangeDia}
                        className="border border-gray-300 p-2 rounded-md bg-white shadow-md"
                    >
                        <option value="Seleccion" className="text-gray-600">Seleccione</option>
                        {diasUnicos.map((dia, index) => (
                            <option key={index} value={dia} className="text-gray-600">
                                {dia}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Lista de Citas</h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {citasFiltradas.map((appointment, index) => (
                        <div key={index} className="bg-gray-100 text-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-300">
                            <div className="text-center p-6">
                                <h3 className="text-xl font-semibold mb-2 text-blue-900">Cita {index + 1}</h3>
                                <p className="text-gray-700"><strong>Día:</strong> {appointment.Day}</p>
                                <p className="text-gray-700"><strong>Hora:</strong> {appointment.Hour}</p>
                                <p className="text-gray-700"><strong>Duración:</strong> {appointment.Duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}