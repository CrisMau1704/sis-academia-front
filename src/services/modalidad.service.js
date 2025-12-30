import { Api } from "./Api.services";

export default {
    index(page = 1, limit = 10, q = "") {
        return Api().get(`/modalidades?page=${page}&limit=${limit}&q=${q}`);
    },
    
    store(datos) {
        return Api().post("/modalidades", datos);
    },

    show(id) {
        return Api().get(`/modalidades/${id}`);
    },

    update(id, datos) {
        return Api().put(`/modalidades/${id}`, datos);
    },

    delete(id) {
        return Api().delete(`/modalidades/${id}`);
    },
};