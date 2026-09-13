# PixelPlay Store — Semana 4

Actividad formativa «Utilizando Bootstrap 5 para el diseño responsivo» de la
asignatura **Desarrollo Frontend I (PFY2201)**, Duoc UC. Exp 2 — Semana 4.

Sitio de una tienda chilena de videojuegos para PlayStation 5, rehecho sobre
**Bootstrap 5.3.8**: barra de navegación que se colapsa en móvil, carrusel de
destacados con avance automático, sistema de cuadrículas y tarjetas de producto.

El proyecto avanza semana a semana: cada commit de este repositorio corresponde
a la entrega de una semana del ramo.

**Sitio publicado:** https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/

---

## Estructura del proyecto

```
tienda-videojuegos-pfy2201/
├── index.html                                  Página principal
├── css/
│   └── Diego_Carvajal_PFY2201_CSS_Semana4.css  Ajustes sobre Bootstrap
├── img/                                        2 logotipos (en uso, el monocromo) y 6 portadas
├── capturas/                                   Escritorio, tablet, móvil,
│   ├── 01-escritorio-1440px.png                menú desplegado y las tres
│   ├── 02-tablet-820px.png                     diapositivas del carrusel
│   ├── 03-movil-390px.png
│   ├── 04-movil-menu-desplegado.png
│   └── 05-carrusel-diapositiva-*.png
└── README.md
```

## Cómo se carga Bootstrap

Desde la CDN de jsDelivr, fijado a la versión **5.3.8**. Los dos archivos llevan
atributo `integrity` (SRI): si el archivo servido se alterara, el navegador lo
rechazaría. La hoja de Bootstrap va en el `<head>`; el JavaScript, al final del
`<body>`, para no retrasar el dibujo de la página.

## Componentes de Bootstrap

| Componente | Dónde | Cómo se configuró |
|---|---|---|
| **Navbar** | Cabecera | `navbar-expand-lg`: menú completo desde 992 px; por debajo, colapsado tras el botón hamburguesa (`navbar-toggler` + `collapse`) |
| **Carousel** | Destacados de la semana | `data-bs-interval="3000"` en cada diapositiva y arranque automático con `data-bs-ride="carousel"`; indicadores y flechas. Un script lo recrea con `ride: false` para detenerlo (botón de pausa y foco del teclado) y con `ride: 'carousel'` para reanudarlo, y le da el alto de la diapositiva más alta, para que la página no salte |
| **Grid** | Catálogo | Barra lateral `col-lg-3` y productos `col-lg-9`; cada tarjeta `col-12 col-md-6 col-xl-4` |
| | Formulario y pie | Campos `col-md-6`; bloques del pie `col-sm-6 col-lg-4` |
| **Cards** | Productos | `card h-100` con `card-img-top`, `card-body` y `card-footer` para precio y botón |
| Otros | Toda la página | `list-group`, `badge`, `form-control`, `form-select`, `form-check` y utilidades de flex y espaciado |

## Puntos de quiebre

Medidos en el navegador, no solo declarados en el código:

| Ancho | Menú | Carrusel | Categorías | Tarjetas por fila |
|---|---|---|---|---|
| < 768 px | Hamburguesa | Portada sobre el texto | Etiquetas en fila | 1 |
| 768 – 991 px | Hamburguesa | Portada junto al texto | Etiquetas en fila | 2 |
| 992 – 1199 px | Completo | Portada junto al texto | Columna | 2 |
| ≥ 1200 px | Completo | Portada junto al texto | Columna | 3 |

## La hoja propia

No reemplaza a Bootstrap ni reconstruye nada que Bootstrap ya resuelva. La mayor
parte consiste en redefinir las variables CSS que Bootstrap 5.3 expone, para
mantener la línea sobria del sitio:

- **Una sola tipografía**: `Inter`, con familias de respaldo.
- **Neutros y un solo acento**: texto `#18181b` y `#52525b`, líneas `#e4e4e7`, pie
  `#f7f7f8` y el índigo `#2d1b69` del logotipo para enlaces, foco del menú y de los
  formularios, y casillas marcadas. Los botones y las etiquetas conservan los grises
  de Bootstrap (`#212529`, `#6c757d` y `#f8f9fa`), y las tarjetas, su borde
  translúcido.
- **Esquinas casi rectas** (2 px) y ningún degradado ni sombra decorativa.

Los colores que Bootstrap también lee en formato `-rgb` se declaran en las dos
variantes, porque según el componente usa una u otra. Donde Bootstrap usa valores fijos sin variable, la hoja
agrega reglas propias: el foco del teclado en el menú, en las flechas del carrusel y
en los formularios, las casillas marcadas y el ancho de las flechas. Además marca la
sección activa del menú y oscurece flechas e indicadores del carrusel.

## Accesibilidad

- Enlace «Saltar al contenido principal», visible al recibir el foco del teclado.
- **Foco visible**: con el color del sitio en los enlaces del menú —también en el
  activo, donde la marca de sección tapaba el foco— y con un contorno oscuro
  alrededor del ícono en las flechas del carrusel, a las que Bootstrap les quita el
  contorno.
- Botón **Pausar / Reanudar** del carrusel: el avance automático de Bootstrap solo
  se detiene con el mouse encima, y quien usa teclado o lector de pantalla también
  necesita poder detenerlo (WCAG 2.2.2). Además deja de rotar mientras el foco del
  teclado está dentro, para que el enlace enfocado no desaparezca. Si el sistema
  pide reducir el movimiento, arranca en pausa.
- Flechas del carrusel con texto oculto para lectores de pantalla; botón hamburguesa
  con `aria-controls` y `aria-expanded`; cada «Consultar» nombra su juego.
- Los enlaces externos avisan que se abren en una pestaña nueva, y el aviso de campos
  obligatorios nombra el asterisco para que se entienda al leerlo en voz alta.

## Verificación

| Comprobación | Resultado |
|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/) | 0 errores, 0 advertencias |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) (CSS 3) | Válido, 0 errores, 0 advertencias |
| Intervalo del carrusel, medido | Un cambio cada 3000 ms |
| Pausa del carrusel | Se mantiene tras usar las flechas y pasar el mouse; al reanudar vuelve a avanzar |
| Pausa a mitad de un cambio de diapositiva | Una sola diapositiva activa y ningún error en la consola |
| Foco del teclado dentro del carrusel | La rotación se detiene y el enlace enfocado no se pierde; al salir, vuelve a avanzar |
| Foco en el menú, en escritorio | Visible en los cuatro enlaces con el color del sitio, también en «Inicio» |
| Alto del carrusel | Igual con las tres diapositivas en 20 anchos entre 320 y 1680 px: la página no salta al cambiar |
| Menú en móvil | Colapsado bajo 992 px; al tocar el botón se despliega y `aria-expanded` pasa a `true` |
| Desborde horizontal | Ninguno en los mismos 20 anchos |
| Contraste WCAG 2.1 nivel AA | Cumple en todas las combinaciones; la más baja, 4,69:1 |

## Cómo verlo localmente

```bash
git clone https://github.com/dcarvajal99/tienda-videojuegos-pfy2201.git
cd tienda-videojuegos-pfy2201
open index.html
```

## Historial del proyecto

Un commit por semana. Para ver el sitio tal como se entregó en una semana
concreta, basta con situarse en su commit:

| Semana | Entrega | Qué se agregó |
|---|---|---|
| 1 | Creando una estructura básica en HTML | HTML5 semántico: encabezados, párrafos, listas, enlaces e imágenes. Sin CSS |
| 2 | Optimizando la página web con CSS | Hoja externa, modelo de cajas, variables, paleta y tipografía, selectores avanzados y formulario de contacto |
| 3 | Optimizando un sitio web con HTML, CSS y diseño responsivo | Maquetación con CSS Grid y Flexbox, barra lateral de filtros, tarjetas como `<article>` y verificación entre navegadores |
| 4 | Utilizando Bootstrap 5 para el diseño responsivo | El sitio pasa a Bootstrap 5.3.8: navbar colapsable, carrusel automático con pausa, sistema de cuadrículas y tarjetas |

```bash
git log --oneline          # ver los cuatro commits
git checkout <hash>        # situarse en la entrega de esa semana
git checkout main          # volver al estado actual
```

## Autor

Diego Carvajal — Desarrollo Frontend I (PFY2201), Duoc UC.
