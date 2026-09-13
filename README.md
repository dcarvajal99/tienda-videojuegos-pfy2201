# PixelPlay Store — Semana 5

Actividad formativa «Manipulando el DOM con JavaScript para mejorar la interactividad»
de la asignatura **Desarrollo Frontend I (PFY2201)**, Duoc UC. Exp 2 — Semana 5.

Sitio de una tienda chilena de videojuegos para PlayStation 5, hecho con
**Bootstrap 5.3.8** y, desde esta semana, **JavaScript**: el catálogo se carga desde
un archivo JSON con la Fetch API y se construye en el DOM, las categorías filtran
los juegos, las tarjetas se resaltan al pasar el puntero, el formulario de contacto
se valida al enviarlo y una API pública entrega el valor del dólar.

El proyecto avanza semana a semana: cada commit de este repositorio corresponde
a la entrega de una semana del ramo.

**Sitio publicado:** https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/

---

## Estructura del proyecto

```
tienda-videojuegos-pfy2201/
├── index.html                                  Página principal
├── js/
│   └── Diego_Carvajal_PFY2201_DOM_Semana5.js   Todo el JavaScript de la página
├── data/
│   └── catalogo.json                           Categorías y juegos del catálogo
├── css/
│   └── Diego_Carvajal_PFY2201_CSS_Semana5.css  Ajustes sobre Bootstrap
├── img/                                        2 logotipos (en uso, el monocromo) y 6 portadas
├── capturas/                                   20 capturas: páginas completas, carrusel y cada estado
│                                               de la interacción (ver «Capturas»)
└── README.md
```

## Cómo verlo localmente

El catálogo se lee con `fetch()`, y los navegadores no permiten esa lectura cuando
la página se abre como archivo (`file://`). Hay que servir la carpeta:

```bash
git clone https://github.com/dcarvajal99/tienda-videojuegos-pfy2201.git
cd tienda-videojuegos-pfy2201
python3 -m http.server 8000
```

y abrir `http://localhost:8000`. Si se abre `index.html` con doble clic, la página
lo detecta y muestra un aviso con el enlace a la versión publicada; el carrusel y
la validación del formulario funcionan igual.

## JavaScript

Todo está en `js/Diego_Carvajal_PFY2201_DOM_Semana5.js`, un script clásico cargado
con `defer` después de Bootstrap: corre con el HTML ya leído y sin bloquear el
dibujo. No es un módulo porque los módulos no cargan con `file://`. El archivo
tiene 46 funciones cortas, cada una con un comentario que explica qué hace,
agrupadas en diez secciones con un mapa al principio.

### Datos externos con Fetch API

Una sola función, `obtenerJSON(url)`, hace el `fetch`, convierte en error una
respuesta que no es `ok` (un 404 no rechaza la promesa por sí solo) y devuelve el
JSON. Las dos fuentes la usan por separado, así que si una falla la otra sigue:

| Fuente | Qué entrega | Cadena de promesas | Si falla |
|---|---|---|---|
| `data/catalogo.json` (propio) | 5 categorías y 6 juegos | `.then(iniciarCatalogo)` `.catch(mostrarErrorCatalogo)` `.finally(ocultarCargando)` | Aviso con **Reintentar** y detalle en la consola. Con `file://`, aviso con enlace a la versión publicada |
| [mindicador.cl](https://mindicador.cl/api/dolar) (API pública) | Dólar observado del día | `.then(mostrarDolar)` `.catch(mostrarDolarNoDisponible)` | Una línea que dice que la referencia no está disponible; el catálogo no se toca |

Los estados del catálogo: **cargando** (indicador y «Cargando catálogo…»),
**listo** («Mostrando 6 de 6 juegos.»), **filtrado**, **categoría sin productos**
(aviso con «Ver todos los juegos») y **error**. El resumen es una región
`role="status"`, así que los lectores de pantalla anuncian cada cambio.

### Eventos

| Elemento | Evento | Función | Qué pasa |
|---|---|---|---|
| Filtros de categoría (delegado) | `click` | `manejarClicFiltro` | La cuadrícula muestra solo esa categoría y el botón queda marcado |
| Tarjetas (delegado) | `mouseover` / `mouseout` | `resaltarTarjeta` / `quitarResaltado` | El borde de la tarjeta pasa al color del sitio y vuelve |
| Tarjetas (delegado) | `focusin` / `focusout` | las mismas dos | Lo mismo al llegar con el teclado |
| Botones Consultar (delegado en `main`) | `click` | `prellenarConsulta` | Lleva a Contacto con el juego escrito en «Juego de interés» |
| Avisos del catálogo (delegado) | `click` | `manejarClicEstado` | Reintentar la carga o volver a ver todos los juegos |
| Formulario | `submit` | `validarFormulario` | Mensajes bajo cada campo con error, o un resumen de la consulta |
| Formulario (delegado) | `input` / `reset` | `revalidarCampo` / `limpiarFormulario` | El mensaje se va al corregir; «Limpiar» borra errores y resumen |

Son 15 `addEventListener`: 10 en `registrarEventos()` y 5 del carrusel de la
Semana 4, que ahora vive en `iniciarCarrusel()` sin cambios.

### Qué pide la actividad y dónde está

| La actividad pide | En el código |
|---|---|
| Seleccionar elementos y modificarlos | `getElementById` y `querySelector` en la sección 1; `marcarFiltroActivo` (`classList`, `aria-pressed`), `actualizarResumen`, `mostrarError` |
| Añadir contenido con `createElement` y `appendChild` | `crearTarjeta`, `crearFiltros`, `llenarSugerencias`, `crearAvisoError`, `crearEstadoVacio`, `mostrarConfirmacion` |
| Eliminar contenido | `vaciarElemento` (con `remove()`), usada al filtrar, al recargar y al limpiar el formulario |
| Eventos `click`, `mouseover` y `submit` | Tabla anterior |
| Fetch API, promesas y manejo de errores | `obtenerJSON`, `cargarCatalogo`, `cargarDolar` y sus funciones de error |
| Funciones sin repetición y comentadas | 46 funciones con comentario; utilidades compartidas como `crearElemento`, `crearAviso` y `formatearPesos` |

**Ningún dato entra como HTML.** Los textos del JSON, de la API y de lo que escribe
el usuario se insertan con `textContent`, propiedades o `setAttribute`; en el
archivo no hay `innerHTML`. Un nombre como `<img src=x onerror=…>` se muestra
tal cual en el resumen del formulario.

## Componentes de Bootstrap

| Componente | Dónde | Cómo se configuró |
|---|---|---|
| **Navbar** | Cabecera | `navbar-expand-lg`: menú completo desde 992 px; por debajo, colapsado tras el botón hamburguesa |
| **Carousel** | Destacados de la semana | Cambio cada 3 s (`data-bs-interval="3000"`), botón Pausar/Reanudar, pausa con el foco dentro y alto estable |
| **Grid** | Catálogo, formulario y pie | Barra lateral `col-lg-3` y productos `col-lg-9`; tarjetas `col-12 col-md-6 col-xl-4` |
| **Cards** | Productos, creadas por JavaScript | `card h-100` con `card-img-top`, `card-body` y `card-footer` |
| **Buttons** y **badges** | Filtros de categoría | `btn btn-outline-dark btn-sm` con la cantidad en un `badge`; el activo lleva `active` |
| **Spinner** y **alerts** | Estados del catálogo | `spinner-border-sm` mientras carga; avisos con `alert bg-body-tertiary border` |
| **Validación de formularios** | Contacto | `is-invalid` e `invalid-feedback` con los mensajes del script |

## Puntos de quiebre

| Ancho | Menú | Carrusel | Categorías | Tarjetas por fila |
|---|---|---|---|---|
| < 768 px | Hamburguesa | Portada sobre el texto | Botones en fila | 1 |
| 768 – 991 px | Hamburguesa | Portada junto al texto | Botones en fila | 2 |
| 992 – 1199 px | Completo | Portada junto al texto | Columna | 2 |
| ≥ 1200 px | Completo | Portada junto al texto | Columna | 3 |

## La hoja propia

No reemplaza a Bootstrap: redefine sus variables CSS para mantener la línea sobria
del sitio y agrega reglas solo donde Bootstrap usa valores fijos.

- **Una sola tipografía** (`Inter`) y **neutros con un solo acento**: texto `#18181b`
  y `#52525b`, líneas `#e4e4e7`, pie `#f7f7f8` y el índigo `#2d1b69` del logotipo
  para enlaces, foco, casillas marcadas y la tarjeta resaltada.
- **Rojo de error `#b02a37`**, la única excepción, y solo en campos con error: el
  `#dc3545` de Bootstrap da 4,53:1 sobre blanco y este, 6,5:1. Se quita el ícono
  rojo que Bootstrap dibuja dentro del campo.
- **Esquinas casi rectas** (2 px) y ningún degradado, sombra decorativa ni animación
  al pasar el puntero.

Los colores que Bootstrap también lee en formato `-rgb` se declaran en las dos
variantes, porque según el componente usa una u otra.

## Accesibilidad

- Enlace «Saltar al contenido principal», visible al recibir el foco del teclado.
- **Foco visible** en el menú, en las flechas del carrusel, en los filtros (el que
  tiene el foco no se rellena, para no confundirlo con el activo), en un campo con
  error (contorno del color del sitio por fuera del borde rojo) y en el título del
  catálogo, al que Reintentar lleva el foco.
- Todo lo que responde al puntero responde también al teclado, con las mismas
  funciones.
- Los filtros son botones con `aria-pressed`; el resumen del catálogo y el resumen
  de la consulta son regiones `role="status"`.
- Cada campo con error lleva `aria-invalid` y su mensaje asociado con
  `aria-describedby`, y el foco pasa al primero, también si se envió con Enter
  desde ese mismo campo.
- Carrusel detenible con el botón Pausar (WCAG 2.2.2), pausa con el foco dentro y
  arranque en pausa si el sistema pide reducir el movimiento.
- **Sin JavaScript** se ve un párrafo que lleva al formulario de contacto, los
  controles que no servirían quedan ocultos y el formulario valida con `required`,
  `type`, `pattern` y `minlength`.

## Verificación

| Comprobación | Resultado |
|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/), `index.html` | 0 errores, 0 advertencias |
| W3C Nu, DOM generado por el script en 6 estados (cargado, filtrado, vacío, error, errores del formulario y resumen) | 0 errores y 0 advertencias en los 6 |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) (CSS 3) | Válido, 0 errores, 0 advertencias |
| `node --check` del JavaScript | Sin errores de sintaxis |
| Batería automática en navegadores reales | 47 pruebas en Chrome, Brave y Firefox; en Safari, todas salvo las del carrusel. Resultados en la tabla siguiente |
| Disposición, desborde y alto del carrusel | Iguales a la Semana 4 en 20 anchos entre 320 y 1680 px, sin desborde |
| Página abierta como archivo (`file://`, Chrome) | Aviso con enlace a la versión publicada; carrusel, formulario y dólar funcionan |

Para provocar los errores, las pruebas usan un servidor local que responde 404,
JSON roto, JSON incompleto o con 2 s de retraso, y simula que la API del dólar no
responde. El código del sitio no tiene nada especial para las pruebas.

## Navegadores

Cada celda es el valor medido en ese navegador:

| Comprobación | Chrome 152 | Brave (Chromium 149) | Firefox 146 | Safari 26 |
|---|---|---|---|---|
| Tarjetas al cargar `data/catalogo.json` | 6, con sus precios | 6, con sus precios | 6, con sus precios | 6, con sus precios |
| `formatearPesos(9990)` | `$9.990` | `$9.990` | `$9.990` | `$9.990` |
| Filtros creados con su cantidad | 6 botones y 6 sugerencias | 6 botones y 6 sugerencias | 6 botones y 6 sugerencias | 6 botones y 6 sugerencias |
| Filtrar por cada categoría | 6/3/1/1/1/0 tarjetas | 6/3/1/1/1/0 tarjetas | 6/3/1/1/1/0 tarjetas | 6/3/1/1/1/0 tarjetas |
| Categoría vacía y «Ver todos los juegos» | aviso y foco en «Todas» | aviso y foco en «Todas» | aviso y foco en «Todas» | aviso y foco en «Todas» |
| Resaltado con `mouseover` | borde `#2d1b69` | borde `#2d1b69` | borde `#2d1b69` | borde `#2d1b69` |
| Resaltado con el teclado (`focusin`) | sí | sí | sí (evento simulado) | sí |
| Consultar llena «Juego de interés» | 9/9 | 9/9 | 9/9 | 9/9 |
| Mensajes de validación (`submit`) | exactos | exactos | exactos | exactos |
| Foco al campo con error tras Enter | sí | sí | no medible | sí |
| Resumen tras 3 envíos seguidos | 1 aviso cada vez | 1 aviso cada vez | 1 aviso cada vez | 1 aviso cada vez |
| Texto con etiquetas en el nombre | se muestra literal | se muestra literal | se muestra literal | se muestra literal |
| Error 404 y Reintentar | aviso, intento 4, recupera | aviso, intento 4, recupera | aviso, intento 4, recupera | aviso, intento 4, recupera |
| JSON roto, sin formato o incompleto | aviso sin restos | aviso sin restos | aviso sin restos | aviso sin restos |
| Carga lenta (2 s) | «Cargando catálogo…» | «Cargando catálogo…» | «Cargando catálogo…» | «Cargando catálogo…» |
| Dólar desde mindicador.cl | $937 al 11-09-2026 | $937 al 11-09-2026 | $937 al 11-09-2026 | $937 al 11-09-2026 |
| Dólar no disponible | texto alternativo | texto alternativo | texto alternativo | texto alternativo |
| Desborde horizontal | 0 de 24 casos | 0 de 24 casos | 0 de 24 casos | 0 de 24 casos |
| Carrusel: 3 s, pausa y foco | sí | sí | sí | no medido¹ |

¹ En Safari la batería corrió en una ventana en segundo plano, donde el navegador
frena los temporizadores; las pruebas del carrusel miden tiempos reales y en ese modo
no alcanzan a terminar, así que no se incluyeron. «No medible» indica que la prueba
necesita que la ventana tenga el foco del sistema, que un navegador sin interfaz no
tiene; la lógica equivalente se comprobó con eventos simulados.

## Capturas

| Archivo | Qué muestra |
|---|---|
| `01` a `03` | La página completa en escritorio (1440 px), tablet (820 px) y teléfono (390 px) |
| `04-movil-menu-desplegado` | El menú abierto en el teléfono |
| `05-carrusel-diapositiva-1` a `-3` | Las tres diapositivas del carrusel |
| `06-catalogo-cargando` | El indicador mientras llega el JSON (respuesta retrasada a propósito) |
| `07-catalogo-cargado` | Filtros, tarjetas creadas por el script y referencia del dólar |
| `08-filtro-accion-y-aventura` | El catálogo filtrado |
| `09-filtro-sin-productos` | La categoría vacía con «Ver todos los juegos» |
| `10-tarjeta-resaltada` | Una tarjeta con el borde del color del sitio tras `mouseover`, junto a otra sin resaltar |
| `11-consultar-prellena-formulario` | Contacto con el juego escrito tras pulsar Consultar |
| `12-formulario-errores` | Mensajes de validación bajo los campos |
| `13-formulario-resumen` | El resumen de una consulta válida |
| `14-error-carga-reintentar` | El aviso de error con Reintentar |
| `15-dolar-no-disponible` | La línea del dólar cuando la API no responde |
| `16-aviso-file` | La página abierta como archivo |
| `17-sin-javascript` | El catálogo con JavaScript desactivado (Firefox) |
| `18-chrome-y-firefox` | El mismo filtro aplicado en Chrome y en Firefox |

## Historial del proyecto

Un commit por semana. Para ver el sitio tal como se entregó en una semana
concreta, basta con situarse en su commit:

| Semana | Entrega | Qué se agregó |
|---|---|---|
| 1 | Creando una estructura básica en HTML | HTML5 semántico: encabezados, párrafos, listas, enlaces e imágenes. Sin CSS |
| 2 | Optimizando la página web con CSS | Hoja externa, modelo de cajas, variables, paleta y tipografía, selectores avanzados y formulario de contacto |
| 3 | Optimizando un sitio web con HTML, CSS y diseño responsivo | Maquetación con CSS Grid y Flexbox, barra lateral de filtros, tarjetas como `<article>` y verificación entre navegadores |
| 4 | Utilizando Bootstrap 5 para el diseño responsivo | El sitio pasa a Bootstrap 5.3.8: navbar colapsable, carrusel automático con pausa, sistema de cuadrículas y tarjetas |
| 5 | Manipulando el DOM con JavaScript para mejorar la interactividad | Catálogo desde JSON con Fetch API, filtros, resaltado de tarjetas, validación del formulario y referencia del dólar |

```bash
git log --oneline          # ver los cinco commits
git checkout <hash>        # situarse en la entrega de esa semana
git checkout main          # volver al estado actual
```

## Autor

Diego Carvajal — Desarrollo Frontend I (PFY2201), Duoc UC.
