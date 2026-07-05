// ============================================================================
//  Configuración de la app
// ----------------------------------------------------------------------------
//  DEMO_MODE = true  → la app funciona sola, con datos de ejemplo en memoria.
//                      No necesita Google Sheets. Ideal para probar y demostrar.
//  DEMO_MODE = false → la app lee y escribe en tu planilla de Google Sheets,
//                      a través del Web App de Google Apps Script (backend/Code.gs).
//
//  Para conectar la base de datos real:
//    1) Seguí las instrucciones de backend/README.md (crear la planilla y
//       publicar el Apps Script como Web App).
//    2) Pegá la URL del Web App en API_URL (abajo).
//    3) Poné DEMO_MODE en false.
// ============================================================================
window.Genova = window.Genova || {}

Genova.config = {
  DEMO_MODE: true,
  API_URL: '', // ej: 'https://script.google.com/macros/s/AKfy.../exec'
  MES_ACTUAL: '2026-07', // mes en curso (formato AAAA-MM)
}
