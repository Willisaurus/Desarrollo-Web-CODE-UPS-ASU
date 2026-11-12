<script setup>
defineProps({
  usuario: { type: Object, required: true },
})
</script>

<template>
  <div class="tarjeta">
    <h3>{{ usuario.nombre }}</h3>
    <p><strong>ID de estudiante:</strong> {{ usuario.id }}</p>
    <p><strong>Área de trabajo:</strong> {{ usuario.area }}</p>
    <p><strong>Estado de sesión:</strong> Activa</p>
  </div>
</template>

