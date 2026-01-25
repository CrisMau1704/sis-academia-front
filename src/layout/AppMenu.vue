<script setup>
import { ref, onMounted } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import authService from '../services/auth.service';
import rolesService from '../services/roles.service'; // <-- Usa este servicio

const model = ref([]);
const userPermissions = ref([]);

// Estructura completa del menú con permisos
const fullMenu = [
    {
        label: 'Inicio',
        items: [
            { 
                label: 'Dashboard', 
                icon: 'pi pi-fw pi-home', 
                to: '/admin/dashboard',
                permission: 'view_dashboard'  // <-- Permiso requerido
            }
        ]
    },
    {
        label: 'Configuración General',
        items: [
            { 
                label: 'Sucursales', 
                icon: 'pi pi-fw pi-map-marker', 
                to: '/admin/sucursales',
                permission: 'manage_branches'
            },
            { 
                label: 'Disciplinas', 
                icon: 'pi pi-fw pi-star', 
                to: '/admin/disciplinas',
                permission: 'manage_disciplines'
            },
            { 
                label: 'Modalidades', 
                icon: 'pi pi-fw pi-briefcase', 
                to: '/admin/modalidades',
                permission: 'manage_modalities'
            },
            { 
                label: 'Horarios', 
                icon: 'pi pi-fw pi-clock', 
                to: '/admin/horarios',
                permission: 'manage_schedules'
            },
            { 
                label: 'Entrenadores', 
                icon: 'pi pi-fw pi-id-card', 
                to: '/admin/entrenadores',
                permission: 'manage_trainers'
            }
        ]
    },
    {
        label: 'Gestión de Estudiantes',
        items: [
            { 
                label: 'Estudiantes', 
                icon: 'pi pi-fw pi-users', 
                to: '/admin/estudiantes',
                permission: 'manage_students'
            },
            { 
                label: 'Inscripciones', 
                icon: 'pi pi-fw pi-list', 
                to: '/admin/inscripciones',
                permission: 'manage_enrollments'
            }
        ]
    },
    {
        label: 'Control de Asistencia',
        items: [
            { 
                label: 'Registro Diario', 
                icon: 'pi pi-fw pi-check-square', 
                to: '/admin/asistencias',
                permission: 'manage_attendance'
            },
            { 
                label: 'Recuperar Clases', 
                icon: 'pi pi-fw pi-refresh', 
                to: '/admin/recuperarclases',
                permission: 'manage_class_recovery'
            }
        ]
    },
    {
        label: 'Pagos y Mensualidades',
        items: [
            { 
                label: 'Historial de Pagos', 
                icon: 'pi pi-fw pi-history', 
                to: '/admin/historialpagos',
                permission: 'view_payment_history'
            }
        ]
    },
    {
        label: 'Reportes',
        items: [
            { 
                label: 'Clases Restantes', 
                icon: 'pi pi-fw pi-chart-line', 
                to: '/admin/clasesrestantes',
                permission: 'view_remaining_classes'
            },
            { 
                label: 'Asistencia Mensual', 
                icon: 'pi pi-fw pi-chart-bar', 
                to: '/admin/asistenciasmensuales',
                permission: 'view_monthly_attendance'
            }
        ]
    },
    {
        label: 'Administración',
        items: [
            { 
                label: 'Usuarios', 
                icon: 'pi pi-fw pi-user', 
                to: '/admin/usuario',
                permission: 'manage_users'
            },
            { 
                label: 'Roles y Permisos', 
                icon: 'pi pi-fw pi-shield', 
                to: '/admin/roles',
                permission: 'manage_roles'
            }
        ]
    }
];

// En AppMenu.vue - método onMounted
onMounted(async () => {
    try {
        // 1. Obtener permisos del usuario
        const response = await rolesService.getMenuPermissions();
        
        // Manejar diferentes estructuras de respuesta
        if (response && response.permisos) {
            userPermissions.value = response.permisos;
        } else if (Array.isArray(response)) {
            userPermissions.value = response;
        } else if (response && response.data && response.data.permisos) {
            userPermissions.value = response.data.permisos;
        } else {
            userPermissions.value = [];
        }
        
        console.log('Permisos del usuario:', userPermissions.value);
        
        // 2. Filtrar menú basado en permisos
        model.value = filterMenuByPermissions(fullMenu);
        
    } catch (error) {
        console.error('Error al cargar permisos:', error);
        // Fallback a lógica antigua por roles
        const rol = authService.getUserRole();
        setMenuByRole(rol);
    }
});

const filterMenuByPermissions = (menu) => {
    return menu
        .map(section => {
            // Filtrar items de la sección
            const filteredItems = section.items.filter(item => {
                if (!item.permission) return true; // Si no requiere permiso, mostrarlo
                return rolesService.hasPermission(userPermissions.value, item.permission);
            });
            
            // Solo mostrar sección si tiene al menos un item visible
            if (filteredItems.length > 0) {
                return {
                    ...section,
                    items: filteredItems
                };
            }
            return null;
        })
        .filter(section => section !== null); // Eliminar secciones vacías
};

const setMenuByRole = (rol) => {
    // Tu lógica anterior como fallback
    if (rol === 'super_admin') {
        model.value = fullMenu;
    } else if (rol === 'vendedor') {
        model.value = [
            {
                label: 'Gestión de estudiantes',
                items: [
                    { label: 'Estudiantes', icon: 'pi pi-fw pi-users', to: '/admin/estudiantes' },
                    { label: 'Clases restantes', icon: 'pi pi-fw pi-chart-line', to: '/admin/reportes' }
                ]
            }
        ];
    } else {
        model.value = [];
    }
};
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss">
/* ESTILOS QUE GARANTIZAN LETRAS BLANCAS EN TODO EL MENÚ */

.layout-menu {
  background-color: #1f2d3d !important;
  margin: 0;
  padding: 1rem 0;
  
  /* FORZAR TEXTO BLANCO EN TODOS LOS ELEMENTOS */
  * {
    color: #ffffff !important;
  }

  /* Estilos específicos para garantizar visibilidad */
  .p-menuitem-text,
  .p-menu-label,
  .menu-label,
  span,
  a,
  .p-menuitem-content,
  .p-submenu-header,
  .p-menuitem-link {
    color: #ffffff !important;
    font-weight: 500;
  }

  /* Íconos blancos */
  .pi,
  .p-menuitem-icon,
  i {
    color: #ffffff !important;
  }

  /* Estados hover */
  a:hover,
  .p-menuitem-link:hover {
    * {
      color: #00d8ff !important;
    }
    
    .pi,
    .p-menuitem-icon,
    i {
      color: #00d8ff !important;
    }
  }

  /* Estados activos */
  .active-menuitem,
  .router-link-active,
  .p-highlight {
    * {
      color: #00d8ff !important;
    }
    
    .pi,
    .p-menuitem-icon,
    i {
      color: #00d8ff !important;
    }
  }

  /* Badges blancos con fondo */
  .p-badge,
  .badge {
    color: #ffffff !important;
    background-color: #3b82f6 !important;
  }

  /* Separadores */
  .menu-separator {
    background-color: rgba(255, 255, 255, 0.2) !important;
    margin: 0.75rem 1rem;
  }

  /* Submenús */
  .p-submenu-list {
    background-color: #2d3f50 !important;
    
    * {
      color: #ffffff !important;
    }
  }
}

/* Si usas PrimeVue, estas reglas adicionales son CRÍTICAS */
.p-menu,
.p-tieredmenu,
.p-panelmenu {
  background: #1f2d3d !important;
  
  * {
    color: #ffffff !important;
  }
  
  .p-menuitem-text {
    color: #ffffff !important;
  }
  
  .p-menuitem-icon {
    color: #ffffff !important;
  }
}

/* Regla NUCLEAR - Garantiza que TODO en el sidebar sea blanco */
.layout-sidebar * {
  color: #ffffff !important;
}

/* Excepción solo para inputs, pero mantiene el menú blanco */
.layout-sidebar input,
.layout-sidebar textarea,
.layout-sidebar select {
  color: #1f2d3d !important;
}
</style>