// Formato de números y fechas (presentación en el cliente).
window.Genova = window.Genova || {}

Genova.format = (function () {
  var MESES_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  var MESES_LARGO = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  // 1240000 -> "$1.240.000"   ·   -12400 -> "−$12.400"
  function money(n) {
    var neg = n < 0
    var x = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return (neg ? '−$' : '$') + x
  }

  // 2480000 -> "2.480.000"  (sin símbolo, para el input de venta)
  function plain(n) {
    return Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // '2026-07-28' -> "28"
  function dayOf(fecha) {
    return fecha.split('-')[2]
  }
  // '2026-07-28' -> "28/07"
  function ddmm(fecha) {
    var p = fecha.split('-')
    return p[2] + '/' + p[1]
  }
  // '2026-07-28' -> "jul"
  function mesAbbrDeFecha(fecha) {
    var p = fecha.split('-')
    return MESES_ABBR[parseInt(p[1], 10) - 1]
  }
  // '2026-07' -> "Julio 2026"
  function mesLargo(mes) {
    var p = mes.split('-')
    return MESES_LARGO[parseInt(p[1], 10) - 1] + ' ' + p[0]
  }

  // Unidad abreviada (tabla admin): docena -> "doc", plancha -> "planchas", kg -> "kg"
  function unidadAbbr(u) {
    if (u === 'docena') return 'doc'
    if (u === 'plancha') return 'planchas'
    return u
  }
  // Unidad larga (detalle franquiciado): docena -> "docenas"
  function unidadLarga(u) {
    if (u === 'docena') return 'docenas'
    if (u === 'plancha') return 'planchas'
    return u
  }

  return {
    money: money,
    plain: plain,
    dayOf: dayOf,
    ddmm: ddmm,
    mesAbbrDeFecha: mesAbbrDeFecha,
    mesLargo: mesLargo,
    unidadAbbr: unidadAbbr,
    unidadLarga: unidadLarga,
  }
})()
