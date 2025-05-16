// Este archivo maneja la conexión a la base de datos SQLite y las operaciones relacionadas con los usuarios
// Importamos el módulo sqlite3
const sqlite3 = require("sqlite3").verbose();

// Crear y abrir la base de datos
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión a la base de datos SQLite establecida.");
  }
});

// Crear la tabla de usuarios si no existe
db.run(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, passwordHash TEXT, rol TEXT)"
);

// Función para registrar un nuevo usuario
function registrarUsuario(email, passwordHash, rol, callback) {
  db.run(
    "INSERT INTO users (email, passwordHash, rol) VALUES (?, ?, ?)",
    [email, passwordHash, rol],
    function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, this.lastID); // Retorna el ID del nuevo usuario
      }
    }
  );
}

// Función para buscar un usuario por su email
function obtenerUsuarioPorEmail(email, callback) {
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    callback(err, row); // Devuelve la fila (usuario) encontrada
  });
}

module.exports = {
  registrarUsuario,
  obtenerUsuarioPorEmail,
};
