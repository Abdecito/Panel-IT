// src/api.js

// Importamos Axios, una librería para hacer peticiones HTTP
import axios from "axios";

// Definimos la URL base para la API del backend
const API_URL = "http://localhost:3001/api";

// Función para obtener la lista de servidores desde la API
export const getServidores = async (token) => {
  const res = await axios.get(`${API_URL}/servidores`, {
    headers: { Authorization: `Bearer ${token}` }, // Enviamos el token JWT en el header
  });
  return res.data; // Devolvemos los datos de los servidores
};

// Función para encender un servidor simulado (por ID) a través de la API
export const encenderServidorAPI = async (id, token) => {
  await axios.post(`${API_URL}/servidores/${id}/encender`, {}, {
    headers: { Authorization: `Bearer ${token}` }, // Autenticación con token
  });
};

// Función para apagar un servidor simulado (por ID) a través de la API
export const apagarServidorAPI = async (id, token) => {
  await axios.post(`${API_URL}/servidores/${id}/apagar`, {}, {
    headers: { Authorization: `Bearer ${token}` }, // Autenticación con token
  });
};
