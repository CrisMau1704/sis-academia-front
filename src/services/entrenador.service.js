// entrenador.service.js
import { Api } from "./Api.services";

export default {
    index(page = 1, limit = 100, q = "") {
        return Api().get(`/entrenadores?page=${page}&limit=${limit}&q=${q}`);
    },
    
    store(datos) {
        return Api().post("/entrenadores", datos);
    },

    show(id) {
        return Api().get(`/entrenadores/${id}`);
    },

    update(id, datos) {
        return Api().put(`/entrenadores/${id}`, datos);
    },

    delete(id) {
        return Api().delete(`/entrenadores/${id}`);
    },
    
    obtenerTodos() {
        return Api().get('/entrenadores?limit=1000');
    }
};