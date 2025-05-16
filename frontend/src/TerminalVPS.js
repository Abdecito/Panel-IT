// Importamos React y el hook useState
import React, { useState } from "react";

// Importamos toastify para mostrar errores si la ejecución falla
import { toast } from "react-toastify";

// Importamos la función que ejecuta comandos vía SSH en el backend
import { ejecutarComandoSSH } from "./api"; // ✅ solo esta importación es necesaria

// Componente funcional TerminalVPS
function TerminalVPS() {
  // Estado para almacenar el comando que el usuario escribe
  const [comando, setComando] = useState("");

  // Estado para mostrar la salida acumulada de los comandos ejecutados
  const [salida, setSalida] = useState("");

  // Función para ejecutar un comando en el VPS real mediante SSH
  const ejecutarComando = async () => {
    // Si no hay comando (vacío o solo espacios), no se hace nada
    if (!comando.trim()) return;

    try {
      // Recuperamos el token JWT desde el localStorage
      const token = localStorage.getItem("token");

      // Llamamos a la API para ejecutar el comando en el servidor
      const { stdout, stderr } = await ejecutarComandoSSH(comando, token);

      // Actualizamos la salida mostrada en la terminal
      setSalida(
        (prev) => prev + `> ${comando}\n${stdout || stderr || "OK"}\n\n`
      );

      // Limpiamos el campo de entrada del comando
      setComando("");
    } catch (err) {
      // Si ocurre un error, lo mostramos en consola y por toast
      console.error("Error al ejecutar comando SSH:", err);
      toast.error("Error al ejecutar el comando");
    }
  };

  // Renderizado del componente
  return (
    <div className="p-4 bg-gray-800 rounded shadow mt-6 border border-gray-700">
      {/* Título de la terminal */}
      <h2 className="text-xl font-bold text-gray-100 mb-2">
        Terminal VPS Real (SSH)
      </h2>

      {/* Área de texto que muestra la salida de los comandos */}
      <textarea
        className="w-full h-48 p-2 bg-gray-900 text-gray-100 font-mono text-sm rounded resize-none mb-3 border border-gray-700"
        value={salida}
        readOnly
      />

      {/* Input de comando + botón de ejecución */}
      <div className="flex gap-2">
        {/* Campo de entrada de texto para comandos */}
        <input
          type="text"
          className="flex-1 p-2 rounded bg-gray-900 text-gray-100 border border-gray-700"
          placeholder="Escribe un comando (ej: ls -la)"
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ejecutarComando()} // Ejecuta con Enter
        />

        {/* Botón para ejecutar el comando */}
        <button
          onClick={ejecutarComando}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Ejecutar
        </button>
      </div>
    </div>
  );
}

// Exportamos el componente para poder usarlo en otros archivos
export default TerminalVPS;
