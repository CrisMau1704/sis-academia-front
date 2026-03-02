import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from "@/layout/AppLayout.vue"
import HomeView from '../views/HomeView.vue'
import Login from '../views/auth/Login.vue'
import NotFound from '../views/errors/NotFound.vue'
import Dashboard from '../views/admin/Dashboard.vue'
import Estudiantes from '../views/admin/Estudiantes.vue'
import Modalidades from '../views/admin/Modalidades.vue'
import Horarios from '../views/admin/Horarios.vue'
import Inscripciones from '../views/admin/Inscripciones.vue'
import Asistencias from '../views/admin/Asistencias.vue'
import Roles from '../views/admin/Roles.vue'
import Usuario from '@/views/admin/Usuario.vue'
import Sucursales from '../views/admin/Sucursales.vue'
import Entrenadores from '../views/admin/Entrenadores.vue'
import Disciplinas from '../views/admin/Disciplina.vue'
import HistorialPago from '../views/admin/HistorialPago.vue'
import AsistenciasMensuales from '../views/admin/AsistenciasMensuales.vue'
import ClasesRestantes from '../views/admin/ClasesRestantes.vue'
import RecuperarClases from '../views/admin/RecuperarClases.vue'
import Reembolsos from '../views/admin/Reembolsos.vue'
import Preinscripciones from '../views/admin/Preinscripciones.vue'

const routes = [
  // ===== RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN) =====
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiereAuth: false } // ← IMPORTANTE: ESTÁ BIEN ESCRITO
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiereAuth: false }
  },

  // ===== RUTAS PRIVADAS (REQUIEREN AUTENTICACIÓN) =====
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiereAuth: true }, // ← TODAS LAS RUTAS HIJO HEREDAN ESTO
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'estudiantes',
        name: 'Estudiantes',
        component: Estudiantes
      },
      {
        path: 'modalidades',
        name: 'Modalidades',
        component: Modalidades
      },
      {
        path: 'disciplinas',
        name: 'Disciplinas',
        component: Disciplinas
      },
      {
        path: 'horarios',
        name: 'Horarios',
        component: Horarios
      },
      {
        path: 'inscripciones',
        name: 'Inscripciones',
        component: Inscripciones
      },
      {
        path: 'preinscripciones',
        name: 'Preinscripciones',
        component: Preinscripciones
      },

      {
        path: 'asistencias',
        name: 'Asistencias',
        component: Asistencias
      },
      {
        path: 'recuperarclases',
        name: 'RecuperarClases',
        component: RecuperarClases
      },
      {
        path: 'historialpagos',
        name: 'HistorialPago',
        component: HistorialPago
      },
      {
        path: 'reembolsos',
        name: 'Reembolsos',
        component: Reembolsos
      },
      {
        path: 'clasesrestantes',
        name: 'ClasesRestantes',
        component: ClasesRestantes
      },
      {
        path: 'asistenciasmensuales',
        name: 'AsistenciasMensuales',
        component: AsistenciasMensuales
      },
      {
        path: 'usuario',
        name: 'Usuario',
        component: Usuario
        // NO NECESITA META, HEREDA DEL PADRE
      },
      {
        path: 'roles',
        name: 'Roles',
        component: Roles
      },
      {
        path: 'sucursales',
        name: 'Sucursales',
        component: Sucursales
      },
      {
        path: 'entrenadores',
        name: 'Entrenadores',
        component: Entrenadores
      }
    ]
  },

  // ===== RUTA 404 =====
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ============================================
// GUARD DE NAVEGACIÓN CORREGIDO
// ============================================
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  
  // 👇 LOGS PARA DEBUG (puedes eliminarlos después)
  console.log('=== NAVEGACIÓN ===')
  console.log('📍 Ruta destino:', to.path)
  console.log('📋 Meta:', to.meta)
  console.log('🔑 Token existe?', !!token)
  console.log('❌ requiereAuth?', to.meta.requiereAuth)

  // REGLA 1: Si la ruta requiere auth y NO hay token → Login
  if (to.meta.requiereAuth && !token) {
    console.log('⏭️ Redirigiendo a Login (requiere autenticación)')
    return next({ name: 'Login' })
  }

  // REGLA 2: Si va al login y YA tiene token → Dashboard
  if (to.name === 'Login' && token) {
    console.log('⏭️ Redirigiendo a Dashboard (ya está logueado)')
    return next({ name: 'Dashboard' })
  }

  // REGLA 3: Para TODO lo demás (incluyendo Home), permitir acceso
  console.log('✅ Acceso permitido a:', to.path)
  next()
})

export default router