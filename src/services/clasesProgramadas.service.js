// servicios/clasesProgramadas.service.js
import { Api } from "./Api.services";

const clasesProgramadasService = {
    // =========== CRUD BÁSICO ===========
    
    // 1. Obtener todas las clases (con filtros)
    index(params = {}) {
        return Api().get('/clases-programadas', { params });
    },
    
    // 2. Crear una clase programada manualmente
    store(data) {
        return Api().post('/clases-programadas', data);
    },
    
    // 3. Obtener una clase específica
    show(claseId) {
        return Api().get(`/clases-programadas/${claseId}`);
    },
    
    // 4. Actualizar una clase
    update(claseId, data) {
        return Api().put(`/clases-programadas/${claseId}`, data);
    },
    
    // 5. Eliminar una clase
    destroy(claseId) {
        return Api().delete(`/clases-programadas/${claseId}`);
    },
    
    // =========== GENERACIÓN AUTOMÁTICA ===========
    
    // 6. Generar clases automáticamente (para inscripción)
    generarAutomatico(data) {
        return Api().post('/clases-programadas/generar/automatico', data);
    },
    
    // 7. Generar clases para una inscripción específica (RUTA QUE NECESITAS)
    generarParaInscripcion(inscripcionId) {
        return Api().post(`/inscripciones/${inscripcionId}/generar-clases-programadas`, {});
    },
    
    // =========== CALENDARIO Y VISUALIZACIÓN ===========
    
    // 8. Obtener calendario del mes
    calendario(mes, anio) {
        return Api().get('/clases-programadas/calendario/mes', {
            params: { mes, anio }
        });
    },
    
    // 9. Obtener clases por fecha específica
    obtenerPorFecha(fecha) {
        return Api().get(`/clases-programadas/fecha/${fecha}`);
    },
    
    // =========== GESTIÓN DE ESTADO ===========
    
    // 10. Cambiar estado de una clase
    cambiarEstado(claseId, estado) {
        return Api().post(`/clases-programadas/${claseId}/estado`, { estado });
    },
    
    // 11. Crear clase de recuperación
    crearRecuperacion(data) {
        return Api().post('/clases-programadas/recuperacion/nueva', data);
    },
    
    // 12. Obtener clases pendientes de recuperación
    clasesParaRecuperacion(estudianteId) {
        return Api().get(`/clases-programadas/estudiante/${estudianteId}/pendientes-recuperacion`);
    },
    
    // =========== REPORTES Y ESTADÍSTICAS ===========
    
    // 13. Reporte de asistencias
    reporteAsistencias(params = {}) {
        return Api().get('/clases-programadas/reporte/asistencias', { params });
    },
    
    // 14. Estadísticas del día (para dashboard)
    estadisticasHoy() {
        return Api().get('/clases-programadas/estadisticas/hoy');
    },
    
    // 15. Obtener clases por rango de fechas (usando index con filtros)
    obtenerPorRango(fechaInicio, fechaFin, params = {}) {
        return Api().get('/clases-programadas', {
            params: {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                ...params
            }
        });
    },
    
    // 16. Obtener clases por estudiante (usando index con filtros)
    obtenerPorEstudiante(estudianteId, params = {}) {
        return Api().get('/clases-programadas', {
            params: {
                estudiante_id: estudianteId,
                ...params
            }
        });
    },
    
    // 17. Obtener clases por inscripción (usando index con filtros)
    obtenerPorInscripcion(inscripcionId, params = {}) {
        return Api().get('/clases-programadas', {
            params: {
                inscripcion_id: inscripcionId,
                ...params
            }
        });
    },
    
    // =========== ALIASES PARA COMPATIBILIDAD ===========
    
    // Para compatibilidad con código que espera estos nombres
    generarClases(inscripcionId) {
        return this.generarParaInscripcion(inscripcionId);
    },
    
    obtenerTodas(params) {
        return this.index(params);
    },
    
    crear(data) {
        return this.store(data);
    },
    
    eliminar(claseId) {
        return this.destroy(claseId);
    },
    
    // Método para uso en el guardarInscripcionYpago
    generarClasesParaInscripcion(inscripcionId, datosExtra = {}) {
        // Puedes enviar datos adicionales si es necesario
        const datosCompletos = {
            ...datosExtra,
            fecha_generacion: new Date().toISOString()
        };
        
        return Api().post(`/inscripciones/${inscripcionId}/generar-clases-programadas`, datosCompletos);
    }
};

export default clasesProgramadasService;