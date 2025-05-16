import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SettingsPage({ onClose }) {
  const [tema, setTema] = useState("dark");
  const [mostrarAvanzado, setMostrarAvanzado] = useState(true);
  const [intervalo, setIntervalo] = useState(5000);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("config");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTema(parsed.tema || "dark");
      setMostrarAvanzado(parsed.mostrarAvanzado ?? true);
      setIntervalo(parsed.intervalo || 5000);
    }
  }, []);

  const handleGuardar = () => {
    const config = { tema, mostrarAvanzado, intervalo };
    localStorage.setItem("config", JSON.stringify(config));
    alert("Configuración guardada");
  };

  return (
    <div className="bg-gray-900 p-6 text-white rounded-lg shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Configuración</h2>

      {/* Tema */}
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

      {/* Avanzado */}
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

      {/* Intervalo */}
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

      {/* Guardar */}
      <button
        onClick={handleGuardar}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        Guardar cambios
      </button>

      <button
        onClick={() => navigate(-1)} // o navigate("/dashboard")
        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white ml-2"
      >
        Volver
      </button>
    </div>
  );
}

export default SettingsPage;
