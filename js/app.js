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
    selKind: 'sucursal', // 'sucursal' | 'mayorista' — qué se seleccionó en el sidebar admin
    mayorista: 0, // índice de mayorista activo (admin)
    det: true, // detalle del cálculo abierto (franquiciado)
    modal: null, // modal abierto: 'pago' | 'anexo' | 'usuario' | 'producto' | 'edit-anexo' | 'edit-pago'
    edit: null, // fila que se está editando: { row, ...valores }
    sucursalActual: '', // nombre de la sucursal activa (admin) — para las escrituras
    user: null, // { email, rol, sucursal } — usuario autenticado (modo real)
    deniedEmail: '', // email rechazado (pantalla de acceso denegado)
    deniedError: '', // mensaje de error crudo del backend (diagnóstico)
    mes: cfg.MES_ACTUAL, // mes que se está viendo (navegable hacia atrás)
    asFran: null, // admin mirando como franquiciado: nombre de sucursal (solo lectura)
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
      var sucursalF = state.asFran || (state.user && state.user.sucursal) || 'City Bell' // su sucursal (o la que el admin está mirando)
      var resF = await api.panelFran(sucursalF, state.mes)
      root.innerHTML = views.franchisee(state, { dash: resF.dash, anexos: resF.anexos, pagos: resF.pagos }) + views.franModal(state, { alias: resF.alias })
      return
    }

    // admin — una sola llamada trae todo lo de la pantalla
    var idx = state.selKind === 'mayorista' ? state.mayorista : state.branch
    var res = await api.panelAdmin(state.selKind, idx, state.mes)
    state.sucursalActual = res.sucursalActual || ''
    state.mayoristaActual = res.mayoristaActual || null
    root.innerHTML = views.admin(state, res) +
      views.adminModal(state, { sucursales: res.sucursales, catalogo: res.catalogo, alias: res.alias, mayoristas: res.mayoristas })
  }

  // --- Helpers de formularios ---
  function val(id) {
    var el = document.getElementById(id)
    return el ? el.value.trim() : ''
  }
  // Formato argentino del input ("1.240.000,50") -> 1240000.5  (miles ".", decimal ",")
  function num(s) {
    s = String(s).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Math.round((parseFloat(s) || 0) * 100) / 100
  }
  function esComisionista() { return !!(state.user && state.user.rol === 'comisionista') }

  // Reformatea un input numérico a formato argentino en vivo (miles "." + decimal ",").
  function reformatNum(el) {
    var v = el.value
    var neg = v.trim().charAt(0) === '-'
    v = v.replace(/[^\d,]/g, '') // solo dígitos y comas (los "." de miles se recalculan)
    var i = v.indexOf(',')
    var ent, dec = null
    if (i !== -1) { ent = v.slice(0, i).replace(/,/g, ''); dec = v.slice(i + 1).replace(/,/g, '').slice(0, 2) }
    else { ent = v.replace(/,/g, '') }
    ent = ent.replace(/^0+(?=\d)/, '')
    var miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    var out = (miles === '' && dec !== null) ? '0' : miles
    if (dec !== null) out += ',' + dec
    el.value = (neg && out !== '') ? '-' + out : out
  }
  function esNumInput(el) {
    return el && el.getAttribute && el.getAttribute('data-num') != null
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
  // 'AAAA-MM' +/- n meses -> 'AAAA-MM'
  function correrMes(mes, delta) {
    var p = mes.split('-')
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1 + delta, 1)
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)
  }

  // --- Navegación por delegación de eventos (un solo listener) ---
  var actions = {
    'login-admin': function () { state.view = 'admin'; state.aTab = 'resumen'; state.modal = null },
    'login-fran': function () { state.view = 'fran'; state.fTab = 'resumen'; state.modal = null },
    'logout': function () {
      try { if (Genova.auth) Genova.auth.logout() } catch (e) {}
      state.user = null; state.modal = null; state.asFran = null; state.view = 'login'
    },
    'view-as-fran': function () {
      state.asFran = state.sucursalActual || ''; state.view = 'fran'; state.fTab = 'resumen'; state.modal = null
    },
    'back-to-admin': function () {
      state.asFran = null; state.view = 'admin'; state.aTab = 'resumen'; state.modal = null
    },
    'google-login': function () {
      Genova.auth.prompt(document.getElementById('gv-google-fallback'))
      return false // el render lo dispara onCredential cuando Google responde
    },
    'ftab': function (el) { state.fTab = el.getAttribute('data-tab') },
    'atab': function (el) { state.selKind = 'sucursal'; state.aTab = el.getAttribute('data-tab') },
    'branch': function (el) { state.selKind = 'sucursal'; state.branch = parseInt(el.getAttribute('data-index'), 10); state.aTab = 'resumen' },
    'branch-may': function (el) { state.selKind = 'mayorista'; state.mayorista = parseInt(el.getAttribute('data-index'), 10) },
    'sel-comision': function () { state.selKind = 'comision' },
    'toggle-det': function () { state.det = !state.det },
    'prev-month': function () { state.mes = correrMes(state.mes, -1) },
    'next-month': function () { if (state.mes < cfg.MES_ACTUAL) state.mes = correrMes(state.mes, 1) },
    'set-mes': function (el) { var v = el.value; if (v && v <= cfg.MES_ACTUAL) state.mes = v },

    'open-modal': function (el) { state.modal = el.getAttribute('data-modal') },
    'close-modal': function () { state.modal = null },

    // Abrir/cerrar el menú lateral en mobile (toggle directo, sin re-render).
    'toggle-nav': function () {
      var adm = document.querySelector('.gv-admin')
      if (adm) adm.classList.toggle('gv-nav-open')
      return false
    },
    // Colapsar/expandir una sección (toggle directo del DOM, sin re-render).
    'collap': function (el) {
      var body = document.getElementById(el.getAttribute('data-target'))
      if (body) {
        var oculto = body.style.display === 'none'
        body.style.display = oculto ? '' : 'none'
        var chev = el.querySelector('.gv-chev')
        if (chev) chev.style.transform = oculto ? '' : 'rotate(-90deg)'
      }
      return false // sin re-render
    },

    'save-venta': function () {
      var monto = num(val('gv-venta'))
      var suc = state.sucursalActual, mes = state.mes
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
      var fecha = isoFecha(val('gv-fecha'))
      return api.create('pagos', {
        sucursal: state.sucursalActual, mes: fecha.slice(0, 7),
        concepto: concepto, monto: monto, estado: 'ok', fecha: fecha, observacion: val('gv-pago-obs'),
      })
    },

    'save-anexo': function () {
      var sel = document.getElementById('gv-anexo-producto')
      if (!sel || !sel.value) { window.alert('No hay productos en el catálogo. Cargá uno primero en Configuración → Nuevo producto.'); return false }
      var opt = sel.options[sel.selectedIndex]
      var cantidad = num(val('gv-anexo-cantidad'))
      if (!cantidad) return false
      state.modal = null
      var fecha = isoFecha(val('gv-fecha'))
      return api.create('anexos', {
        sucursal: state.sucursalActual, mes: fecha.slice(0, 7), fecha: fecha,
        producto: sel.value, cantidad: cantidad,
        unidad: opt.getAttribute('data-unidad'), precioUnit: Number(opt.getAttribute('data-precio')) || 0,
      })
    },

    'save-usuario': function () {
      var nombre = val('gv-user-nombre')
      if (!nombre) return false
      state.modal = null
      return api.create('usuarios', {
        nombre: nombre, iniciales: val('gv-user-iniciales'), sucursal: val('gv-user-sucursal'),
        email: val('gv-user-email'), rol: val('gv-user-rol') || 'franquiciado', estado: 'Activo',
      })
    },

    'save-cuenta': function () {
      var concepto = val('gv-cuenta-concepto')
      if (!concepto) return false
      state.modal = null
      return api.create('alias', { concepto: concepto, aliasCbu: val('gv-cuenta-cbu'), titular: val('gv-cuenta-titular') })
    },
    'edit-cuenta': function (el) {
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        concepto: decodeURIComponent(el.getAttribute('data-concepto') || ''),
        aliasCbu: decodeURIComponent(el.getAttribute('data-cbu') || ''),
        titular: decodeURIComponent(el.getAttribute('data-titular') || ''),
      }
      state.modal = 'edit-cuenta'
    },
    'del-cuenta': function (el) {
      if (!window.confirm('¿Eliminar esta cuenta para cobros?')) return false
      return api.remove('alias', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-cuenta': function () {
      var concepto = val('gv-cuenta-concepto')
      if (!concepto) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      return api.update('alias', row, { concepto: concepto, aliasCbu: val('gv-cuenta-cbu'), titular: val('gv-cuenta-titular') })
    },
    'copy-alias': function (el) {
      var txt = el.getAttribute('data-text') || ''
      try { if (navigator.clipboard) navigator.clipboard.writeText(txt) } catch (e) {}
      if (el.getAttribute('data-orig') == null) el.setAttribute('data-orig', el.innerHTML)
      el.textContent = '¡Copiado!'
      setTimeout(function () { el.innerHTML = el.getAttribute('data-orig') }, 1200)
      return false // sin re-render: mantiene el modal abierto
    },
    // Al elegir una cuenta en el desplegable, actualiza alias/CBU + titular (sin re-render).
    'pick-cuenta': function (el) {
      var opt = el.options[el.selectedIndex]
      var cbu = opt ? (opt.getAttribute('data-cbu') || '') : ''
      var tit = opt ? (opt.getAttribute('data-titular') || '') : ''
      var a = document.getElementById('gv-cuenta-alias'); if (a) a.textContent = cbu || '—'
      var t = document.getElementById('gv-cuenta-titular'); if (t) t.textContent = tit || '—'
      var c = document.getElementById('gv-cuenta-copy')
      if (c) { c.setAttribute('data-text', cbu); c.removeAttribute('data-orig') }
      return false // sin re-render
    },

    'save-producto': function () {
      var producto = val('gv-prod-nombre')
      if (!producto) return false
      state.modal = null
      return api.create('catalogo', {
        producto: producto, unidad: val('gv-prod-unidad'), precio: num(val('gv-prod-precio')),
      })
    },

    // ---------- Mayoristas (Configuración) ----------
    'save-mayorista': function () {
      var nombre = val('gv-may-nombre')
      if (!nombre) return false
      state.modal = null
      return api.create('mayoristas', { nombre: nombre, cuit: val('gv-may-cuit'), plazoPago: num(val('gv-may-plazo')), telefono: val('gv-may-tel') })
    },
    'edit-mayorista': function (el) {
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        nombre: decodeURIComponent(el.getAttribute('data-nombre') || ''),
        cuit: decodeURIComponent(el.getAttribute('data-cuit') || ''),
        plazoPago: el.getAttribute('data-plazo'),
        telefono: decodeURIComponent(el.getAttribute('data-tel') || ''),
      }
      state.modal = 'edit-mayorista'
    },
    'del-mayorista': function (el) {
      if (!window.confirm('¿Eliminar este mayorista?')) return false
      return api.remove('mayoristas', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-mayorista': function () {
      var nombre = val('gv-may-nombre')
      if (!nombre) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      return api.update('mayoristas', row, { nombre: nombre, cuit: val('gv-may-cuit'), plazoPago: num(val('gv-may-plazo')), telefono: val('gv-may-tel') })
    },

    // ---------- Facturación mayorista ----------
    'save-factura': function () {
      if (esComisionista()) return false
      var nro = val('gv-fc-nro')
      var monto = num(val('gv-fc-monto'))
      if (!nro || !monto) return false
      state.modal = null
      var fecha = isoFecha(val('gv-fecha'))
      var may = (state.mayoristaActual && state.mayoristaActual.nombre) || ''
      return api.create('facturas', { mayorista: may, fecha: fecha, nroFactura: nro, monto: monto, pagada: false, fechaPago: '' })
    },
    'del-factura': function (el) {
      if (esComisionista()) return false
      if (!window.confirm('¿Eliminar esta factura?')) return false
      return api.remove('facturas', parseInt(el.getAttribute('data-id'), 10))
    },
    'marcar-pagada': function (el) {
      if (esComisionista()) return false
      state.edit = { row: parseInt(el.getAttribute('data-id'), 10) }
      state.modal = 'marcar-pagada'
    },
    'save-marcar-pagada': function () {
      if (esComisionista()) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      return api.update('facturas', row, { pagada: true, fechaPago: isoFecha(val('gv-fecha')) })
    },
    'unmark-pagada': function (el) {
      if (esComisionista()) return false
      if (!window.confirm('¿Marcar esta factura como NO pagada?')) return false
      return api.update('facturas', parseInt(el.getAttribute('data-id'), 10), { pagada: false, fechaPago: '' })
    },
    'comunicar-deuda': function (el) {
      var tel = (el.getAttribute('data-tel') || '').replace(/\D/g, '')
      if (!tel) { window.alert('Este mayorista no tiene teléfono cargado. Agregalo en Configuración → Mayoristas.'); return false }
      var nombre = decodeURIComponent(el.getAttribute('data-nombre') || '')
      var nro = decodeURIComponent(el.getAttribute('data-nro') || '')
      var monto = el.getAttribute('data-monto') || ''
      var dias = el.getAttribute('data-dias') || ''
      var msg = 'Hola ' + nombre + ', te recordamos la factura ' + nro + ' por ' + monto + ' con ' + dias + ' días de atraso. ¡Gracias!'
      window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), '_blank')
      return false
    },
    'edit-producto': function (el) {
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        producto: decodeURIComponent(el.getAttribute('data-producto') || ''),
        unidad: decodeURIComponent(el.getAttribute('data-unidad') || ''),
        precio: el.getAttribute('data-precio'),
      }
      state.modal = 'edit-producto'
    },
    'del-producto': function (el) {
      if (!window.confirm('¿Eliminar este producto del catálogo? No afecta a los anexos ya cargados.')) return false
      return api.remove('catalogo', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-producto': function () {
      var producto = val('gv-prod-nombre')
      if (!producto) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      return api.update('catalogo', row, { producto: producto, unidad: val('gv-prod-unidad'), precio: num(val('gv-prod-precio')) })
    },

    'edit-usuario': function (el) {
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        nombre: decodeURIComponent(el.getAttribute('data-nombre') || ''),
        iniciales: decodeURIComponent(el.getAttribute('data-iniciales') || ''),
        sucursal: decodeURIComponent(el.getAttribute('data-sucursal') || ''),
        email: decodeURIComponent(el.getAttribute('data-email') || ''),
        estado: decodeURIComponent(el.getAttribute('data-estado') || ''),
        rol: decodeURIComponent(el.getAttribute('data-rol') || 'franquiciado'),
      }
      state.modal = 'edit-usuario'
    },
    'del-usuario': function (el) {
      if (!window.confirm('¿Eliminar este franquiciado? Perderá el acceso.')) return false
      return api.remove('usuarios', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-usuario': function () {
      var nombre = val('gv-user-nombre')
      if (!nombre) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      return api.update('usuarios', row, {
        nombre: nombre, iniciales: val('gv-user-iniciales'), sucursal: val('gv-user-sucursal'),
        email: val('gv-user-email'), rol: val('gv-user-rol') || 'franquiciado', estado: val('gv-user-estado'),
      })
    },

    'save-pago-fran': function () {
      if (state.asFran) return false // admin mirando: solo lectura
      var monto = num(val('gv-pago-monto'))
      var concepto = val('gv-pago-concepto')
      if (!concepto || !monto) return false
      state.modal = null
      var fecha = isoFecha(val('gv-fecha'))
      return api.create('pagos', {
        sucursal: (state.user && state.user.sucursal) || 'City Bell', mes: fecha.slice(0, 7),
        concepto: concepto, monto: monto, estado: 'pending', fecha: fecha, observacion: val('gv-pago-obs'),
      })
    },

    'verify-pago': function (el) {
      return api.update('pagos', parseInt(el.getAttribute('data-id'), 10), { estado: 'ok' })
    },
    'reject-pago': function (el) {
      if (!window.confirm('¿Rechazar y borrar este pago?')) return false
      return api.remove('pagos', parseInt(el.getAttribute('data-id'), 10))
    },

    'edit-anexo': function (el) {
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        producto: decodeURIComponent(el.getAttribute('data-producto') || ''),
        cantidad: el.getAttribute('data-cantidad'),
        fecha: el.getAttribute('data-fecha'),
      }
      state.modal = 'edit-anexo'
    },
    'del-anexo': function (el) {
      if (!window.confirm('¿Eliminar este anexo? Se recalcularán los saldos.')) return false
      return api.remove('anexos', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-anexo': function () {
      var sel = document.getElementById('gv-anexo-producto')
      if (!sel || !sel.value) return false
      var opt = sel.options[sel.selectedIndex]
      var cantidad = num(val('gv-anexo-cantidad'))
      if (!cantidad) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      var fecha = isoFecha(val('gv-fecha'))
      return api.update('anexos', row, {
        mes: fecha.slice(0, 7), fecha: fecha, producto: sel.value, cantidad: cantidad,
        unidad: opt.getAttribute('data-unidad'), precioUnit: Number(opt.getAttribute('data-precio')) || 0,
      })
    },

    'edit-pago': function (el) {
      if (state.asFran) return false // admin mirando: solo lectura
      state.edit = {
        row: parseInt(el.getAttribute('data-id'), 10),
        concepto: decodeURIComponent(el.getAttribute('data-concepto') || ''),
        monto: el.getAttribute('data-monto'),
        fecha: el.getAttribute('data-fecha'),
        observacion: decodeURIComponent(el.getAttribute('data-obs') || ''),
      }
      state.modal = 'edit-pago'
    },
    'del-pago': function (el) {
      if (state.asFran) return false // admin mirando: solo lectura
      if (!window.confirm('¿Eliminar este pago? Se recalcularán los saldos.')) return false
      return api.remove('pagos', parseInt(el.getAttribute('data-id'), 10))
    },
    'save-edit-pago': function () {
      if (state.asFran) return false // admin mirando: solo lectura
      var monto = num(val('gv-pago-monto'))
      var concepto = val('gv-pago-concepto')
      if (!concepto || !monto) return false
      var row = state.edit.row
      state.modal = null; state.edit = null
      var fecha = isoFecha(val('gv-fecha'))
      return api.update('pagos', row, { concepto: concepto, monto: monto, mes: fecha.slice(0, 7), fecha: fecha, observacion: val('gv-pago-obs') })
    },
  }

  // Overlay de "trabajando" (el backend Apps Script tarda ~2-4s por request).
  function loading(on) {
    var el = document.getElementById('gv-loading')
    if (on && !el) {
      el = document.createElement('div')
      el.id = 'gv-loading'
      el.style.cssText = 'position:fixed; inset:0; background:rgba(250,246,240,0.55); display:flex; align-items:center; justify-content:center; z-index:200;'
      el.innerHTML = '<div style="background:#fff; padding:14px 24px; border-radius:12px; box-shadow:0 8px 24px rgba(43,27,18,0.18); font-family:\'Inter\',sans-serif; font-size:14px; font-weight:600; color:#6B5A4C;">Cargando…</div>'
      document.body.appendChild(el)
    } else if (!on && el) {
      el.parentNode.removeChild(el)
    }
  }

  function run(el) {
    var fn = actions[el.getAttribute('data-action')]
    if (!fn) return
    var r = fn(el)
    if (r === false) return
    loading(true)
    Promise.resolve(r).then(function (res) {
      if (res && res.error) window.alert('El backend rechazó la operación: ' + res.error)
      return render()
    }).catch(function (e) {
      window.alert('Error de conexión con la planilla: ' + (e && e.message ? e.message : e))
    }).then(function () { loading(false) })
  }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]')
    if (!el || el.tagName === 'SELECT') return // el <select> se maneja en 'change'
    run(el)
  })
  root.addEventListener('change', function (e) {
    var el = e.target.closest('[data-action]')
    if (!el || el.tagName !== 'SELECT') return
    run(el)
  })

  // Inputs numéricos: el "." escribe la coma decimal; formatea miles/decimales en vivo.
  root.addEventListener('keydown', function (e) {
    var el = e.target
    if (!esNumInput(el) || (e.key !== '.' && e.key !== ',')) return
    e.preventDefault()
    if (el.value.indexOf(',') !== -1) return // ya hay decimal
    var s = el.selectionStart == null ? el.value.length : el.selectionStart
    var en = el.selectionEnd == null ? el.value.length : el.selectionEnd
    el.value = el.value.slice(0, s) + ',' + el.value.slice(en)
    reformatNum(el)
  })
  root.addEventListener('input', function (e) {
    if (esNumInput(e.target)) reformatNum(e.target)
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
      if (me.rol === 'comisionista') { state.view = 'admin'; state.selKind = 'comision' }
      else if (me.rol === 'admin') { state.view = 'admin'; state.selKind = 'sucursal' }
      else state.view = 'fran'
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
