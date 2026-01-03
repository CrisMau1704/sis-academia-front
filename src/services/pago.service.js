import { Api } from "./Api.services";

export default {
  // Obtener todos los pagos con paginación y filtros
  index(page = 1, limit = 10, filtros = {}) {
    let url = `/pagos?page=${page}&limit=${limit}`;
    
    // Agregar filtros dinámicos
    const params = new URLSearchParams();
    
    if (filtros.inscripcion_id) params.append('inscripcion_id', filtros.inscripcion_id);
    if (filtros.estudiante_id) params.append('estudiante_id', filtros.estudiante_id);
    if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.sucursal_id) params.append('sucursal_id', filtros.sucursal_id);
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.anio) params.append('anio', filtros.anio);
    
    const queryString = params.toString();
    if (queryString) {
      url += `&${queryString}`;
    }
    
    return Api().get(url);
  },
  
  // Obtener pagos por inscripción
  porInscripcion(inscripcionId, page = 1, limit = 10) {
    return Api().get(`/pagos/inscripcion/${inscripcionId}?page=${page}&limit=${limit}`);
  },
  
  // Obtener pagos por estudiante
  porEstudiante(estudianteId, page = 1, limit = 10) {
    return Api().get(`/pagos/estudiante/${estudianteId}?page=${page}&limit=${limit}`);
  },
  
  // Obtener un pago específico
  show(id) {
    return Api().get(`/pagos/${id}`);
  },
  
  // Crear un nuevo pago
  store(pagoData) {
    // Validar campos requeridos según tu base de datos
    const requiredFields = ['inscripcion_id', 'monto', 'metodo_pago', 'fecha_pago'];
    const missingFields = requiredFields.filter(field => !pagoData[field]);
    
    if (missingFields.length > 0) {
      return Promise.reject({
        response: {
          data: {
            message: `Faltan campos requeridos: ${missingFields.join(', ')}`
          }
        }
      });
    }
    
    return Api().post('/pagos', pagoData);
  },
  
  // Actualizar un pago existente
  update(id, pagoData) {
    return Api().put(`/pagos/${id}`, pagoData);
  },
  
  // Eliminar un pago (cambiar estado a anulado en lugar de eliminar físicamente)
  delete(id, motivo = 'Eliminado por usuario') {
    return Api().delete(`/pagos/${id}`, { data: { motivo } });
  },
  
  // Anular un pago (cambiar estado)
  anular(id, motivo) {
    return Api().put(`/pagos/${id}/anular`, { motivo });
  },
  
  // Confirmar un pago pendiente
  confirmar(id, datosConfirmacion = {}) {
    return Api().put(`/pagos/${id}/confirmar`, datosConfirmacion);
  },
  
  // Generar reporte de pagos
  generarReporte(params = {}) {
    return Api().get('/pagos/reporte', { params });
  },
  
  // Exportar pagos a Excel
  exportarExcel(params = {}) {
    return Api().get('/pagos/exportar/excel', { 
      params,
      responseType: 'blob' // Importante para descargar archivos
    });
  },
  
  // Exportar pagos a PDF
  exportarPDF(params = {}) {
    return Api().get('/pagos/exportar/pdf', { 
      params,
      responseType: 'blob'
    });
  },
  
  // Obtener estadísticas de pagos
  estadisticas(params = {}) {
    return Api().get('/pagos/estadisticas', { params });
  },
  
  // Obtener métodos de pago disponibles
  getMetodosPago() {
    return [
      { value: 'efectivo', label: 'Efectivo', icon: 'pi pi-money-bill' },
      { value: 'qr', label: 'QR/Yape/Plin', icon: 'pi pi-qrcode' },
      { value: 'tarjeta', label: 'Tarjeta', icon: 'pi pi-credit-card' },
      { value: 'transferencia', label: 'Transferencia', icon: 'pi pi-sync' }
    ];
  },
  
  // Obtener estados de pago disponibles
  getEstadosPago() {
    return [
      { value: 'pagado', label: 'Pagado', severity: 'success' },
      { value: 'pendiente', label: 'Pendiente', severity: 'warning' },
      { value: 'anulado', label: 'Anulado', severity: 'danger' }
    ];
  },
  
  // Calcular resumen de pagos
  calcularResumen(pagos) {
    return pagos.reduce((resumen, pago) => {
      // Convertir monto a número
      const monto = parseFloat(pago.monto) || 0;
      
      // Sumar por estado
      resumen.total_pagado += pago.estado === 'pagado' ? monto : 0;
      resumen.total_pendiente += pago.estado === 'pendiente' ? monto : 0;
      resumen.total_anulado += pago.estado === 'anulado' ? monto : 0;
      
      // Contar por método de pago
      if (pago.estado === 'pagado') {
        resumen.metodos_pago[pago.metodo_pago] = (resumen.metodos_pago[pago.metodo_pago] || 0) + monto;
      }
      
      // Contar por estado
      resumen.contador_estados[pago.estado] = (resumen.contador_estados[pago.estado] || 0) + 1;
      resumen.total_registros++;
      
      return resumen;
    }, {
      total_pagado: 0,
      total_pendiente: 0,
      total_anulado: 0,
      total_registros: 0,
      metodos_pago: {},
      contador_estados: {}
    });
  },
  
  // Formatear pago para mostrar
  formatearPago(pago) {
    return {
      ...pago,
      monto_formateado: `S/ ${parseFloat(pago.monto).toFixed(2)}`,
      fecha_formateada: pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-PE') : '',
      metodo_pago_label: this.getMetodosPago().find(m => m.value === pago.metodo_pago)?.label || pago.metodo_pago,
      estado_label: this.getEstadosPago().find(e => e.value === pago.estado)?.label || pago.estado,
      estado_severity: this.getEstadosPago().find(e => e.value === pago.estado)?.severity || 'info'
    };
  },
  
  // Validar datos de pago antes de enviar
  validarPago(pagoData) {
    const errores = [];
    
    // Validar monto
    if (!pagoData.monto || parseFloat(pagoData.monto) <= 0) {
      errores.push('El monto debe ser mayor a 0');
    }
    
    // Validar método de pago
    const metodosValidos = ['efectivo', 'qr', 'tarjeta', 'transferencia'];
    if (!metodosValidos.includes(pagoData.metodo_pago)) {
      errores.push(`Método de pago inválido. Debe ser: ${metodosValidos.join(', ')}`);
    }
    
    // Validar fecha
    if (!pagoData.fecha_pago) {
      errores.push('La fecha de pago es requerida');
    } else {
      const fechaPago = new Date(pagoData.fecha_pago);
      if (fechaPago > new Date()) {
        errores.push('La fecha de pago no puede ser futura');
      }
    }
    
    // Validar inscripción
    if (!pagoData.inscripcion_id) {
      errores.push('La inscripción es requerida');
    }
    
    return {
      valido: errores.length === 0,
      errores: errores
    };
  },
  
  // Generar número de comprobante
  generarNumeroComprobante(tipo = 'PAGO') {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${tipo}-${anio}${mes}${dia}-${random}`;
  },
  
  // Simular pago con tarjeta (para desarrollo)
  simularPagoTarjeta(datosTarjeta) {
    // En producción, esto se conectaría con una pasarela de pagos
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular validación básica
        if (!datosTarjeta.numero || !datosTarjeta.nombre || !datosTarjeta.fecha_vencimiento || !datosTarjeta.cvv) {
          reject({ message: 'Datos de tarjeta incompletos' });
          return;
        }
        
        // Simular respuesta exitosa
        resolve({
          success: true,
          transaccion_id: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          mensaje: 'Pago procesado correctamente',
          fecha_procesamiento: new Date().toISOString()
        });
      }, 1500);
    });
  }
};