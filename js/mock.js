// ============================================================================
//  Datos de ejemplo del MODO DEMO (en memoria).
//  Replican la estructura de la planilla de Google Sheets: una "hoja" por
//  entidad. En modo real, estos mismos datos salen de tu planilla.
//
//  Estado de cuenta de demostración (mes en curso, Julio 2026):
//    · City Bell    → pendiente (debe)      · Gonnet     → al día ($0)
//    · Los Hornos   → saldo a favor (verde) · Villa Elvira → pendiente (debe)
// ============================================================================
window.Genova = window.Genova || {}

Genova.mock = (function () {
  // --- Hojas de configuración (listas maestras) ---
  var sucursales = [
    { nombre: 'City Bell' },
    { nombre: 'Gonnet' },
    { nombre: 'Los Hornos' },
    { nombre: 'Villa Elvira' },
  ]

  var usuarios = [
    { nombre: 'Marina Ferrari', iniciales: 'MF', sucursal: 'City Bell', email: 'citybell@genova.com', rol: 'franquiciado', estado: 'Activo' },
    { nombre: 'Diego Lauría', iniciales: 'DL', sucursal: 'Gonnet', email: 'gonnet@genova.com', rol: 'franquiciado', estado: 'Activo' },
    { nombre: 'Sofía Paz', iniciales: 'SP', sucursal: 'Los Hornos', email: 'loshornos@genova.com', rol: 'franquiciado', estado: 'Activo' },
    { nombre: 'Nahuel Ríos', iniciales: 'NR', sucursal: 'Villa Elvira', email: 'villaelvira@genova.com', rol: 'franquiciado', estado: 'Invitado' },
    { nombre: 'Roberto Genova', iniciales: 'RG', sucursal: '', email: 'admin@genova.com', rol: 'admin', estado: 'Activo' },
  ]

  var catalogo = [
    { producto: 'Sorrentinos de jamón y queso', unidad: 'docena', precio: 4450 },
    { producto: 'Ravioles de ricota', unidad: 'docena', precio: 3800 },
    { producto: 'Ñoquis de papa', unidad: 'docena', precio: 2900 },
    { producto: 'Tapa de empanada', unidad: 'plancha', precio: 1850 },
    { producto: 'Salsa bolognesa', unidad: 'kg', precio: 4200 },
    { producto: 'Salsa fileto', unidad: 'kg', precio: 3500 },
  ]

  // --- Hojas de datos (una fila por registro) ---
  var ventas = [
    { sucursal: 'City Bell', mes: '2026-07', monto: 2480000, fecha: '2026-07-01', cargadoPor: 'Roberto G.' },
    { sucursal: 'Gonnet', mes: '2026-07', monto: 1900000, fecha: '2026-07-01', cargadoPor: 'Roberto G.' },
    { sucursal: 'Los Hornos', mes: '2026-07', monto: 2100000, fecha: '2026-07-01', cargadoPor: 'Roberto G.' },
    { sucursal: 'Villa Elvira', mes: '2026-07', monto: 1650000, fecha: '2026-07-01', cargadoPor: 'Roberto G.' },
  ]

  // Saldo del mes anterior que se arrastra (cuenta corriente).
  var saldos = [
    { sucursal: 'City Bell', mes: '2026-07', monto: 145000 },
    { sucursal: 'Gonnet', mes: '2026-07', monto: 48200 },
    { sucursal: 'Los Hornos', mes: '2026-07', monto: 60000 },
    { sucursal: 'Villa Elvira', mes: '2026-07', monto: 95000 },
  ]

  var anexos = [
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-28', producto: 'Sorrentinos de jamón', cantidad: 6, unidad: 'docena', precioUnit: 4450 },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-22', producto: 'Tapa de empanada', cantidad: 20, unidad: 'plancha', precioUnit: 1850 },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-15', producto: 'Ñoquis de papa', cantidad: 15, unidad: 'docena', precioUnit: 2900 },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-08', producto: 'Salsa bolognesa', cantidad: 8, unidad: 'kg', precioUnit: 4200 },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-02', producto: 'Ravioles de ricota', cantidad: 12, unidad: 'docena', precioUnit: 3800 },

    { sucursal: 'Gonnet', mes: '2026-07', fecha: '2026-07-24', producto: 'Ravioles de ricota', cantidad: 10, unidad: 'docena', precioUnit: 3800 },
    { sucursal: 'Gonnet', mes: '2026-07', fecha: '2026-07-11', producto: 'Ñoquis de papa', cantidad: 8, unidad: 'docena', precioUnit: 2900 },

    { sucursal: 'Los Hornos', mes: '2026-07', fecha: '2026-07-20', producto: 'Sorrentinos de jamón', cantidad: 5, unidad: 'docena', precioUnit: 4450 },
    { sucursal: 'Los Hornos', mes: '2026-07', fecha: '2026-07-07', producto: 'Salsa bolognesa', cantidad: 6, unidad: 'kg', precioUnit: 4200 },

    { sucursal: 'Villa Elvira', mes: '2026-07', fecha: '2026-07-23', producto: 'Tapa de empanada', cantidad: 30, unidad: 'plancha', precioUnit: 1850 },
    { sucursal: 'Villa Elvira', mes: '2026-07', fecha: '2026-07-14', producto: 'Ravioles de ricota', cantidad: 20, unidad: 'docena', precioUnit: 3800 },
    { sucursal: 'Villa Elvira', mes: '2026-07', fecha: '2026-07-05', producto: 'Ñoquis de papa', cantidad: 15, unidad: 'docena', precioUnit: 2900 },
  ]

  var pagos = [
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-29', concepto: 'Posnet', monto: 200000, estado: 'pending' },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-18', concepto: 'Efectivo', monto: 300000, estado: 'ok' },
    { sucursal: 'City Bell', mes: '2026-07', fecha: '2026-07-05', concepto: 'Transferencia', monto: 400000, estado: 'ok' },

    { sucursal: 'Gonnet', mes: '2026-07', fecha: '2026-07-27', concepto: 'Transferencia', monto: 628800, estado: 'ok' },
    { sucursal: 'Gonnet', mes: '2026-07', fecha: '2026-07-10', concepto: 'Efectivo', monto: 400000, estado: 'ok' },

    { sucursal: 'Los Hornos', mes: '2026-07', fecha: '2026-07-26', concepto: 'Transferencia', monto: 746125, estado: 'ok' },
    { sucursal: 'Los Hornos', mes: '2026-07', fecha: '2026-07-09', concepto: 'Efectivo', monto: 400000, estado: 'ok' },

    { sucursal: 'Villa Elvira', mes: '2026-07', fecha: '2026-07-25', concepto: 'Posnet', monto: 192600, estado: 'pending' },
    { sucursal: 'Villa Elvira', mes: '2026-07', fecha: '2026-07-08', concepto: 'Transferencia', monto: 500000, estado: 'ok' },
  ]

  var db = {
    sucursales: sucursales,
    usuarios: usuarios,
    catalogo: catalogo,
    ventas: ventas,
    saldos: saldos,
    anexos: anexos,
    pagos: pagos,
  }

  return { db: db }
})()
