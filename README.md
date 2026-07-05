# Pastas Genova · Cuenta corriente (app web)

App para llevar la cuenta corriente mensual entre el franquiciante y los
franquiciados de las sucursales (City Bell, Gonnet, Los Hornos, Villa Elvira).

Está hecha con la **misma tecnología que la app de la fábrica**: JavaScript
simple (HTML/CSS/JS), **sin framework ni paso de compilación**, pensada para
subirse como sitio estático (por ejemplo, a Vercel). La base de datos es una
planilla de **Google Sheets** vía **Google Apps Script** (carpeta `../backend`).

## Modo demo (funciona sin backend)

Por defecto la app arranca en **modo demo**: usa datos de ejemplo en memoria, así
que **funciona sola, sin Google Sheets**. Ideal para probar y mostrar.

Para verla:

- **Rápido:** abrí `index.html` con doble clic en el navegador.
- **Recomendado:** servila con un servidor estático simple, por ejemplo:
  ```bash
  cd webapp
  python3 -m http.server 8080
  # luego abrí http://localhost:8080
  ```

## Qué se puede hacer

- **Login por rol:** elegí Administrador o Franquiciado; "Salir" vuelve al inicio.
- **Franquiciado (celular):** Resumen (con detalle del cálculo colapsable),
  Anexos (solo lectura) y Pagos. Ve siempre su sucursal (City Bell).
- **Admin (computadora):** sidebar con las 4 pestañas (Resumen, Productos anexos,
  Pagos, Configuración) y **selector de sucursales** que recalcula todas las
  cifras según la sucursal elegida (rojo si debe, verde si está al día o a favor).

Los cálculos respetan la fórmula del Excel `Anexos sucus`:

```
Total del mes = Venta/2 + Anexos/2 + Saldo anterior − Pagos del mes
```

## Conectar la base de datos real (Google Sheets)

Cuando quieras usar datos reales en vez de los de ejemplo, seguí las
instrucciones de [`../backend/README.md`](../backend/README.md) y luego, en
`js/config.js`, poné `DEMO_MODE: false` y pegá la URL del Web App en `API_URL`.

## Estructura

```
webapp/
  index.html            Carga las fuentes, el CSS y los scripts en orden
  css/styles.css        Estilos base (lienzo crema, scrollbars ocultos)
  assets/logo-g.png     Isotipo de Génova
  js/
    config.js           Modo demo / URL del backend / mes en curso
    format.js           Formato de moneda y fechas
    compute.js          Cálculo del mes (modo demo)
    mock.js             Datos de ejemplo (modo demo)
    api.js              Cliente de datos (elige demo o Google Sheets)
    icons.js            Íconos SVG
    views.js            HTML de cada pantalla (login / franquiciado / admin)
    app.js              Estado, navegación y montaje
```

## Estado actual

La navegación, el selector de sucursal y el detalle colapsable funcionan. Los
formularios (Registrar un pago, Cargar producto, Verificar/Rechazar, Alta, Nuevo
producto) todavía son visuales; el backend ya expone las operaciones para
conectarlos (crear / modificar / borrar) cuando se decida activarlos.
