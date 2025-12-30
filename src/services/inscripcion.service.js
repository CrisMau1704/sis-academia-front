// src/services/inscripcion.service.js
import { Api } from "./Api.services";

export default {
  index(page = 1, limit = 10, q = "") {
    return Api().get(`/inscripciones?page=${page}&limit=${limit}&q=${q}`);
  },
  
  getAll() {
    return Api().get("/inscripciones");
  },

  show(id) {
    return Api().get(`/inscripciones/${id}`);
  },

  create(datos) {
    return Api().post("/inscripciones", datos);
  },

  update(id, datos) {
    return Api().put(`/inscripciones/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/inscripciones/${id}`);
  },

  asociarHorario(inscripcionId, horarioId, datosPivote = {}) {
    return Api().post(`/inscripciones/${inscripcionId}/horarios`, {
      horario_id: horarioId,
      ...datosPivote
    });
  },

  desasociarHorario(inscripcionId, horarioId) {
    return Api().delete(`/inscripciones/${inscripcionId}/horarios/${horarioId}`);
  },

  renovar(id) {
    return Api().post(`/inscripciones/${id}/renovar`);
  }
};