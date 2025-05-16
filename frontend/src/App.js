// Importaciones necesarias de React y React Router
import React from "react";
import {
  BrowserRouter as Router, // Enrutador basado en el historial del navegador
  Routes, // Contenedor de todas las rutas
  Route, // Define una ruta individual
  Navigate, // Componente para redirigir
} from "react-router-dom";

// Importamos los componentes de las distintas vistas
import Login from "./Login";
import Register from "./Register";
import Panel from "./Panel";
import DashboardPage from "./DashboardPage";
import Layout from "./Layout";
import TerminalWindow from "./TerminalWindow";
import SettingsPage from "./SettingsPage";

// ToastContainer para mostrar notificaciones en pantalla
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Estilos de las notificaciones

// Contexto global para búsqueda
import { SearchProvider } from "./context/SearchContext";

// ========== COMPONENTE DE RUTA PROTEGIDA ==========
// Si no hay token en localStorage, redirige al login
const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

// ========== COMPONENTE PRINCIPAL DE LA APLICACIÓN ==========
function App() {
  return (
    // Envolvemos toda la app con el contexto de búsqueda
    <SearchProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ruta protegida independiente (sin Layout) */}
          <Route
            path="/terminal-window"
            element={
              <RutaPrivada>
                <TerminalWindow />
              </RutaPrivada>
            }
          />

          {/* Grupo de rutas protegidas que comparten el Layout */}
          <Route
            path="/"
            element={
              <RutaPrivada>
                <Layout /> {/* Layout común para dashboard, panel y settings */}
              </RutaPrivada>
            }
          >
            {/* Redirige al dashboard por defecto si entras a "/" */}
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="panel" element={<Panel />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Ruta por defecto (catch-all): redirige a login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        {/* Componente que muestra los toasts (notificaciones emergentes) */}
        <ToastContainer position="top-right" autoClose={1250} />
      </Router>
    </SearchProvider>
  );
}

export default App; // Exportamos el componente principal para usarlo en index.js
// El componente App es el punto de entrada de la aplicación y maneja las rutas y la navegación entre diferentes vistas.
// El componente RutaPrivada se encarga de proteger las rutas que requieren autenticación.