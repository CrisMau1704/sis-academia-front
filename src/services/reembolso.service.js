// reembolso.service.js (VERSIÓN COMPATIBLE)
import { Api } from "./Api.services";

export default {
    // Listar reembolsos
    index(page = 1, per_page = 20, filtros = {}) {
        return Api().get("/reembolsos", { 
            params: { 
                page, 
                per_page,
                ...filtros 
            } 
        });
    },
    
    // Crear
    store(datos) {
        return Api().post("/reembolsos", datos);
    },
    
    // Mostrar
    show(id) {
        return Api().get(`/reembolsos/${id}`);
    },
    
    // Actualizar
    update(id, datos) {
        return Api().put(`/reembolsos/${id}`, datos);
    },
    
    // Eliminar
    destroy(id) {
        return Api().delete(`/reembolsos/${id}`);
    },
    
    // Acciones específicas
    aprobar(id) {
        return Api().post(`/reembolsos/${id}/aprobar`);
    },
    
    rechazar(id) {
        return Api().post(`/reembolsos/${id}/rechazar`);
    },
    
    completar(id) {
        return Api().post(`/reembolsos/${id}/completar`);
    },
    
    // Obtener pagos para reembolso
    obtenerPagosReembolsables(estudianteId) {
        return Api().get(`/pagos/estudiante/${estudianteId}/reembolsables`);
    }
};