// ============================================================================
//  Vistas — cada función arma el HTML de una pantalla como texto.
//  El markup y los estilos están calcados del prototipo aprobado.
// ============================================================================
window.Genova = window.Genova || {}

Genova.views = (function () {
  var f = Genova.format
  var icon = Genova.icons.svg
  var money = f.money

  // Colores y etiquetas según el estado de la cuenta (rojo/verde).
  function present(d) {
    var saldoDisplay = d.status === 'aldia' ? '$0' : money(d.saldo)
    if (d.status === 'favor') {
      return { accent: '#2E7D4F', statusLabel: 'Saldo a favor', saldoLabel: 'Saldo a favor del franquiciado', saldoBand: 'Saldo a favor', statusBg: '#E7F1EB', statusFg: '#2E7D4F', saldoBandBg: '#E7F1EB', saldoDisplay: saldoDisplay }
    }
    if (d.status === 'aldia') {
      return { accent: '#2E7D4F', statusLabel: 'Al día', saldoLabel: 'Saldo del franquiciado', saldoBand: 'Saldo', statusBg: '#E7F1EB', statusFg: '#2E7D4F', saldoBandBg: '#E7F1EB', saldoDisplay: '$0' }
    }
    return { accent: '#B3261E', statusLabel: 'Cuenta pendiente', saldoLabel: 'Saldo a pagar del franquiciado', saldoBand: 'Saldo a pagar', statusBg: '#FBEAE8', statusFg: '#B3261E', saldoBandBg: '#FBEAE8', saldoDisplay: saldoDisplay }
  }

  function badgePago(estado) {
    if (estado === 'pending') return { label: 'Por verificar', bg: '#FBF3E2', fg: '#C77700' }
    return { label: 'Verificado', bg: '#E7F1EB', fg: '#2E7D4F' }
  }

  // ============================ LOGIN ============================
  function cardShell(inner) {
    return `
    <div style="width:440px; background:#FAF6F0; border-radius:20px; box-shadow:0 8px 32px rgba(43,27,18,0.14); padding:40px 36px; text-align:center;">
      <div style="width:76px; height:76px; margin:0 auto 18px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:8px;">
        <img src="assets/logo-g.png" alt="Pastas Genova" style="width:100%; height:100%; object-fit:contain;">
      </div>
      <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:26px; line-height:1.1;">Pastas Genova</h1>
      <div style="font-size:13px; color:#6B5A4C; margin-top:6px; margin-bottom:28px;">Cuenta corriente de franquicias</div>
      ${inner}
    </div>`
  }

  function loginRoles() {
    return `
      <div style="text-align:left; font-size:11px; font-weight:700; letter-spacing:.06em; color:#A89684; text-transform:uppercase; margin-bottom:10px;">Ingresar como</div>
      <button data-action="login-admin" class="gv-role" style="width:100%; display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #E5DDD2; border-radius:12px; padding:16px 18px; margin-bottom:12px; cursor:pointer; text-align:left; font-family:'Inter',sans-serif;">
        <div style="width:44px; height:44px; border-radius:10px; background:#FBEAE8; color:#C8102E; display:flex; align-items:center; justify-content:center; flex:0 0 auto;">${icon('user', 22)}</div>
        <div style="flex:1 1 auto;">
          <div style="font-size:15px; font-weight:600;">Administrador</div>
          <div style="font-size:12px; color:#6B5A4C;">Franquiciante · todas las sucursales</div>
        </div>
        <span style="color:#C8B7A6; font-size:20px;">›</span>
      </button>
      <button data-action="login-fran" class="gv-role" style="width:100%; display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #E5DDD2; border-radius:12px; padding:16px 18px; cursor:pointer; text-align:left; font-family:'Inter',sans-serif;">
        <div style="width:44px; height:44px; border-radius:10px; background:#FBEAE8; color:#C8102E; display:flex; align-items:center; justify-content:center; flex:0 0 auto;">${icon('home', 22)}</div>
        <div style="flex:1 1 auto;">
          <div style="font-size:15px; font-weight:600;">Franquiciado</div>
          <div style="font-size:12px; color:#6B5A4C;">Sucursal City Bell · Marina Ferrari</div>
        </div>
        <span style="color:#C8B7A6; font-size:20px;">›</span>
      </button>
      <div style="font-size:11px; color:#A89684; margin-top:24px;">Prototipo · elegí un rol para recorrer la app</div>`
  }

  function loginGoogle() {
    return `
      <p style="font-size:13px; color:#6B5A4C; line-height:1.45; margin-bottom:20px;">Acceso exclusivo para usuarios autorizados. Iniciá sesión con tu cuenta de Google.</p>
      <button data-action="google-login" style="width:100%; display:flex; align-items:center; justify-content:center; gap:12px; background:#C8102E; color:#fff; border:none; border-radius:12px; padding:16px 18px; cursor:pointer; font-family:'Inter',sans-serif; font-size:15px; font-weight:600;">${icon('user', 20)} Continuar con Google</button>
      <div id="gv-google-fallback" style="margin-top:14px; display:flex; justify-content:center;"></div>
      <div style="font-size:11px; color:#A89684; margin-top:24px;">Si no podés entrar, pedile al administrador que te dé de alta.</div>`
  }

  function login() {
    return cardShell(Genova.config.DEMO_MODE ? loginRoles() : loginGoogle())
  }

  function booting() {
    return cardShell(`<div style="font-size:14px; color:#6B5A4C;">Verificando acceso…</div>`)
  }

  function denied(email, error) {
    var diag = error ? `<div style="font-size:11px; color:#8A7A6C; background:#F5EFE6; border:1px dashed #D9CBBA; border-radius:8px; padding:8px 10px; margin-bottom:16px; word-break:break-word; font-family:monospace;">${error}</div>` : ''
    return cardShell(`
      <div style="width:52px; height:52px; margin:0 auto 14px; border-radius:50%; background:#FBEAE8; color:#B3261E; display:flex; align-items:center; justify-content:center;">${icon('info', 26, 2, '#B3261E')}</div>
      <h2 style="font-family:'Playfair Display',serif; font-weight:700; font-size:20px;">Acceso denegado</h2>
      <p style="font-size:13px; color:#6B5A4C; line-height:1.45; margin:10px 0 14px;">La cuenta <b>${email || ''}</b> no está autorizada. Pedile al administrador que te dé de alta en Configuración.</p>
      ${diag}
      <button data-action="logout" style="width:100%; background:#fff; color:#C8102E; border:1.5px solid #E7C9C6; border-radius:12px; padding:14px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Probar con otra cuenta</button>`)
  }

  // ============================ FRANQUICIADO (mobile) ============================
  function franchisee(state, data) {
    var d = data.dash
    var tab = state.fTab
    var ro = !!state.asFran // admin mirando como franquiciado → solo lectura
    var body = tab === 'resumen' ? franResumen(state, d)
      : tab === 'anexos' ? franAnexos(d, data.anexos)
      : franPagos(d, data.pagos, ro)

    function tabBtn(key, label) {
      var active = tab === key
      var col = active ? '#C8102E' : '#6B5A4C'
      return `<button data-action="ftab" data-tab="${key}" style="flex:1; background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; color:${col};">
        ${icon(key, 22)}<span style="font-size:11px; font-weight:${active ? 600 : 500};">${label}</span></button>`
    }

    return `
    <div style="width:390px; height:844px; background:#FAF6F0; border-radius:32px; box-shadow:0 12px 40px rgba(43,27,18,0.20); overflow:hidden; position:relative; display:flex; flex-direction:column;">
      <div style="flex:0 0 auto; background:#C8102E; padding:14px 16px; display:flex; align-items:center; gap:10px; color:#fff;">
        <div style="width:34px; height:34px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; flex:0 0 auto; padding:3px;">
          <img src="assets/logo-g.png" alt="" style="width:100%; height:100%; object-fit:contain;">
        </div>
        <div style="display:flex; flex-direction:column; line-height:1.1;">
          <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:16px;">Pastas Genova</span>
          <span style="font-size:11px; opacity:.85; font-weight:500;">Sucursal ${d.sucursal}</span>
        </div>
        ${ro
          ? `<button data-action="back-to-admin" style="margin-left:auto; background:rgba(255,255,255,.16); border:none; color:#fff; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; padding:7px 11px; border-radius:8px; cursor:pointer;">← Panel admin</button>`
          : `<button data-action="logout" style="margin-left:auto; background:rgba(255,255,255,.16); border:none; color:#fff; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; padding:7px 11px; border-radius:8px; cursor:pointer;">Salir</button>`}
      </div>
      ${ro ? `<div style="flex:0 0 auto; background:#FBEAE8; color:#8A2E26; font-size:11px; font-weight:600; text-align:center; padding:7px 12px;">Vista de ${d.sucursal} · solo lectura (estás como admin)</div>` : ''}

      <div class="gv-scroll" style="flex:1 1 auto; overflow-y:auto; padding:16px 16px 96px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <button data-action="prev-month" style="width:36px; height:36px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#6B5A4C; font-size:18px; cursor:pointer;">‹</button>
          <div style="text-align:center; line-height:1.2;">
            ${mesSelect(d.mes)}
            <div style="font-size:11px; color:${d.mes === Genova.config.MES_ACTUAL ? '#C77700' : '#8A7A6C'}; font-weight:600; letter-spacing:.02em; margin-top:4px;">${d.mes === Genova.config.MES_ACTUAL ? 'MES EN CURSO' : 'HISTÓRICO'}</div>
          </div>
          <button ${d.mes === Genova.config.MES_ACTUAL ? '' : 'data-action="next-month"'} style="width:36px; height:36px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:${d.mes === Genova.config.MES_ACTUAL ? '#C8B7A6' : '#6B5A4C'}; font-size:18px; cursor:${d.mes === Genova.config.MES_ACTUAL ? 'not-allowed' : 'pointer'};">›</button>
        </div>
        ${body}
      </div>

      <div style="flex:0 0 auto; position:absolute; bottom:0; left:0; right:0; background:#fff; border-top:1px solid #E5DDD2; display:flex; padding:8px 0 10px;">
        ${tabBtn('resumen', 'Resumen')}
        ${tabBtn('anexos', 'Anexos')}
        ${tabBtn('pagos', 'Pagos')}
      </div>
    </div>`
  }

  function halfRow(label, full, half) {
    return `
    <div style="background:#FAF6F0; border:1px solid #F0EAE0; border-radius:12px; padding:12px 14px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <span style="font-size:13px; color:#6B5A4C;">${label}</span>
        <span style="font-size:14px; color:#6B5A4C; text-decoration:line-through; text-decoration-color:#C8B7A6; font-variant-numeric:tabular-nums;">${full}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed #E5DDD2;">
        <span style="display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#B3261E;"><span style="background:#FBEAE8; font-size:11px; font-weight:700; padding:1px 6px; border-radius:5px;">÷2</span> Te toca la mitad</span>
        <span style="font-size:17px; font-weight:700; font-variant-numeric:tabular-nums;">${half}</span>
      </div>
    </div>`
  }

  // Grupo "Venta del mes" del detalle cuando la matriz todavía no cargó la venta.
  function ventaSinCargar() {
    return `
    <div style="background:#FFFFFF; border:1px dashed #D9CBBA; border-radius:12px; padding:12px 14px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; color:#6B5A4C;">Venta del mes</span>
        <span style="display:inline-flex; align-items:center; gap:6px; background:#FBF3E2; color:#C77700; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px;">Sin cargar</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed #E5DDD2;">
        <span style="display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:600; color:#A89684;"><span style="background:#F1EADF; color:#A89684; font-size:11px; font-weight:700; padding:1px 6px; border-radius:5px;">÷2</span> Te toca la mitad</span>
        <span style="font-size:17px; font-weight:700; font-variant-numeric:tabular-nums; color:#C8B7A6;">—</span>
      </div>
    </div>`
  }

  function franResumen(state, d) {
    var chevron = state.det ? 'rotate(180deg)' : 'rotate(0deg)'
    var detMax = state.det ? '760px' : '0px'
    var sinVenta = !d.ventaCargada
    var st = d.status // 'pendiente' | 'aldia' | 'favor'

    // --- Tarjeta de saldo (arriba) --- el monto se muestra siempre, aunque falte la venta.
    var card
    if (st === 'favor') {
      card = { label: 'Tu saldo', valColor: '#2E7D4F', val: money(d.saldo), badgeBg: '#E7F1EB', badgeFg: '#2E7D4F', badgeText: 'Saldo a favor', note: 'Pagaste de más: se descuenta del próximo mes.', noteColor: '#6B5A4C' }
    } else if (st === 'aldia') {
      card = { label: 'Tu saldo', valColor: '#2E7D4F', val: '$0', badgeBg: '#E7F1EB', badgeFg: '#2E7D4F', badgeText: 'Al día', note: 'Total del mes ' + money(d.totalMes) + ' · pagaste ' + money(d.pagosTotal), noteColor: '#6B5A4C' }
    } else {
      card = { label: 'Tu saldo a pagar', valColor: '#B3261E', val: money(d.saldo), badgeBg: '#FBEAE8', badgeFg: '#B3261E', badgeText: 'Pendiente de pago', note: 'Total del mes ' + money(d.totalMes) + ' · pagaste ' + money(d.pagosTotal), noteColor: '#6B5A4C' }
    }
    // Falta la venta del mes: el monto es provisional (suma anexos/2 + saldo anterior − pagos) y subirá al cargarla.
    if (sinVenta) {
      card.label = card.label + ' · provisional'
      card.badgeBg = '#FBF3E2'; card.badgeFg = '#C77700'; card.badgeText = 'Falta la venta del mes'
      card.note = 'Provisional: incluye la mitad de los anexos, el saldo anterior y tus pagos. Subirá cuando la matriz cargue la venta.'
      card.noteColor = '#8A6B2E'
    }

    // --- Banda "Saldo" final --- (se muestra siempre, aunque falte la venta)
    var saldoBanda
    if (st === 'favor') {
      saldoBanda = `<div style="background:#E7F1EB; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; flex-direction:column; line-height:1.2;">
          <span style="font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#2E7D4F;">Saldo a favor</span>
          <span style="font-size:11px; color:#3F7D5C; font-weight:500;">Queda como crédito para el próximo mes</span>
        </div>
        <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; color:#2E7D4F;">${money(d.saldo)}</span>
      </div>`
    } else if (st === 'aldia') {
      saldoBanda = `<div style="background:#E7F1EB; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#2E7D4F;">Saldo</span>
        <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; color:#2E7D4F;">$0</span>
      </div>`
    } else {
      saldoBanda = `<div style="background:#FBEAE8; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#B3261E;">Saldo a pagar</span>
        <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; color:#B3261E;">${money(d.saldo)}</span>
      </div>`
    }

    // Al día / a favor → CTA secundario (contorno). Pendiente → CTA rojo.
    var ctaSecundario = (st === 'favor' || st === 'aldia')
    var ctaStyle = ctaSecundario
      ? 'background:#fff; color:#C8102E; border:1.5px solid #E7C9C6;'
      : 'background:#C8102E; color:#fff; border:none;'

    return `
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:24px 20px; text-align:center; margin-bottom:16px;">
      <div style="font-size:13px; color:#6B5A4C; font-weight:500; margin-bottom:6px;">${card.label}</div>
      <div style="font-weight:700; font-size:40px; color:${card.valColor}; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; line-height:1.05;">${card.val}</div>
      <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; background:${card.badgeBg}; color:${card.badgeFg}; padding:5px 12px; border-radius:999px; font-size:13px; font-weight:600;">
        <span style="width:7px; height:7px; border-radius:50%; background:${card.badgeFg};"></span> ${card.badgeText}
      </div>
      <div style="font-size:12px; color:${card.noteColor}; margin-top:12px; line-height:1.4;">${card.note}</div>
    </div>

    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <button data-action="toggle-det" style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:none; border:none; cursor:pointer; text-align:left;">
        <span style="font-family:'Playfair Display',serif; font-weight:600; font-size:16px;">Detalle del cálculo</span>
        <span style="font-size:12px; color:#6B5A4C; transform:${chevron}; transition:transform .2s;">▾</span>
      </button>
      <div style="max-height:${detMax}; overflow:hidden; transition:max-height .28s ease;">
        <div style="padding:4px 16px 16px;">
          ${sinVenta ? ventaSinCargar() : halfRow('Venta del mes', money(d.venta), money(d.ventaMitad))}
          ${halfRow('Productos anexos', money(d.anexosTotal), money(d.anexosMitad))}
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; margin-bottom:10px;">
            <span style="font-size:14px;">Saldo mes anterior</span>
            <span style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">${money(d.saldoAnterior)}</span>
          </div>
          <div style="background:linear-gradient(180deg,#FBF4E4,#F7ECD3); border:1px solid #EAD9A9; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; line-height:1.2;">
              <span style="font-family:'Playfair Display',serif; font-size:15px; font-weight:700;">Total del mes${sinVenta ? ' · provisional' : ''}</span>
              <span style="font-size:11px; color:#8A6B2E; font-weight:500;">${sinVenta ? 'Anexos + saldo anterior (falta la venta)' : 'Las dos mitades + saldo anterior'}</span>
            </div>
            <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums;">${money(d.totalMes)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; margin-top:2px;">
            <span style="font-size:14px; color:#2E7D4F; font-weight:500;">Pagos del mes</span>
            <span style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; color:#2E7D4F;">${money(-d.pagosTotal)}</span>
          </div>
          ${saldoBanda}
        </div>
      </div>
    </div>

    ${state.asFran ? '' : `<button data-action="ftab" data-tab="pagos" style="width:100%; margin-top:16px; ${ctaStyle} border-radius:8px; padding:15px; font-size:15px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; box-shadow:0 2px 8px rgba(43,27,18,0.08);">Registrar un pago</button>`}`
  }

  function franAnexos(d, rows) {
    var lista = rows.map(function (a) {
      var detail = a.cantidad + ' ' + f.unidadLarga(a.unidad) + ' · ' + money(a.precioUnit) + ' c/u'
      return `<div style="display:flex; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid #F0EAE0;">
        <div style="flex:0 0 auto; width:40px; text-align:center;">
          <div style="font-size:16px; font-weight:700; line-height:1;">${f.dayOf(a.fecha)}</div>
          <div style="font-size:10px; color:#6B5A4C; text-transform:uppercase;">${f.mesAbbrDeFecha(a.fecha)}</div>
        </div>
        <div style="flex:1 1 auto; min-width:0;">
          <div style="font-size:14px; font-weight:600;">${a.producto}</div>
          <div style="font-size:12px; color:#6B5A4C; margin-top:1px;">${detail}</div>
        </div>
        <div style="flex:0 0 auto; font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">${money(a.subtotal)}</div>
      </div>`
    }).join('')

    return `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:22px;">Productos anexos</h1>
      <span style="background:#F1EADF; color:#6B5A4C; font-size:11px; font-weight:600; padding:5px 10px; border-radius:999px;">Solo lectura</span>
    </div>
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 20px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
      <div style="line-height:1.25;">
        <div style="font-size:13px; color:#6B5A4C; font-weight:500;">Total anexos del mes</div>
        <div style="font-size:11px; color:#B3261E; font-weight:600; margin-top:4px;">La mitad va a tu cuenta → ${money(d.anexosMitad)}</div>
      </div>
      <div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums;">${money(d.anexosTotal)}</div>
    </div>
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">${lista}</div>
    <div style="text-align:center; font-size:12px; color:#8A7A6C; margin-top:16px;">Las cargas las registra la casa matriz.</div>`
  }

  function franPagos(d, rows, ro) {
    var lista = rows.map(function (p) {
      var b = badgePago(p.estado)
      return `<div style="display:flex; align-items:center; gap:12px; padding:14px 16px; border-bottom:1px solid #F0EAE0;">
        <div style="flex:0 0 auto; width:40px; text-align:center;">
          <div style="font-size:16px; font-weight:700; line-height:1;">${f.dayOf(p.fecha)}</div>
          <div style="font-size:10px; color:#6B5A4C; text-transform:uppercase;">${f.mesAbbrDeFecha(p.fecha)}</div>
        </div>
        <div style="flex:1 1 auto; min-width:0;">
          <div style="font-size:14px; font-weight:600;">${p.concepto}</div>
          <div style="display:inline-flex; align-items:center; gap:5px; margin-top:3px; background:${b.bg}; color:${b.fg}; font-size:11px; font-weight:600; padding:2px 8px; border-radius:999px;">
            <span style="width:6px; height:6px; border-radius:50%; background:${b.fg};"></span>${b.label}
          </div>
          ${(p.estado === 'pending' && !ro) ? `<div style="display:flex; gap:8px; margin-top:8px;">${rowBtns('pago', p)}</div>` : ''}
        </div>
        <div style="flex:0 0 auto; font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">${money(p.monto)}</div>
      </div>`
    }).join('')

    return `
    <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:22px; margin-bottom:14px;">Pagos</h1>
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 20px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid #F0EAE0;">
        <span style="font-size:13px; color:#6B5A4C;">Pagaste este mes</span>
        <span style="font-size:17px; font-weight:600; font-variant-numeric:tabular-nums; color:#2E7D4F;">${money(d.pagosTotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px;">
        <span style="font-size:14px; font-weight:600;">Saldo a pagar</span>
        <span style="font-size:22px; font-weight:700; font-variant-numeric:tabular-nums; color:#B3261E;">${money(d.saldo)}</span>
      </div>
    </div>
    ${ro ? '' : `<button data-action="open-modal" data-modal="pago-fran" style="width:100%; margin-bottom:8px; background:#C8102E; color:#fff; border:none; border-radius:8px; padding:15px; font-size:15px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
      ${icon('plus', 18, 2.4)} Registrar un pago
    </button>`}
    <div style="display:flex; align-items:center; gap:8px; background:#FBF3E2; border:1px solid #EAD9A9; border-radius:8px; padding:10px 12px; margin-bottom:16px;">
      ${icon('info', 16, 2, '#C77700')}
      <span style="font-size:12px; color:#8A6B2E; line-height:1.35;">Los pagos que cargás quedan <b>Por verificar</b> hasta que la matriz los confirme.</span>
    </div>
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">${lista}</div>`
  }

  // ============================ ADMIN (desktop) ============================
  function admin(state, data) {
    var d = data.dash
    var p = present(d)
    var main = state.aTab === 'resumen' ? adminResumen(d, p)
      : state.aTab === 'anexos' ? adminAnexos(d, data.anexos)
      : state.aTab === 'pagos' ? adminPagos(d, p, data.pagos)
      : adminConfig(data.usuarios, data.catalogo, data.alias)

    var navDef = [['resumen', 'Resumen'], ['anexos', 'Productos anexos'], ['pagos', 'Pagos'], ['config', 'Configuración']]
    var nav = navDef.map(function (n) {
      var active = state.aTab === n[0]
      return `<button data-action="atab" data-tab="${n[0]}" style="width:100%; display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:8px; border:none; background:${active ? '#FBEAE8' : 'transparent'}; color:${active ? '#C8102E' : '#6B5A4C'}; font-size:14px; font-weight:${active ? 600 : 500}; cursor:pointer; text-align:left; margin-bottom:2px; font-family:'Inter',sans-serif;">
        <span style="width:18px; height:18px; display:inline-flex;">${icon(n[0], 18)}</span>${n[1]}</button>`
    }).join('')

    var branches = data.sucursales.map(function (b, i) {
      var active = i === state.branch
      return `<button data-action="branch" data-index="${i}" style="width:100%; display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; border:none; background:${active ? '#FBEAE8' : 'transparent'}; cursor:pointer; text-align:left; margin-bottom:2px; font-family:'Inter',sans-serif;">
        <span style="width:8px; height:8px; border-radius:50%; background:${active ? '#C8102E' : '#C8B7A6'}; flex:0 0 auto;"></span>
        <span style="flex:1 1 auto; font-size:13px; font-weight:${active ? 600 : 500}; color:${active ? '#C8102E' : '#2B1B12'};">${b.nombre}</span>
      </button>`
    }).join('')

    var titulos = { resumen: 'Resumen', anexos: 'Productos anexos', pagos: 'Pagos', config: 'Configuración' }
    var mobileBar = `<div class="gv-mobilebar" style="align-items:center; gap:12px; padding:2px 2px 14px; margin-bottom:6px; border-bottom:1px solid #F0EAE0;">
      <button data-action="toggle-nav" aria-label="Menú" style="background:#fff; border:1px solid #E5DDD2; border-radius:8px; width:42px; height:42px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#2B1B12; flex:0 0 auto;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
      <span style="font-family:'Playfair Display',serif; font-weight:700; font-size:18px;">${titulos[state.aTab] || ''}</span>
    </div>`

    return `
    <div class="gv-admin" style="width:1440px; height:900px; background:#FAF6F0; border-radius:16px; box-shadow:0 30px 80px -12px rgba(43,27,18,0.38), 0 12px 28px rgba(43,27,18,0.20); overflow:hidden; display:flex;">
      <div class="gv-backdrop" data-action="toggle-nav"></div>
      <div class="gv-side" style="flex:0 0 248px; background:#FFFFFF; border-right:1px solid #E5DDD2; display:flex; flex-direction:column; padding:20px 16px;">
        <div style="display:flex; align-items:center; gap:10px; padding:4px 8px 20px;">
          <img src="assets/logo-g.png" alt="" style="width:40px; height:40px; object-fit:contain; flex:0 0 auto;">
          <div style="line-height:1.15;">
            <div style="font-family:'Playfair Display',serif; font-weight:700; font-size:17px;">Pastas Genova</div>
            <div style="font-size:11px; color:#6B5A4C; font-weight:500;">Panel de administración</div>
          </div>
        </div>
        <div style="font-size:10px; font-weight:700; letter-spacing:.08em; color:#A89684; text-transform:uppercase; padding:8px 8px 6px;">Cuenta corriente</div>
        ${nav}
        <div style="font-size:10px; font-weight:700; letter-spacing:.08em; color:#A89684; text-transform:uppercase; padding:22px 8px 6px;">Sucursales</div>
        ${branches}
        <button data-action="view-as-fran" style="width:100%; margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px; padding:9px 12px; border-radius:8px; border:1px dashed #C8B7A6; background:transparent; color:#6B5A4C; font-size:12px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif;">${icon('home', 15)} Ver como franquiciado</button>
        <div style="margin-top:auto; display:flex; align-items:center; gap:10px; padding:10px 8px; border-top:1px solid #F0EAE0;">
          <div style="width:32px; height:32px; border-radius:50%; background:#2B1B12; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600;">${(state.user && state.user.iniciales) || '··'}</div>
          <div style="line-height:1.2; flex:1 1 auto;">
            <div style="font-size:13px; font-weight:600;">${(state.user && state.user.nombre) || 'Administrador'}</div>
            <div style="font-size:11px; color:#6B5A4C;">Franquiciante</div>
          </div>
          <button data-action="logout" style="background:none; border:none; color:#C8102E; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Salir</button>
        </div>
      </div>
      <div class="gv-main gv-scroll" style="flex:1 1 auto; overflow-y:auto; padding:28px 36px;">${mobileBar}${main}</div>
    </div>`
  }

  // Selector de mes/año (nativo → scroll y picker del sistema en mobile).
  function mesSelect(mes) {
    var cur = Genova.config.MES_ACTUAL
    var p = cur.split('-')
    var y = parseInt(p[0], 10), m = parseInt(p[1], 10)
    var opts = ''
    for (var i = 0; i < 36; i++) {
      var dt = new Date(y, m - 1 - i, 1)
      var val = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2)
      opts += '<option value="' + val + '"' + (val === mes ? ' selected' : '') + '>' +
        f.mesLargo(val) + (val === cur ? ' · en curso' : '') + '</option>'
    }
    return '<select data-action="set-mes" style="font-family:\'Playfair Display\',serif; font-weight:700; font-size:17px; text-align:center; text-align-last:center; border:1px solid #E5DDD2; border-radius:8px; padding:8px 12px; background:#FBF7F0; color:#2B1B12; cursor:pointer; -webkit-appearance:none; appearance:none; text-transform:capitalize;">' + opts + '</select>'
  }

  function monthNav(mes) {
    var esActual = mes === Genova.config.MES_ACTUAL
    return `<div style="display:flex; align-items:center; gap:10px;">
      <button data-action="prev-month" style="width:38px; height:38px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#6B5A4C; font-size:18px; cursor:pointer;">‹</button>
      <div style="text-align:center; min-width:130px;">
        ${mesSelect(mes)}
        <div style="font-size:10px; color:${esActual ? '#C77700' : '#8A7A6C'}; font-weight:700; margin-top:4px;">${esActual ? 'MES EN CURSO' : 'HISTÓRICO'}</div>
      </div>
      <button ${esActual ? '' : 'data-action="next-month"'} style="width:38px; height:38px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:${esActual ? '#C8B7A6' : '#6B5A4C'}; font-size:18px; cursor:${esActual ? 'not-allowed' : 'pointer'};">›</button>
    </div>`
  }

  function detRow(label, value, indent) {
    return `<div style="display:flex; justify-content:space-between; padding:${indent ? '12px 0 12px 18px' : '12px 0'}; border-top:1px solid #F0EAE0; ${indent ? 'background:#FBF7F0;' : ''}">
      <span style="font-size:${indent ? 13 : 14}px; ${indent ? 'color:#6B5A4C;' : ''}">${label}</span>
      <span style="font-size:15px; font-weight:${indent ? 600 : 500}; font-variant-numeric:tabular-nums;">${value}</span>
    </div>`
  }

  function adminResumen(d, p) {
    return `
    <div class="gv-head" style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:24px;">
      <div>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Resumen — ${d.sucursal}</h1>
          <span style="background:${p.statusBg}; color:${p.statusFg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;">${p.statusLabel}</span>
        </div>
        <div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Cuenta corriente mensual del franquiciado.</div>
      </div>
      ${monthNav(d.mes)}
    </div>
    <div class="gv-two-col" style="display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start;">
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:22px 24px;">
          <label style="font-size:13px; font-weight:600;">Venta total del mes</label>
          <div style="font-size:12px; color:#6B5A4C; margin:2px 0 12px;">Cargala para calcular la mitad que va a la cuenta.</div>
          <div style="display:flex; align-items:center; border:1.5px solid #C8102E; border-radius:8px; overflow:hidden;">
            <span style="padding:0 8px 0 14px; font-size:20px; font-weight:600; color:#6B5A4C;">$</span>
            <input id="gv-venta" value="${f.plain(d.venta)}" data-num inputmode="decimal" style="flex:1 1 auto; border:none; outline:none; padding:13px 14px 13px 0; font-size:20px; font-weight:700; font-family:'Inter',sans-serif; font-variant-numeric:tabular-nums; background:transparent;">
            <button data-action="save-venta" style="margin:6px; background:#C8102E; color:#fff; border:none; border-radius:6px; padding:9px 18px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Guardar</button>
          </div>
          <div style="font-size:12px; color:#6B5A4C; margin-top:10px;">Última carga: hoy, 09:41 · Roberto G.</div>
        </div>
        <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:26px 24px; border-left:4px solid ${p.accent};">
          <div style="font-size:13px; color:#6B5A4C; font-weight:500;">${p.saldoLabel}</div>
          <div style="font-size:44px; font-weight:700; color:${p.accent}; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; line-height:1.1; margin-top:4px;">${p.saldoDisplay}</div>
          <div style="display:flex; gap:24px; margin-top:14px; padding-top:16px; border-top:1px solid #F0EAE0;">
            <div><div style="font-size:11px; color:#6B5A4C; text-transform:uppercase; font-weight:600;">Total del mes</div><div style="font-size:17px; font-weight:600; font-variant-numeric:tabular-nums; margin-top:2px;">${money(d.totalMes)}</div></div>
            <div><div style="font-size:11px; color:#6B5A4C; text-transform:uppercase; font-weight:600;">Pagos registrados</div><div style="font-size:17px; font-weight:600; font-variant-numeric:tabular-nums; color:#2E7D4F; margin-top:2px;">${money(-d.pagosTotal)}</div></div>
          </div>
        </div>
      </div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:8px 24px 16px;">
        <div style="padding:16px 0 8px;"><span style="font-family:'Playfair Display',serif; font-weight:600; font-size:17px;">Detalle del cálculo</span></div>
        ${detRow('Venta del mes', money(d.venta), false)}
        ${detRow('↳ Mitad a la cuenta (÷2)', money(d.ventaMitad), true)}
        ${detRow('Productos anexos', money(d.anexosTotal), false)}
        ${detRow('↳ Mitad a la cuenta (÷2)', money(d.anexosMitad), true)}
        ${detRow('Saldo mes anterior', money(d.saldoAnterior), false)}
        <div style="display:flex; justify-content:space-between; padding:14px 0; border-top:2px solid #E5DDD2;"><span style="font-size:14px; font-weight:700;">Total del mes</span><span style="font-size:16px; font-weight:700; font-variant-numeric:tabular-nums;">${money(d.totalMes)}</span></div>
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #F0EAE0;"><span style="font-size:14px; color:#2E7D4F;">Pagos del mes</span><span style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; color:#2E7D4F;">${money(-d.pagosTotal)}</span></div>
        <div style="display:flex; justify-content:space-between; padding:15px 18px; margin-top:6px; background:${p.saldoBandBg}; border-radius:8px;"><span style="font-size:15px; font-weight:700; color:${p.accent};">${p.saldoBand}</span><span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; color:${p.accent};">${p.saldoDisplay}</span></div>
      </div>
    </div>`
  }

  function th(label, right) {
    return `<span style="font-size:11px; font-weight:700; letter-spacing:.05em; color:#6B5A4C; text-transform:uppercase; ${right ? 'text-align:right;' : ''}">${label}</span>`
  }

  function adminAnexos(d, rows) {
    var cols = '104px 1fr 100px 120px 120px 160px'
    var body = rows.map(function (r) {
      return `<div class="gv-list-row" style="display:grid; grid-template-columns:${cols}; gap:14px; padding:14px 20px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span class="gv-cell" data-label="Fecha" style="font-size:14px; font-variant-numeric:tabular-nums;">${f.dmy(r.fecha)}</span>
        <span class="gv-cell" data-label="Producto" style="font-size:14px; font-weight:600;">${r.producto}</span>
        <span class="gv-cell" data-label="Cantidad" style="font-size:14px; text-align:right; color:#6B5A4C;">${r.cantidad} ${f.unidadAbbr(r.unidad)}</span>
        <span class="gv-cell" data-label="Precio" style="font-size:14px; text-align:right; font-variant-numeric:tabular-nums;">${money(r.precioUnit)}</span>
        <span class="gv-cell" data-label="Subtotal" style="font-size:14px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(r.subtotal)}</span>
        <div class="gv-cell gv-cell-actions" style="display:flex; gap:8px; justify-content:flex-end;">${rowBtns('anexo', r)}</div>
      </div>`
    }).join('')

    return `
    <div class="gv-head" style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px;">
      <div><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Productos anexos — ${d.sucursal}</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Mercadería que la sucursal compra a la matriz durante el mes.</div></div>
      <button data-action="open-modal" data-modal="anexo" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:11px 18px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:8px;">${icon('plus', 16, 2.4)} Cargar producto</button>
    </div>
    <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <div class="gv-list-head" style="display:grid; grid-template-columns:${cols}; gap:14px; padding:13px 20px; background:#FAF6F0; border-bottom:1px solid #F0EAE0;">
        ${th('Fecha')}${th('Producto')}${th('Cantidad', true)}${th('Precio', true)}${th('Subtotal', true)}${th('Acción', true)}
      </div>
      ${body}
      <div style="display:grid; grid-template-columns:1fr 140px; gap:14px; padding:16px 20px; background:#FBF7F0;">
        <span style="font-size:14px; font-weight:700;">Total anexos del mes · la mitad (${money(d.anexosMitad)}) entra a la cuenta</span>
        <span style="font-size:17px; font-weight:700; text-align:right; font-variant-numeric:tabular-nums;">${money(d.anexosTotal)}</span>
      </div>
    </div>`
  }

  function adminPagos(d, p, rows) {
    var cols = '104px 1fr 130px 120px 270px'
    var pendBorder = d.pendCount > 0 ? '#C77700' : '#E5DDD2'
    var pendColor = d.pendCount > 0 ? '#C77700' : '#6B5A4C'
    var pendText = d.pendCount > 0 ? (d.pendCount + (d.pendCount === 1 ? ' pago' : ' pagos') + ' esperando confirmación') : 'Sin pagos pendientes'
    var statLabel = 'font-size:12px; color:#6B5A4C; font-weight:600; text-transform:uppercase;'

    var body = rows.map(function (r) {
      var b = badgePago(r.estado)
      var verificar = r.estado === 'pending'
        ? `<button data-action="verify-pago" data-id="${r._row}" style="background:#2E7D4F; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Verificar</button>`
        : ''
      var accion = `<div style="display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">${verificar}${rowBtns('pago', r)}</div>`
      return `<div class="gv-list-row" style="display:grid; grid-template-columns:${cols}; gap:14px; padding:15px 20px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span class="gv-cell" data-label="Fecha" style="font-size:14px; font-variant-numeric:tabular-nums;">${f.dmy(r.fecha)}</span>
        <span class="gv-cell" data-label="Concepto" style="font-size:14px; font-weight:600;">${r.concepto}</span>
        <span class="gv-cell" data-label="Monto" style="font-size:15px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(r.monto)}</span>
        <span class="gv-cell" data-label="Estado"><span style="display:inline-flex; align-items:center; gap:6px; background:${b.bg}; color:${b.fg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;"><span style="width:6px; height:6px; border-radius:50%; background:${b.fg};"></span>${b.label}</span></span>
        <div class="gv-cell gv-cell-actions" style="text-align:right;">${accion}</div>
      </div>`
    }).join('')

    return `
    <div class="gv-head" style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px;">
      <div><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Pagos — ${d.sucursal}</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Verificá los pagos cargados por el franquiciado o registrá uno.</div></div>
      <button data-action="open-modal" data-modal="pago" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:11px 18px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:8px;">${icon('plus', 16, 2.4)} Registrar pago</button>
    </div>
    <div class="gv-two-col" style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:22px;">
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px;"><div style="${statLabel}">Pagos verificados</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:#2E7D4F; margin-top:6px;">${money(d.pagosVerificados)}</div></div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px; border-left:4px solid ${pendBorder};"><div style="${statLabel}">Por verificar</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:${pendColor}; margin-top:6px;">${money(d.pagosPorVerificar)}</div><div style="font-size:12px; color:#8A6B2E; margin-top:2px;">${pendText}</div></div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px;"><div style="${statLabel}">Saldo a pagar</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:${p.accent}; margin-top:6px;">${p.saldoDisplay}</div></div>
    </div>
    <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <div class="gv-list-head" style="display:grid; grid-template-columns:${cols}; gap:14px; padding:13px 20px; background:#FAF6F0; border-bottom:1px solid #F0EAE0;">
        ${th('Fecha')}${th('Concepto')}${th('Monto', true)}${th('Estado')}${th('Acción', true)}
      </div>
      ${body}
    </div>`
  }

  // Tarjeta con encabezado clickeable que colapsa su contenido (toggle por JS).
  // Arranca colapsada; el header dispara la acción 'collap' que muestra/oculta #id.
  function collapCard(id, title, subtitle, inner, borderColor) {
    return `<div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden; margin-bottom:24px;${borderColor ? ' border-left:4px solid ' + borderColor + ';' : ''}">
      <div data-action="collap" data-target="${id}" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 22px;">
        <div>
          <div style="font-family:'Playfair Display',serif; font-weight:600; font-size:17px;">${title}</div>
          ${subtitle ? `<div style="font-size:12px; color:#6B5A4C; margin-top:2px;">${subtitle}</div>` : ''}
        </div>
        <span class="gv-chev" style="color:#C8B7A6; font-size:12px; transition:transform .15s; transform:rotate(-90deg);">▼</span>
      </div>
      <div id="${id}" style="display:none; border-top:1px solid #F0EAE0;">${inner}</div>
    </div>`
  }

  function adminConfig(usuarios, catalogo, alias) {
    var cuentasCols = '1fr 1fr 1fr 160px'
    var cuentas = (Array.isArray(alias) ? alias : []).map(function (c) {
      var dataAttrs = `data-id="${c._row}" data-concepto="${encodeURIComponent(c.concepto || '')}" data-cbu="${encodeURIComponent(c.aliasCbu || '')}" data-titular="${encodeURIComponent(c.titular || '')}"`
      var btn = 'border-radius:6px; padding:6px 12px; font-size:12px; font-weight:600; font-family:\'Inter\',sans-serif; cursor:pointer;'
      return `<div class="gv-list-row" style="display:grid; grid-template-columns:${cuentasCols}; gap:12px; padding:13px 22px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span class="gv-cell" data-label="Concepto" style="font-size:14px; font-weight:600;">${c.concepto || '—'}</span>
        <span class="gv-cell" data-label="Alias / CBU" style="font-size:13px; color:#6B5A4C; word-break:break-all;">${c.aliasCbu || '—'}</span>
        <span class="gv-cell" data-label="Titular" style="font-size:13px; color:#6B5A4C;">${c.titular || '—'}</span>
        <div class="gv-cell gv-cell-actions" style="display:flex; gap:8px; justify-content:flex-end;">
          <button data-action="edit-cuenta" ${dataAttrs} style="background:#fff; color:#6B5A4C; border:1px solid #E5DDD2; ${btn}">Editar</button>
          <button data-action="del-cuenta" data-id="${c._row}" style="background:#fff; color:#B3261E; border:1px solid #E7C9C6; ${btn}">Eliminar</button>
        </div>
      </div>`
    }).join('')
    var aliasInner = `
      <div style="padding:14px 22px;">
        <button data-action="open-modal" data-modal="cuenta" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:9px 15px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:7px;">${icon('plus', 15, 2.4)} Nueva cuenta</button>
      </div>
      <div class="gv-list-head" style="display:grid; grid-template-columns:${cuentasCols}; gap:12px; padding:12px 22px; background:#FAF6F0; border-top:1px solid #F0EAE0; border-bottom:1px solid #F0EAE0;">
        ${th('Concepto')}${th('Alias / CBU')}${th('Titular')}${th('Acción', true)}
      </div>
      ${cuentas || `<div style="padding:16px 22px; font-size:13px; color:#8A7A6C;">Todavía no hay cuentas cargadas.</div>`}`

    var miniBtn = 'border-radius:6px; padding:6px 12px; font-size:12px; font-weight:600; font-family:\'Inter\',sans-serif; cursor:pointer;'
    var lista = usuarios.filter(function (u) { return u.rol === 'franquiciado' }).map(function (u) {
      var b = u.estado === 'Activo' ? { bg: '#E7F1EB', fg: '#2E7D4F' } : { bg: '#FBF3E2', fg: '#C77700' }
      var uData = `data-id="${u._row}" data-nombre="${encodeURIComponent(u.nombre || '')}" data-iniciales="${encodeURIComponent(u.iniciales || '')}" data-sucursal="${encodeURIComponent(u.sucursal || '')}" data-email="${encodeURIComponent(u.email || '')}" data-estado="${encodeURIComponent(u.estado || '')}"`
      return `<div style="display:flex; align-items:center; flex-wrap:wrap; gap:13px; padding:14px 22px; border-bottom:1px solid #F0EAE0;">
        <div style="width:38px; height:38px; border-radius:50%; background:#FBEAE8; color:#C8102E; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex:0 0 auto;">${u.iniciales}</div>
        <div style="flex:1 1 160px; min-width:0;"><div style="font-size:14px; font-weight:600;">${u.nombre}</div><div style="font-size:12px; color:#6B5A4C;">${u.sucursal} · ${u.email}</div></div>
        <span style="display:inline-flex; align-items:center; gap:6px; background:${b.bg}; color:${b.fg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;"><span style="width:6px; height:6px; border-radius:50%; background:${b.fg};"></span>${u.estado}</span>
        <div style="display:flex; gap:8px; flex:0 0 auto;">
          <button data-action="edit-usuario" ${uData} style="background:#fff; color:#6B5A4C; border:1px solid #E5DDD2; ${miniBtn}">Editar</button>
          <button data-action="del-usuario" data-id="${u._row}" style="background:#fff; color:#B3261E; border:1px solid #E7C9C6; ${miniBtn}">Eliminar</button>
        </div>
      </div>`
    }).join('')

    var catCols = '1fr 90px 110px 150px'
    var cat = catalogo.map(function (c) {
      var cData = `data-id="${c._row}" data-producto="${encodeURIComponent(c.producto || '')}" data-unidad="${encodeURIComponent(c.unidad || '')}" data-precio="${c.precio}"`
      return `<div class="gv-list-row" style="display:grid; grid-template-columns:${catCols}; gap:12px; padding:13px 22px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span class="gv-cell" data-label="Producto" style="font-size:14px; font-weight:600;">${c.producto}</span>
        <span class="gv-cell" data-label="Unidad" style="font-size:13px; color:#6B5A4C;">${c.unidad}</span>
        <span class="gv-cell" data-label="Precio" style="font-size:14px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(c.precio)}</span>
        <div class="gv-cell gv-cell-actions" style="display:flex; gap:8px; justify-content:flex-end;">
          <button data-action="edit-producto" ${cData} style="background:#fff; color:#6B5A4C; border:1px solid #E5DDD2; ${miniBtn}">Editar</button>
          <button data-action="del-producto" data-id="${c._row}" style="background:#fff; color:#B3261E; border:1px solid #E7C9C6; ${miniBtn}">Eliminar</button>
        </div>
      </div>`
    }).join('')

    var catInner = `
      <div style="padding:14px 22px;">
        <button data-action="open-modal" data-modal="producto" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:9px 15px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:7px;">${icon('plus', 15, 2.4)} Nuevo producto</button>
      </div>
      <div class="gv-list-head" style="display:grid; grid-template-columns:${catCols}; gap:12px; padding:12px 22px; background:#FAF6F0; border-top:1px solid #F0EAE0; border-bottom:1px solid #F0EAE0;">
        ${th('Producto')}${th('Unidad')}${th('Precio vigente', true)}${th('Acción', true)}
      </div>
      ${cat || `<div style="padding:16px 22px; font-size:13px; color:#8A7A6C;">Todavía no hay productos cargados.</div>`}`

    return `
    <div style="margin-bottom:24px;"><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Configuración</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Tocá cada sección para expandir o colapsar.</div></div>
    ${collapCard('gv-collap-alias', 'Cuentas para cobros (alias / CBU) · ' + (Array.isArray(alias) ? alias.length : 0), 'Se le muestran al franquiciado al registrar un pago, para que copie el alias o CBU.', aliasInner, '#C8102E')}
    <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden; margin-bottom:24px;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #F0EAE0;">
        <div><div style="font-family:'Playfair Display',serif; font-weight:600; font-size:17px;">Franquiciados</div><div style="font-size:12px; color:#6B5A4C; margin-top:2px;">Un acceso por sucursal.</div></div>
        <button data-action="open-modal" data-modal="usuario" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:9px 15px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:7px;">${icon('plus', 15, 2.4)} Alta</button>
      </div>
      ${lista}
    </div>
    ${collapCard('gv-collap-cat', 'Catálogo de productos anexos · ' + catalogo.length, 'Precio vigente que se aplica al cargar anexos.', catInner)}`
  }

  // ============================ MODALES (admin) ============================
  var inputBase = 'width:100%; box-sizing:border-box; border:1px solid #E5DDD2; border-radius:8px; padding:11px 13px; font-size:14px; font-family:\'Inter\',sans-serif; background:#fff; outline:none;'

  function campo(label, inner) {
    return `<div style="margin-bottom:14px;"><label style="display:block; font-size:13px; font-weight:600; margin-bottom:6px;">${label}</label>${inner}</div>`
  }

  function overlay(titulo, saveAction, inner) {
    return `
    <div style="position:fixed; inset:0; background:rgba(43,27,18,0.45); display:flex; align-items:center; justify-content:center; z-index:100;">
      <div style="width:440px; max-width:92vw; background:#FAF6F0; border-radius:16px; box-shadow:0 24px 64px rgba(43,27,18,0.4); padding:24px 26px; font-family:'Inter',sans-serif;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
          <h2 style="font-family:'Playfair Display',serif; font-weight:700; font-size:20px;">${titulo}</h2>
          <button data-action="close-modal" style="background:none; border:none; font-size:20px; color:#6B5A4C; cursor:pointer; line-height:1;">✕</button>
        </div>
        ${inner}
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:22px;">
          <button data-action="close-modal" style="background:#fff; color:#6B5A4C; border:1px solid #E5DDD2; border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Cancelar</button>
          <button data-action="${saveAction}" style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:10px 20px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Guardar</button>
        </div>
      </div>
    </div>`
  }

  function escAttr(s) {
    return String(s == null ? '' : s).replace(/"/g, '&quot;')
  }
  // Botones Editar / Eliminar de una fila (mismo look en admin y franquiciado).
  function rowBtns(entity, r) {
    var base = 'border-radius:6px; padding:6px 12px; font-size:12px; font-weight:600; font-family:\'Inter\',sans-serif; cursor:pointer;'
    var data = entity === 'anexo'
      ? `data-id="${r._row}" data-producto="${encodeURIComponent(r.producto)}" data-cantidad="${r.cantidad}" data-fecha="${r.fecha}"`
      : `data-id="${r._row}" data-concepto="${encodeURIComponent(r.concepto)}" data-monto="${r.monto}" data-fecha="${r.fecha}"`
    return `<button data-action="edit-${entity}" ${data} style="background:#fff; color:#6B5A4C; border:1px solid #E5DDD2; ${base}">Editar</button>
      <button data-action="del-${entity}" data-id="${r._row}" style="background:#fff; color:#B3261E; border:1px solid #E7C9C6; ${base}">Eliminar</button>`
  }

  function editPagoOverlay(state) {
    var e = state.edit || {}
    return overlay('Editar pago', 'save-edit-pago',
      campo('Concepto', `<input id="gv-pago-concepto" value="${escAttr(e.concepto)}" style="${inputBase}">`) +
      campo('Monto', `<input id="gv-pago-monto" value="${e.monto || ''}" inputmode="numeric" style="${inputBase}">`) +
      campo('Fecha (dd/mm/aaaa)', `<input id="gv-fecha" value="${e.fecha ? f.dmy(e.fecha) : ''}" placeholder="dd/mm/aaaa" inputmode="numeric" style="${inputBase}">`))
  }

  function adminModal(state, data) {
    if (!state.modal) return ''
    if (state.modal === 'cuenta' || state.modal === 'edit-cuenta') {
      var ec = state.modal === 'edit-cuenta' ? (state.edit || {}) : {}
      var saveC = state.modal === 'edit-cuenta' ? 'save-edit-cuenta' : 'save-cuenta'
      return overlay(state.modal === 'edit-cuenta' ? 'Editar cuenta' : 'Nueva cuenta para cobros', saveC,
        campo('Concepto', `<input id="gv-cuenta-concepto" value="${escAttr(ec.concepto)}" placeholder="Ej: Transferencia bancaria" style="${inputBase}">`) +
        campo('Alias o CBU', `<input id="gv-cuenta-cbu" value="${escAttr(ec.aliasCbu)}" placeholder="Ej: genova.pastas / 01700..." style="${inputBase}">`) +
        campo('Nombre en la cuenta', `<input id="gv-cuenta-titular" value="${escAttr(ec.titular)}" placeholder="Ej: Roberto Genova S.A." style="${inputBase}">`))
    }
    if (state.modal === 'edit-pago') return editPagoOverlay(state)
    if (state.modal === 'edit-anexo') {
      var e = state.edit || {}
      var eopts = (data.catalogo || []).map(function (c) {
        return `<option value="${escAttr(c.producto)}" data-unidad="${c.unidad}" data-precio="${c.precio}"${c.producto === e.producto ? ' selected' : ''}>${c.producto} · ${money(c.precio)}</option>`
      }).join('')
      return overlay('Editar producto anexo', 'save-edit-anexo',
        campo('Producto', `<select id="gv-anexo-producto" style="${inputBase}">${eopts}</select>`) +
        campo('Cantidad', `<input id="gv-anexo-cantidad" value="${e.cantidad ? f.plain(e.cantidad) : ''}" data-num inputmode="decimal" style="${inputBase}">`) +
        campo('Fecha (dd/mm/aaaa)', `<input id="gv-fecha" value="${e.fecha ? f.dmy(e.fecha) : ''}" placeholder="dd/mm/aaaa" inputmode="numeric" style="${inputBase}">`))
    }
    var hoy = new Date()
    var hoyDDMM = ('0' + hoy.getDate()).slice(-2) + '/' + ('0' + (hoy.getMonth() + 1)).slice(-2)
    var fechaCampo = campo('Fecha (dd/mm)', `<input id="gv-fecha" value="${hoyDDMM}" placeholder="dd/mm" inputmode="numeric" style="${inputBase}">`)

    if (state.modal === 'pago') {
      return overlay('Registrar pago', 'save-pago', pagoFields(data.alias))
    }

    if (state.modal === 'anexo') {
      var opts = (data.catalogo || []).map(function (c) {
        return `<option value="${c.producto}" data-unidad="${c.unidad}" data-precio="${c.precio}">${c.producto} · ${money(c.precio)}</option>`
      }).join('')
      return overlay('Cargar producto', 'save-anexo',
        campo('Producto', `<select id="gv-anexo-producto" style="${inputBase}">${opts}</select>`) +
        campo('Cantidad', `<input id="gv-anexo-cantidad" data-num inputmode="decimal" placeholder="0" style="${inputBase}">`) +
        fechaCampo)
    }

    if (state.modal === 'usuario' || state.modal === 'edit-usuario') {
      var eu = state.modal === 'edit-usuario' ? (state.edit || {}) : {}
      var saveU = state.modal === 'edit-usuario' ? 'save-edit-usuario' : 'save-usuario'
      var sucs = (data.sucursales || []).map(function (s) {
        return `<option value="${escAttr(s.nombre)}"${s.nombre === eu.sucursal ? ' selected' : ''}>${s.nombre}</option>`
      }).join('')
      var ests = ['Activo', 'Inactivo'].map(function (x) {
        return `<option value="${x}"${(eu.estado || 'Activo') === x ? ' selected' : ''}>${x}</option>`
      }).join('')
      return overlay(state.modal === 'edit-usuario' ? 'Editar franquiciado' : 'Alta de franquiciado', saveU,
        campo('Nombre', `<input id="gv-user-nombre" value="${escAttr(eu.nombre)}" style="${inputBase}">`) +
        campo('Iniciales', `<input id="gv-user-iniciales" value="${escAttr(eu.iniciales)}" maxlength="3" placeholder="Ej: MF" style="${inputBase}">`) +
        campo('Sucursal', `<select id="gv-user-sucursal" style="${inputBase}">${sucs}</select>`) +
        campo('Email', `<input id="gv-user-email" type="email" value="${escAttr(eu.email)}" style="${inputBase}">`) +
        (state.modal === 'edit-usuario' ? campo('Estado', `<select id="gv-user-estado" style="${inputBase}">${ests}</select>`) : ''))
    }

    if (state.modal === 'producto' || state.modal === 'edit-producto') {
      var ep = state.modal === 'edit-producto' ? (state.edit || {}) : {}
      var saveP = state.modal === 'edit-producto' ? 'save-edit-producto' : 'save-producto'
      return overlay(state.modal === 'edit-producto' ? 'Editar producto' : 'Nuevo producto', saveP,
        campo('Producto', `<input id="gv-prod-nombre" value="${escAttr(ep.producto)}" style="${inputBase}">`) +
        campo('Unidad', `<input id="gv-prod-unidad" value="${escAttr(ep.unidad)}" placeholder="Ej: docena, kg, plancha" style="${inputBase}">`) +
        campo('Precio', `<input id="gv-prod-precio" value="${ep.precio ? f.plain(ep.precio) : ''}" data-num inputmode="decimal" placeholder="0" style="${inputBase}">`))
    }

    return ''
  }

  // Ícono de copiar (clipboard).
  function copyIcon() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto;"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
  }

  // Campos compartidos del modal "Registrar pago" (admin y franquiciado):
  // Concepto = desplegable de cuentas; debajo alias/CBU + titular (según la cuenta) con Copiar; luego monto y fecha.
  function pagoFields(cuentas) {
    var hoy = new Date()
    var hoyDDMM = ('0' + hoy.getDate()).slice(-2) + '/' + ('0' + (hoy.getMonth() + 1)).slice(-2)
    var montoFecha =
      campo('Monto', `<input id="gv-pago-monto" data-num inputmode="decimal" placeholder="0" style="${inputBase}">`) +
      campo('Fecha (dd/mm)', `<input id="gv-fecha" value="${hoyDDMM}" placeholder="dd/mm" inputmode="numeric" style="${inputBase}">`)

    if (!cuentas || !cuentas.length) {
      return campo('Concepto', `<input id="gv-pago-concepto" placeholder="Ej: Transferencia" style="${inputBase}">`) + montoFecha
    }

    var opts = cuentas.map(function (c, i) {
      return `<option value="${escAttr(c.concepto)}" data-cbu="${escAttr(c.aliasCbu || '')}" data-titular="${escAttr(c.titular || '')}"${i === 0 ? ' selected' : ''}>${c.concepto}</option>`
    }).join('')
    var first = cuentas[0]

    return campo('Concepto', `<select id="gv-pago-concepto" data-action="pick-cuenta" style="${inputBase}">${opts}</select>`) +
      `<div style="background:#FBF7F0; border:1px solid #E5DDD2; border-radius:10px; padding:12px 14px; margin-bottom:14px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="min-width:0;">
            <div style="font-size:11px; color:#6B5A4C;">Alias / CBU</div>
            <div id="gv-cuenta-alias" style="font-size:15px; font-weight:700; word-break:break-all;">${first.aliasCbu || '—'}</div>
          </div>
          <button data-action="copy-alias" id="gv-cuenta-copy" data-text="${escAttr(first.aliasCbu || '')}" title="Copiar" style="flex:0 0 auto; display:inline-flex; align-items:center; gap:6px; background:#C8102E; color:#fff; border:none; border-radius:8px; padding:8px 12px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">${copyIcon()} Copiar</button>
        </div>
        <div style="font-size:12px; color:#6B5A4C; margin-top:8px;">Titular: <span id="gv-cuenta-titular" style="font-weight:600; color:#2B1B12;">${first.titular || '—'}</span></div>
      </div>` +
      montoFecha
  }

  function franModal(state, data) {
    if (state.modal === 'edit-pago') return editPagoOverlay(state)
    if (state.modal !== 'pago-fran') return ''
    return overlay('Registrar un pago', 'save-pago-fran', pagoFields((data && data.alias) || []))
  }

  return { login: login, booting: booting, denied: denied, franchisee: franchisee, admin: admin, adminModal: adminModal, franModal: franModal }
})()
