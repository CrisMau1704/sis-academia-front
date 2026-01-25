import { Api } from "./Api.services";

export default {
    /**
     * Obtener permisos del menú para el usuario actual
     */
    getMenuPermissions() {
        return Api().get('/permisos/menu');
    },

    /**
     * Obtener todos los permisos del sistema
     */
    getAllPermissions() {
        return Api().get('/permisos');
    },

    /**
     * Obtener permisos por rol
     */
    getPermissionsByRole(roleId) {
        return Api().get(`/permisos/rol/${roleId}`);
    },

    /**
     * Actualizar permisos de un rol
     */
    updateRolePermissions(roleId, permisos) {
        return Api().put(`/permisos/rol/${roleId}`, { permisos });
    },

    /**
     * Obtener todos los roles con permisos
     */
    getRolesWithPermissions() {
        return Api().get('/roles/con-permisos');
    },

    /**
     * Asignar permisos a un rol (alternativa)
     */
    assignPermissionsToRole(roleId, permisosIds) {
        return Api().put(`/roles/${roleId}/permisos`, { permisos: permisosIds });
    },

    /**
     * Verificar si el usuario tiene un permiso específico
     * (Helper para usar en Vue)
     */
    hasPermission(userPermissions, requiredPermission) {
        if (!userPermissions || !requiredPermission) return false;
        return userPermissions.includes(requiredPermission);
    },

    /**
     * Verificar si el usuario tiene al menos uno de los permisos requeridos
     */
    hasAnyPermission(userPermissions, requiredPermissions) {
        if (!userPermissions || !requiredPermissions) return false;
        return requiredPermissions.some(perm => userPermissions.includes(perm));
    }
};