import { Api } from "./Api.services";

export default {
  getAll() {
    return Api().get("/asistencias");
  },

  show(id) {
    return Api().get(`/asistencias/${id}`);
  },

  create(datos) {
    return Api().post("/asistencias/registrar", datos);
  },

  update(id, datos) {
    return Api().put(`/asistencias/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/asistencias/${id}`);
  },

  getPorInscripcion(id) {
    return Api().get(`/asistencias/inscripcion/${id}`);
  }
};
