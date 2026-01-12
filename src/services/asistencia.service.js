// asistencia.service.js - VERSIÓN CORRECTA
import { Api } from "./Api.services";

const asistenciaService = {
    // =========== PRINCIPALES ===========
    
    // ESTE MÉTODO DEBE LLAMARSE obtenerDia (sin "Por")
    obtenerDia(fecha) {
        return Api().get(`/asistencias/dia?fecha=${fecha}`);
    },
    
    // Para compatibilidad, mantén este también
    obtenerPorFecha(fecha) {
        return this.obtenerDia(fecha);
    },
    
    // 2. Marcar asistencia individual
    marcar(data) {
        return Api().post('/asistencias/marcar', data);
    },
    
    // 3. Justificar falta
    justificar(data) {
        return Api().post('/asistencias/justificar', data);
    },
    
    // 4. Marcar en lote
    marcarLote(data) {
        return Api().post('/asistencias/lote', data);
    },
    
    // 5. Estadísticas
    estadisticas(fecha) {
        return Api().get(`/asistencias/estadisticas?fecha=${fecha}`);
    },
    
    // =========== UTILIDADES ===========
    
    verificarPermisos(inscripcionId) {
        return Api().get(`/asistencias/permisos/${inscripcionId}`);
    },
    
    obtenerMotivos() {
        return Api().get('/asistencias/motivos');
    },
    
    exportarReporte(fecha) {
        return Api().get(`/asistencias/exportar?fecha=${fecha}`);
    },
    
    // =========== MANTENER COMPATIBILIDAD ===========
    
    // Alias para código antiguo
    registrar(data) {
        return this.marcar(data);
    },
    
    registrarEnLote(data) {
        return this.marcarLote(data);
    }
};

export default asistenciaService;