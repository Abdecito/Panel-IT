// Importamos React y el hook useState para manejar estado local
import React, { useState } from "react";

// Importamos axios para hacer peticiones HTTP
import axios from "axios";

// Hook de React Router para redirigir a otras rutas
import { useNavigate } from "react-router-dom";

// Componente funcional Login
function Login() {
  // Estado para el campo de correo electrónico
  const [email, setEmail] = useState("");

  // Estado para el campo de contraseña
  const [password, setPassword] = useState("");

  // Estado para mostrar mensajes de error
  const [error, setError] = useState("");

  // Hook de navegación para redireccionar al panel tras login exitoso
  const navigate = useNavigate();

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita recargar la página
    try {
      // Enviamos email y password al backend
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      // Si el login es exitoso, guardamos el token en localStorage
      localStorage.setItem("token", res.data.token);
      console.log("Token recibido:", res.data.token);

      // Redirige al panel principal
      navigate("/panel");
    } catch (err) {
      // Si ocurre un error, mostramos mensaje
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas");
    }
  };

  // JSX que representa la interfaz de inicio de sesión
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Título */}
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>

        {/* Mensaje de error si lo hay */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Campo de correo */}
        <label className="block text-sm mb-1">Correo</label>
        <input
          type="email"
          placeholder="Correo"
          className="w-full px-4 py-2 mb-4 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Actualiza estado
        />

        {/* Campo de contraseña */}
        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-4 py-2 mb-6 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Actualiza estado
        />

        {/* Botón para enviar el formulario */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

// Exportamos el componente para poder usarlo en el resto de la app
export default Login;
