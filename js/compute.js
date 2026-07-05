// ============================================================================
//  Cálculo de la cuenta corriente (misma fórmula que el Excel "Anexos sucus")
//
//    Total del mes = Venta/2 + Anexos/2 + Saldo anterior − Pagos del mes
//
//  Esta lógica vive acá para el MODO DEMO. En modo real, el mismo cálculo lo
//  hace el backend de Google Apps Script (backend/Code.gs) — mismo contrato.
// ============================================================================
window.Genova = window.Genova || {}

Genova.compute = (function () {
  function esDe(sucursal, mes) {
    return function (r) {
      return r.sucursal === sucursal && r.mes === mes
    }
  }
  function suma(arr) {
    return arr.reduce(function (t, n) { return t + n }, 0)
  }

  // Devuelve todos los totales derivados de una sucursal en un mes.
  function dashboard(db, sucursal, mes) {
    var filtro = esDe(sucursal, mes)

    var ventasMes = db.ventas.filter(filtro)
    var ventaCargada = ventasMes.length > 0
    var venta = suma(ventasMes.map(function (v) { return v.monto }))

    var anexosMes = db.anexos.filter(filtro)
    var anexosTotal = suma(anexosMes.map(function (a) { return a.cantidad * a.precioUnit }))

    var saldoRec = db.saldos.filter(filtro)[0]
    var saldoAnterior = saldoRec ? saldoRec.monto : 0

    var ventaMitad = venta / 2
    var anexosMitad = anexosTotal / 2
    var totalMes = ventaMitad + anexosMitad + saldoAnterior

    var pagosMes = db.pagos.filter(filtro)
    var pagosVerificados = suma(pagosMes.filter(function (p) { return p.estado === 'ok' }).map(function (p) { return p.monto }))
    var pagosPorVerificar = suma(pagosMes.filter(function (p) { return p.estado === 'pending' }).map(function (p) { return p.monto }))
    var pendCount = pagosMes.filter(function (p) { return p.estado === 'pending' }).length
    var pagosTotal = pagosVerificados + pagosPorVerificar

    var saldo = totalMes - pagosTotal
    var status = saldo > 0 ? 'pendiente' : (saldo < 0 ? 'favor' : 'aldia')

    return {
      sucursal: sucursal,
      mes: mes,
      ventaCargada: ventaCargada,
      venta: venta,
      ventaMitad: ventaMitad,
      anexosTotal: anexosTotal,
      anexosMitad: anexosMitad,
      saldoAnterior: saldoAnterior,
      totalMes: totalMes,
      pagosVerificados: pagosVerificados,
      pagosPorVerificar: pagosPorVerificar,
      pendCount: pendCount,
      pagosTotal: pagosTotal,
      saldo: saldo,
      status: status,
    }
  }

  return { dashboard: dashboard }
})()
