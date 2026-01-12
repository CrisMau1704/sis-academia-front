import { Api } from "./Api.services";

export default {
    // Obtener estudiantes con paginación y búsqueda
    index(page = 1, limit = 100, q = "") {
        return Api().get(`/estudiantes?page=${page}&limit=${limit}&q=${q}`);
    },
    
    // Crear nuevo estudiante
    store(datos) {
        return Api().post("/estudiantes", datos);
    },

    // Obtener un estudiante por ID
    show(id) {
        return Api().get(`/estudiantes/${id}`);
    },

    // Actualizar estudiante
    update(id, datos) {
        return Api().put(`/estudiantes/${id}`, datos);
    },

    // Eliminar estudiante
    delete(id) {
        return Api().delete(`/estudiantes/${id}`);
    },
    
    // Obtener todos los estudiantes (sin paginación)
    obtenerTodos() {
        return Api().get('/estudiantes'); // <-- CAMBIAR axios por Api()
    },
      conInscripcionesActivas() {
        return api.get('/estudiantes/con-inscripciones-activas');
    },
    obtenerInscripcionActiva(estudianteId) {
    return Api().get(`/estudiantes/${estudianteId}/inscripcion-activa`);
  },
  inscripcionActiva(estudianteId) {
    return Api().get(`/estudiantes/${estudianteId}/inscripcion-activa`);
  }
};