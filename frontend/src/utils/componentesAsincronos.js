import { defineAsyncComponent } from 'vue'
import IndicadorCarga from '../components/IndicadorCarga.vue'
import ErrorCargaComponente from '../components/ErrorCargaComponente.vue'

const RETARDO_INDICADOR = 200
const TIEMPO_MAXIMO = 10000

export function crearComponenteAsincrono(cargador) {
  return defineAsyncComponent({
    loader: cargador,
    loadingComponent: IndicadorCarga,
    errorComponent: ErrorCargaComponente,
    delay: RETARDO_INDICADOR,
    timeout: TIEMPO_MAXIMO,
  })
}

