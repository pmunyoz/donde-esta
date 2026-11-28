# Piensa un rato (piensaunrato.es)

Juegos diarios gratuitos en español, sin registro. Web estática en GitHub Pages (rama `main`, dominio en `CNAME`).
Propietario: Pascual Muñoz (pmunyoz). Escribe siempre en español de España.

## Cómo trabajamos

- **Nunca se publica directamente en `main`.** Cada cambio va en una rama y una PR; Pascual revisa y hace el merge.
  Comprueba antes si la PR anterior ya está mergeada: si lo está, la siguiente tarea va en rama nueva desde `main`.
- En cada PR pon la vista previa: `https://raw.githack.com/pmunyoz/donde-esta/<rama>/<página>.html`
  (sirve archivos de la rama; tarda un par de minutos en refrescar).
- Pregunta antes de decisiones de producto difíciles de deshacer. Para lo demás, haz y explica.
- Prueba siempre antes de abrir la PR (ver «Pruebas»), en móvil (320–390 px) y escritorio, modo claro y oscuro.
- GitHub Pages cachea JS/CSS ~10 minutos: tras un merge, un fallo «raro» puede ser caché del navegador.

## Estructura

- `index.html` — portada (sin barra de juegos): tarjetas de los 5 juegos con la puntuación de hoy si ya se jugó.
  Redirige los enlaces antiguos `/?dia=`, `/?reto=`, `/?liga=`, `/?modo=` a `donde.html`.
- Juegos (HTML con su JS dentro):
  - `donde.html` — ¿Dónde está? (adivinar pueblo de España; mapa, pistas, fotos de Wikimedia). Antes era la portada.
  - `letras.html` — 5 palabras desordenadas, 25 puntos. Prefijo de guardado `lt-`.
  - `cifras.html` — 3 rondas de cifras, 30 puntos. Prefijo `cf-`.
  - `grupos.html` + `grupos-datos.js` — 16 palabras en 4 grupos. 4 pts/grupo + bono por fallos (4/2/1/0) +
    bono de tiempo (5, −1 cada 30 s). Máx. 25. Botón «Empezar» tapa las palabras. Prefijo `gr-`. Nº 1 = 27/11/2026.
  - `linea.html` + `linea-datos.js` — Línea del tiempo: 9 sucesos, tema rotatorio cada día, 3 fallos.
    3 pts/acierto + 1 sin fallos = 25. Prefijo `tl-`. Nº 1 = 27/11/2026.
  - ¿Dónde está? usa prefijo `dd-`. ¿Dónde está?, Letras y Cifras: nº 1 = 26/11/2026.
- Reto del día: determinista según la fecha (`DAY` = días desde el 14/11/2026, semilla mulberry32).
  `?dia=AAAA-MM-DD` juega un día anterior (no cuenta en estadísticas ni liga).
- Barra de juegos (Inicio + 5 juegos, icono y nombre corto) en todas las páginas salvo la portada; estilos en `barra.css`
  (también el relieve 3D de botones y la fila compacta «Más juegos» `.go-mini`).
- Scripts compartidos (leen las variables globales de cada juego: `st`, `key`, `CUSTOM`, `ARCH`, `score()`, `usedSecs()`…):
  - `reto.js` — retos de profes en `?reto=` (tipos: `l` Letras, `d` ¿Dónde está?, `c` Cifras, `g` Grupos, `t` Línea).
  - `clase.js` — clasificación en directo de una clase (`cl` en el reto).
  - `ranking.js` — clasificación pública: la primera vez pide apodo; luego publica solo al terminar.
    Se puede cambiar el apodo, quitarse del día o desactivar la publicación automática.
  - `estadisticas.js` («Hoy, entre todos» y tu puesto), `logros.js`, `imagen.js` (imagen para compartir),
    `avisos.js` (aviso diario push, probado en móvil real), `contador.js` (cuenta partidas), `ads.js`, `qr.js`.
- Otras páginas: `profes.html` (Retos para clase, con pistas propuestas de Wikipedia en ¿Dónde está?), `clase.html`,
  `ranking.html`, `archivo.html`, `soluciones.html`, `logros.html`, `sugerencias.html`, `acerca.html`, `privacidad.html`.
- App instalable: `manifest.webmanifest` (nombre «Piensa un rato», accesos directos) y `sw.js`.
- Al añadir un juego nuevo hay que tocar: barra, `.go-mini`, portada, archivo, soluciones, ranking, profes, logros,
  `ranking.js`/`clase.js`/`imagen.js`, sitemap, manifest, acerca, privacidad, sugerencias, Supabase y el comprobador.

## Supabase (proyecto `lnqigozwqraprajvaoiv`)

La clave publicable está en el código (es pública). Las tablas solo se tocan mediante funciones.
- Tablas: `partidas` (contador), `resultados` (ligas de amigos), `ranking` (clasificación pública, se borra a los
  60 días; para retirar un apodo, `oculto = true`), `clase_resultados` (se borra a los 7 días), `sugerencias`,
  `suscripciones` (aviso diario).
- Funciones: `estadisticas_dia`, `ranking_enviar` (si ya estabas ese día solo cambia el apodo), `ranking_quitar`,
  `ranking_ver`, `clase_enviar`, `clase_ranking`, `suscribir`/`desuscribir`, `resumen_dia` (solo servidor).
- Las columnas `juego`/`modo` tienen un CHECK con la lista de juegos: al añadir uno, amplíalo.
- Edge Functions: `aviso-sugerencia` (correo por cada sugerencia), `aviso-diario` (push a las 8:00 UTC),
  `resumen-diario` (correo a las 23:00 de Madrid con las partidas del día). Correo con Resend (secreto `RESEND_API_KEY`).
  Las llaman `pg_cron`/triggers con una cabecera `x-aviso`; no pongas esos tokens en el repositorio.

## Otros servicios

- AdSense `ca-pub-8361369070531250`, bloque `8510435358`. Publicidad poco agresiva: un solo anuncio al final
  (pantalla final de los juegos, portada, clasificación, días anteriores, soluciones y logros). **Nunca durante la
  partida ni en Clase, Profes, Acerca de, Privacidad o Sugerencias** (las usan alumnos).
- GoatCounter `pmunyoz` (visitas). Ko-fi `pascualmunoz`. Dominio en DonDominio.

## Valenciano (oculto de momento)

`herramientas/valenciano.py` genera `va/lletres.html`, `va/xifres.html` y `va/*.js` a partir de las páginas en
castellano con pares de traducción; se para con «no trobe» si un texto en castellano ya no existe (actualiza el par).
Las páginas `va/` no se enlazan y llevan `noindex`. Ejecuta el generador después de tocar `letras.html`,
`cifras.html` o los scripts compartidos: la Action lo comprueba. Más adelante se quiere traducir toda la web.

## Pruebas

- `python3 tests/comprobar_retos.py 30` — revisa los próximos 30 días de los 5 juegos (Action
  `.github/workflows/comprobar-retos.yml`, que también comprueba que `va/` esté regenerado).
- Prueba manual con Playwright y Chrome (`/usr/bin/google-chrome`) contra `python3 -m http.server`, simulando
  Supabase, GoatCounter, AdSense, Photon y Wikipedia (sin red desde el entorno).
- Comprueba que la barra cabe a 320 px y que no hay desbordes horizontales.

## Pendientes

- Revisar sucesos de `linea-datos.js` y categorías de `grupos-datos.js`.
- Traducir toda la web al valenciano (fase 2) y volver a enlazarla.
- Posible publicación en Google Play (Trusted Web Activity; necesita cuenta de desarrollador y 12 testers 14 días).
- Seguir la aprobación de AdSense.
