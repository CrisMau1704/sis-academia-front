import { Api } from "./Api.services";

export default {
  clasesRestantes() {
    return Api().get("/reportes/clases-restantes");
  },

  inscripcionesVencidas() {
    return Api().get("/reportes/inscripciones-vencidas");
  }
};
