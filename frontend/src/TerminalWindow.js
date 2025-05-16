// Importamos React y los hooks necesarios
import React, { useState } from "react";

// Importamos axios para hacer peticiones HTTP
import axios from "axios";

// Componente funcional para una terminal SSH real abierta en nueva ventana
function TerminalWindow() {
  // Estado para el texto del comando actual
  const [comando, setComando] = useState("");

  // Estado para indicar si el comando se está ejecutando
  const [loading, setLoading] = useState(false);

  // Historial de comandos ejecutados y sus salidas
  const [historial, setHistorial] = useState([]);

  // Función para enviar el comando al backend y guardar la respuesta
  const ejecutarComando = async () => {
    // Si el comando está vacío o solo tiene espacios, no se hace nada
    if (!comando.trim()) return;

    setLoading(true); // Activamos el estado de carga

    try {
      // Obtenemos el token de autenticación desde localStorage
      const token = localStorage.getItem("token");

      // Hacemos una petición POST a la API de SSH del backend
      const response = await axios.post(
        "http://localhost:3001/api/ssh", // Ruta del endpoint
        { comando }, // Enviamos el comando en el body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Añadimos el token en la cabecera
          },
        }
      );

      // Añadimos la respuesta al historial (nuevo arriba)
      setHistorial((prev) => [
        {
          comando,
          salida: response.data.stdout, // salida estándar
          error: response.data.stderr,  // salida de error si existe
        },
        ...prev,
      ]);
    } catch (err) {
      // En caso de error (ej: conexión o permisos), lo guardamos en el historial
      setHistorial((prev) => [
        {
          comando,
          salida: "",
          error: "Error al ejecutar el comando.",
        },
        ...prev,
      ]);
    } finally {
      // Limpiamos el campo de entrada y desactivamos la carga
      setComando("");
      setLoading(false);
    }
  };

  // Función para detectar la tecla Enter (sin Shift) y ejecutar
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ejecutarComando();
    }
  };

  // Renderizado del componente
  return (
    <div className="bg-black text-green-400 font-mono p-4 h-screen overflow-y-auto">
      {/* Título de la terminal */}
      <h2 className="text-lg text-white mb-4">Terminal VPS Real</h2>

      {/* Textarea para escribir el comando */}
      <textarea
        className="w-full bg-black border border-gray-700 p-2 text-green-400 resize-none mb-4"
        rows={3}
        placeholder="Escribe un comando y pulsa Enter..."
        value={comando}
        onChange={(e) => setComando(e.target.value)}
        onKeyDown={handleKeyDown} // Ejecuta al pulsar Enter
      />

      {/* Indicador de carga mientras se ejecuta un comando */}
      {loading && <p className="text-yellow-400">Ejecutando comando...</p>}

      {/* Mostrar historial de comandos y salidas */}
      {historial.map((item, index) => (
        <div key={index} className="mb-6">
          {/* Comando ejecutado */}
          <div className="text-white mb-1">
            🖥 <span className="text-blue-300">{item.comando}</span>
          </div>

          {/* Salida estándar (stdout) */}
          {item.salida && (
            <pre className="bg-gray-800 p-2 text-sm whitespace-pre-wrap text-green-300">
              {item.salida}
            </pre>
          )}

          {/* Salida de error (stderr) */}
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

// Exportamos el componente para su uso en rutas u otras vistas
export default TerminalWindow;
