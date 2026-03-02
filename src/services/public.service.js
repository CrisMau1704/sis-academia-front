// services/public.service.js
import { ApiPublic } from "./Api.services";

export default {
  getModalidades() {
    return ApiPublic().get('/public/modalidades');
  },

  getHorarios(params = {}) {
    let url = '/public/horarios';
    const queryParams = new URLSearchParams();
    if (params.modalidad_id) queryParams.append('modalidad_id', params.modalidad_id);
    const queryString = queryParams.toString();
    if (queryString) url += `?${queryString}`;
    return ApiPublic().get(url);
  },

  getSucursales() {
    return ApiPublic().get('/public/sucursales');
  },

  enviarPreinscripcion(data) {
    console.log('📤 Service - Enviando datos:', data); // 👈 LOG AQUÍ TAMBIÉN
    return ApiPublic().post('/public/preinscripciones', data);
  }
};