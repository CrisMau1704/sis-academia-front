// src/services/horario.service.js
import { Api } from "./Api.services";

export default {
  index(page = 1, limit = 10, q = "") {
    return Api().get(`/horarios?page=${page}&limit=${limit}&q=${q}`);
  },
  
  getAll() {
    return Api().get("/horarios");
  },

  show(id) {
    return Api().get(`/horarios/${id}`);
  },

  create(datos) {
    return Api().post("/horarios", datos);
  },

  update(id, datos) {
    return Api().put(`/horarios/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/horarios/${id}`);
  },
};