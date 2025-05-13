import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getServidores } from "./api";

function DashboardPage() {
  const [cpuData, setCpuData] = useState([]);
  const [servidores, setServidores] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getServidores(token)
        .then(data => setServidores(data))
        .catch(err => console.error("Error al cargar servidores", err));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData(prev => [
        ...prev.slice(-29),
        {
          time: new Date().toLocaleTimeString().slice(0, 8),
          value: parseFloat((Math.random() * 100).toFixed(1))
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Resumen de gráficos de los servidores</h2>
      <p className="text-gray-300 mb-6">Aquí puedes ver un resumen general del uso de recursos.</p>

      {/* Gráfico general de CPU */}
      <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">Uso de CPU</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={cpuData}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
            <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
              labelStyle={{ color: "#F9FAFB" }}
              itemStyle={{ color: "#F43F5E" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F43F5E"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tarjetas individuales por servidor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {servidores.map((srv) => (
          <div key={srv.id} className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700 text-white">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
