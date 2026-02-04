import { Api } from "./Api.services";

export default {
    // Obtener estudiantes con paginación y búsqueda
     index(page = 1, limit = 100, q = "", withAntiguedad = true) {
    const params = {
        page,
        limit,
        q,
        // IMPORTANTE: Pide explícitamente las relaciones
        with: 'inscripciones',  // ← Esto dice al backend que incluya inscripciones
        with_inscripciones: true,
        with_antiguedad: withAntiguedad
    };
    
    console.log('📤 Pidiendo estudiantes con params:', params);
    return Api().get("/estudiantes", { params });
},
    
    // Crear nuevo estudiante
    store(datos) {
        return Api().post("/estudiantes", datos);
    },

    // Obtener un estudiante por ID
    show(id) {
        return Api().get(`/estudiantes/${id}`);
    },

    // Actualizar estudiante
    update(id, datos) {
        return Api().put(`/estudiantes/${id}`, datos);
    },

    // Eliminar estudiante
    delete(id) {
        return Api().delete(`/estudiantes/${id}`);
    },
    
    // Obtener todos los estudiantes (sin paginación)
    obtenerTodos() {
    return this.index(1, 1000, ""); // Reutiliza el método index con límite alto
},
      conInscripcionesActivas() {
        return api.get('/estudiantes/con-inscripciones-activas');
    },
    obtenerInscripcionActiva(estudianteId) {
    return Api().get(`/estudiantes/${estudianteId}/inscripcion-activa`);
  },
  inscripcionActiva(estudianteId) {
    return Api().get(`/estudiantes/${estudianteId}/inscripcion-activa`);
  }
};