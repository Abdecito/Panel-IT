import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      console.log("Token recibido:", res.data.token);
      navigate("/panel");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1e293b] p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <label className="block text-sm mb-1">Correo</label>
        <input
          type="email"
          placeholder="Correo"
          className="w-full px-4 py-2 mb-4 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-4 py-2 mb-6 text-white bg-[#334155] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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

export default Login;
