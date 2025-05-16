// Importamos React y hooks necesarios
import React, { useEffect, useState } from "react";

// Importamos componentes de gráficas de la librería Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Función para obtener los servidores desde la API
import { getServidores } from "./api";

// Hook personalizado que accede al estado de búsqueda global
import { useSearch } from "./context/SearchContext";

// Librerías para generar PDF a partir de HTML
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Componente principal del dashboard
function DashboardPage() {
  // Estados para guardar los datos de las gráficas
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [networkData, setNetworkData] = useState([]);

  // Estado para la lista de servidores obtenida del backend
  const [servidores, setServidores] = useState([]);

  // Obtenemos la búsqueda desde el contexto
  const { query } = useSearch();

  // Efecto que se ejecuta una sola vez al cargar la página
  // Carga la lista de servidores desde el backend usando el token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getServidores(token)
        .then((data) => setServidores(data))
        .catch((err) => console.error("Error al cargar servidores", err));
    }
  }, []);

  // Efecto que simula nuevas métricas cada 10 segundos (CPU, RAM, red)
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString().slice(0, 8); // HH:MM:SS
      const randomCPU = parseFloat((Math.random() * 100).toFixed(1)); // 0-100%
      const randomRAM = parseFloat((Math.random() * 16).toFixed(1)); // 0-16 GB
      const randomNET = parseFloat((Math.random() * 600).toFixed(1)); // 0-600 Kbps

      // Guardamos solo los últimos 30 puntos (desplazamiento)
      setCpuData((prev) => [...prev.slice(-29), { time, value: randomCPU }]);
      setRamData((prev) => [...prev.slice(-29), { time, value: randomRAM }]);
      setNetworkData((prev) => [
        ...prev.slice(-29),
        { time, value: randomNET },
      ]);
    }, 10000); // Cada 10 segundos

    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, []);

  // Función que renderiza una gráfica con parámetros personalizados
  const renderGraph = (title, data, strokeColor, maxY, unit) => (
    <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700 mb-8">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <ResponsiveContainer minWidth={300} height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
          <YAxis domain={[0, maxY]} tick={{ fill: "#9CA3AF" }} unit={unit} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
            labelStyle={{ color: "#F9FAFB" }}
            itemStyle={{ color: strokeColor }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Filtro de servidores según búsqueda ingresada (nombre, IP o servicio)
  const servidoresFiltrados = servidores.filter((srv) => {
    const texto = query.toLowerCase();
    return (
      srv.nombre.toLowerCase().includes(texto) ||
      srv.ip.toLowerCase().includes(texto) ||
      (Array.isArray(srv.servicios) &&
        srv.servicios.some((s) => s.toLowerCase().includes(texto)))
    );
  });

  // Generar PDF del dashboard visual usando html2canvas y jsPDF
  const generarReportePDF = async () => {
    const input = document.getElementById("dashboard-contenido"); // Elemento a capturar
    if (!input) return;

    const canvas = await html2canvas(input); // Captura como imagen canvas
    const imgData = canvas.toDataURL("image/png"); // Convertimos a base64
    const pdf = new jsPDF("p", "mm", "a4"); // Creamos PDF formato A4
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight); // Insertamos imagen
    pdf.save("reporte-dashboard.pdf"); // Guardamos PDF
  };

  // Render principal del componente
  return (
    <div>
      {/* Título de la página */}
      <h2 className="text-2xl font-bold text-white mb-4">
        Resumen de gráficos de los servidores
      </h2>

      {/* Descripción */}
      <p className="text-gray-300 mb-6">
        Aquí puedes ver un resumen general del uso de recursos.
      </p>

      {/* Botón para exportar el dashboard como PDF */}
      <button
        onClick={generarReportePDF}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {/* Icono de descarga */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11V3m0 8l-3-3m3 3l3-3m-9 7h12a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2z"
          />
        </svg>
        Generar Reporte PDF
      </button>

      {/* Contenedor principal del dashboard (usado para capturar el PDF) */}
      <div id="dashboard-contenido">
        {/* Gráficas de métricas */}
        {renderGraph("Uso de CPU (%)", cpuData, "#F43F5E", 100, "%")}
        {renderGraph("Uso de RAM (GB)", ramData, "#8B5CF6", 16, " GB")}
        {renderGraph(
          "Tráfico de Red (Kbps)",
          networkData,
          "#10B981",
          600,
          " Kbps"
        )}

        {/* Tarjetas individuales de servidores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servidoresFiltrados.map((srv) => (
            <div
              key={srv.id}
              className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700 text-white"
            >
              <h3 className="text-lg font-semibold mb-2">{srv.nombre}</h3>
              <p>
                <strong>IP:</strong>{" "}
                <span className="text-gray-300">{srv.ip}</span>
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span
                  className={
                    srv.estado === "online" ? "text-green-400" : "text-red-400"
                  }
                >
                  {srv.estado}
                </span>
              </p>
              <p>
                <strong>CPU:</strong>{" "}
                <span className="text-gray-300">{srv.cpu}</span>
              </p>
              <p>
                <strong>RAM:</strong>{" "}
                <span className="text-gray-300">{srv.ram}</span>
              </p>

              {/* Lista de servicios si existen */}
              {srv.servicios?.length > 0 && (
                <div className="mt-2">
                  <strong>Servicios:</strong>
                  <ul className="list-disc list-inside text-gray-300 text-sm mt-1">
                    {srv.servicios.map((serv, i) => (
                      <li key={i}>{serv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
