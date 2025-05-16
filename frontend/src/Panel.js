import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getServidores,
  encenderServidorAPI,
  apagarServidorAPI,
  reiniciarServidorAPI,
} from "./api";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import TerminalVPS from "./TerminalVPS"; //
import Layout from "./Layout";
import {
  Trash2,
  Power,
  PowerOff,
  RotateCcw,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";
import { FaMicrochip, FaMemory, FaServer } from "react-icons/fa";
import { MdOutlinePower } from "react-icons/md";
import { useSearch } from "./context/SearchContext"; // ✅ Importar el contexto

function Panel() {
  const [servidores, setServidores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loadingReset, setLoadingReset] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuario = token ? jwtDecode(token) : null;
  const [loadingBotones, setLoadingBotones] = useState({});
  const { query } = useSearch();

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
    cargarServidores(); // Carga inicial

    const interval = setInterval(() => {
      cargarServidores(); // Actualiza cada 5 segundos
    }, 5000);

    const eventosGuardados = JSON.parse(
      localStorage.getItem("eventos") || "[]"
    );
    setEventos(eventosGuardados);

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
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
    setLoadingBotones((prev) => ({ ...prev, [id]: true }));
    try {
      await encenderServidorAPI(id, token);
      await cargarServidores();
      const nombre =
        servidores.find((s) => String(s.id) === String(id))?.nombre ||
        `Servidor ${id}`;
      actualizarEventos(` ${nombre} ha sido encendido`);
      toast.success(`${nombre} encendido correctamente`);
    } catch (err) {
      console.error("Error al encender servidor:", err);
      toast.error("Error al encender el servidor");
    } finally {
      setLoadingBotones((prev) => ({ ...prev, [id]: false }));
    }
  };

  const apagarServidor = async (id) => {
    setLoadingBotones((prev) => ({ ...prev, [id]: true }));
    try {
      await apagarServidorAPI(id, token);
      await cargarServidores();
      const nombre =
        servidores.find((s) => String(s.id) === String(id))?.nombre ||
        `Servidor ${id}`;
      actualizarEventos(` ${nombre} ha sido apagado`);
      toast.warn(`${nombre} ha sido apagado`);
    } catch (err) {
      console.error("Error al apagar servidor:", err);
      toast.error("Error al apagar el servidor");
    } finally {
      setLoadingBotones((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Reiniciar servidor
  // Cambia el estado del servidor a "Reiniciando..." y luego lo apaga y enciende
  // Después de encenderlo, actualiza la lista de servidores y muestra un mensaje de éxito
  // Si hay un error, muestra un mensaje de error
  // Se utiliza para el botón de reiniciar en la interfaz

  const reiniciarServidor = async (id) => {
    setLoadingBotones((prev) => ({ ...prev, [id]: true }));
    const nombreServidor = servidores.find(
      (s) => String(s.id) === String(id)
    )?.nombre;
    const enReinicio = servidores.map((srv) =>
      String(srv.id) === String(id) ? { ...srv, estado: "Reiniciando..." } : srv
    );
    actualizarServidores(enReinicio);
    actualizarEventos(` ${nombreServidor} se está reiniciando`);
    toast.info(`${nombreServidor} se está reiniciando...`);

    try {
      await apagarServidorAPI(id, token);
      setTimeout(async () => {
        try {
          await encenderServidorAPI(id, token);
          await cargarServidores();
          actualizarEventos(`${nombreServidor} ha vuelto a estar online`);
          toast.success(`${nombreServidor} está online`);
        } catch (err2) {
          console.error("Error al encender después del apagado:", err2);
          toast.error("No se pudo encender el servidor tras reinicio");
        } finally {
          setLoadingBotones((prev) => ({ ...prev, [id]: false }));
        }
      }, 10000);
    } catch (err) {
      console.error("Error al apagar el servidor para reinicio:", err);
      toast.error("Error al reiniciar el servidor");
      setLoadingBotones((prev) => ({ ...prev, [id]: false }));
    }
  };

  const restablecerServidores = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres restablecer todos los servidores y borrar el historial?"
      )
    ) {
      return;
    }

    setLoadingReset(true);

    try {
      const data = await getServidores(token);

      // Encender todos los simulados excepto el VPS real
      const simulados = data.filter((s) => s.id !== "local-pc");
      await Promise.all(simulados.map((s) => encenderServidorAPI(s.id, token)));

      const actualizados = await getServidores(token);
      actualizarServidores(actualizados);

      setEventos([]);
      localStorage.removeItem("eventos");
      actualizarEventos("⚙️ Todos los servidores fueron restablecidos");
      toast.success("Servidores restablecidos y online");
      toast.info("Historial de eventos borrado");
    } catch (err) {
      console.error("Error al restablecer servidores:", err);
      toast.error("Error al restablecer los servidores");
    } finally {
      setLoadingReset(false);
    }
  };

  const renderCpuBar = (cpuString) => {
    const value = parseFloat(cpuString);
    if (isNaN(value)) return null;
    return (
      <div className="w-full bg-gray-200 rounded h-2 mt-1">
        <div
          className="h-2 rounded"
          style={{
            width: `${value}%`,
            backgroundColor: value > 80 ? "#dc2626" : "#60a5fa",
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white-700 mb-1">
            Panel de Infraestructura IT
          </h1>
          {usuario && (
            <p className="text-sm text-white-600">
              Bienvenido, <span className="font-semibold">{usuario.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
          <button
            onClick={restablecerServidores}
            disabled={loadingReset}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded shadow w-full sm:w-auto
              ${
                loadingReset
                  ? "bg-yellow-400 cursor-wait"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }
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
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Restableciendo...
              </>
            ) : (
              <>Restablecer Servidores</>
            )}
          </button>
        </div>
      </div>

      {servidores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servidores
              .filter((srv) => {
                const texto = query.toLowerCase();
                return (
                  srv.nombre?.toLowerCase().includes(texto) ||
                  srv.ip?.toLowerCase().includes(texto) ||
                  srv.estado?.toLowerCase().includes(texto) ||
                  srv.servicios?.some((s) => s.toLowerCase().includes(texto))
                );
              })
              .map((srv) => (
                <div
                  key={srv.id}
                  className="bg-gray-900 p-4 rounded-lg shadow border border-gray-900"
                >
                  <h2 className="text-xl font-bold text-white">{srv.nombre}</h2>
                  <p className="flex items-center gap-2">
                    <FaServer className="text-blue-400" />
                    <strong>IP:</strong>{" "}
                    <span className="text-gray-100">{srv.ip}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <MdOutlinePower
                      className={
                        srv.estado === "online"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    />
                    <strong>Estado:</strong>{" "}
                    <span
                      className={
                        srv.estado === "online"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {srv.estado}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <FaMicrochip className="text-yellow-400" />
                    <strong>CPU:</strong>{" "}
                    <span className="text-gray-100">{srv.cpu}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <FaMemory className="text-purple-400" />
                    <strong>RAM:</strong>{" "}
                    <span className="text-gray-100">{srv.ram}</span>
                  </p>

                  {(() => {
                    let used = 0,
                      total = 1;

                    if (srv.ram && srv.ram.includes("/")) {
                      const partes = srv.ram.split("/");
                      used = parseFloat(partes[0]) || 0;
                      total = parseFloat(partes[1]) || 1;
                    }

                    const data = [
                      { name: "Usado", value: used },
                      { name: "Libre", value: Math.max(total - used, 0) },
                    ];

                    const COLORS = ["#60a5fa", "#d1d5db"];

                    return (
                      <div className="text-white">
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
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                        <p className="text-sm text-center">Uso de RAM</p>
                      </div>
                    );
                  })()}

                  <div className="text-white">
                    <strong>Servicios:</strong>
                    <ul className="list-disc list-inside text-white">
                      {srv.servicios.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-3 mt-4">
                        {/* SWITCH Encender/Apagar */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={srv.estado === "online"}
                            onChange={() =>
                              srv.estado === "online"
                                ? apagarServidor(srv.id)
                                : encenderServidor(srv.id)
                            }
                            disabled={loadingBotones[srv.id]}
                          />
                          <div
                            className={`w-11 h-6 rounded-full peer transition-colors duration-300
      ${srv.estado === "online" ? "bg-green-500" : "bg-red-400"}
      ${loadingBotones[srv.id] ? "opacity-50 cursor-not-allowed" : ""}
    `}
                          ></div>
                          <div
                            className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
      ${srv.estado === "online" ? "translate-x-5" : ""}
    `}
                          ></div>
                        </label>

                        {/* BOTÓN DE REINICIO MEJORADO */}
                        <button
                          onClick={() => reiniciarServidor(srv.id)}
                          disabled={
                            srv.estado !== "online" || loadingBotones[srv.id]
                          }
                          className={`w-7 h-7 flex items-center justify-center rounded-full transition duration-200 shadow
    ${
      srv.estado !== "online" || loadingBotones[srv.id]
        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
                          title="Reiniciar servidor"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className={`w-5 h-5 ${
                              loadingBotones[srv.id] ? "animate-spin" : ""
                            }`}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 
         3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 
         13.803-3.7l3.181 3.182m0-4.991v4.99"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-100">
                Historial de eventos
              </h2>
              <button
                onClick={() => {
                  setEventos([]);
                  localStorage.removeItem("eventos");
                }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm shadow"
              >
                <Trash2 size={16} />
                Clear
              </button>
            </div>

            {eventos.length > 0 ? (
              <ul className="bg-gray-800 p-4 rounded shadow max-h-64 overflow-y-auto text-sm border border-gray-700 text-gray-100 space-y-1">
                {eventos.map((e, i) => {
                  let icon = null;

                  if (e.mensaje.includes("vuelto a estar online")) {
                    icon = <CheckCircle className="text-green-400 w-4 h-4" />;
                  } else if (e.mensaje.includes("encendido")) {
                    icon = <Power className="text-green-400 w-4 h-4" />;
                  } else if (e.mensaje.includes("apagado")) {
                    icon = <PowerOff className="text-red-400 w-4 h-4" />;
                  } else if (e.mensaje.includes("reiniciando")) {
                    icon = <RotateCcw className="text-blue-400 w-4 h-4" />;
                  }

                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-gray-400 w-16">[{e.hora}]</span>
                      {icon}
                      <span>{e.mensaje}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400">No hay eventos registrados aún.</p>
            )}

            <TerminalVPS />
          </div>
        </>
      ) : (
        <p className="text-white text-center">Cargando servidores...</p>
      )}
    </div>
  );
}

export default Panel;
