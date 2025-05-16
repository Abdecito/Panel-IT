// Importamos React y hooks necesarios
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Para navegar entre rutas

// Componente de configuración
function SettingsPage({ onClose }) {
  // Estados locales para guardar las preferencias del usuario
  const [tema, setTema] = useState("dark"); // Tema de la interfaz (oscuro o claro)
  const [mostrarAvanzado, setMostrarAvanzado] = useState(true); // Mostrar o no estadísticas avanzadas
  const [intervalo, setIntervalo] = useState(5000); // Intervalo de actualización en milisegundos

  const navigate = useNavigate(); // Hook para navegación programática

  // useEffect para cargar la configuración guardada en localStorage cuando se monta el componente
  useEffect(() => {
    const saved = localStorage.getItem("config");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTema(parsed.tema || "dark"); // Aplica el tema guardado
      setMostrarAvanzado(parsed.mostrarAvanzado ?? true); // Aplica si mostrar o no estadísticas avanzadas
      setIntervalo(parsed.intervalo || 5000); // Aplica el intervalo guardado
    }
  }, []);

  // Guarda la configuración en localStorage
  const handleGuardar = () => {
    const config = { tema, mostrarAvanzado, intervalo };
    localStorage.setItem("config", JSON.stringify(config));
    alert("Configuración guardada"); // Alerta simple al usuario
  };

  // Interfaz del componente
  return (
    <div className="bg-gray-900 p-6 text-white rounded-lg shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Configuración</h2>

      {/* Selector de tema */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Tema</label>
        <select
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded border border-gray-700"
        >
          <option value="dark">Oscuro</option>
          <option value="light">Claro</option>
        </select>
      </div>

      {/* Checkbox para mostrar estadísticas avanzadas */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Mostrar estadísticas avanzadas
        </label>
        <input
          type="checkbox"
          checked={mostrarAvanzado}
          onChange={(e) => setMostrarAvanzado(e.target.checked)}
          className="accent-blue-500 scale-125"
        />
      </div>

      {/* Selector de intervalo de actualización */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Intervalo de actualización
        </label>
        <select
          value={intervalo}
          onChange={(e) => setIntervalo(Number(e.target.value))}
          className="bg-gray-800 text-white p-2 rounded border border-gray-700"
        >
          <option value={2000}>2 segundos</option>
          <option value={5000}>5 segundos</option>
          <option value={10000}>10 segundos</option>
        </select>
      </div>

      {/* Botón para guardar los cambios */}
      <button
        onClick={handleGuardar}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        Guardar cambios
      </button>

      {/* Botón para volver a la página anterior */}
      <button
        onClick={() => navigate(-1)} // También puede ser navigate("/dashboard") si se quiere ir directamente ahí
        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white ml-2"
      >
        Volver
      </button>
    </div>
  );
}

export default SettingsPage;
