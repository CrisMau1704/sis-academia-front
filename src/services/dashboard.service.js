// src/services/dashboard.service.js
import { Api } from "./Api.services";

export default {
    // Obtener estadísticas generales del dashboard
    getEstadisticas() {
        return Api().get('/dashboard/estadisticas');
    },
    
    // Obtener recaudación mensual (para gráfico)
    getRecaudacionMensual(meses = 6) {
        return Api().get(`/dashboard/recaudacion-mensual?meses=${meses}`);
    },
    
    // Obtener resumen por modalidades
    getResumenModalidades() {
        return Api().get('/dashboard/resumen-modalidades');
    },
    
    // Obtener últimas inscripciones
    getUltimasInscripciones(limit = 5) {
        return Api().get(`/dashboard/ultimas-inscripciones?limit=${limit}`);
    },
    
    // Obtener últimos pagos
    getUltimosPagos(limit = 5) {
        return Api().get(`/dashboard/ultimos-pagos?limit=${limit}`);
    },
    
    // Obtener alertas importantes
    getAlertas() {
        return Api().get('/dashboard/alertas');
    },
    
    // Obtener tendencias (comparativo mes actual vs anterior)
    getTendencias() {
        return Api().get('/dashboard/tendencias');
    },
    
    // Obtener datos para gráfico de inscripciones por modalidad
    getInscripcionesPorModalidad() {
        return Api().get('/dashboard/inscripciones-por-modalidad');
    },
    
    // Obtener métricas de rendimiento
    getMetricasRendimiento() {
        return Api().get('/dashboard/metricas-rendimiento');
    }
};