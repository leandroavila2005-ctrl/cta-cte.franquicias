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
  function login() {
    return `
    <div style="width:440px; background:#FAF6F0; border-radius:20px; box-shadow:0 8px 32px rgba(43,27,18,0.14); padding:40px 36px; text-align:center;">
      <div style="width:76px; height:76px; margin:0 auto 18px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:8px;">
        <img src="assets/logo-g.png" alt="Pastas Genova" style="width:100%; height:100%; object-fit:contain;">
      </div>
      <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:26px; line-height:1.1;">Pastas Genova</h1>
      <div style="font-size:13px; color:#6B5A4C; margin-top:6px; margin-bottom:28px;">Cuenta corriente de franquicias</div>
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

      <div style="font-size:11px; color:#A89684; margin-top:24px;">Prototipo · elegí un rol para recorrer la app</div>
    </div>`
  }

  // ============================ FRANQUICIADO (mobile) ============================
  function franchisee(state, data) {
    var d = data.dash
    var tab = state.fTab
    var body = tab === 'resumen' ? franResumen(state, d)
      : tab === 'anexos' ? franAnexos(d, data.anexos)
      : franPagos(d, data.pagos)

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
        <button data-action="logout" style="margin-left:auto; background:rgba(255,255,255,.16); border:none; color:#fff; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; padding:7px 11px; border-radius:8px; cursor:pointer;">Salir</button>
      </div>

      <div class="gv-scroll" style="flex:1 1 auto; overflow-y:auto; padding:16px 16px 96px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <button style="width:36px; height:36px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#6B5A4C; font-size:18px; cursor:pointer;">‹</button>
          <div style="text-align:center; line-height:1.2;">
            <div style="font-family:'Playfair Display',serif; font-weight:700; font-size:19px;">${f.mesLargo(d.mes)}</div>
            <div style="font-size:11px; color:#C77700; font-weight:600; letter-spacing:.02em;">MES EN CURSO</div>
          </div>
          <button style="width:36px; height:36px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#C8B7A6; font-size:18px; cursor:not-allowed;">›</button>
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

  function franResumen(state, d) {
    var chevron = state.det ? 'rotate(180deg)' : 'rotate(0deg)'
    var detMax = state.det ? '760px' : '0px'
    return `
    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:24px 20px; text-align:center; margin-bottom:16px;">
      <div style="font-size:13px; color:#6B5A4C; font-weight:500; margin-bottom:6px;">Tu saldo a pagar</div>
      <div style="font-weight:700; font-size:40px; color:#B3261E; font-variant-numeric:tabular-nums; letter-spacing:-0.02em; line-height:1.05;">${money(d.saldo)}</div>
      <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; background:#FBEAE8; color:#B3261E; padding:5px 12px; border-radius:999px; font-size:13px; font-weight:600;">
        <span style="width:7px; height:7px; border-radius:50%; background:#B3261E;"></span> Pendiente de pago
      </div>
      <div style="font-size:12px; color:#6B5A4C; margin-top:12px;">Total del mes ${money(d.totalMes)} · pagaste ${money(d.pagosTotal)}</div>
    </div>

    <div style="background:#FFFFFF; border-radius:16px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <button data-action="toggle-det" style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:none; border:none; cursor:pointer; text-align:left;">
        <span style="font-family:'Playfair Display',serif; font-weight:600; font-size:16px;">Detalle del cálculo</span>
        <span style="font-size:12px; color:#6B5A4C; transform:${chevron}; transition:transform .2s;">▾</span>
      </button>
      <div style="max-height:${detMax}; overflow:hidden; transition:max-height .28s ease;">
        <div style="padding:4px 16px 16px;">
          ${halfRow('Venta del mes', money(d.venta), money(d.ventaMitad))}
          ${halfRow('Productos anexos', money(d.anexosTotal), money(d.anexosMitad))}
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; margin-bottom:10px;">
            <span style="font-size:14px;">Saldo mes anterior</span>
            <span style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">${money(d.saldoAnterior)}</span>
          </div>
          <div style="background:linear-gradient(180deg,#FBF4E4,#F7ECD3); border:1px solid #EAD9A9; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; line-height:1.2;">
              <span style="font-family:'Playfair Display',serif; font-size:15px; font-weight:700;">Total del mes</span>
              <span style="font-size:11px; color:#8A6B2E; font-weight:500;">Las dos mitades + saldo anterior</span>
            </div>
            <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums;">${money(d.totalMes)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; margin-top:2px;">
            <span style="font-size:14px; color:#2E7D4F; font-weight:500;">Pagos del mes</span>
            <span style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums; color:#2E7D4F;">${money(-d.pagosTotal)}</span>
          </div>
          <div style="background:#FBEAE8; border-radius:12px; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#B3261E;">Saldo a pagar</span>
            <span style="font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; color:#B3261E;">${money(d.saldo)}</span>
          </div>
        </div>
      </div>
    </div>

    <button data-action="ftab" data-tab="pagos" style="width:100%; margin-top:16px; background:#C8102E; color:#fff; border:none; border-radius:8px; padding:15px; font-size:15px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; box-shadow:0 2px 8px rgba(43,27,18,0.08);">Registrar un pago</button>`
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

  function franPagos(d, rows) {
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
    <button style="width:100%; margin-bottom:8px; background:#C8102E; color:#fff; border:none; border-radius:8px; padding:15px; font-size:15px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
      ${icon('plus', 18, 2.4)} Registrar un pago
    </button>
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
      : adminConfig(data.usuarios, data.catalogo)

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

    return `
    <div style="width:1440px; height:900px; background:#FAF6F0; border-radius:16px; box-shadow:0 30px 80px -12px rgba(43,27,18,0.38), 0 12px 28px rgba(43,27,18,0.20); overflow:hidden; display:flex;">
      <div style="flex:0 0 248px; background:#FFFFFF; border-right:1px solid #E5DDD2; display:flex; flex-direction:column; padding:20px 16px;">
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
        <div style="margin-top:auto; display:flex; align-items:center; gap:10px; padding:10px 8px; border-top:1px solid #F0EAE0;">
          <div style="width:32px; height:32px; border-radius:50%; background:#2B1B12; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600;">RG</div>
          <div style="line-height:1.2; flex:1 1 auto;">
            <div style="font-size:13px; font-weight:600;">Roberto Genova</div>
            <div style="font-size:11px; color:#6B5A4C;">Franquiciante</div>
          </div>
          <button data-action="logout" style="background:none; border:none; color:#C8102E; font-size:11px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Salir</button>
        </div>
      </div>
      <div class="gv-scroll" style="flex:1 1 auto; overflow-y:auto; padding:28px 36px;">${main}</div>
    </div>`
  }

  function monthNav() {
    return `<div style="display:flex; align-items:center; gap:10px;">
      <button style="width:38px; height:38px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#6B5A4C; font-size:18px; cursor:pointer;">‹</button>
      <div style="text-align:center; min-width:120px;">
        <div style="font-family:'Playfair Display',serif; font-weight:700; font-size:16px;">Julio 2026</div>
        <div style="font-size:10px; color:#C77700; font-weight:700;">MES EN CURSO</div>
      </div>
      <button style="width:38px; height:38px; border-radius:8px; border:1px solid #E5DDD2; background:#fff; color:#C8B7A6; font-size:18px; cursor:not-allowed;">›</button>
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
    <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:24px;">
      <div>
        <div style="display:flex; align-items:center; gap:10px;">
          <h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Resumen — ${d.sucursal}</h1>
          <span style="background:${p.statusBg}; color:${p.statusFg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;">${p.statusLabel}</span>
        </div>
        <div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Cuenta corriente mensual del franquiciado.</div>
      </div>
      ${monthNav()}
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start;">
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:22px 24px;">
          <label style="font-size:13px; font-weight:600;">Venta total del mes</label>
          <div style="font-size:12px; color:#6B5A4C; margin:2px 0 12px;">Cargala para calcular la mitad que va a la cuenta.</div>
          <div style="display:flex; align-items:center; border:1.5px solid #C8102E; border-radius:8px; overflow:hidden;">
            <span style="padding:0 8px 0 14px; font-size:20px; font-weight:600; color:#6B5A4C;">$</span>
            <input value="${f.plain(d.venta)}" readonly style="flex:1 1 auto; border:none; outline:none; padding:13px 14px 13px 0; font-size:20px; font-weight:700; font-family:'Inter',sans-serif; font-variant-numeric:tabular-nums; background:transparent;">
            <button style="margin:6px; background:#C8102E; color:#fff; border:none; border-radius:6px; padding:9px 18px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Guardar</button>
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
    var cols = '120px 1fr 130px 140px 140px'
    var body = rows.map(function (r) {
      return `<div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:14px 20px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span style="font-size:14px; font-variant-numeric:tabular-nums;">${f.ddmm(r.fecha)}</span>
        <span style="font-size:14px; font-weight:600;">${r.producto}</span>
        <span style="font-size:14px; text-align:right; color:#6B5A4C;">${r.cantidad} ${f.unidadAbbr(r.unidad)}</span>
        <span style="font-size:14px; text-align:right; font-variant-numeric:tabular-nums;">${money(r.precioUnit)}</span>
        <span style="font-size:14px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(r.subtotal)}</span>
      </div>`
    }).join('')

    return `
    <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px;">
      <div><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Productos anexos — ${d.sucursal}</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Mercadería que la sucursal compra a la matriz durante el mes.</div></div>
      <button style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:11px 18px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:8px;">${icon('plus', 16, 2.4)} Cargar producto</button>
    </div>
    <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:13px 20px; background:#FAF6F0; border-bottom:1px solid #F0EAE0;">
        ${th('Fecha')}${th('Producto')}${th('Cantidad', true)}${th('Precio', true)}${th('Subtotal', true)}
      </div>
      ${body}
      <div style="display:grid; grid-template-columns:1fr 140px; gap:14px; padding:16px 20px; background:#FBF7F0;">
        <span style="font-size:14px; font-weight:700;">Total anexos del mes · la mitad (${money(d.anexosMitad)}) entra a la cuenta</span>
        <span style="font-size:17px; font-weight:700; text-align:right; font-variant-numeric:tabular-nums;">${money(d.anexosTotal)}</span>
      </div>
    </div>`
  }

  function adminPagos(d, p, rows) {
    var cols = '120px 1fr 150px 150px 220px'
    var pendBorder = d.pendCount > 0 ? '#C77700' : '#E5DDD2'
    var pendColor = d.pendCount > 0 ? '#C77700' : '#6B5A4C'
    var pendText = d.pendCount > 0 ? (d.pendCount + (d.pendCount === 1 ? ' pago' : ' pagos') + ' esperando confirmación') : 'Sin pagos pendientes'
    var statLabel = 'font-size:12px; color:#6B5A4C; font-weight:600; text-transform:uppercase;'

    var body = rows.map(function (r) {
      var b = badgePago(r.estado)
      var accion = r.estado === 'pending'
        ? `<div style="display:flex; gap:8px; justify-content:flex-end;">
            <button style="background:#2E7D4F; color:#fff; border:none; border-radius:6px; padding:7px 14px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Verificar</button>
            <button style="background:#fff; color:#B3261E; border:1px solid #E7C9C6; border-radius:6px; padding:7px 14px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer;">Rechazar</button>
          </div>`
        : `<span style="font-size:13px; color:#8A7A6C;">Confirmado</span>`
      return `<div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:15px 20px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span style="font-size:14px; font-variant-numeric:tabular-nums;">${f.ddmm(r.fecha)}</span>
        <span style="font-size:14px; font-weight:600;">${r.concepto}</span>
        <span style="font-size:15px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(r.monto)}</span>
        <span><span style="display:inline-flex; align-items:center; gap:6px; background:${b.bg}; color:${b.fg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;"><span style="width:6px; height:6px; border-radius:50%; background:${b.fg};"></span>${b.label}</span></span>
        <div style="text-align:right;">${accion}</div>
      </div>`
    }).join('')

    return `
    <div style="display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:22px;">
      <div><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Pagos — ${d.sucursal}</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Verificá los pagos cargados por el franquiciado o registrá uno.</div></div>
      <button style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:11px 18px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:8px;">${icon('plus', 16, 2.4)} Registrar pago</button>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:22px;">
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px;"><div style="${statLabel}">Pagos verificados</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:#2E7D4F; margin-top:6px;">${money(d.pagosVerificados)}</div></div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px; border-left:4px solid ${pendBorder};"><div style="${statLabel}">Por verificar</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:${pendColor}; margin-top:6px;">${money(d.pagosPorVerificar)}</div><div style="font-size:12px; color:#8A6B2E; margin-top:2px;">${pendText}</div></div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); padding:18px 22px;"><div style="${statLabel}">Saldo a pagar</div><div style="font-size:26px; font-weight:700; font-variant-numeric:tabular-nums; color:${p.accent}; margin-top:6px;">${p.saldoDisplay}</div></div>
    </div>
    <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
      <div style="display:grid; grid-template-columns:${cols}; gap:14px; padding:13px 20px; background:#FAF6F0; border-bottom:1px solid #F0EAE0;">
        ${th('Fecha')}${th('Concepto')}${th('Monto', true)}${th('Estado')}${th('Acción', true)}
      </div>
      ${body}
    </div>`
  }

  function adminConfig(usuarios, catalogo) {
    var lista = usuarios.filter(function (u) { return u.rol === 'franquiciado' }).map(function (u) {
      var b = u.estado === 'Activo' ? { bg: '#E7F1EB', fg: '#2E7D4F' } : { bg: '#FBF3E2', fg: '#C77700' }
      return `<div style="display:flex; align-items:center; gap:13px; padding:14px 22px; border-bottom:1px solid #F0EAE0;">
        <div style="width:38px; height:38px; border-radius:50%; background:#FBEAE8; color:#C8102E; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex:0 0 auto;">${u.iniciales}</div>
        <div style="flex:1 1 auto; min-width:0;"><div style="font-size:14px; font-weight:600;">${u.nombre}</div><div style="font-size:12px; color:#6B5A4C;">${u.sucursal} · ${u.email}</div></div>
        <span style="display:inline-flex; align-items:center; gap:6px; background:${b.bg}; color:${b.fg}; font-size:12px; font-weight:600; padding:4px 10px; border-radius:999px;"><span style="width:6px; height:6px; border-radius:50%; background:${b.fg};"></span>${u.estado}</span>
      </div>`
    }).join('')

    var cat = catalogo.map(function (c) {
      return `<div style="display:grid; grid-template-columns:1fr 120px 140px; gap:12px; padding:13px 22px; border-bottom:1px solid #F0EAE0; align-items:center;">
        <span style="font-size:14px; font-weight:600;">${c.producto}</span>
        <span style="font-size:13px; color:#6B5A4C;">${c.unidad}</span>
        <span style="font-size:14px; text-align:right; font-weight:600; font-variant-numeric:tabular-nums;">${money(c.precio)}</span>
      </div>`
    }).join('')

    return `
    <div style="margin-bottom:24px;"><h1 style="font-family:'Playfair Display',serif; font-weight:700; font-size:28px;">Configuración</h1><div style="font-size:13px; color:#6B5A4C; margin-top:6px;">Accesos de franquiciados y catálogo maestro de productos anexos.</div></div>
    <div style="display:grid; grid-template-columns:1fr 1.25fr; gap:24px; align-items:start;">
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #F0EAE0;">
          <div><div style="font-family:'Playfair Display',serif; font-weight:600; font-size:17px;">Franquiciados</div><div style="font-size:12px; color:#6B5A4C; margin-top:2px;">Un acceso por sucursal.</div></div>
          <button style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:9px 15px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:7px;">${icon('plus', 15, 2.4)} Alta</button>
        </div>
        ${lista}
      </div>
      <div style="background:#FFFFFF; border-radius:8px; box-shadow:0 2px 8px rgba(43,27,18,0.08); overflow:hidden;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #F0EAE0;">
          <div><div style="font-family:'Playfair Display',serif; font-weight:600; font-size:17px;">Catálogo de productos anexos</div><div style="font-size:12px; color:#6B5A4C; margin-top:2px;">Precio vigente que se aplica al cargar anexos.</div></div>
          <button style="background:#C8102E; color:#fff; border:none; border-radius:8px; padding:9px 15px; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; cursor:pointer; display:flex; align-items:center; gap:7px;">${icon('plus', 15, 2.4)} Nuevo producto</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 120px 140px; gap:12px; padding:12px 22px; background:#FAF6F0; border-bottom:1px solid #F0EAE0;">
          ${th('Producto')}${th('Unidad')}${th('Precio vigente', true)}
        </div>
        ${cat}
      </div>
    </div>`
  }

  return { login: login, franchisee: franchisee, admin: admin }
})()
