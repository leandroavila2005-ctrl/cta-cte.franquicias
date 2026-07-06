// ============================================================================
//  App — estado compartido, navegación y montaje de las vistas.
// ============================================================================
window.Genova = window.Genova || {}

;(function () {
  var api = Genova.api
  var views = Genova.views
  var cfg = Genova.config

  var state = {
    view: 'login', // 'login' | 'fran' | 'admin'
    fTab: 'resumen', // pestaña del franquiciado
    aTab: 'resumen', // pestaña del admin
    branch: 0, // índice de sucursal activa (admin)
    det: true, // detalle del cálculo abierto (franquiciado)
    modal: null, // modal admin abierto: 'pago' | 'anexo' | 'usuario' | 'producto'
    sucursalActual: '', // nombre de la sucursal activa (admin) — para las escrituras
    user: null, // { email, rol, sucursal } — usuario autenticado (modo real)
    deniedEmail: '', // email rechazado (pantalla de acceso denegado)
    deniedError: '', // mensaje de error crudo del backend (diagnóstico)
  }

  var root = document.getElementById('app')

  // --- Carga los datos que la vista actual necesita y la dibuja ---
  async function render() {
    if (state.view === 'login') {
      root.innerHTML = views.login()
      return
    }
    if (state.view === 'booting') {
      root.innerHTML = views.booting()
      return
    }
    if (state.view === 'denied') {
      root.innerHTML = views.denied(state.deniedEmail, state.deniedError)
      return
    }

    if (state.view === 'fran') {
      var sucursalF = (state.user && state.user.sucursal) || 'City Bell' // su sucursal (o City Bell en demo)
      var resF = await api.panelFran(sucursalF, cfg.MES_ACTUAL)
      root.innerHTML = views.franchisee(state, { dash: resF.dash, anexos: resF.anexos, pagos: resF.pagos }) + views.franModal(state)
      return
    }

    // admin — una sola llamada trae todo lo de la pantalla
    var res = await api.panelAdmin(state.branch, cfg.MES_ACTUAL)
    state.sucursalActual = res.sucursalActual
    root.innerHTML = views.admin(state, {
      sucursales: res.sucursales,
      dash: res.dash,
      anexos: res.anexos,
      pagos: res.pagos,
      usuarios: res.usuarios,
      catalogo: res.catalogo,
    }) + views.adminModal(state, { sucursales: res.sucursales, catalogo: res.catalogo })
  }

  // --- Helpers de formularios ---
  function val(id) {
    var el = document.getElementById(id)
    return el ? el.value.trim() : ''
  }
  // "1.240.000" o "1240000" -> 1240000
  function num(s) {
    return Number(String(s).replace(/[^\d-]/g, '')) || 0
  }
  // "dd/mm" (o "dd/mm/aaaa") -> "AAAA-MM-DD" (año: del mes en curso). Vacío -> hoy.
  function isoFecha(s) {
    if (!s) {
      var h = new Date()
      return h.getFullYear() + '-' + ('0' + (h.getMonth() + 1)).slice(-2) + '-' + ('0' + h.getDate()).slice(-2)
    }
    var p = String(s).split('/')
    var d = ('0' + (p[0] || '')).slice(-2)
    var m = ('0' + (p[1] || '')).slice(-2)
    var y = p[2] || cfg.MES_ACTUAL.split('-')[0]
    return y + '-' + m + '-' + d
  }

  // --- Navegación por delegación de eventos (un solo listener) ---
  var actions = {
    'login-admin': function () { state.view = 'admin'; state.aTab = 'resumen'; state.modal = null },
    'login-fran': function () { state.view = 'fran'; state.fTab = 'resumen'; state.modal = null },
    'logout': function () {
      try { if (Genova.auth) Genova.auth.logout() } catch (e) {}
      state.user = null; state.modal = null; state.view = 'login'
    },
    'google-login': function () {
      Genova.auth.prompt(document.getElementById('gv-google-fallback'))
      return false // el render lo dispara onCredential cuando Google responde
    },
    'ftab': function (el) { state.fTab = el.getAttribute('data-tab') },
    'atab': function (el) { state.aTab = el.getAttribute('data-tab') },
    'branch': function (el) { state.branch = parseInt(el.getAttribute('data-index'), 10) },
    'toggle-det': function () { state.det = !state.det },

    'open-modal': function (el) { state.modal = el.getAttribute('data-modal') },
    'close-modal': function () { state.modal = null },

    'save-venta': function () {
      var monto = num(val('gv-venta'))
      var suc = state.sucursalActual, mes = cfg.MES_ACTUAL
      return api.list('ventas', { sucursal: suc, mes: mes }).then(function (rows) {
        if (rows && rows.length) return api.update('ventas', rows[0]._row, { monto: monto })
        return api.create('ventas', { sucursal: suc, mes: mes, monto: monto, fecha: isoFecha(''), cargadoPor: 'Admin' })
      })
    },

    'save-pago': function () {
      var monto = num(val('gv-pago-monto'))
      var concepto = val('gv-pago-concepto')
      if (!concepto || !monto) return false
      state.modal = null
      return api.create('pagos', {
        sucursal: state.sucursalActual, mes: cfg.MES_ACTUAL,
        concepto: concepto, monto: monto, estado: 'ok', fecha: isoFecha(val('gv-fecha')),
      })
    },

    'save-anexo': function () {
      var sel = document.getElementById('gv-anexo-producto')
      if (!sel || !sel.value) { window.alert('No hay productos en el catálogo. Cargá uno primero en Configuración → Nuevo producto.'); return false }
      var opt = sel.options[sel.selectedIndex]
      var cantidad = num(val('gv-anexo-cantidad'))
      if (!cantidad) return false
      state.modal = null
      return api.create('anexos', {
        sucursal: state.sucursalActual, mes: cfg.MES_ACTUAL, fecha: isoFecha(val('gv-fecha')),
        producto: sel.value, cantidad: cantidad,
        unidad: opt.getAttribute('data-unidad'), precioUnit: num(opt.getAttribute('data-precio')),
      })
    },

    'save-usuario': function () {
      var nombre = val('gv-user-nombre')
      if (!nombre) return false
      state.modal = null
      return api.create('usuarios', {
        nombre: nombre, iniciales: val('gv-user-iniciales'), sucursal: val('gv-user-sucursal'),
        email: val('gv-user-email'), rol: 'franquiciado', estado: 'Activo',
      })
    },

    'save-producto': function () {
      var producto = val('gv-prod-nombre')
      if (!producto) return false
      state.modal = null
      return api.create('catalogo', {
        producto: producto, unidad: val('gv-prod-unidad'), precio: num(val('gv-prod-precio')),
      })
    },

    'save-pago-fran': function () {
      var monto = num(val('gv-fpago-monto'))
      var concepto = val('gv-fpago-concepto')
      if (!concepto || !monto) return false
      state.modal = null
      return api.create('pagos', {
        sucursal: 'City Bell', mes: cfg.MES_ACTUAL,
        concepto: concepto, monto: monto, estado: 'pending', fecha: isoFecha(val('gv-fecha')),
      })
    },

    'verify-pago': function (el) {
      return api.update('pagos', parseInt(el.getAttribute('data-id'), 10), { estado: 'ok' })
    },
    'reject-pago': function (el) {
      if (!window.confirm('¿Rechazar y borrar este pago?')) return false
      return api.remove('pagos', parseInt(el.getAttribute('data-id'), 10))
    },
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]')
    if (!el) return
    var fn = actions[el.getAttribute('data-action')]
    if (!fn) return
    var r = fn(el)
    if (r === false) return
    Promise.resolve(r).then(function (res) {
      if (res && res.error) window.alert('El backend rechazó la operación: ' + res.error)
      return render()
    }).catch(function (e) {
      window.alert('Error de conexión con la planilla: ' + (e && e.message ? e.message : e))
    })
  })

  // --- Arranque / autenticación ---
  function onCredential() {
    state.view = 'booting'; render()
    api.me().then(function (me) {
      if (!me || me.error) {
        state.deniedEmail = (Genova.auth.profile() || {}).email || ''
        state.deniedError = (me && me.error) || 'respuesta vacía del backend'
        state.view = 'denied'; render(); return
      }
      state.user = me
      state.view = me.rol === 'admin' ? 'admin' : 'fran'
      state.aTab = 'resumen'; state.fTab = 'resumen'; state.branch = 0
      render()
    }).catch(function (e) {
      state.deniedEmail = (Genova.auth.profile() || {}).email || ''
      state.deniedError = 'fetch falló: ' + (e && e.message ? e.message : e)
      state.view = 'denied'; render()
    })
  }

  function waitForGoogle(cb, n) {
    if (window.google && google.accounts && google.accounts.id) return cb()
    if ((n || 0) > 100) return
    setTimeout(function () { waitForGoogle(cb, (n || 0) + 1) }, 120)
  }

  function start() {
    render() // pantalla de login
    if (cfg.DEMO_MODE) return // modo demo: botones de rol, sin Google
    waitForGoogle(function () {
      try { Genova.auth.init(onCredential) }
      catch (e) { window.alert(e.message) }
    })
  }

  start()
})()
