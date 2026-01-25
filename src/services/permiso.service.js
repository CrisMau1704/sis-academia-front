// permiso.service.js - VERSIÓN COMPLETA Y CORREGIDA
import { Api } from "./Api.services";

const permisoService = {
    // ========== PERMISOS GENERALES ==========
    index(page = 1, perPage = 10, filtro = '') {
        return Api().get('/permisos', {
            params: { page, per_page: perPage, filtro }
        });
    },

    store(data) {
        return Api().post('/permisos', data);
    },

    aprobar(id, data = {}) {
        return Api().put(`/permisos/${id}/aprobar`, data);
    },

    rechazar(id, data = {}) {
        return Api().put(`/permisos/${id}/rechazar`, data);
    },

    verificarDisponibilidad(inscripcionId) {
        return Api().get(`/permisos/verificar-disponibilidad/${inscripcionId}`);
    },

    porEstudiante(estudianteId) {
        return Api().get(`/permisos/estudiante/${estudianteId}`);
    },

    // ========== PERMISOS JUSTIFICADOS (PARA RECUPERACIONES) ==========
    // Obtener permisos justificados por inscripción
    getJustificadosPorInscripcion(inscripcionId) {
        return Api().get('/permisos-justificados/por-inscripcion', {
            params: { inscripcion_id: inscripcionId }
        });
    },

    // Obtener permisos justificados aprobados y recuperables
    getRecuperables(inscripcionId) {
        return Api().get('/permisos-justificados/recuperables', {
            params: { inscripcion_id: inscripcionId }
        });
    },

    // Verificar si un permiso ya tiene recuperación programada
    tieneRecuperacion(permisoId) {
        return Api().get(`/permisos-justificados/${permisoId}/tiene-recuperacion`);
    },

    // Obtener detalles de un permiso justificado específico
    getPermisoJustificado(id) {
        return Api().get(`/permisos-justificados/${id}`);
    },

    // Crear permiso justificado (para justificaciones rápidas desde asistencia)
    crearJustificacion(data) {
        return Api().post('/permisos-justificados', data);
    },

    // ========== ESTADÍSTICAS Y REPORTES ==========
    // Obtener estadísticas de permisos por periodo
    getEstadisticas(fechaInicio, fechaFin) {
        return Api().get('/permisos/estadisticas', {
            params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
        });
    },

    // Obtener permisos próximos a vencer
    getProximosAVencer(dias = 7) {
        return Api().get('/permisos/proximos-a-vencer', {
            params: { dias }
        });
    },

    // ========== PARA EL SISTEMA DE ASISTENCIAS ==========
    // Justificar ausencia rápida (como en asistencia.vue)
    justificarAusencia(data) {
        return Api().post('/asistencias/justificar', data);
    },

    // Obtener permisos de un estudiante para una fecha específica
    getPorEstudianteYFecha(estudianteId, fecha) {
        return Api().get('/permisos/por-estudiante-fecha', {
            params: { estudiante_id: estudianteId, fecha }
        });
    }
};

export default permisoService;