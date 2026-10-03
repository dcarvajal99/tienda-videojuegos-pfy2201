# PixelPlay Store en React

Versión del catálogo de PixelPlay Store construida con **React 19 + Vite** para
Desarrollo Frontend I (PFY2201). Nació en la Semana 7 y en la Semana 8 se mejoró
con hooks propios, carrito guardado, cambio de vista y botones que cambian según
el estado. El sitio en HTML, CSS y JavaScript de las semanas anteriores sigue en
la raíz del repositorio; esta aplicación se publica en la subcarpeta `/react/`.

- Aplicación publicada: https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/react/
- Código: https://github.com/dcarvajal99/tienda-videojuegos-pfy2201/tree/main/tienda-react

## Cómo ejecutarla

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173/tienda-videojuegos-pfy2201/react/
npm run build    # deja la versión publicable en dist/
npm run deploy   # construye y publica dist/ en la carpeta react/ de la rama gh-pages
```

`npm run deploy` usa el paquete `gh-pages` con `-e react`: reemplaza solo la carpeta
`react/` de la rama de publicación, sin tocar el sitio que está en la raíz.

## Estructura

```
src/
├── main.jsx                  Punto de entrada: monta <App /> en index.html
├── App.jsx                   Une los hooks, guarda el estado de la interfaz y reparte props
├── estilos.css               Ajustes propios sobre Bootstrap
├── hooks/
│   ├── useCatalogo.js        Carga productos.json (useState + useEffect) y permite reintentar
│   └── useCarrito.js         Carrito con agregar, quitar, eliminar y vaciar; se guarda en localStorage
├── utilidades/
│   ├── formato.js            Pesos chilenos, precio final, descuento, resumen y texto sin tildes
│   ├── catalogo.js           Categorías y filtro por búsqueda y categoría
│   └── carrito.js            Líneas del carrito, unidades y total
└── componentes/
    ├── BarraTienda.jsx       Cabecera con el contador del carrito
    ├── Filtros.jsx           Buscador y selector de categoría (onChange)
    ├── SelectorVista.jsx     Botones Cuadrícula / Lista (aria-pressed)
    ├── ListaProductos.jsx    Recorre el catálogo con map()
    ├── TarjetaProducto.jsx   Tarjeta con detalles, precios y el botón que pasa a «En el carrito»
    ├── Carrito.jsx           Panel con carga, carrito vacío o la lista con el total
    ├── FilaCarrito.jsx       Una línea del carrito con «Quitar una» y «Eliminar»
    └── Aviso.jsx             Mensaje reutilizable de carga, error (con Reintentar) o sin resultados
```

## Estado, efectos y renderizado condicional

| Dónde | `useState` | Para qué |
| --- | --- | --- |
| `useCatalogo` | `productos`, `cargando`, `error`, `intento` | El catálogo y el estado de su carga |
| `useCarrito` | `items` | Qué productos se eligieron y cuántas unidades |
| `App` | `busqueda`, `categoria`, `vista`, `mensaje` | Filtros, vista elegida y último aviso del carrito |
| `TarjetaProducto` | `detallesAbiertos` | Botón «Ver detalles» / «Ocultar detalles», propio de cada tarjeta |

| Dónde | `useEffect` | Cuándo corre |
| --- | --- | --- |
| `useCatalogo` | Pide `productos.json` con `fetch` y lo cancela si la página se cierra | Al montar y al pulsar «Reintentar» |
| `useCarrito` | Guarda el carrito en `localStorage` | Cada vez que cambia el carrito |
| `App` | Escribe la cantidad del carrito en el título de la pestaña | Cada vez que cambian las unidades |

Renderizado condicional: indicador de carga, error con «Reintentar», búsqueda sin
resultados, carrito vacío, precio tachado y descuento solo en ofertas, «Agregar al
carrito» que pasa a «En el carrito (n) · Agregar otra» (y a «Máximo» en
diez unidades), detalles que se abren y se cierran, y vista de cuadrícula o de lista.

## Datos

`public/productos.json` tiene seis juegos con `precioNormal`, `precioOferta` (`null`
si no hay oferta) y `desarrollador`. El carrito guarda solo `{ id, cantidad }`: el
nombre, la imagen y el precio se toman del catálogo, así no se duplican datos ni
quedan precios antiguos guardados.

## Capturas

`capturas/semana-7/` y `capturas/semana-8/` tienen las evidencias de cada entrega.
