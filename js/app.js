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
  }

  var root = document.getElementById('app')

  // --- Carga los datos que la vista actual necesita y la dibuja ---
  async function render() {
    if (state.view === 'login') {
      root.innerHTML = views.login()
      return
    }

    if (state.view === 'fran') {
      var sucursalF = 'City Bell' // el franquiciado ve siempre su sucursal
      var mesF = cfg.MES_ACTUAL
      var resF = await Promise.all([
        api.dashboard(sucursalF, mesF),
        api.list('anexos', { sucursal: sucursalF, mes: mesF }),
        api.list('pagos', { sucursal: sucursalF, mes: mesF }),
      ])
      root.innerHTML = views.franchisee(state, { dash: resF[0], anexos: resF[1], pagos: resF[2] })
      return
    }

    // admin
    var sucursales = await api.list('sucursales', {})
    var sucursal = sucursales[state.branch].nombre
    var mes = cfg.MES_ACTUAL
    var res = await Promise.all([
      api.dashboard(sucursal, mes),
      api.list('anexos', { sucursal: sucursal, mes: mes }),
      api.list('pagos', { sucursal: sucursal, mes: mes }),
      api.list('usuarios', {}),
      api.list('catalogo', {}),
    ])
    root.innerHTML = views.admin(state, {
      sucursales: sucursales,
      dash: res[0],
      anexos: res[1],
      pagos: res[2],
      usuarios: res[3],
      catalogo: res[4],
    })
  }

  // --- Navegación por delegación de eventos (un solo listener) ---
  var actions = {
    'login-admin': function () { state.view = 'admin'; state.aTab = 'resumen' },
    'login-fran': function () { state.view = 'fran'; state.fTab = 'resumen' },
    'logout': function () { state.view = 'login' },
    'ftab': function (el) { state.fTab = el.getAttribute('data-tab') },
    'atab': function (el) { state.aTab = el.getAttribute('data-tab') },
    'branch': function (el) { state.branch = parseInt(el.getAttribute('data-index'), 10) },
    'toggle-det': function () { state.det = !state.det },
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]')
    if (!el) return
    var fn = actions[el.getAttribute('data-action')]
    if (!fn) return
    fn(el)
    render()
  })

  render()
})()
