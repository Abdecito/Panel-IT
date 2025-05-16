// Importaciones necesarias de React y librerías
import React, { useState, useEffect } from "react";
import {
  LogOut, Server, Terminal, Home, Settings, Pin,
  BadgeCheck, Search, LayoutDashboard,
} from "lucide-react"; // Iconos modernos
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"; // Enrutamiento
import { toast } from "react-toastify"; // Notificaciones
import { jwtDecode } from "jwt-decode"; // Decodifica el JWT para obtener el rol
import { useSearch } from "./context/SearchContext"; // Contexto global de búsqueda
import { useRef } from "react"; // Para referenciar el input de búsqueda
import SettingsPage from "./SettingsPage"; // No se usa aquí, pero puede estar en uso en otra ruta

function Layout() {
  // Determina si el sidebar está fijado manualmente
  const [fijado, setFijado] = useState(false);

  // Detecta si el usuario tiene el cursor sobre el sidebar
  const [hover, setHover] = useState(false);

  // Almacena el rol del usuario extraído del token
  const [rol, setRol] = useState(null);

  // Calcula si el sidebar está expandido (por hover o fijado)
  const expandido = fijado || hover;

  const location = useLocation(); // Para saber la ruta actual
  const navigate = useNavigate(); // Permite navegar programáticamente
  const { setQuery } = useSearch(); // Permite actualizar la búsqueda global
  const inputRef = useRef(); // Referencia al input de búsqueda
  const [inputValue, setInputValue] = useState(""); // Valor actual del input

  // Atajo de teclado: Ctrl + K para enfocar el input de búsqueda
  useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus(); // Enfoca el input
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // Al montar, decodifica el token JWT y extrae el rol
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodificado = jwtDecode(token);
        setRol(decodificado.rol);
      } catch (err) {
        console.error("Token inválido");
      }
    }
  }, []);

  // Cierra la sesión: elimina el token, muestra notificación y redirige
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Cabecera */}
      <header className="bg-gray-850 border-b border-gray-700 px-6 py-4 shadow w-full grid grid-cols-3 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 col-start-1">
          <h1 className="text-xl font-bold text-red-500">TFG</h1>
          <span className="text-gray-400 text-sm">Cloud</span>
        </div>

        {/* Input de búsqueda */}
        <div className="flex justify-center col-start-2">
          <div className="relative w-full max-w-md">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                setInputValue(value); // Actualiza el input
                setQuery(value); // Actualiza el contexto global
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setInputValue("");
                  setQuery("");
                  inputRef.current.blur();
                }
              }}
              placeholder="Search..."
              className="w-full pl-9 pr-24 py-[6px] text-sm rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* Icono lupa */}
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />

            {/* Botón para limpiar input */}
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  setQuery("");
                  inputRef.current.focus();
                }}
                className={`absolute right-20 top-1/2 -translate-y-1/2 transform
                  text-gray-400 hover:text-white text-xl font-bold leading-[0]
                  transition-all duration-200 ease-in-out
                  hover:rotate-90 hover:bg-gray-700 hover:scale-110 p-1 rounded-full
                  opacity-${inputValue ? "100" : "0"} scale-${inputValue ? "100" : "95"}
                  pointer-events-${inputValue ? "auto" : "none"}`}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}

            {/* Ayuda visual: Ctrl K */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded">
              Ctrl K
            </div>
          </div>
        </div>

        {/* Rol del usuario */}
        {rol && (
          <div className="flex items-center gap-2 text-sm text-gray-300 justify-end col-start-3">
            <BadgeCheck size={18} className="text-blue-400" />
            <span className="capitalize">{rol}</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar lateral */}
        <aside
          className={`bg-gray-800 flex flex-col transition-[width] duration-300 ease-in-out ${
            expandido ? "w-64" : "w-20"
          }`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* Botón fijar/desfijar sidebar */}
          <div className="p-2 w-full flex justify-end">
            <button
              onClick={() => setFijado(!fijado)}
              className="text-gray-400 hover:text-white transition-transform cursor-pointer"
              title={fijado ? "Desfijar sidebar" : "Fijar sidebar"}
            >
              <Pin
                size={20}
                className={`transition-transform duration-300 ${
                  fijado ? "rotate-45 text-blue-400" : "text-gray-400"
                }`}
              />
            </button>
          </div>

          {/* Ítems del menú */}
          <nav className="px-2 space-y-2">
            <NavItem
              to="/panel"
              icon={<Server size={20} />}
              text="Servidores"
              expandido={expandido}
              active={location.pathname === "/panel"}
            />
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
              expandido={expandido}
              active={location.pathname === "/dashboard"}
            />
            <NavItem
              icon={<Terminal size={20} />}
              text="Terminal"
              expandido={expandido}
              onClick={() =>
                window.open("/terminal-window", "_blank", "width=900,height=600")
              }
              active={false}
            />
            <NavItem
              to="/settings"
              icon={<Settings size={20} />}
              text="Configuración"
              expandido={expandido}
              active={location.pathname === "/settings"}
            />
          </nav>

          {/* Botón cerrar sesión al fondo */}
          <div className="mt-auto px-2 pb-4">
            <NavItem
              icon={<LogOut size={20} />}
              text="Cerrar sesión"
              expandido={expandido}
              onClick={cerrarSesion}
              active={false}
            />
          </div>
        </aside>

        {/* Zona de contenido dinámico según la ruta */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-950 text-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, text, to, onClick, expandido, active }) {
  const content = (
    <>
      <span className="w-6 flex justify-center">{icon}</span>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expandido ? "ml-2 max-w-[200px] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        <span className="whitespace-nowrap">{text}</span>
      </div>
    </>
  );

  return (
    <div className="group relative">
      {to ? (
        // Si tiene 'to', renderiza un <Link> de React Router
        <Link
          to={to}
          className={`flex items-center px-2 py-2 transition-all duration-200 ${
            active ? "text-white font-semibold" : "text-gray-300 hover:text-white"
          }`}
        >
          {content}
        </Link>
      ) : (
        // Si no tiene 'to', es un botón (ej: terminal o logout)
        <button
          onClick={onClick}
          className="flex items-center px-2 py-2 text-red-400 hover:text-gray-300 text-sm w-full transition-all duration-200"
        >
          {content}
        </button>
      )}

      {/* Tooltip si el sidebar está colapsado */}
      {!expandido && (
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {text}
        </span>
      )}
    </div>
  );
}

// Exporta el componente Layout como el componente por defecto
// para que pueda ser usado en otras partes de la aplicación
export default Layout;
