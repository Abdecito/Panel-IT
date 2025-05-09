// Importamos las dependencias necesarias
const express = require("express");  // Framework web para Node.js
const cors = require("cors");        // Middleware para permitir peticiones entre dominios (CORS)
const jwt = require("jsonwebtoken"); // Librería para manejar los tokens JWT
const bcrypt = require("bcryptjs");  // Librería para cifrar y comparar contraseñas
require("dotenv").config();          // Cargar las variables de entorno desde el archivo .env
const db = require("./db");          // Importamos las funciones de la base de datos (db.js)
const si = require("systeminformation"); // Librería para obtener información del sistema

// Inicializamos la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3001;  // Puerto en el que escuchará la API
const JWT_SECRET = process.env.JWT_SECRET; // Clave secreta para firmar los tokens JWT

// Middleware global
app.use(cors());             // Permite peticiones desde cualquier origen (Cross-Origin Resource Sharing)
app.use(express.json());     // Permite recibir JSON en el body de las peticiones HTTP

// Ruta de prueba para verificar si el backend está funcionando
app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });  // Respuesta simple en formato JSON
});


// Ruta para registrar un nuevo usuario
// Recibe email, password y rol. Si el usuario no existe, lo registra.
app.post("/api/register", (req, res) => {
  const { email, password, rol } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  // Verificamos si el usuario ya existe
  db.obtenerUsuarioPorEmail(email, (err, row) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error en la base de datos" });
    }

    if (row) {
      return res.status(400).json({ mensaje: "Usuario ya registrado" });
    }

    // Si el usuario no existe, ciframos la contraseña
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insertamos el nuevo usuario en la base de datos
    db.registrarUsuario(email, passwordHash, rol, (err, userId) => {
      if (err) {
        return res.status(500).json({ mensaje: "Error al registrar usuario" });
      }
      res.status(201).json({ mensaje: "Usuario registrado exitosamente" });
    });
  });
});

// Ruta de login: recibe email y contraseña, devuelve token JWT si las credenciales son válidas
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Login recibido:", req.body); // Mostrar los datos recibidos en el login

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Faltan credenciales" });
  }

  // Comprobamos si el usuario existe en la base de datos
  db.obtenerUsuarioPorEmail(email, (err, row) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error en la base de datos" });
    }

    if (!row) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    // Comparamos la contraseña recibida con el hash guardado en la base de datos
    const passwordValida = bcrypt.compareSync(password, row.passwordHash);
    console.log("¿Contraseña válida?", passwordValida);  // Mostrar si la contraseña es válida o no

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Si las credenciales son válidas, generamos un token JWT
    const token = jwt.sign({ email: row.email, rol: row.rol }, JWT_SECRET, { expiresIn: "2h" });

    // Enviamos el token al cliente
    res.json({ token });
  });
});

// Middleware para verificar el token en rutas protegidas
// Verifica que el token esté presente y sea válido
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1]; // Extraemos el token del encabezado de la solicitud

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verificamos la validez del token
    req.usuario = decoded; // Si es válido, guardamos los datos del usuario en req
    next(); // Continuamos con la ejecución de la siguiente función
  } catch (err) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}

// Lista de servidores simulados con estado persistente
const servidoresSimulados = [
  { id: 1, nombre: "Servidor Principal", ip: "10.10.10.1", estado: "offline", servicios: ["Active Directory", "DNS", "DHCP"] },
  { id: 2, nombre: "Servidor Secundario", ip: "10.10.10.2", estado: "offline", servicios: ["Servicios de impresión", "Servicios de archivos", "FTP"] },
  { id: 3, nombre: "VPS", ip: "10.10.10.3", estado: "offline", servicios: ["Hosting web", "Base de datos", "Docker"] },
  { id: 4, nombre: "VPS", ip: "10.10.10.4", estado: "offline", servicios: ["Hosting web", "Base de datos", "Docker"] },
  { id: 5, nombre: "GPU", ip: "10.10.10.5", estado: "offline", servicios: ["Hosting web", "Base de datos", "Docker"] },
];

// Obtener todos los servidores (simulados + real)
// Obtener todos los servidores (simulados + real)
app.get("/api/servidores", verificarToken, async (req, res) => {
  // Asignar datos solo si el servidor está "online"
  const simuladosConDatos = servidoresSimulados.map((s) => {
    const cpu = s.estado === "online" ? `${Math.floor(Math.random() * 50)}%` : "0%";
    const ram = s.estado === "online" ? `${(Math.random() * 8).toFixed(1)} GB` : "0 GB";
    return { ...s, cpu, ram };
  });

  try {
    const [cpu, mem, net] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkInterfaces(),
    ]);

    const real = {
      id: "local-pc",
      nombre: "VPS Real",
      ip: net.find((n) => n.ip4 && !n.internal)?.ip4 || "127.0.0.1",
      cpu: `${cpu.currentLoad.toFixed(1)}%`,
      ram: `${(mem.used / 1024 / 1024).toFixed(1)} / ${(mem.total / 1024 / 1024).toFixed(1)} MB`,
      estado: "online",
      servicios: ["Hosting", "Node.js", "React"],
    };

    res.json([real, ...simuladosConDatos]);
  } catch (error) {
    console.error("Error al obtener datos locales:", error);
    res.json([{
      id: "local-pc",
      nombre: "VPS Real",
      ip: "127.0.0.1",
      cpu: "0%",
      ram: "0 MB",
      estado: "offline",
      servicios: [],
    }, ...simuladosConDatos]);
  }
});


// Actualizar estado de un servidor simulado
app.post("/api/servidores/:id/estado", verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body;

  const servidor = servidoresSimulados.find(s => s.id === id);
  if (!servidor) {
    return res.status(404).json({ mensaje: "Servidor no encontrado" });
  }

  if (!["online", "offline"].includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido" });
  }

  servidor.estado = estado;
  res.json({ mensaje: `Estado del servidor ${id} actualizado a ${estado}` });
});

// Inicializamos el servidor y comenzamos a escuchar peticiones en el puerto definido
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});


// Ruta raíz del servidor
app.get("/", (req, res) => {
  res.send("Backend funcionando correctamente");
});