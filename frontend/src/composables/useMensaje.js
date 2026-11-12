import { ref } from 'vue'

export function useMensaje() {
  const texto = ref('')
  const tipo = ref('exito')

  function mostrar(nuevoTexto, nuevoTipo = 'exito') {
    texto.value = nuevoTexto
    tipo.value = nuevoTipo
  }

  function limpiar() {
    texto.value = ''
  }

  return { texto, tipo, mostrar, limpiar }
}

