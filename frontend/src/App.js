import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";  // Componente de Login
import Panel from "./Panel";  // Componente del Panel de usuario
import Register from "./Register";  // Componente de registro
import { ToastContainer } from "react-toastify"; // Componente para mostrar notificaciones
import "react-toastify/dist/ReactToastify.css"; // Estilos de notificaciones


// Protege el acceso a rutas privadas
const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/panel"
            element={
              <RutaPrivada>
                <Panel />
              </RutaPrivada>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        {/* Contenedor de notificaciones */}
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </Router>
  );
}

export default App;
