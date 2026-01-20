import { Api } from "./Api.services";

export default {
    // Obtener inscripciones con paginación
    index(page = 1, limit = 100, q = "") {
        return Api().get(`/inscripciones?page=${page}&limit=${limit}&q=${q}`);
    },
    
    // Crear nueva inscripción
    store(datos) {
        return Api().post("/inscripciones", datos);
    },

    // Obtener una inscripción por ID (con relaciones básicas)
    show(id) {
        return Api().get(`/inscripciones/${id}`);
    },
    
    // Obtener inscripción con TODAS las relaciones (incluyendo horarios)
    getConRelaciones(id) {
        return Api().get(`/inscripciones/${id}?with=estudiante,modalidad,horarios,inscripcion_horarios,sucursal,entrenador`);
    },
    
    // Obtener solo los horarios de una inscripción
    getHorarios(id) {
        return Api().get(`/inscripciones/${id}/horarios`);
    },

    // Actualizar inscripción
    update(id, datos) {
        return Api().put(`/inscripciones/${id}`, datos);
    },

    // Eliminar inscripción
    delete(id) {
        return Api().delete(`/inscripciones/${id}`);
    },
    
    // Renovar inscripción
    renovar(id, datos) {
        return Api().post(`/inscripciones/${id}/renovar`, datos);
    },

    // Obtener inscripción activa por estudiante
    obtenerActivaPorEstudiante(estudianteId) {
        return Api().get(`/inscripciones/estudiante/${estudianteId}/activa`);
    },
    
    // Obtener todas las inscripciones de un estudiante
    obtenerPorEstudiante(estudianteId) {
        return Api().get(`/inscripciones/estudiante/${estudianteId}`);
    },
    
    // Obtener inscripciones por estado
    obtenerPorEstado(estado) {
        return Api().get(`/inscripciones/estado/${estado}`);
    }
};
// ¡NO agregues nada después de esta línea! El export ya terminó