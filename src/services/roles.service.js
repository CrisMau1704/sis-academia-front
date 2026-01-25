import { Api } from "./Api.services";

export default {
    // Obtener usuarios con roles
    async getUsersWithRoles() {
        try {
            const response = await Api().get('/roles/usuarios');
            return response.data || response;
        } catch (error) {
            console.error('Error en getUsersWithRoles:', error);
            throw error;
        }
    },
    
    // Obtener todos los roles
    async getAllRoles() {
        try {
            const response = await Api().get('/roles');
            return response.data || response;
        } catch (error) {
            console.error('Error en getAllRoles:', error);
            throw error;
        }
    },
    
    // Asignar roles a un usuario
    async assignUserRoles(userId, roles) {
        try {
            const response = await Api().post('/roles/asignar', { user_id: userId, roles });
            return response.data || response;
        } catch (error) {
            console.error('Error en assignUserRoles:', error);
            throw error;
        }
    },

    // ===== MÉTODOS NUEVOS PARA PERMISOS =====
    
    /**
     * Obtener roles con sus permisos incluidos
     */
    async getRolesWithPermissions() {
        try {
            const response = await Api().get('/roles/con-permisos');
            return response.data || response;
        } catch (error) {
            console.error('Error en getRolesWithPermissions:', error);
            throw error;
        }
    },

    /**
     * Obtener permisos por rol
     */
    async getPermissionsByRole(roleId) {
        try {
            const response = await Api().get(`/roles/${roleId}/permisos`);
            return response.data || response;
        } catch (error) {
            console.error('Error en getPermissionsByRole:', error);
            throw error;
        }
    },

    /**
     * Actualizar permisos de un rol
     */
    // En roles.service.js - método updateRolePermissions
// EN roles.service.js - Opción alternativa:
// EN roles.service.js:
async updateRolePermissions(roleId, permisosArray) {  // Cambia nombre del parámetro
    try {
        console.log('Enviando al backend:', {
            roleId,
            permisos: permisosArray  // Esto es lo que el backend espera
        });
        
        // IMPORTANTE: Envía como objeto con propiedad "permisos"
        const response = await Api().put(`/roles/${roleId}/permisos`, {
            permisos: permisosArray
        });
        
        return response.data || response;
    } catch (error) {
        console.error('Error en updateRolePermissions:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
},

    /**
     * Crear un nuevo rol
     */
    async createRole(data) {
        try {
            const response = await Api().post('/roles', data);
            return response.data || response;
        } catch (error) {
            console.error('Error en createRole:', error);
            throw error;
        }
    },

    /**
     * Actualizar un rol
     */
    async updateRole(roleId, data) {
        try {
            const response = await Api().put(`/roles/${roleId}`, data);
            return response.data || response;
        } catch (error) {
            console.error('Error en updateRole:', error);
            throw error;
        }
    },

    /**
     * Eliminar un rol
     */
    async deleteRole(roleId) {
        try {
            const response = await Api().delete(`/roles/${roleId}`);
            return response.data || response;
        } catch (error) {
            console.error('Error en deleteRole:', error);
            throw error;
        }
    },

    /**
     * Obtener permisos del menú para el usuario actual
     */
    async getMenuPermissions() {
        try {
            const response = await Api().get('/permisos-sistema/menu');
            return response.data || response;
        } catch (error) {
            console.error('Error en getMenuPermissions:', error);
            // En caso de error, devolver estructura vacía
            return { permisos: [] };
        }
    },

    /**
     * Obtener todos los permisos del sistema
     */
    async getAllPermissions() {
        try {
            const response = await Api().get('/permisos-sistema');
            return response.data || response;
        } catch (error) {
            console.error('Error en getAllPermissions:', error);
            throw error;
        }
    },

    // ===== HELPERS PARA FRONTEND =====
    
    /**
     * Verificar si el usuario tiene un permiso específico
     */
    hasPermission(userPermissions, requiredPermission) {
        if (!userPermissions || !requiredPermission) return false;
        
        // Si userPermissions es un objeto con propiedad 'permisos'
        if (typeof userPermissions === 'object' && userPermissions.permisos) {
            return userPermissions.permisos.includes(requiredPermission);
        }
        
        // Si es un array directamente
        if (Array.isArray(userPermissions)) {
            return userPermissions.includes(requiredPermission);
        }
        
        return false;
    },

    /**
     * Verificar si el usuario tiene al menos uno de los permisos requeridos
     */
    hasAnyPermission(userPermissions, requiredPermissions) {
        if (!userPermissions || !requiredPermissions) return false;
        
        let permisosArray = userPermissions;
        
        // Si userPermissions es un objeto con propiedad 'permisos'
        if (typeof userPermissions === 'object' && userPermissions.permisos) {
            permisosArray = userPermissions.permisos;
        }
        
        if (!Array.isArray(requiredPermissions)) {
            return permisosArray.includes(requiredPermissions);
        }
        
        return requiredPermissions.some(perm => permisosArray.includes(perm));
    }
};