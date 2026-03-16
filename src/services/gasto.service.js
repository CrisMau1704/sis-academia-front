import { Api } from "./Api.services";

export default {
    // Obtener gastos con paginación y filtros
    index(page = 1, limit = 100, q = "", filters = {}) {
        const params = {
            page,
            limit,
            q,
            ...filters
        };
        
        console.log('📤 Cargando gastos con params:', params);
        return Api().get("/gastos", { params });
    },

    // Obtener todos los gastos (sin paginación)
    obtenerTodos() {
        return this.index(1, 1000, "");
    },

    // Obtener un gasto por ID
    show(id) {
        return Api().get(`/gastos/${id}`);
    },

    // Crear nuevo gasto
    store(datos) {
        return Api().post("/gastos", datos);
    },

    // Actualizar gasto (usamos POST con _method=PUT para soportar archivos si es necesario)
   update(id, datos) {
    return Api().post(`/gastos/${id}`, datos); // Sin _method
},
    // Eliminar gasto
    delete(id) {
        return Api().delete(`/gastos/${id}`);
    },

    // Obtener estadísticas de gastos
    estadisticas(params = {}) {
        return Api().get("/gastos/estadisticas", { params });
    },

    // Obtener gastos por categoría
    porCategoria(categoria, page = 1, limit = 100) {
        return this.index(page, limit, "", { categoria });
    },

    // Obtener gastos por rango de fechas
    porRangoFechas(fecha_desde, fecha_hasta, page = 1, limit = 100) {
        return this.index(page, limit, "", { fecha_desde, fecha_hasta });
    },

    // Obtener gastos del mes actual
    delMesActual() {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        
        return this.index(1, 100, "", { 
            fecha_desde: `${año}-${mes}-01`,
            fecha_hasta: `${año}-${mes}-31`
        });
    },

    // Obtener resumen por categorías
    resumenPorCategorias(año = null, mes = null) {
        const params = {};
        if (año) params.año = año;
        if (mes) params.mes = mes;
        
        return Api().get("/gastos/estadisticas", { params });
    }
};