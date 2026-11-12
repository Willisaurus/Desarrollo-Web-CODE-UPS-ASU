export function formatearFecha(fechaIso) {
  if (!fechaIso) {
    return ''
  }
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

