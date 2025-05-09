// Importa React y componentes necesarios de react-router-dom para la navegación
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importa los componentes principales de la aplicación
import Login from "./Login";          // Componente de Login
import Panel from "./Panel";          // Componente del Panel de usuario (zona protegida)
import Register from "./Register";    // Componente de registro de usuarios

// Importa el contenedor de notificaciones y sus estilos
import { ToastContainer } from "react-toastify"; // Contenedor para mostrar notificaciones
import "react-toastify/dist/ReactToastify.css";  // Estilos CSS para las notificaciones

// Componente que protege rutas privadas
// Si no hay token en localStorage, redirige al login
const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token"); // Obtiene el token JWT del almacenamiento local
  // Si hay token, renderiza el componente protegido (children); si no, redirige a /login
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router> {/* Envuelve toda la app en el componente de router para habilitar navegación */}
      <>
        <Routes>
          {/* Ruta pública para iniciar sesión */}
          <Route path="/login" element={<Login />} />

          {/* Ruta pública para registrarse */}
          <Route path="/register" element={<Register />} />

          {/* Ruta protegida, solo accesible si hay token */}
          <Route
            path="/panel"
            element={
              <RutaPrivada> {/* Envolvemos el componente Panel con RutaPrivada */}
                <Panel />
              </RutaPrivada>
            }
          />

          {/* Ruta comodín: cualquier otra URL redirige al login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        {/* Contenedor de notificaciones: se muestra en la parte superior derecha */}
        {/* autoClose indica que las notificaciones se cerrarán automáticamente tras 3 segundos */}
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </Router>
  );
}

// Exporta el componente principal de la app para que pueda ser usado en index.js
export default App;
// Este archivo es el punto de entrada de la aplicación React. Aquí se configuran las rutas y se importan los componentes necesarios.
// El componente App utiliza react-router-dom para manejar la navegación entre diferentes vistas de la aplicación.