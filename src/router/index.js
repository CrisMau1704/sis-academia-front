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



const routes = [
  {
    path: '/',
    // este codigo se activa si se quiere apuntar a una landing page 
    //name: 'Home',
    // component: HomeView
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiereAuth: false }
  },
  {
    path: '/admin',
    component: AppLayout,
    meta: { requiereAuth: true },
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
                component: Usuario,
                meta:{requiereAuth: true}
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
      },
       

    ]
  },
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

// Guard para autenticación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiereAuth && !token) {
    return next({ name: 'Login' })
  }

  if (to.name === 'Login' && token) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router
