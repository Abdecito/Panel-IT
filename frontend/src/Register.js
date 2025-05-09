// Importa React y los hooks necesarios
import React, { useState } from "react";

// Importa axios para enviar solicitudes HTTP al backend
import axios from "axios";

// Hook para redireccionar al usuario tras el registro
import { useNavigate } from "react-router-dom";

function Register() {
  // Estados locales para cada campo del formulario y mensajes de estado
  const [email, setEmail] = useState("");           // Email del nuevo usuario
  const [password, setPassword] = useState("");     // Contraseña
  const [rol, setRol] = useState("");               // Rol del usuario (usuario o admin)
  const [error, setError] = useState("");           // Mensaje de error si falla el registro
  const [success, setSuccess] = useState(false);    // Marca si el registro fue exitoso

  const navigate = useNavigate(); // Permite redirigir al usuario a otra ruta

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que se recargue la página

    try {
      // Envía los datos del nuevo usuario al backend
      const res = await axios.post("http://localhost:3001/api/register", {
        email,
        password,
        rol
      });

      // Si todo va bien, muestra mensaje de éxito y redirige a /login tras 2 segundos
      setSuccess(true);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Si hay error en la respuesta, muestra el mensaje recibido o uno genérico
      console.error("Error en el registro:", err);
      const mensaje = err.response?.data?.mensaje || "Error desconocido";
      setError(mensaje);
    }
  };

  return (
    // Contenedor centrado vertical y horizontalmente, con fondo gris claro
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Formulario con estilos simples y centrado */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Registrar nuevo usuario</h2>

        {/* Mensaje de error en rojo si el registro falla */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Mensaje de éxito en verde si el registro fue correcto */}
        {success && <p className="text-green-500 text-sm mb-3">¡Usuario registrado exitosamente!</p>}

        {/* Campo de correo */}
        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Campo de contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Selección de rol (obligatoria) */}
        <select
          className="w-full mb-3 p-2 border rounded"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          required // Evita que se envíe el formulario sin elegir un rol
        >
          <option value="">Selecciona un rol</option>
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        {/* Botón para enviar el formulario */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full p-2 rounded">
          Registrar
        </button>
      </form>
    </div>
  );
}

// Exporta el componente para usarlo en App.js
export default Register;
