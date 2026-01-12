// permiso.service.js
import { Api } from "./Api.services"; // importar igual que en entrenador.service.js

const permisoService = {
    // Listar permisos
    index(page = 1, perPage = 10, filtro = '') {
        return Api().get('/permisos', {
            params: { page, per_page: perPage, filtro }
        });
    },

    // Crear permiso
    store(data) {
        return Api().post('/permisos', data);
    },

    // Aprobar permiso
    aprobar(id, data = {}) {
        return Api().put(`/permisos/${id}/aprobar`, data);
    },

    // Rechazar permiso
    rechazar(id, data = {}) {
        return Api().put(`/permisos/${id}/rechazar`, data);
    },

    // Verificar disponibilidad de permisos
    verificarDisponibilidad(inscripcionId) {
        return Api().get(`/permisos/verificar-disponibilidad/${inscripcionId}`);
    },

    // Obtener permisos por estudiante
    porEstudiante(estudianteId) {
        return Api().get(`/permisos/estudiante/${estudianteId}`);
    }
};

export default permisoService;
