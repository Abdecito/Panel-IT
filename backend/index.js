const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const db = require("./db");
const si = require("systeminformation");
const hetzner = require("./hetzner");
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require("fs");

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

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

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

// Obtener todos los servidores incluyendo estado real del VPS
app.get("/api/servidores", verificarToken, async (req, res) => {
  const simuladosConDatos = servidoresSimulados.map((s) => {
    const cpu = s.estado === "online" ? `${Math.floor(Math.random() * 40) + 10}%` : "0%";
    const ram = s.estado === "online" ? `${(Math.random() * 6 + 2).toFixed(1)} / 16.0 GB` : "0 GB";
    return { ...s, cpu, ram };
  });

  try {
    const estadoVPS = await hetzner.obtenerEstadoVPS();
    vpsReal.estado = estadoVPS.estado;
    vpsReal.ip = estadoVPS.ip;
    vpsReal.cpu = estadoVPS.cpu;
    vpsReal.ram = estadoVPS.ram;
  } catch (err) {
    console.error("Error al obtener estado del VPS real:", err);
    vpsReal.estado = "offline";
    vpsReal.cpu = "0%";
    vpsReal.ram = "0 MB";
  }

  res.json([vpsReal, ...simuladosConDatos]);
});

// Encender servidor
app.post("/api/servidores/:id/encender", verificarToken, async (req, res) => {
  const id = req.params.id;

  if (id === "local-pc") {
    try {
      await hetzner.encenderVPS();
      vpsReal.estado = "online";
      return res.json({ mensaje: "VPS Real encendido" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error al encender el VPS real" });
    }
  }

  const servidor = servidoresSimulados.find((s) => s.id === parseInt(id));
  if (!servidor) return res.status(404).json({ mensaje: "Servidor no encontrado" });

  servidor.estado = "online";
  res.json({ mensaje: `Servidor ${servidor.nombre} encendido` });
});

// Apagar servidor
app.post("/api/servidores/:id/apagar", verificarToken, async (req, res) => {
  const id = req.params.id;

  if (id === "local-pc") {
    try {
      await hetzner.apagarVPS();
      vpsReal.estado = "offline";
      return res.json({ mensaje: "VPS Real apagado" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error al apagar el VPS real" });
    }
  }

  const servidor = servidoresSimulados.find((s) => s.id === parseInt(id));
  if (!servidor) return res.status(404).json({ mensaje: "Servidor no encontrado" });

  servidor.estado = "offline";
  res.json({ mensaje: `Servidor ${servidor.nombre} apagado` });
});

// Reiniciar servidor

app.post("/api/servidores/:id/reiniciar", verificarToken, async (req, res) => {
  const id = req.params.id;

  // Función auxiliar para esperar
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  if (id === "local-pc") {
    try {
      await hetzner.apagarVPS();
      await sleep(10000); // Esperar 10 segundos
      await hetzner.encenderVPS();
      return res.json({ mensaje: "VPS Real reiniciado" });
    } catch (err) {
      console.error("Error al reiniciar VPS real:", err);
      return res.status(500).json({ mensaje: "Error al reiniciar el VPS real" });
    }
  }

  // Reiniciar un servidor simulado
  const servidor = servidoresSimulados.find((s) => s.id === parseInt(id));
  if (!servidor) return res.status(404).json({ mensaje: "Servidor no encontrado" });

  servidor.estado = "offline";
  await sleep(2000);
  servidor.estado = "online";

  res.json({ mensaje: `Servidor ${servidor.nombre} reiniciado` });
});





// SSH 
app.post("/api/ssh", authenticateToken, async (req, res) => {
  const { comando } = req.body;
  if (!comando) return res.status(400).json({ error: "Comando vacío" });

  const ssh = new NodeSSH(); // ✅ crear instancia dentro o antes del handler

  try {
    const privateKey = fs.readFileSync("/root/.ssh/id_rsa", "utf8"); // ✅ lee el contenido

    await ssh.connect({
      host: "138.199.213.60",
      username: "root",
      privateKey: privateKey,
    });

    const resultado = await ssh.execCommand(comando);
    console.log("Salida:", resultado.stdout);
    console.log("Error:", resultado.stderr);
    res.json({ stdout: resultado.stdout, stderr: resultado.stderr });
  } catch (err) {
    console.error("Error en /api/ssh:", err);
    res.status(500).json({ error: "Error al ejecutar el comando SSH" });
  }
});



// Iniciar servidor Express
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});



// Este archivo es el backend de la aplicación. Aquí se configuran las rutas y se manejan las peticiones HTTP.
// Se utiliza Express para crear un servidor que escucha en el puerto definido en la variable PORT.
// También se utiliza JWT para la autenticación y bcrypt para el hash de contraseñas.
// Además, se integra con una base de datos SQLite para almacenar usuarios y sus credenciales.
// También se simulan servidores y se integran con la API de Hetzner para encender y apagar VPS reales.
// Las rutas están protegidas por un middleware que verifica el token JWT en las cabeceras de las peticiones.
// Se utilizan variables de entorno para almacenar información sensible como el secreto del JWT.
// El servidor escucha en todas las interfaces de red disponibles 






//Cuando este en producción reemplazar esta ruta /api/ssh por este bloque:

/*
const { exec } = require("child_process");
const fs = require("fs");
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

const modoEjecucion = process.env.MODO_EJECUCION || "ssh"; // default: ssh

app.post("/api/ssh", authenticateToken, async (req, res) => {
  const { comando } = req.body;
  if (!comando) return res.status(400).json({ error: "Comando vacío" });

  try {
    if (modoEjecucion === "local") {
      //  Ejecutar comando directamente (modo producción)
      exec(comando, (error, stdout, stderr) => {
        if (error) {
          console.error("Error al ejecutar local:", error.message);
          return res.status(500).json({ error: "Error al ejecutar comando local" });
        }
        res.json({ stdout: stdout.trim(), stderr: stderr.trim() });
      });
    } else {
      //  Ejecutar comando por SSH (modo desarrollo)
      const privateKey = fs.readFileSync("/home/tu_usuario/.ssh/id_rsa", "utf8"); // Ajusta ruta si no usas root
      await ssh.connect({
        host: "138.199.213.60",
        username: "root",
        privateKey: privateKey,
      });
      const resultado = await ssh.execCommand(comando);
      res.json({ stdout: resultado.stdout, stderr: resultado.stderr });
    }
  } catch (err) {
    console.error("Error en /api/ssh:", err);
    res.status(500).json({ error: "Error inesperado al ejecutar el comando" });
  }
});
*/


// Y cuando este en el vps cambiar la variables de entorno a modoEjecucion=local