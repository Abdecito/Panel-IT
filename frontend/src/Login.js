// Importa React y los hooks necesarios
import React, { useState } from "react";

// Importa axios para hacer peticiones HTTP
import axios from "axios";

// Hook de React Router para redirigir al usuario
import { useNavigate } from "react-router-dom";

function Login() {
  // Estados locales para email, password y error
  const [email, setEmail] = useState("");         // Almacena el email del usuario
  const [password, setPassword] = useState("");   // Almacena la contraseña
  const [error, setError] = useState("");         // Mensaje de error si las credenciales fallan

  const navigate = useNavigate(); // Hook para redirigir programáticamente

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // Envía los datos al backend usando axios
      const res = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      // Guarda el token recibido en localStorage para futuras autenticaciones
      localStorage.setItem("token", res.data.token);
      console.log("Token recibido:", res.data.token); // Útil para depuración

      // Redirige al usuario al panel protegido tras login exitoso
      navigate("/panel");
    } catch (err) {
      // Si falla, muestra mensaje de error en la interfaz
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas");
    }
  };

  return (
    // Contenedor centrado vertical y horizontalmente, con fondo gris claro
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Formulario con estilo simple y centrado */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>

        {/* Si hay un error, se muestra aquí */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Campo de correo electrónico */}
        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Actualiza el estado email
        />

        {/* Campo de contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Actualiza el estado password
        />

        {/* Botón para enviar el formulario */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full p-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}

// Exporta el componente para ser usado en App.js
export default Login;
