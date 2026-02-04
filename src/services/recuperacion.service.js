// recuperacion.service.js - VERSIÓN ACTUALIZADA (igual que sucursal.service.js)
import { Api } from "./Api.services";

export default {
    // ========== CRUD BÁSICO ==========
    // recuperacion.service.js - VERSIÓN ACTUALIZADA

index(page = 1, limit = 100, q = '', filtros = {}) {
  let url = `/recuperaciones?page=${page}&limit=${limit}`;
  
  // Agregar filtros dinámicos
  if (q) url += `&q=${q}`;
  
  // Agregar filtros adicionales
  Object.keys(filtros).forEach(key => {
    if (filtros[key]) {
      url += `&${key}=${filtros[key]}`;
    }
  });
  
  return Api().get(url);
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
    // Obtener recuperaciones por inscripción - USANDO QUERY PARAMS
    getPorInscripcion(inscripcionId, page = 1, limit = 100, estado = null) {
    let url = `/recuperaciones?inscripcion_id=${inscripcionId}&page=${page}&limit=${limit}`;
    if (estado) url += `&estado=${estado}`;
    return Api().get(url);
},
    // Obtener recuperaciones por estudiante - USANDO QUERY PARAMS
    getPorEstudiante(estudianteId, page = 1, limit = 100) {
        return Api().get(`/recuperaciones?estudiante_id=${estudianteId}&page=${page}&limit=${limit}`);
    },

    // Obtener permisos recuperables por inscripción
    getPermisosRecuperables(inscripcionId) {
        return Api().get(`/recuperaciones/${inscripcionId}/permisos-recuperables`);
    },

    // Obtener horarios disponibles para recuperación - CON QUERY PARAMS
    getHorariosDisponibles(modalidadId = null, fecha = null) {
        let url = '/recuperaciones/horarios/disponibles?';
        if (modalidadId) url += `modalidad_id=${modalidadId}&`;
        if (fecha) url += `fecha=${fecha}&`;
        return Api().get(url);
    },

    // Completar una recuperación
    // recuperacion.service.js - CORRECCIÓN DEL MÉTODO completar
completar(id, data = {}) {
    // El backend Laravel espera solo los datos necesarios
    // NO envíes 'estado' ni 'asistio' aquí porque el backend los maneja internamente
    
    const datosEnviar = {
        observaciones: data.observaciones || 'Recuperación completada exitosamente'
        // No envíes 'estado' o 'asistio' aquí
        // El backend ya sabe que debe cambiar el estado a 'completada'
    };
    
    console.log('📤 Completando recuperación ID:', id);
    console.log('📤 Datos a enviar:', datosEnviar);
    
    return Api().post(`/recuperaciones/${id}/completar`, datosEnviar);
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
    // Reporte mensual - USANDO QUERY PARAMS
    reporteMensual(mes = null, anio = null) {
        let url = '/recuperaciones/reporte/mensual?';
        if (mes) url += `mes=${mes}&`;
        if (anio) url += `anio=${anio}&`;
        return Api().get(url);
    },

    // Estadísticas de recuperaciones - USANDO QUERY PARAMS
    estadisticas(fecha_desde = null, fecha_hasta = null, estado = null) {
        let url = '/recuperaciones/estadisticas?';
        if (fecha_desde) url += `fecha_desde=${fecha_desde}&`;
        if (fecha_hasta) url += `fecha_hasta=${fecha_hasta}&`;
        if (estado) url += `estado=${estado}&`;
        return Api().get(url);
    },

    // ========== MÉTODOS ADICIONALES PARA COMPATIBILIDAD ==========
    // Método alternativo para buscar con filtros
    buscar(filtros = {}) {
        let url = '/recuperaciones?';
        Object.keys(filtros).forEach(key => {
            if (filtros[key]) {
                url += `${key}=${filtros[key]}&`;
            }
        });
        return Api().get(url);
    },

    // Obtener todas las recuperaciones (sin paginación)
    obtenerTodas() {
        return Api().get('/recuperaciones?limit=1000');
    },

    // recuperacion.service.js - AGREGAR ESTOS MÉTODOS

// Método específico usando el endpoint porInscripcion del controlador
getPorInscripcionEspecifico(inscripcionId) {
    return Api().get(`/recuperaciones/inscripcion/${inscripcionId}`);
},

// Método para recuperaciones programadas específicamente
getProgramadasPorInscripcion(inscripcionId) {
    return Api().get(`/recuperaciones?inscripcion_id=${inscripcionId}&estado=programada`);
},
};