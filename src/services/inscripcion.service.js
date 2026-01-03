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

    // Obtener una inscripción por ID
    show(id) {
        return Api().get(`/inscripciones/${id}`);
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
    }
};