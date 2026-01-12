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
    
     // Método 1: Horarios disponibles (usa tu ruta existente)
    obtenerDisponibles(filtros = {}) {
        return Api().get('/horarios/disponibles', {
            params: {
                ...filtros
            }
        });
    },
    
    // Método 2: Horarios por modalidad
    obtenerPorModalidad(modalidadId) {
        return Api().get(`/horarios/modalidad/${modalidadId}`);
    },
    
    // Método 3: Horarios por día
    obtenerPorDia(dia) {
        return Api().get('/horarios/por-dia', {
            params: { dia }
        });
    },
    
    // Método 4: Estadísticas
    obtenerEstadisticas() {
        return Api().get('/horarios/estadisticas');
    }
    
};