# PixelPlay Store — Semana 6

> **Para revisar:** descomprime el ZIP y abre `index.html`. Con conexión a internet la tienda funciona
> completa también con doble clic (el catálogo se lee desde la copia publicada). Versión publicada:
> https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/ · Repositorio:
> https://github.com/dcarvajal99/tienda-videojuegos-pfy2201

Actividad sumativa «Optimizando la lógica y rendimiento de una página web con JavaScript» de la
asignatura **Desarrollo Frontend I (PFY2201)**, Duoc UC. Exp 2 — Semana 6.

Tienda chilena de videojuegos para PlayStation 5 hecha con **Bootstrap 5.3.8** y **JavaScript**:
la lista de productos se carga desde un JSON con la Fetch API, se puede buscar y filtrar por
categoría, y los productos se agregan a un carrito con resumen, cantidades y total.

El proyecto avanza semana a semana: cada commit de este repositorio corresponde a la entrega de una
semana del ramo.

---

## Estructura del proyecto

```
tienda-videojuegos-pfy2201/
├── index.html
├── assets/
│   ├── css/Diego_Carvajal_PFY2201_CSS_Semana6.css        Ajustes sobre Bootstrap
│   ├── js/Diego_Carvajal_PFY2201_Optimizacion_Semana6.js JavaScript de la página
│   ├── js/productos.json                                 Categorías y productos (lo lee fetch)
│   └── img/                                              Logotipos y 6 portadas de 800×800
├── capturas/                                             17 capturas de la entrega
└── README.md
```

`productos.json` vive en `assets/js/` junto al script que lo lee, para respetar exactamente la
estructura `index.html` + `assets/{js,css,img}` que pide la entrega.

## Qué hace la página

| Pide la actividad | Cómo se resolvió |
|---|---|
| Lista de productos con imagen, nombre y precio | Tarjetas `card` creadas por JavaScript desde `productos.json` |
| Barra de navegación con al menos dos categorías | Menú desplegable «Categorías» con las 5 categorías; cada una filtra el catálogo. Menú colapsable en móvil y barra fija con el contador del carrito |
| Pie con contacto y redes | Dirección, horario, teléfono, correo e Instagram, YouTube y Twitch |
| `click` para agregar al carrito | «Agregar al carrito» en cada tarjeta y en el modal de detalle |
| Resumen en un área designada | Panel «Resumen del carrito» junto al catálogo: filas con −, + y Quitar, cantidad de productos, total, Vaciar y Finalizar compra (pedido simulado). Se guarda en `localStorage` |
| `submit` para procesar una búsqueda | Formulario «Buscar en el catálogo»: busca por nombre, categoría o estudio, sin importar tildes ni mayúsculas, y sin recargar la página |
| Fetch de un JSON local | `obtenerJSON()` es la única función con `fetch`: revisa la respuesta, tiene un tiempo máximo de 8 s y clasifica los errores |
| Mensaje amigable si no carga | Aviso con el motivo (sin conexión, tiempo agotado, archivo no encontrado o datos inválidos) y botón Reintentar. Abierta con doble clic (`file://`), la página lee el catálogo desde la copia publicada y lo explica en una nota |
| Funciones claras y comentadas | 89 funciones, cada una con un comentario; el archivo empieza con un mapa de sus 13 secciones |

También se conservan el carrusel de destacados (Semana 4), la referencia del dólar desde
mindicador.cl, el resaltado de tarjetas y el formulario de contacto validado (Semana 5), y un modal
de Bootstrap con el detalle de cada producto.

## Optimizaciones medidas

| Qué | Resultado |
|---|---|
| Portadas redimensionadas a 800×800 (JPEG q80 progresivo) | 1.407,7 KB → 641,2 KB (−54 %) |
| Catálogo insertado de una vez (`DocumentFragment`) | 1 inserción en la página en lugar de 6 |
| Filtrar y buscar sin recrear tarjetas (atributo `hidden`) | 0 nodos creados o eliminados |
| Carrito actualizado por fila | Un cambio de cantidad no crea nodos y solo toca su fila |
| Una sola petición del catálogo | 1 petición aunque se busque, filtre y compre varias veces |
| Eventos por delegación | 25 escuchas, con 6 o con 60 productos |
| Un solo modal reutilizado | 1 modal para todos los productos |
| Texto de búsqueda preparado al cargar | 1 normalización por búsqueda |

El archivo usa hoisting para ordenar el código: `iniciarPagina()` se llama arriba, antes de las
funciones que usa. Ordena el archivo; no cambia el rendimiento.

## Verificación

- W3C Nu HTML Checker: 0 errores y 0 advertencias en `index.html` y en 13 estados del DOM que genera el
  script (carrito, modal abierto y cerrado, búsqueda sin resultados, error, etc.).
- W3C CSS Validator: hoja válida, 0 errores y 0 advertencias.
- Batería automática de pruebas en Chrome y Firefox (y en Brave en una pasada anterior): carga, barra, búsqueda, carrito, modal,
  errores (404, JSON roto, tiempo agotado), desborde horizontal entre 320 y 1680 px y carrusel.
- Abierta como archivo (`file://`) en Chrome, Brave y Firefox: 6 productos, imágenes locales y sin
  errores en la consola.
- Sin JavaScript: se ve el menú completo, y un aviso lleva al formulario de contacto.

## Cómo verlo localmente

Descomprime el ZIP y abre `index.html` (con internet), o sirve la carpeta:

```bash
python3 -m http.server 8000
```

y abre `http://localhost:8000`.

## Historial del proyecto

| Semana | Entrega | Qué se agregó |
|---|---|---|
| 1 | Estructura básica en HTML | HTML5 semántico |
| 2 | Optimizando la página web con CSS | Hoja externa, modelo de cajas, paleta, tipografía y formulario |
| 3 | Sitio responsivo con HTML y CSS | CSS Grid y Flexbox, barra lateral y tarjetas |
| 4 | Bootstrap 5 para el diseño responsivo | Navbar colapsable, carrusel, cuadrícula y tarjetas de Bootstrap |
| 5 | Manipulando el DOM con JavaScript | Catálogo desde JSON con Fetch, filtros, validación del formulario y dólar |
| 6 | Optimizando la lógica y rendimiento con JavaScript | Carrito, búsqueda, categorías en la barra, modal, estructura `assets/` y optimizaciones medidas |

```bash
git log --oneline          # ver los seis commits
git checkout <hash>        # situarse en la entrega de esa semana
git checkout main          # volver al estado actual
```

## Autor

Diego Carvajal — Desarrollo Frontend I (PFY2201), Duoc UC.
