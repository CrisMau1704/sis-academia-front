import { Api } from "./Api.services";

export default {
  
   // Paginación
     index(page = 1, limit = 10, q = "") {
        return Api().get(`/sucursales?page=${page}&limit=${limit}&q=${q}`);
    },
    
   store(datos) {
        return Api().post("/sucursales", datos);
    },

  show(id) {
    return Api().get(`/sucursales/${id}`);
  },


  update(id, datos) {
    return Api().put(`/sucursales/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/sucursales/${id}`);
  },
};
