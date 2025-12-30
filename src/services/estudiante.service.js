import { Api } from "./Api.services";

export default {
  
   // Paginación
     index(page = 1, limit = 10, q = "") {
        return Api().get(`/estudiantes?page=${page}&limit=${limit}&q=${q}`);
    },
    
   store(datos) {
        return Api().post("/estudiantes", datos);
    },

  show(id) {
    return Api().get(`/estudiantes/${id}`);
  },


  update(id, datos) {
    return Api().put(`/estudiantes/${id}`, datos);
  },

  delete(id) {
    return Api().delete(`/estudiantes/${id}`);
  },
};
