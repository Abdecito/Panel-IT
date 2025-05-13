import React, { useState } from "react";
import { toast } from "react-toastify";
import { ejecutarComandoSSH } from "./api"; // ✅ solo esta importación es necesaria

function TerminalVPS() {
  const [comando, setComando] = useState("");
  const [salida, setSalida] = useState("");

  const ejecutarComando = async () => {
    if (!comando.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const { stdout, stderr } = await ejecutarComandoSSH(comando, token);

      setSalida((prev) =>
        prev + `> ${comando}\n${stdout || stderr || "OK"}\n\n`
      );
      setComando("");
    } catch (err) {
      console.error("Error al ejecutar comando SSH:", err);
      toast.error("Error al ejecutar el comando");
    }
  };

  return (
<div className="p-4 bg-gray-800 rounded shadow mt-6 border border-gray-700">
  <h2 className="text-xl font-bold text-gray-100 mb-2">Terminal VPS Real (SSH)</h2>

  <textarea
    className="w-full h-48 p-2 bg-gray-900 text-gray-100 font-mono text-sm rounded resize-none mb-3 border border-gray-700"
    value={salida}
    readOnly
  />

  <div className="flex gap-2">
    <input
      type="text"
      className="flex-1 p-2 rounded bg-gray-900 text-gray-100 border border-gray-700"
      placeholder="Escribe un comando (ej: ls -la)"
      value={comando}
      onChange={(e) => setComando(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && ejecutarComando()}
    />
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

export default TerminalVPS;
