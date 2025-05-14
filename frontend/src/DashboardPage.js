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

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Resumen de gráficos de los servidores</h2>
      <p className="text-gray-300 mb-6">Aquí puedes ver un resumen general del uso de recursos.</p>

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
  );
}

export default DashboardPage;
