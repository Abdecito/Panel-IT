import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Panel from "./Panel";
import DashboardPage from "./DashboardPage";
import Layout from "./Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SearchProvider } from "./context/SearchContext"; 
import TerminalWindow from "./TerminalWindow";
import SettingsPage from "./SettingsPage";

// Ruta protegida
const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <SearchProvider> {/* ✅ Envolvemos todo con SearchProvider */}
      <Router>
        <Routes>
  {/* Públicas */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* TerminalWindow: protegida pero independiente del Layout */}
  <Route
    path="/terminal-window"
    element={
      <RutaPrivada>
        <TerminalWindow />
      </RutaPrivada>
    }
  />

  {/* Protegidas con Layout */}
  <Route
    path="/"
    element={
      <RutaPrivada>
        <Layout />
      </RutaPrivada>
    }
  >
    <Route index element={<Navigate to="/dashboard" />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="panel" element={<Panel />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/login" />} />
</Routes>

        <ToastContainer position="top-right" autoClose={1250} />
      </Router>
    </SearchProvider>
  );
}

export default App;
