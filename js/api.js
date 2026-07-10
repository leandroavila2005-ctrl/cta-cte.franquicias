// ============================================================================
//  Cliente de datos. Un solo contrato, dos implementaciones:
//    · MODO DEMO → lee de Genova.mock.db (en memoria).
//    · MODO REAL → llama al Web App de Google Apps Script (Google Sheets).
//
//  Métodos (todos devuelven una Promesa):
//    api.dashboard(sucursal, mes)      → totales calculados del mes
//    api.list(entidad, filtros)        → filas de una hoja (con filtros opc.)
//    api.create(entidad, datos)        → agrega una fila
//    api.update(entidad, id, datos)    → modifica una fila
//    api.remove(entidad, id)           → borra una fila
// ============================================================================
window.Genova = window.Genova || {}

Genova.api = (function () {
  var cfg = Genova.config

  // --------- Filtro y orden comunes (demo) ---------
  function aplicarFiltros(filas, filtros) {
    if (!filtros) return filas
    return filas.filter(function (f) {
      for (var k in filtros) {
        if (filtros[k] != null && f[k] !== filtros[k]) return false
      }
      return true
    })
  }
  function porFechaDesc(a, b) {
    return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0
  }

  // ============================ MODO DEMO ============================
  function demo() {
    var db = Genova.mock.db

    function list(entidad, filtros) {
      var filas = (db[entidad] || []).slice()
      filas = aplicarFiltros(filas, filtros)
      if (entidad === 'anexos') {
        filas = filas.map(function (a) {
          return Object.assign({}, a, { subtotal: a.cantidad * a.precioUnit })
        })
      }
      if (entidad === 'anexos' || entidad === 'pagos' || entidad === 'ventas') {
        filas.sort(porFechaDesc)
      }
      return Promise.resolve(filas)
    }

    function dashboard(sucursal, mes) {
      return Promise.resolve(Genova.compute.dashboard(db, sucursal, mes))
    }

    function create(entidad, datos) {
      db[entidad] = db[entidad] || []
      db[entidad].push(datos)
      return Promise.resolve(datos)
    }
    function update(entidad, index, datos) {
      Object.assign(db[entidad][index], datos)
      return Promise.resolve(db[entidad][index])
    }
    function remove(entidad, index) {
      db[entidad].splice(index, 1)
      return Promise.resolve(true)
    }

    function me() { return Promise.resolve({ email: 'demo', rol: 'admin', sucursal: '' }) }

    function panelAdmin(kind, index, mes) {
      var sucursales = (db.sucursales || []).slice()
      var idx = Number(index) || 0
      var sucursal = (sucursales[idx] || sucursales[0] || {}).nombre || ''
      return Promise.all([
        dashboard(sucursal, mes),
        list('anexos', { sucursal: sucursal, mes: mes }),
        list('pagos', { sucursal: sucursal, mes: mes }),
        list('usuarios', {}),
        list('catalogo', {}),
      ]).then(function (r) {
        return { selKind: 'sucursal', sucursales: sucursales, mayoristas: [], sucursalActual: sucursal, dash: r[0], anexos: r[1], pagos: r[2], usuarios: r[3], catalogo: r[4] }
      })
    }
    function panelComision() { return Promise.resolve({ mayoristas: [], facturas: [] }) }
    function panelFran(sucursal, mes) {
      return Promise.all([
        dashboard(sucursal, mes),
        list('anexos', { sucursal: sucursal, mes: mes }),
        list('pagos', { sucursal: sucursal, mes: mes }),
      ]).then(function (r) { return { dash: r[0], anexos: r[1], pagos: r[2] } })
    }

    return { me: me, panelAdmin: panelAdmin, panelFran: panelFran, panelComision: panelComision, list: list, dashboard: dashboard, create: create, update: update, remove: remove }
  }

  // ============================ MODO REAL ============================
  // Habla con backend/Code.gs publicado como Web App.
  function real() {
    function tok() {
      return (Genova.auth && Genova.auth.token && Genova.auth.token()) || ''
    }
    function qs(params) {
      return Object.keys(params)
        .filter(function (k) { return params[k] != null })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]) })
        .join('&')
    }
    function get(params) {
      return fetch(cfg.API_URL + '?' + qs(Object.assign({ token: tok(), _: Date.now() }, params))).then(function (r) { return r.json() })
    }
    function post(body) {
      return fetch(cfg.API_URL, {
        method: 'POST',
        // texto plano evita el "preflight" CORS que Apps Script no maneja
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ token: tok() }, body)),
      }).then(function (r) { return r.json() })
    }

    return {
      me: function () {
        return get({ action: 'me' })
      },
      panelAdmin: function (kind, index, mes) {
        return get({ action: 'panelAdmin', kind: kind, index: index, mes: mes })
      },
      panelFran: function (sucursal, mes) {
        return get({ action: 'panelFran', sucursal: sucursal, mes: mes })
      },
      panelComision: function (mes) {
        return get({ action: 'panelComision', mes: mes })
      },
      list: function (entidad, filtros) {
        return get(Object.assign({ action: 'list', entity: entidad }, filtros || []))
      },
      dashboard: function (sucursal, mes) {
        return get({ action: 'dashboard', sucursal: sucursal, mes: mes })
      },
      // Escrituras por GET: el POST cross-origin con Apps Script termina en una
      // redirección que el navegador recibe como HTML y no devuelve JSON confiable.
      create: function (entidad, datos) {
        return get({ action: 'create', entity: entidad, data: JSON.stringify(datos) })
      },
      update: function (entidad, id, datos) {
        return get({ action: 'update', entity: entidad, id: id, data: JSON.stringify(datos) })
      },
      remove: function (entidad, id) {
        return get({ action: 'remove', entity: entidad, id: id })
      },
    }
  }

  return cfg.DEMO_MODE ? demo() : real()
})()
