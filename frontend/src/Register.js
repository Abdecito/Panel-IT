// Importamos React y los hooks necesarios
import React, { useState } from "react";
import axios from "axios"; // Cliente HTTP para hacer peticiones al backend
import { useNavigate } from "react-router-dom"; // Hook para redirigir programáticamente

function Register() {
  // Estados locales para los campos del formulario
  const [email, setEmail] = useState(""); // Email del nuevo usuario
  const [password, setPassword] = useState(""); // Contraseña del nuevo usuario
  const [rol, setRol] = useState(""); // Rol del nuevo usuario (admin o usuario)
  const [error, setError] = useState(""); // Mensaje de error en caso de fallo
  const [success, setSuccess] = useState(false); // Estado de éxito del registro

  const navigate = useNavigate(); // Hook para redireccionar al usuario

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      // Petición POST al backend con los datos del formulario
      await axios.post("http://localhost:3001/api/register", {
        email,
        password,
        rol,
      });
      setSuccess(true);     // Marca el registro como exitoso
      setError("");         // Limpia cualquier error previo
      setTimeout(() => navigate("/login"), 2000); // Redirige al login tras 2 segundos
    } catch (err) {
      console.error("Error en el registro:", err);
      // Si hay mensaje de error desde el backend lo muestra, si no muestra genérico
      const mensaje = err.response?.data?.mensaje || "Error desconocido";
      setError(mensaje); // Establece mensaje de error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      {/* Formulario de registro centrado vertical y horizontalmente */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Registrar nuevo usuario
        </h2>

        {/* Mensaje de error si lo hay */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Mensaje de éxito si el registro fue exitoso */}
        {success && (
          <p className="text-green-500 text-sm mb-4">
            ¡Usuario registrado exitosamente!
          </p>
        )}

        {/* Campo de correo */}
        <label className="block text-sm mb-1">Correo</label>
        <input
          type="email"
          placeholder="Correo"
          className="w-full px-4 py-2 mb-4 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Actualiza estado email
        />

        {/* Campo de contraseña */}
        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-4 py-2 mb-4 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Actualiza estado password
        />

        {/* Selector de rol */}
        <label className="block text-sm mb-1">Rol</label>
        <select
          className="w-full px-4 py-2 mb-4 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={rol}
          onChange={(e) => setRol(e.target.value)} // Actualiza estado rol
          required
        >
          <option value="">Selecciona un rol</option>
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        {/* Botón de envío */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Register;
