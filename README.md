# PixelPlay Store — Semana 2

Actividad **«Optimizando la página web con CSS»** de la asignatura
**Desarrollo Frontend I (PFY2201)**, Duoc UC. Exp 1 — Semana 2.

Página principal de una tienda chilena de videojuegos para PlayStation 5.
El proyecto avanza semana a semana: cada commit de este repositorio corresponde
a la entrega de una semana del ramo.

**Sitio publicado:** https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/

---

## Estructura del proyecto

```
tienda-videojuegos-pfy2201/
├── index.html                                  Página principal
├── css/
│   └── Diego_Carvajal_PFY2201_CSS_Semana2.css  Hoja de estilos externa
├── img/
│   ├── logo-pixelplay-mono.svg                 Logotipo monocromo (en uso)
│   ├── logo-pixelplay.svg                      Logotipo original a color
│   └── juego-*.jpg                             6 portadas de videojuegos
└── README.md
```

## De dónde viene y qué se agregó

### Semana 1 — Creando una estructura básica en HTML

Estructura de la página con HTML5 semántico, sin CSS ni JavaScript.

- Etiquetas semánticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Jerarquía de encabezados: un `<h1>` único, `<h2>` por sección y `<h3>` por producto
- Listas `<ul>` y `<ol>`, enlaces internos, externos y `mailto:`
- Imágenes con `alt`, `width` y `height`

### Semana 2 — Optimizando la página web con CSS

Optimización visual mediante una hoja de estilos **externa**, más un formulario
de contacto que aplica los contenidos de formularios de la semana.

- **Hoja externa** enlazada con `<link>` dentro del `<head>`
- **Modelo de cajas**: `box-sizing: border-box`, `padding`, `margin` y `border`
- **Variables CSS** en `:root` para colores, tipografía y escala de espaciado
- **Selectores**: etiqueta, clase, ID, descendente, hijo (`>`), adyacente (`+`),
  hermanos generales (`~`), de atributo (`[type=…]`, `[href^=…]`), pseudo-clases
  (`:hover`, `:focus`, `:active`, `:required`, `:nth-child()`, `:first-child`,
  `:last-of-type`) y pseudo-elementos (`::before`, `::after`, `::placeholder`,
  `::selection`)
- **Diseño responsivo** mobile first: la grilla de productos pasa de 1 a 2 y a 3
  columnas en los puntos de quiebre de 600 px y 900 px

### Criterio de diseño

Sobriedad: la interfaz no compite con las portadas de los juegos.

- **Una sola familia tipográfica** (`Inter`, pesos 400/500/600) con familias de
  respaldo. La jerarquía se construye con tamaño y peso, no sumando tipografías.
- **Cinco tonos neutros y un solo acento**: blanco `#ffffff`, gris de fondo
  `#f7f7f8`, línea `#e4e4e7`, texto secundario `#52525b`, texto `#18181b` y el
  índigo `#2d1b69` del logotipo, reservado para enlaces, foco y campos obligatorios.
- **Sin efectos decorativos**: ni degradados, ni sombras, ni brillos. La estructura
  se define con espacio en blanco y líneas de un píxel.
- `img/logo-pixelplay-mono.svg` es la versión monocroma del logotipo, usada en la
  cabecera; el original a color se conserva en `img/logo-pixelplay.svg`.

## Validación

| Herramienta | Resultado |
|---|---|
| [W3C Nu HTML Checker](https://validator.w3.org/nu/) | 0 errores, 0 advertencias |
| [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) (CSS 3) | Válido, 0 errores |
| Contraste WCAG 2.1 nivel AA | Cumple en todas las combinaciones de texto y fondo |
| Anchos probados sin desborde horizontal | 320, 360, 390, 480, 600, 768, 820 y 1440 px |

## Cómo verlo localmente

```bash
git clone https://github.com/dcarvajal99/tienda-videojuegos-pfy2201.git
cd tienda-videojuegos-pfy2201
open index.html
```

En Visual Studio Code también puede abrirse con la extensión **Live Server**.

## Tecnologías

HTML5 · CSS3 (variables, Flexbox, Grid y media queries) · Google Fonts (Inter)

## Autor

Diego Carvajal — Desarrollo Frontend I (PFY2201), Duoc UC.
