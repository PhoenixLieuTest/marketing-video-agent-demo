import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:18789",
  timeout: 60000,
});

export default api;
