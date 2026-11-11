<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { estadoSesion, pedirApi, verificarSesionActiva } from '../services/api'

const tareas = ref([])

const misTareas = computed(() => {
  if (!estadoSesion.usuario) return []
  return tareas.value.filter(
    tarea => tarea.creadoPor && String(tarea.creadoPor._id) === String(estadoSesion.usuario.id)
  )
})

const resumen = computed(() => ({
  total: misTareas.value.length,
  pendientes: misTareas.value.filter(t => t.estado === 'Pendiente').length,
  enProgreso: misTareas.value.filter(t => t.estado === 'En Progreso').length,
  completadas: misTareas.value.filter(t => t.estado === 'Completada').length,
}))

onMounted(async () => {
  await verificarSesionActiva(true)
  const respuesta = await pedirApi('GET', '/api/tareas')
  if (respuesta.ok) {
    tareas.value = respuesta.cuerpo.datos
  }
})
</script>

<template>
  <main>
    <section v-if="estadoSesion.usuario">
      <h2>Perfil del Estudiante</h2>
      <div class="tarjeta">
        <h3>{{ estadoSesion.usuario.nombre }}</h3>
        <p><strong>ID de estudiante:</strong> {{ estadoSesion.usuario.id }}</p>
        <p><strong>Área de trabajo:</strong> {{ estadoSesion.usuario.area }}</p>
        <p><strong>Estado de sesión:</strong> Activa</p>
      </div>
    </section>

    <section>
      <h2>Resumen de mis tareas</h2>
      <ul class="tarjetas-contenedor">
        <li class="tarjeta">
          <h3>Total creadas</h3>
          <p>{{ resumen.total }} tareas</p>
        </li>
        <li class="tarjeta">
          <h3>Pendientes</h3>
          <p>{{ resumen.pendientes }} tareas</p>
        </li>
        <li class="tarjeta">
          <h3>Completadas</h3>
          <p>{{ resumen.completadas }} tareas ({{ resumen.enProgreso }} en progreso)</p>
        </li>
      </ul>
      <p class="texto-ayuda">
        <RouterLink to="/tareas">Ir al Dashboard de Tareas →</RouterLink>
      </p>
    </section>
  </main>
</template>

