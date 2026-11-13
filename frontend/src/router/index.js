import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { verificarSesionActiva } from '../composables/useSesion'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, posicionGuardada) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return posicionGuardada || { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: HomeView,
      meta: { publica: true, titulo: 'Inicio - CODE UPS' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { publica: true, soloInvitado: true, titulo: 'Iniciar Sesión - CODE UPS' },
    },
    {
      path: '/tareas',
      name: 'tareas',
      component: () => import('../views/TareasView.vue'),
      meta: { requiereAuth: true, titulo: 'Dashboard de Tareas - CODE UPS' },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/PerfilView.vue'),
      meta: { requiereAuth: true, titulo: 'Perfil del Estudiante - CODE UPS' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'inicio' },
    },
  ],
})

router.beforeEach(async (to) => {
  const usuario = await verificarSesionActiva()

  if (to.meta.titulo) {
    document.title = to.meta.titulo
  }

  if (to.meta.requiereAuth && !usuario) {
    return { name: 'login' }
  }

  if (to.meta.soloInvitado && usuario) {
    return { name: 'tareas' }
  }
})

export default router
