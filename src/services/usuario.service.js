import { Api } from "./Api.services";

export default {

     // Paginación
      index(page = 1, limit = 10, q = "") {
             return Api().get(`/usuarios?page=${page}&limit=${limit}&q=${q}`);
         },

    store(datos) {  // Añade datos como parámetro aquí
        return Api().post("/usuarios", datos);
    },

    mostrarUsuario(id) {
        return Api().get("/usuarios/" + id);
    },

    update(id, datos) {  // Añade datos como parámetro aquí
        return Api().put("/usuarios/" + id, datos);
    },

    eliminarUsuario(id) {
        return Api().delete("/usuarios/" + id);
    },
};
