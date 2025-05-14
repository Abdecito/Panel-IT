import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getServidores } from "./api";
import { useSearch } from "./context/SearchContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



function DashboardPage() {
  const [cpuData, setCpuData] = useState([]);
  const [ramData, setRamData] = useState([]);
  const [networkData, setNetworkData] = useState([]);
  const [servidores, setServidores] = useState([]);
  const { query } = useSearch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getServidores(token)
        .then((data) => setServidores(data))
        .catch((err) => console.error("Error al cargar servidores", err));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString().slice(0, 8);
      const randomCPU = parseFloat((Math.random() * 100).toFixed(1));
      const randomRAM = parseFloat((Math.random() * 16).toFixed(1));
      const randomNET = parseFloat((Math.random() * 600).toFixed(1));

      setCpuData((prev) => [...prev.slice(-29), { time, value: randomCPU }]);
      setRamData((prev) => [...prev.slice(-29), { time, value: randomRAM }]);
      setNetworkData((prev) => [...prev.slice(-29), { time, value: randomNET }]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  const servidoresFiltrados = servidores.filter((srv) => {
    const texto = query.toLowerCase();
    return (
      srv.nombre.toLowerCase().includes(texto) ||
      srv.ip.toLowerCase().includes(texto) ||
      (Array.isArray(srv.servicios) &&
        srv.servicios.some((s) => s.toLowerCase().includes(texto)))
    );
  });

  const generarReportePDF = async () => {
  const input = document.getElementById("dashboard-contenido");
  if (!input) return;

  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("reporte-dashboard.pdf");
};

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Resumen de gráficos de los servidores</h2>
      <p className="text-gray-300 mb-6">Aquí puedes ver un resumen general del uso de recursos.</p>

<button
  onClick={generarReportePDF}
  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
>
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

  {/* DIV Envolvente */}
    <div id="dashboard-contenido">
      {renderGraph("Uso de CPU (%)", cpuData, "#F43F5E", 100, "%")}
      {renderGraph("Uso de RAM (GB)", ramData, "#8B5CF6", 16, " GB")}
      {renderGraph("Tráfico de Red (Kbps)", networkData, "#10B981", 600, " Kbps")}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {servidoresFiltrados.map((srv) => (
          <div
            key={srv.id}
            className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700 text-white"
          >
            <h3 className="text-lg font-semibold mb-2">{srv.nombre}</h3>
            <p><strong>IP:</strong> <span className="text-gray-300">{srv.ip}</span></p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={srv.estado === "online" ? "text-green-400" : "text-red-400"}>
                {srv.estado}
              </span>
            </p>
            <p><strong>CPU:</strong> <span className="text-gray-300">{srv.cpu}</span></p>
            <p><strong>RAM:</strong> <span className="text-gray-300">{srv.ram}</span></p>
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
