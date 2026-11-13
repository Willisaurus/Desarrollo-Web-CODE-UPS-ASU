<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useValidaciones } from '../composables/useValidaciones'
import MensajeEstado from './MensajeEstado.vue'

const props = defineProps({
  tareaEdicion: { type: Object, default: null },
  enviando: { type: Boolean, default: false },
})

const emit = defineEmits(['guardar', 'cancelar'])

const { validarTarea } = useValidaciones()

const formulario = reactive({
  titulo: '',
  descripcion: '',
  area: '',
  fechaEntrega: '',
  estado: 'Pendiente',
})
const error = ref('')

const esEdicion = computed(() => props.tareaEdicion !== null)

function cargarTarea(tarea) {
  formulario.titulo = tarea ? tarea.titulo : ''
  formulario.descripcion = tarea ? tarea.descripcion : ''
  formulario.area = tarea ? tarea.area : ''
  formulario.fechaEntrega = tarea ? tarea.fechaEntrega.slice(0, 10) : ''
  formulario.estado = tarea ? tarea.estado : 'Pendiente'
  error.value = ''
}

watch(() => props.tareaEdicion, cargarTarea, { immediate: true })

function enviar() {
  error.value = validarTarea(formulario)
  if (error.value) {
    return
  }

  emit('guardar', {
    titulo: formulario.titulo.trim(),
    descripcion: formulario.descripcion.trim(),
    area: formulario.area,
    fechaEntrega: formulario.fechaEntrega,
    estado: formulario.estado,
  })
}
</script>

<template>
  <form novalidate @submit.prevent="enviar">
    <fieldset>
      <legend>Datos de la tarea</legend>

      <div class="campo-formulario">
        <label for="titulo">Título:</label>
        <input
          id="titulo"
          v-model="formulario.titulo"
          type="text"
          placeholder="Ej. Taller de Git"
          maxlength="100"
          required
        >
      </div>

      <div class="campo-formulario">
        <label for="descripcion">Descripción (opcional):</label>
        <textarea id="descripcion" v-model="formulario.descripcion" rows="3" maxlength="500"></textarea>
      </div>

      <div class="campo-formulario">
        <label for="area">Área:</label>
        <select id="area" v-model="formulario.area" required>
          <option value="">-- Selecciona un área --</option>
          <option value="Desarrollo Web">Desarrollo Web</option>
          <option value="Inteligencia Artificial">Inteligencia Artificial</option>
          <option value="Vinculación">Vinculación</option>
        </select>
      </div>

      <div class="campo-formulario">
        <label for="fechaEntrega">Fecha de entrega:</label>
        <input id="fechaEntrega" v-model="formulario.fechaEntrega" type="date" required>
      </div>

      <div class="campo-formulario">
        <label for="estado">Estado:</label>
        <select id="estado" v-model="formulario.estado">
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completada">Completada</option>
        </select>
      </div>

      <MensajeEstado :texto="error" tipo="error" />

      <div class="grupo-botones">
        <button type="submit" :disabled="enviando">
          <template v-if="enviando">Guardando...</template>
          <template v-else-if="esEdicion">Guardar cambios</template>
          <template v-else>Guardar tarea</template>
        </button>
        <button v-if="esEdicion" type="button" :disabled="enviando" @click="emit('cancelar')">
          Cancelar edición
        </button>
      </div>
    </fieldset>
  </form>
</template>

