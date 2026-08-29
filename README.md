# PixelPlay Store — Semana 3

Actividad **sumativa** «Optimizando un sitio web con HTML, CSS y diseño responsivo»
de la asignatura **Desarrollo Frontend I (PFY2201)**, Duoc UC. Exp 1 — Semana 3.

Sitio de una tienda chilena de videojuegos para PlayStation 5, estructurado con
HTML5 semántico y maquetado con **CSS Grid** y **Flexbox**.

El proyecto avanza semana a semana: cada commit de este repositorio corresponde
a la entrega de una semana del ramo.

**Sitio publicado:** https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/

---

## Estructura del proyecto

```
tienda-videojuegos-pfy2201/
├── index.html                                  Página principal
├── css/
│   └── Diego_Carvajal_PFY2201_CSS_Semana3.css  Hoja de estilos externa
├── img/                                        Logotipo y 6 portadas
├── capturas/                                   Evidencias en 3 dispositivos
│   ├── 01-escritorio-1440px.png                y comparativa entre navegadores
│   ├── 02-tablet-820px.png
│   ├── 03-movil-390px.png
│   └── 04-navegadores-firefox-vs-chrome-*.png
└── README.md
```

## Reparto entre Grid y Flexbox

El enunciado pide Flexbox para las barras horizontales y Grid para las secciones
principales. Cada sistema se usa donde le corresponde:

| | Dónde | Por qué |
|---|---|---|
| **CSS Grid** | Estructura de la página (`body`) | Es bidimensional: coloca cabecera, filtros, contenido y pie en filas y columnas a la vez, con `grid-template-areas` |
| | Cuadrícula de productos | Las tarjetas ocupan filas y columnas: 1 → 2 → 3 según el ancho |
| | Formulario en escritorio | Dos columnas de campos, con los anchos declarados una sola vez |
| **Flexbox** | Menú de navegación | Una sola fila que se envuelve sola cuando no cabe |
| | Pie de página | Tres bloques que se reparten el ancho y se apilan con `flex-wrap`, sin media query |
| | Barra lateral de categorías | Mismo HTML: etiquetas en fila envolvente en móvil, columna en escritorio |
| | Interior de cada tarjeta | Columna con `flex-grow` en la descripción, para que precio y botón queden siempre al pie |
| | Fila de botones del formulario | Columna en móvil, fila alineada a la derecha desde 600 px |

## Puntos de quiebre

| Ancho | Estructura de página | Productos | Categorías |
|---|---|---|---|
| < 600 px | 1 columna | 1 por fila | Etiquetas en fila envolvente |
| 600 – 899 px | 1 columna | 2 por fila | Etiquetas en fila envolvente |
| ≥ 900 px | 2 columnas (filtros + contenido) | 3 por fila | Columna vertical |

Enfoque **mobile first**: los estilos base son los del teléfono y todas las media
queries usan `min-width`, de modo que solo agregan ajustes al crecer la pantalla.

## Criterio de diseño

Sobriedad: la interfaz no compite con las portadas de los juegos.

- **Una sola familia tipográfica** (`Inter`, pesos 400/500/600) con familias de respaldo.
- **Cinco tonos neutros y un solo acento**: `#ffffff`, `#f7f7f8`, `#e4e4e7`, `#52525b`,
  `#18181b` y el índigo `#2d1b69` del logotipo, reservado a enlaces, foco y campos
  obligatorios.
- **Sin efectos decorativos**: ni degradados, ni sombras, ni brillos. La estructura se
  define con espacio en blanco y líneas de un píxel.

## Verificación

| Comprobación | Resultado |
|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/) | 0 errores, 0 advertencias |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) (CSS 3) | Válido, 0 errores |
| Anchos probados sin desborde horizontal | 320 a 1680 px (19 anchos) |
| Chrome 151 (Blink) vs Firefox 146 (Gecko) | Sin diferencias de maquetación en 390, 820 y 1440 px |
| Contraste WCAG 2.1 nivel AA | Cumple en todas las combinaciones de texto y fondo |

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

```bash
git log --oneline          # ver los tres commits
git checkout <hash>        # situarse en la entrega de esa semana
git checkout main          # volver al estado actual
```

## Autor

Diego Carvajal — Desarrollo Frontend I (PFY2201), Duoc UC.
