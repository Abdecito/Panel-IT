import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3001/api/register", {
        email,
        password,
        rol
      });

      setSuccess(true);
      setError("");
      setTimeout(() => navigate("/login"), 2000); // Redirige al login tras 2 segundos
    } catch (err) {
        console.error("Error en el registro:", err);
        const mensaje = err.response?.data?.mensaje || "Error desconocido";
        setError(mensaje);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Registrar nuevo usuario</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">¡Usuario registrado exitosamente!</p>}

        <input
          type="email"
          placeholder="Correo"
          className="w-full mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
            className="w-full mb-3 p-2 border rounded"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            required
        >
            <option value="">Selecciona un rol</option>
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
        </select>

        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full p-2 rounded">
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Register;
