// recuperacion.service.js - VERSIÓN CORREGIDA PARA TU Api()
import { Api } from "./Api.services";

const recuperacionService = {
    // ========== CRUD BÁSICO ==========
    index(params = {}) {
        return Api().get('/recuperaciones', { params });
    },

    store(data) {
        return Api().post('/recuperaciones', data);
    },

    show(id) {
        return Api().get(`/recuperaciones/${id}`);
    },

    update(id, data) {
        return Api().put(`/recuperaciones/${id}`, data);
    },

    destroy(id) {
        return Api().delete(`/recuperaciones/${id}`);
    },

    // ========== MÉTODOS ESPECÍFICOS ==========
    // Obtener recuperaciones por inscripción
    getPorInscripcion(inscripcionId) {
        return Api().get(`/recuperaciones/inscripcion/${inscripcionId}`);
    },

    // Obtener recuperaciones por estudiante
    getPorEstudiante(estudianteId) {
        return Api().get(`/recuperaciones/estudiante/${estudianteId}`);
    },

    // Obtener permisos recuperables por inscripción
    getPermisosRecuperables(inscripcionId) {
        return Api().get(`/recuperaciones/${inscripcionId}/permisos-recuperables`);
    },

    // Obtener horarios disponibles para recuperación
    getHorariosDisponibles(params = {}) {
        return Api().get('/recuperaciones/horarios/disponibles', { params });
    },

    // Completar una recuperación
    completar(id, data = {}) {
        return Api().post(`/recuperaciones/${id}/completar`, data);
    },

    // Cancelar una recuperación
    cancelar(id, data = {}) {
        return Api().post(`/recuperaciones/${id}/cancelar`, data);
    },

    // Verificar período de recuperación
    verificarPeriodo(inscripcionId) {
        return Api().get(`/recuperaciones/${inscripcionId}/verificar-periodo`);
    },

    // Cambiar estado de una recuperación
    updateEstado(id, estado, motivo = '') {
        return Api().put(`/recuperaciones/${id}/estado`, { estado, motivo });
    },

    // ========== REPORTES Y ESTADÍSTICAS ==========
    // Reporte mensual
    reporteMensual(mes = null, anio = null) {
        const params = {}
        if (mes) params.mes = mes
        if (anio) params.anio = anio
        
        return Api().get('/recuperaciones/reporte/mensual', { params });
    },

    // Estadísticas de recuperaciones
    estadisticas(params = {}) {
        return Api().get('/recuperaciones/estadisticas', { params });
    }
};

export default recuperacionService;