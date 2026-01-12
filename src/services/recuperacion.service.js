// recuperacion.service.js
import { Api } from "./Api.services"; // Importamos la función Api

const recuperacionService = {
    // Listar recuperaciones
    index(page = 1, perPage = 10, filtro = '', estado = 'programada') {
        return Api().get('/recuperaciones', {
            params: { page, per_page: perPage, filtro, estado }
        });
    },

    // Crear recuperación
    store(data) {
        return Api().post('/recuperaciones', data);
    },

    // Actualizar recuperación
    update(id, data) {
        return Api().put(`/recuperaciones/${id}`, data);
    },

    // Completar recuperación
    completar(id, data = {}) {
        return Api().put(`/recuperaciones/${id}/completar`, data);
    },

    // Cancelar recuperación
    destroy(id) {
        return Api().delete(`/recuperaciones/${id}`);
    },

    // Verificar faltas recuperables
    verificarFaltasRecuperables(inscripcionId) {
        return Api().get(`/recuperaciones/verificar/${inscripcionId}`);
    },

    // Obtener horarios disponibles para recuperación
    horariosDisponibles(params) {
        return Api().get('/recuperaciones/horarios-disponibles', {
            params
        });
    }
};

export default recuperacionService;
