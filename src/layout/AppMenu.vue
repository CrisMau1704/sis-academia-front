<script setup>
import { ref, onMounted } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import authService from '../services/auth.service';

const model = ref([]);

onMounted(() => {
    const rol = authService.getUserRole();
    console.log('Rol del usuario:', rol);

// En tu archivo del menú
if (rol === 'super_admin') {
    model.value = [
        {
            label: 'Inicio',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin/dashboard' }
            ]
        },
        {
            label: 'Configuración General',
            items: [
                { label: 'Sucursales', icon: 'pi pi-fw pi-map-marker', to: '/admin/sucursales' },
                { label: 'Disciplinas', icon: 'pi pi-fw pi-star', to: '/admin/disciplinas' },
                { label: 'Modalidades', icon: 'pi pi-fw pi-briefcase', to: '/admin/modalidades' },
                
                { label: 'Horarios', icon: 'pi pi-fw pi-clock', to: '/admin/horarios' },
                { label: 'Entrenadores', icon: 'pi pi-fw pi-id-card', to: '/admin/entrenadores' }
            ]
        },
        {
            label: 'Gestión de Estudiantes',
            items: [
                { label: 'Estudiantes', icon: 'pi pi-fw pi-users', to: '/admin/estudiantes' },
                { label: 'Inscripciones', icon: 'pi pi-fw pi-list', to: '/admin/inscripciones' },
                
            ]
        },
        {
            label: 'Control de Asistencia',
            items: [
                { 
                    label: 'Registro Diario', 
                    icon: 'pi pi-fw pi-check-square', 
                    to: '/admin/asistencias' 
                },
                
                { 
                    label: 'Recuperar Clases', 
                    icon: 'pi pi-fw pi-refresh', 
                    to: '/admin/recuperarclases' 
                }
            ]
        },
        {
            label: 'Pagos y Mensualidades',
            items: [
               
                { label: 'Historial de Pagos', icon: 'pi pi-fw pi-history', to: '/admin/historialpagos' }
               
            ]
        },
        {
            label: 'Reportes',
            items: [
                { 
                    label: 'Clases Restantes', 
                    icon: 'pi pi-fw pi-chart-line', 
                    to: '/admin/clasesrestantes',
                    description: 'Ver cuántas clases le quedan a cada estudiante'
                },
                { 
                    label: 'Asistencia Mensual', 
                    icon: 'pi pi-fw pi-chart-bar', 
                    to: '/admin/asistenciasmensuales' 
                }
                
            ]
        },
        {
            label: 'Administración',
            items: [
                { label: 'Usuarios', icon: 'pi pi-fw pi-user', to: '/admin/usuario' },
                { label: 'Roles y Permisos', icon: 'pi pi-fw pi-shield', to: '/admin/roles' }
               
            ]
        }
    ];


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
    }else {
        console.log('Rol no reconocido:', rol);
    }
});
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