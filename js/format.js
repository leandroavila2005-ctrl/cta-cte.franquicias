// Formato de números y fechas (presentación en el cliente).
window.Genova = window.Genova || {}

Genova.format = (function () {
  var MESES_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  var MESES_LARGO = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  // Formato argentino: miles con "." y 2 decimales con ",".  1240000 -> "1.240.000,00"
  function arNum(n) {
    var p = Math.abs(Number(n) || 0).toFixed(2).split('.')
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1]
  }
  // 1240000 -> "$1.240.000,00"   ·   -12400.5 -> "−$12.400,50"
  function money(n) {
    return ((Number(n) || 0) < 0 ? '−$' : '$') + arNum(n)
  }
  // 2480000 -> "2.480.000,00"  (sin símbolo, para el input de venta)
  function plain(n) {
    return arNum(n)
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
  // '2026-07-28' -> "28/07/2026"
  function dmy(fecha) {
    var p = fecha.split('-')
    return p[2] + '/' + p[1] + '/' + p[0]
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
    dmy: dmy,
    mesAbbrDeFecha: mesAbbrDeFecha,
    mesLargo: mesLargo,
    unidadAbbr: unidadAbbr,
    unidadLarga: unidadLarga,
  }
})()
