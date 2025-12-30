import { Api } from "./Api.services";

export default {
  
   // Paginación
     index(page = 1, limit = 10, q = "") {
        return Api().get(`/disciplinas?page=${page}&limit=${limit}&q=${q}`);
    },
    
   store(datos) {
        return Api().post("/disciplinas", datos);
    },

  show(id) {
    return Api().get(`/disciplinas/${id}`);
  },


  update(id, datos) {
    return Api().put(`/disciplinas/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/disciplinas/${id}`);
  },
};
