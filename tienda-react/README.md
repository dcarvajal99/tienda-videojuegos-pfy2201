# PixelPlay Store en React

Versión del catálogo de PixelPlay Store construida con **React 19 + Vite** para
Desarrollo Frontend I (PFY2201). Nació en la Semana 7 y en la Semana 8 se mejoró
con hooks propios, carrito guardado, búsqueda con debounce, cambio de vista y
botones que responden a cada acción. El sitio en HTML, CSS y JavaScript de las semanas anteriores sigue en
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
│   ├── useCarrito.js         Carrito con agregar, quitar, eliminar y vaciar; se guarda en localStorage
│   ├── useDebounce.js        Aplica la búsqueda 300 ms después de la última tecla
│   └── useAccionBreve.js     Pausa breve tras una acción: confirmación visible y sin doble clic
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
| `Carrito` | `confirmando` | Pregunta «¿Vaciar el carrito?» antes de borrarlo todo |
| `useDebounce` | `diferido` | El texto de búsqueda que ya se aplicó |
| `useAccionBreve` | `enPausa` | Si un botón está mostrando su confirmación o esperando |

| Dónde | `useEffect` | Cuándo corre |
| --- | --- | --- |
| `useCatalogo` | Pide `productos.json` con `fetch` y lo cancela si la página se cierra | Al montar y al pulsar «Reintentar» |
| `useCarrito` | Guarda el carrito en `localStorage` | Cada vez que cambia el carrito |
| `App` | Escribe la cantidad del carrito en el título de la pestaña | Cada vez que cambian las unidades |
| `useDebounce` | Programa la búsqueda y cancela la anterior si llega otra tecla | Cada vez que cambia el texto |
| `Carrito` | Devuelve el foco cuando desaparece el botón que lo tenía | Después de cada render, si hay un destino anotado |

Renderizado condicional: indicador de carga, error con «Reintentar», búsqueda sin
resultados, carrito vacío, precio tachado y descuento solo en ofertas, «Agregar al
carrito» que pasa a «En el carrito (n) · Agregar otra» (y a «Máximo» en
diez unidades), detalles que se abren y se cierran, y vista de cuadrícula o de lista.

## Respuesta a cada acción

- **Debounce en la búsqueda**: el filtro corre 300 ms después de la última tecla; mientras tanto
  aparece «Buscando…» y los resultados anteriores se atenúan. Al borrar el campo, el catálogo
  completo vuelve al instante.
- **`useMemo`**: el filtro, las categorías y las líneas del carrito solo se recalculan cuando
  cambian sus datos; agregar al carrito o cambiar la vista no vuelve a filtrar el catálogo.
- **Confirmación y pausa**: al agregar, el botón muestra «✓ Agregado» durante 600 ms y no
  responde a un segundo clic. Los botones del carrito comparten una pausa de 400 ms, así un doble
  clic en «Eliminar» no borra también la línea que sube a ocupar su lugar.
- **Vaciar pide confirmación**: «Sí, vaciar» o «Cancelar», con el foco en la opción segura.
- **El foco no se pierde**: cuando una acción hace desaparecer el botón enfocado, el foco pasa al
  botón principal de la tarjeta o al título del carrito.

## Datos

`public/productos.json` tiene seis juegos con `precioNormal`, `precioOferta` (`null`
si no hay oferta) y `desarrollador`. El carrito guarda solo `{ id, cantidad }`: el
nombre, la imagen y el precio se toman del catálogo, así no se duplican datos ni
quedan precios antiguos guardados.

## Capturas

`capturas/semana-7/` y `capturas/semana-8/` tienen las evidencias de cada entrega.
