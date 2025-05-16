import React, { useState } from "react";
import axios from "axios";

function TerminalWindow() {
  const [comando, setComando] = useState("");
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);

  const ejecutarComando = async () => {
    if (!comando.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/api/ssh",
        { comando },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Guardar comando ejecutado con salida y error (si hay)
      setHistorial((prev) => [
        {
          comando,
          salida: response.data.stdout,
          error: response.data.stderr,
        },
        ...prev, // último comando arriba
      ]);
    } catch (err) {
      setHistorial((prev) => [
        {
          comando,
          salida: "",
          error: "Error al ejecutar el comando.",
        },
        ...prev,
      ]);
    } finally {
      setComando(""); // limpiar textarea
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ejecutarComando();
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono p-4 h-screen overflow-y-auto">
      <h2 className="text-lg text-white mb-4">Terminal VPS Real</h2>

      <textarea
        className="w-full bg-black border border-gray-700 p-2 text-green-400 resize-none mb-4"
        rows={3}
        placeholder="Escribe un comando y pulsa Enter..."
        value={comando}
        onChange={(e) => setComando(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {loading && <p className="text-yellow-400">Ejecutando comando...</p>}

      {historial.map((item, index) => (
        <div key={index} className="mb-6">
          <div className="text-white mb-1">
            🖥 <span className="text-blue-300">{item.comando}</span>
          </div>

          {item.salida && (
            <pre className="bg-gray-800 p-2 text-sm whitespace-pre-wrap text-green-300">
              {item.salida}
            </pre>
          )}

          {item.error && (
            <pre className="bg-red-800 p-2 text-sm whitespace-pre-wrap text-red-200">
              {item.error}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export default TerminalWindow;
