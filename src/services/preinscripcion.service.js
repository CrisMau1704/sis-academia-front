// services/preinscripcion.service.js
import { ApiPublic } from "./Api.services";

export default {
    // Enviar preinscripción desde landing page (público - sin token)
    enviarPreinscripcion(data) {
        // ✅ VALIDAR CAMPOS REQUERIDOS (INCLUYENDO FECHAS)
        const requiredFields = [
            'nombres', 
            'apellidos', 
            'ci', 
            'telefono', 
            'correo', 
            'modalidad_id', 
            'sucursal_id',
            'fecha_inicio',  // ← AGREGADO
            'fecha_fin'       // ← AGREGADO
        ];
        
        const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
        
        if (missingFields.length > 0) {
            return Promise.reject({
                response: {
                    data: {
                        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
                        errors: missingFields.reduce((acc, field) => {
                            acc[field] = [`El campo ${field} es requerido`];
                            return acc;
                        }, {})
                    }
                }
            });
        }

        // ✅ VALIDAR QUE HAY HORARIOS SELECCIONADOS
        if (!data.horarios || !Array.isArray(data.horarios) || data.horarios.length === 0) {
            return Promise.reject({
                response: {
                    data: {
                        message: 'Debes seleccionar al menos un horario',
                        errors: { horarios: ['Debes seleccionar al menos un horario'] }
                    }
                }
            });
        }

        // ✅ VALIDAR FORMATO DE CORREO
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.correo)) {
            return Promise.reject({
                response: {
                    data: {
                        message: 'El correo electrónico no es válido',
                        errors: { correo: ['El formato del correo no es válido'] }
                    }
                }
            });
        }

        // ✅ VALIDAR FECHAS
        const fechaInicio = new Date(data.fecha_inicio);
        const fechaFin = new Date(data.fecha_fin);
        
        if (fechaFin <= fechaInicio) {
            return Promise.reject({
                response: {
                    data: {
                        message: 'La fecha fin debe ser posterior a la fecha inicio',
                        errors: { 
                            fecha_fin: ['La fecha fin debe ser posterior a la fecha inicio'] 
                        }
                    }
                }
            });
        }

        // ✅ PREPARAR DATOS LIMPIOS CON TODOS LOS CAMPOS
        const datosLimpios = {
            // Datos personales
            nombres: data.nombres?.trim() || '',
            apellidos: data.apellidos?.trim() || '',
            ci: data.ci?.trim() || '',
            telefono: data.telefono?.trim() || '',
            correo: data.correo?.trim().toLowerCase() || '',
            
            // Datos de inscripción
            sucursal_id: Number(data.sucursal_id),
            modalidad_id: Number(data.modalidad_id),
            
            // ✅ FECHAS (formato YYYY-MM-DD)
            fecha_inicio: data.fecha_inicio instanceof Date 
                ? data.fecha_inicio.toISOString().split('T')[0]
                : data.fecha_inicio,
            fecha_fin: data.fecha_fin instanceof Date 
                ? data.fecha_fin.toISOString().split('T')[0]
                : data.fecha_fin,
            
            // ✅ HORARIOS (array de IDs)
            horarios: data.horarios.map(id => Number(id)),
            
            // ✅ OBSERVACIONES (opcional)
            observaciones: data.observaciones?.trim() || '',
            
            // ✅ TÉRMINOS
            acepta_terminos: data.acepta_terminos ? 1 : 0
        };

        // ✅ LOG PARA DEBUG
        console.log('📤 ENVIANDO PREINSCRIPCIÓN:');
        console.log('📤 URL:', '/public/preinscripciones');
        console.log('📤 Datos completos:', JSON.stringify(datosLimpios, null, 2));
        console.log('📤 Fecha inicio:', datosLimpios.fecha_inicio);
        console.log('📤 Fecha fin:', datosLimpios.fecha_fin);
        console.log('📤 Horarios:', datosLimpios.horarios);
        console.log('📤 Cantidad horarios:', datosLimpios.horarios.length);

        return ApiPublic().post('/public/preinscripciones', datosLimpios)
            .then(response => {
                console.log('📥 RESPUESTA EXITOSA:', response.data);
                return response;
            })
            .catch(error => {
                console.error('❌ ERROR EN PREINSCRIPCIÓN:');
                console.error('❌ Status:', error.response?.status);
                console.error('❌ Data:', error.response?.data);
                console.error('❌ Errors:', error.response?.data?.errors);
                throw error;
            });
    },

    // Obtener todas las preinscripciones (para admin)
    obtenerPreinscripciones(page = 1, limit = 10, filtros = {}) {
        let url = `/public/preinscripciones?page=${page}&limit=${limit}`;
        
        const params = new URLSearchParams();
        
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.modalidad_id) params.append('modalidad_id', filtros.modalidad_id);
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.buscar) params.append('buscar', filtros.buscar);
        
        const queryString = params.toString();
        if (queryString) {
            url += `&${queryString}`;
        }
        
        return ApiPublic().get(url);
    },

    // Obtener una preinscripción específica
    obtenerPreinscripcion(id) {
        return ApiPublic().get(`/public/preinscripciones/${id}`);
    },

    // Aprobar preinscripción (convertir en inscripción activa)
    aprobarPreinscripcion(id, datosInscripcion = {}) {
        return ApiPublic().post(`/public/preinscripciones/${id}/aprobar`, datosInscripcion);
    },

    // Rechazar preinscripción
    rechazarPreinscripcion(id, motivo) {
        return ApiPublic().post(`/public/preinscripciones/${id}/rechazar`, { motivo });
    }
};