const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("./db");
const si = require("systeminformation");
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

// Usuarios
app.post("/api/register", (req, res) => {
  const { email, password, rol } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  db.obtenerUsuarioPorEmail(email, (err, row) => {
    if (err) return res.status(500).json({ mensaje: "Error en la base de datos" });
    if (row) return res.status(400).json({ mensaje: "Usuario ya registrado" });

    const passwordHash = bcrypt.hashSync(password, 10);
    db.registrarUsuario(email, passwordHash, rol, (err, userId) => {
      if (err) return res.status(500).json({ mensaje: "Error al registrar usuario" });
      res.status(201).json({ mensaje: "Usuario registrado exitosamente" });
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ mensaje: "Faltan credenciales" });

  db.obtenerUsuarioPorEmail(email, (err, row) => {
    if (err) return res.status(500).json({ mensaje: "Error en la base de datos" });
    if (!row) return res.status(401).json({ mensaje: "Usuario no encontrado" });

    const passwordValida = bcrypt.compareSync(password, row.passwordHash);
    if (!passwordValida) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign({ email: row.email, rol: row.rol }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  });
});

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}

// Estado VPS real en memoria
let vpsReal = {
  id: "local-pc",
  nombre: "VPS Real",
  ip: "127.0.0.1",
  estado: "offline",
  servicios: ["Hosting", "Node.js", "React"],
};

// Servidores simulados
const servidoresSimulados = [
  { id: 1, nombre: "Servidor Principal", ip: "10.10.10.1", estado: "offline", servicios: ["Active Directory", "DNS", "DHCP"] },
  { id: 2, nombre: "Servidor Secundario", ip: "10.10.10.2", estado: "offline", servicios: ["Servicios de impresión", "Servicios de archivos", "FTP"] },
  { id: 3, nombre: "VPS", ip: "10.10.10.3", estado: "offline", servicios: ["Hosting web", "Base de datos", "Docker"] },
  { id: 4, nombre: "VPS", ip: "10.10.10.4", estado: "offline", servicios: ["Wordpress", "MySQL", "Kubernetes"] },
  { id: 5, nombre: "GPU", ip: "10.10.10.5", estado: "offline", servicios: ["Machine Learning", "Renderizado", "Docker"] },
];

// Ruta principal para obtener todos los servidores
app.get("/api/servidores", verificarToken, async (req, res) => {
  const simuladosConDatos = servidoresSimulados.map((s) => {
    const cpu = s.estado === "online" ? `${Math.floor(Math.random() * 40) + 10}%` : "0%";
    const ram = s.estado === "online" ? `${(Math.random() * 6 + 2).toFixed(1)} / 16.0 GB` : "0 GB";
    return { ...s, cpu, ram };
  });

  try {
    const [cpu, mem, net] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkInterfaces(),
    ]);

    const ip = net.find((n) => n.ip4 && !n.internal)?.ip4 || "127.0.0.1";
    vpsReal.ip = ip;
    vpsReal.cpu = vpsReal.estado === "online" ? `${cpu.currentLoad.toFixed(1)}%` : "0%";
    vpsReal.ram = vpsReal.estado === "online"
      ? `${(mem.used / 1024 / 1024).toFixed(1)} / ${(mem.total / 1024 / 1024).toFixed(1)} MB`
      : "0 MB";

    res.json([vpsReal, ...simuladosConDatos]);
  } catch (error) {
    console.error("Error al obtener datos locales:", error);
    vpsReal.cpu = "0%";
    vpsReal.ram = "0 MB";
    res.json([vpsReal, ...simuladosConDatos]);
  }
});

// Encender/apagar servidores simulados
app.post("/api/servidores/:id/encender", verificarToken, (req, res) => {
  const id = req.params.id;

  if (id === "local-pc") {
    vpsReal.estado = "online";
    return res.json({ mensaje: "VPS Real encendido" });
  }

  const servidor = servidoresSimulados.find((s) => s.id === parseInt(id));
  if (!servidor) return res.status(404).json({ mensaje: "Servidor no encontrado" });

  servidor.estado = "online";
  res.json({ mensaje: `Servidor ${servidor.nombre} encendido` });
});

app.post("/api/servidores/:id/apagar", verificarToken, (req, res) => {
  const id = req.params.id;

  if (id === "local-pc") {
    vpsReal.estado = "offline";
    return res.json({ mensaje: "VPS Real apagado" });
  }

  const servidor = servidoresSimulados.find((s) => s.id === parseInt(id));
  if (!servidor) return res.status(404).json({ mensaje: "Servidor no encontrado" });

  servidor.estado = "offline";
  res.json({ mensaje: `Servidor ${servidor.nombre} apagado` });
});

// Iniciar servidor Express
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});
