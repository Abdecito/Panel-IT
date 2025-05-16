// Importamos React hooks necesarios
import { createContext, useContext, useState } from "react";

// Creamos un nuevo contexto global llamado SearchContext
// Este contexto nos permite compartir el estado de búsqueda entre componentes
const SearchContext = createContext();

// Componente proveedor que envuelve a los componentes hijos y les proporciona acceso al contexto
export function SearchProvider({ children }) {
  // Estado local para almacenar la búsqueda actual
  const [query, setQuery] = useState("");

  // Retornamos el proveedor del contexto con el valor actual y la función para modificarlo
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children} {/* Renderiza los componentes hijos que consumen el contexto */}
    </SearchContext.Provider>
  );
}

// Hook personalizado que permite a cualquier componente acceder al contexto de búsqueda
export function useSearch() {
  return useContext(SearchContext);
}
