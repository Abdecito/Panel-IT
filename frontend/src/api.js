import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getServidores = async (token) => {
  const res = await axios.get(`${API_URL}/servidores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const actualizarEstadoServidor = async (id, estado, token) => {
  await axios.post(
    `${API_URL}/servidores/${id}/estado`,
    { estado },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const restablecerServidoresSimulados = async (token, ids) => {
  // Apagar
  await Promise.all(
    ids.map((id) =>
      axios.post(
        `${API_URL}/servidores/${id}/estado`,
        { estado: "offline" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    )
  );

  // Encender
  await Promise.all(
    ids.map((id) =>
      axios.post(
        `${API_URL}/servidores/${id}/estado`,
        { estado: "online" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    )
  );
};
