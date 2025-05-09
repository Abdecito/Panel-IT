import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getServidores,
  encenderServidorAPI,
  apagarServidorAPI,
} from "./api";
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

function Panel() {
  const [servidores, setServidores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loadingReset, setLoadingReset] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = token ? jwtDecode(token) : null;

  const actualizarServidores = (nuevosServidores) => {
    setServidores(nuevosServidores);
    localStorage.setItem("servidores", JSON.stringify(nuevosServidores));
  };

  const cargarServidores = async () => {
    try {
      const data = await getServidores(token);
      actualizarServidores(data);
    } catch (err) {
      console.error("Error al cargar servidores:", err);
    }
  };

  useEffect(() => {
    cargarServidores();
    const eventosGuardados = JSON.parse(localStorage.getItem("eventos") || "[]");
    setEventos(eventosGuardados);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const actualizarEventos = (nuevoEvento) => {
    const nuevosEventos = [
      { hora: new Date().toLocaleTimeString(), mensaje: nuevoEvento },
      ...eventos,
    ];
    setEventos(nuevosEventos);
    localStorage.setItem("eventos", JSON.stringify(nuevosEventos));
  };

  const encenderServidor = async (id) => {
    try {
      await encenderServidorAPI(id, token);
      await cargarServidores();
      const nombre = servidores.find((s) => String(s.id) === String(id))?.nombre || `Servidor ${id}`;
      actualizarEventos(`🟢 ${nombre} ha sido encendido`);
      toast.success(`${nombre} encendido correctamente`);
    } catch (err) {
      console.error("Error al encender servidor:", err);
      toast.error("Error al encender el servidor");
    }
  };

  const apagarServidor = async (id) => {
    try {
      await apagarServidorAPI(id, token);
      await cargarServidores();
      const nombre = servidores.find((s) => String(s.id) === String(id))?.nombre || `Servidor ${id}`;
      actualizarEventos(`🔴 ${nombre} ha sido apagado`);
      toast.warn(`${nombre} ha sido apagado`);
    } catch (err) {
      console.error("Error al apagar servidor:", err);
      toast.error("Error al apagar el servidor");
    }
  };

  const reiniciarServidor = (id) => {
    const nombreServidor = servidores.find((s) => String(s.id) === String(id))?.nombre;
    const enReinicio = servidores.map((srv) =>
      String(srv.id) === String(id) ? { ...srv, estado: "Reiniciando..." } : srv
    );
    actualizarServidores(enReinicio);
    actualizarEventos(`🔁 ${nombreServidor} se está reiniciando`);
    toast.info(`${nombreServidor} se está reiniciando...`);

    setTimeout(async () => {
      try {
        await encenderServidorAPI(id, token);
        await cargarServidores();
        actualizarEventos(`✅ ${nombreServidor} ha vuelto a estar online`);
        toast.success(`${nombreServidor} está online`);
      } catch (err) {
        console.error("Error al reiniciar servidor:", err);
        toast.error("Error al reiniciar el servidor");
      }
    }, 3000);
  };

  const restablecerServidores = () => {
    if (!window.confirm("¿Estás seguro de que quieres restablecer todos los servidores y borrar el historial?")) {
      return;
    }

    setLoadingReset(true);

    getServidores(token)
      .then((res) => {
        actualizarServidores(res);
        toast.success("Servidores restablecidos y online");

        setEventos([]);
        localStorage.removeItem("eventos");
        actualizarEventos("⚙️ Todos los servidores fueron restablecidos");
        toast.info("Historial de eventos borrado");
      })
      .catch((err) => {
        console.error("Error al restablecer servidores:", err);
        toast.error("Error al restablecer los servidores");
      })
      .finally(() => {
        setLoadingReset(false);
      });
  };

  const renderCpuBar = (cpuString) => {
    const value = parseFloat(cpuString);
    if (isNaN(value)) return null;
    return (
      <div className="w-full bg-gray-200 rounded h-2 mt-1">
        <div
          className="h-2 rounded"
          style={{ width: `${value}%`, backgroundColor: value > 80 ? '#dc2626' : '#60a5fa' }}
        ></div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-1">Panel de Infraestructura IT</h1>
          {usuario && (
            <p className="text-sm text-gray-600">
              Bienvenido, <span className="font-semibold">{usuario.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
          <button
            onClick={restablecerServidores}
            disabled={loadingReset}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded shadow w-full sm:w-auto
              ${loadingReset ? "bg-yellow-400 cursor-wait" : "bg-yellow-600 hover:bg-yellow-700"}
              text-white`}
          >
            {loadingReset ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Restableciendo...
              </>
            ) : (
              <>Restablecer Servidores</>
            )}
          </button>

          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {servidores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servidores.map((srv) => (
              <div key={srv.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">{srv.nombre}</h2>
                <p><strong>IP:</strong> {srv.ip}</p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span className={srv.estado === "online" ? "text-green-600" : "text-red-600"}>
                    {srv.estado || "desconocido"}
                  </span>
                </p>
                <p><strong>CPU:</strong> {srv.cpu}</p>
                {renderCpuBar(srv.cpu)}
                <p><strong>RAM:</strong> {srv.ram}</p>

                {srv.ram && srv.ram.includes("/") && (() => {
                  const [used, total] = srv.ram.split("/").map(val => parseFloat(val));
                  const data = [
                    { name: "Usado", value: used },
                    { name: "Libre", value: total - used }
                  ];
                  const COLORS = ["#FF8042", "#00C49F"];
                  return (
                    <div className="mt-2">
                      <PieChart width={100} height={100}>
                        <Pie
                          data={data}
                          cx={50}
                          cy={50}
                          innerRadius={30}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                      <p className="text-sm text-center">Uso de RAM</p>
                    </div>
                  );
                })()}

                <div className="mt-2">
                  <strong>Servicios:</strong>
                  <ul className="list-disc list-inside text-gray-700">
                    {srv.servicios.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => encenderServidor(srv.id)}
                      disabled={srv.estado === "online" || srv.estado === "Reiniciando..."}
                      className={`px-3 py-1 rounded text-sm ${srv.estado === "online" || srv.estado === "Reiniciando..." ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                    >
                      Encender
                    </button>
                    <button
                      onClick={() => apagarServidor(srv.id)}
                      disabled={srv.estado === "offline" || srv.estado === "Reiniciando..."}
                      className={`px-3 py-1 rounded text-sm ${srv.estado === "offline" || srv.estado === "Reiniciando..." ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
                    >
                      Apagar
                    </button>
                  </div>
                  <button
                    onClick={() => reiniciarServidor(srv.id)}
                    disabled={srv.estado !== "online"}
                    className={`px-3 py-1 rounded text-sm ${srv.estado !== "online" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Historial de eventos</h2>
              <button
                onClick={() => {
                  setEventos([]);
                  localStorage.removeItem("eventos");
                }}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Limpiar historial
              </button>
            </div>

            {eventos.length > 0 ? (
              <ul className="bg-white p-4 rounded shadow max-h-64 overflow-y-auto text-sm border">
                {eventos.map((e, i) => (
                  <li key={i} className="mb-1">
                    <span className="text-gray-500 mr-2">[{e.hora}]</span>
                    {e.mensaje}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay eventos registrados aún.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center">Cargando servidores...</p>
      )}
    </div>
  );
}

export default Panel;
