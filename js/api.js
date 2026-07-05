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

    return { list: list, dashboard: dashboard, create: create, update: update, remove: remove }
  }

  // ============================ MODO REAL ============================
  // Habla con backend/Code.gs publicado como Web App.
  function real() {
    function qs(params) {
      return Object.keys(params)
        .filter(function (k) { return params[k] != null })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]) })
        .join('&')
    }
    function get(params) {
      return fetch(cfg.API_URL + '?' + qs(params)).then(function (r) { return r.json() })
    }
    function post(body) {
      return fetch(cfg.API_URL, {
        method: 'POST',
        // texto plano evita el "preflight" CORS que Apps Script no maneja
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      }).then(function (r) { return r.json() })
    }

    return {
      list: function (entidad, filtros) {
        return get(Object.assign({ action: 'list', entity: entidad }, filtros || []))
      },
      dashboard: function (sucursal, mes) {
        return get({ action: 'dashboard', sucursal: sucursal, mes: mes })
      },
      create: function (entidad, datos) {
        return post({ action: 'create', entity: entidad, data: datos })
      },
      update: function (entidad, id, datos) {
        return post({ action: 'update', entity: entidad, id: id, data: datos })
      },
      remove: function (entidad, id) {
        return post({ action: 'remove', entity: entidad, id: id })
      },
    }
  }

  return cfg.DEMO_MODE ? demo() : real()
})()
