// hetzner.js

// Importamos axios para hacer peticiones HTTP
const axios = require("axios");

// Cargamos las variables de entorno desde un archivo .env
require("dotenv").config();

// URL base de la API de Hetzner Cloud
const HETZNER_API_URL = "https://api.hetzner.cloud/v1";

// Token de acceso a la API, obtenido desde las variables de entorno
const TOKEN = process.env.HETZNER_API_KEY;

// ID del servidor VPS que queremos controlar
const SERVER_ID = process.env.HETZNER_SERVER_ID;

// Cabeceras comunes para todas las peticiones: token de autorización y tipo de contenido
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

// Espera hasta que el VPS alcance un estado específico (ej: "running" o "off")
// Reintenta cada 2 segundos hasta alcanzar el estado deseado o agotar el tiempo (timeout)
async function esperarEstadoVPS(estadoDeseado, timeout = 15000) {
  const interval = 2000; // Tiempo entre reintentos
  const maxTries = Math.ceil(timeout / interval); // Máximo de intentos permitidos

  for (let i = 0; i < maxTries; i++) {
    const actual = await obtenerEstadoBruto(); // Consultamos el estado actual del VPS
    if (actual === estadoDeseado) return; // Si es el estado deseado, salimos
    await new Promise((res) => setTimeout(res, interval)); // Esperamos antes del siguiente intento
  }

  // Si no se alcanza el estado esperado en el tiempo dado, lanzamos un error
  throw new Error(`Timeout esperando estado '${estadoDeseado}'`);
}

// Devuelve el estado "bruto" del servidor: "running" o "off"
async function obtenerEstadoBruto() {
  const res = await axios.get(`${HETZNER_API_URL}/servers/${SERVER_ID}`, {
    headers,
  });
  return res.data.server.status;
}

// Enciende el VPS real haciendo una llamada POST a la API de Hetzner
async function encenderVPS() {
  try {
    const res = await axios.post(
      `${HETZNER_API_URL}/servers/${SERVER_ID}/actions/poweron`,
      {},
      { headers }
    );

    console.log("Encendiendo VPS real:", res.data);

    // Esperamos hasta que el estado del VPS sea "running"
    await esperarEstadoVPS("running");

    return res.data;
  } catch (error) {
    console.error(
      "Error al encender VPS real:",
      error.response?.data || error.message
    );
    throw new Error("No se pudo encender el VPS real");
  }
}

// Apaga el VPS de forma forzada (poweroff), sin cerrar procesos limpiamente
async function apagarVPS() {
  try {
    const res = await axios.post(
      `${HETZNER_API_URL}/servers/${SERVER_ID}/actions/poweroff`,
      {},
      { headers }
    );

    console.log("Apagando VPS real:", res.data);

    // Esperamos hasta que el estado del VPS sea "off"
    await esperarEstadoVPS("off");

    return res.data;
  } catch (error) {
    console.error(
      "Error al apagar VPS real:",
      error.response?.data || error.message
    );
    throw new Error("No se pudo apagar el VPS real");
  }
}

// Reinicia el VPS (reboot) usando la API
async function reiniciarVPS() {
  try {
    const res = await axios.post(
      `${HETZNER_API_URL}/servers/${SERVER_ID}/actions/reboot`,
      {},
      { headers }
    );

    console.log("Reiniciando VPS real:", res.data);

    return res.data;
  } catch (error) {
    console.error(
      "Error al reiniciar VPS real:",
      error.response?.data || error.message
    );
    throw new Error("No se pudo reiniciar el VPS real");
  }
}

// Obtiene el estado actual del VPS, incluyendo:
// - Estado (online/offline)
// - IP pública
// - Uso simulado de CPU y RAM (si está online)
async function obtenerEstadoVPS() {
  try {
    const res = await axios.get(`${HETZNER_API_URL}/servers/${SERVER_ID}`, {
      headers,
    });

    const server = res.data.server;

    // Traducimos el estado "running" a "online", y cualquier otro a "offline"
    const estado = server.status === "running" ? "online" : "offline";

    // IP pública del servidor
    const ip = server.public_net.ipv4.ip;

    // Simulamos valores de CPU y RAM solo si el VPS está online
    const cpu =
      estado === "online" ? `${(Math.random() * 10 + 5).toFixed(1)}%` : "0%";

    const ram =
      estado === "online"
        ? `${(Math.random() * 3000 + 1000).toFixed(1)} / 15870.0 MB`
        : "0 MB";

    // Devolvemos los datos para mostrar en el panel
    return { estado, ip, cpu, ram };
  } catch (error) {
    console.error(
      "Error al obtener estado del VPS:",
      error.response?.data || error.message
    );
    throw new Error("No se pudo obtener el estado del VPS");
  }
}

// Exportamos las funciones para usarlas desde otros módulos (como rutas o controladores)
module.exports = {
  encenderVPS,
  apagarVPS,
  reiniciarVPS,
  obtenerEstadoVPS,
  esperarEstadoVPS,
  obtenerEstadoBruto,
};
