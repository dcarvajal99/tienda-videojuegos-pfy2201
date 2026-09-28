# PixelPlay Store en React

Versión del catálogo de PixelPlay Store construida con **React 19 + Vite**, para la
Semana 7 de Desarrollo Frontend I (PFY2201). El sitio en HTML, CSS y JavaScript de
las semanas anteriores sigue publicado en la raíz del repositorio; esta aplicación
se publica en la subcarpeta `/react/`.

## Cómo ejecutarla

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173/tienda-videojuegos-pfy2201/react/
npm run build    # deja la versión publicable en dist/
npm run preview  # revisa dist/ tal como quedará en GitHub Pages
```

## Componentes

| Archivo | Rol |
| --- | --- |
| `src/App.jsx` | Componente raíz. Guarda el estado (productos, carrito, búsqueda, categoría) y reparte datos y funciones por props. |
| `src/componentes/BarraTienda.jsx` | Cabecera con el logo y la insignia que muestra cuántos productos hay en el carrito. |
| `src/componentes/Filtros.jsx` | Campo de búsqueda y selector de categoría; ambos usan `onChange`. |
| `src/componentes/ListaProductos.jsx` | Recorre el catálogo con `map()` y arma la cuadrícula de tarjetas. |
| `src/componentes/TarjetaProducto.jsx` | Tarjeta con imagen, nombre, resumen, precio normal, precio de oferta y botón `onClick`. |
| `src/componentes/Carrito.jsx` | Panel con las líneas del carrito, el contador de productos y el total. |
| `src/componentes/FilaCarrito.jsx` | Una línea del carrito, con los botones «Quitar una» y «Eliminar». |
| `src/componentes/Aviso.jsx` | Mensaje reutilizable para los estados de carga, error y búsqueda sin resultados. |
| `src/utilidades/formato.js` | Funciones sueltas: formato en pesos, precio final, porcentaje de descuento, resumen de texto y normalización para buscar. |

## Conceptos de React aplicados

- **Componentes funcionales y JSX**: ocho componentes, cada uno en su archivo.
- **Props**: `App` entrega datos (`productos`, `items`, `total`) y funciones (`onAgregar`, `onQuitar`, `onEliminar`, `onVaciar`) a sus hijos.
- **`useState`**: productos, carga, error, búsqueda, categoría, carrito y mensaje.
- **`useEffect`**: uno carga `productos.json` al montar la página (con `AbortController` para cancelar la petición) y otro refleja el total del carrito en el título de la pestaña.
- **Renderizado condicional**: spinner de carga, mensaje de error, catálogo sin resultados, carrito vacío y bloque de precios distinto según haya oferta o no.
- **Eventos**: `onClick` en los botones de compra y del carrito; `onChange` en el buscador y en el selector de categorías.

## Datos

`public/productos.json` tiene los seis juegos del catálogo con `precioNormal` y
`precioOferta` (este último es `null` cuando el juego no está en oferta). El carrito
cobra siempre el precio de oferta si existe.
