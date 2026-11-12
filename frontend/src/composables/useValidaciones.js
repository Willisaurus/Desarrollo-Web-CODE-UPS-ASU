const DOMINIOS_PERMITIDOS = ['@est.ups.edu.ec', '@ups.edu.ec']
const LONGITUD_MINIMA_PASSWORD = 6
const LONGITUD_MINIMA_TITULO = 3

function esCorreoInstitucional(correo) {
  return DOMINIOS_PERMITIDOS.some(dominio => correo.endsWith(dominio))
}

function validarRegistro(datos) {
  if (datos.nombre.trim() === '') {
    return 'Por favor, ingresa tu nombre completo.'
  }
  if (!esCorreoInstitucional(datos.correo.trim().toLowerCase())) {
    return 'Debes ingresar un correo institucional válido (@est.ups.edu.ec o @ups.edu.ec).'
  }
  if (datos.password.length < LONGITUD_MINIMA_PASSWORD) {
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
  }
  if (datos.area === '') {
    return 'Por favor, selecciona un área de interés de la lista.'
  }
  return ''
}

function validarLogin(datos) {
  if (datos.correo.trim() === '' || datos.password === '') {
    return 'Ingresa tu correo y tu contraseña.'
  }
  return ''
}

function validarTarea(datos) {
  if (datos.titulo.trim().length < LONGITUD_MINIMA_TITULO) {
    return `El título debe tener al menos ${LONGITUD_MINIMA_TITULO} caracteres.`
  }
  if (datos.area === '') {
    return 'Selecciona un área.'
  }
  if (datos.fechaEntrega === '') {
    return 'Selecciona una fecha de entrega.'
  }
  return ''
}

export function useValidaciones() {
  return { validarRegistro, validarLogin, validarTarea }
}

