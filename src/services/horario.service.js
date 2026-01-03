// horario.service.js
import { Api } from "./Api.services";

export default {
    index(page = 1, limit = 100, q = "") {
        return Api().get(`/horarios?page=${page}&limit=${limit}&q=${q}`);
    },
    
    store(datos) {
        return Api().post("/horarios", datos);
    },

    show(id) {
        return Api().get(`/horarios/${id}`);
    },

    update(id, datos) {
        return Api().put(`/horarios/${id}`, datos);
    },

    delete(id) {
        return Api().delete(`/horarios/${id}`);
    },
    
    obtenerTodos() {
        return Api().get('/horarios?limit=1000');
    },
    
    // Si tu API tiene esta ruta específica
    disponibles() {
        return Api().get('/horarios/disponibles');
    },
    
    // O usa obtenerTodos si no tienes /disponibles
    horariosDisponibles() {
        return this.obtenerTodos();
    },
      porModalidad(modalidadId) {
        return Api().get(`/horarios`, { params: { modalidad_id: modalidadId } });
    },
    // Obtener horarios disponibles
    disponibles(modalidadId = null) {
        const params = {};
        if (modalidadId) {
            params.modalidad_id = modalidadId;
        }
        return Api().get('/horarios/disponibles', { params });
    }
    
};