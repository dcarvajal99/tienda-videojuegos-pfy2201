// Funciones del catálogo: categorías disponibles y filtro por búsqueda y categoría.
import { normalizarTexto } from './formato.js';

// Lista de categorías sin repetir, con «todas» al comienzo.
export function listarCategorias(productos) {
    return ['todas', ...new Set(productos.map((producto) => producto.categoria))];
}

// Aplica el texto buscado y la categoría elegida sobre el catálogo completo.
// La búsqueda revisa nombre, descripción y desarrollador, sin tildes ni mayúsculas.
export function filtrarProductos(productos, busqueda, categoria) {
    const palabras = normalizarTexto(busqueda).split(/\s+/).filter(Boolean);

    return productos.filter((producto) => {
        if (categoria !== 'todas' && producto.categoria !== categoria) return false;
        if (palabras.length === 0) return true;

        const contenido = normalizarTexto(producto.nombre + ' ' + producto.descripcion + ' ' + producto.desarrollador);
        return palabras.every((palabra) => contenido.includes(palabra));
    });
}

// Ruta de la portada: las imágenes del catálogo están en public/img; las de los juegos
// agregados pueden ser una dirección https; sin imagen se usa la portada genérica.
export const PORTADA_GENERICA = import.meta.env.BASE_URL + 'img/sin-portada.svg';

export function rutaImagen(imagen) {
    if (!imagen) return PORTADA_GENERICA;
    if (imagen.startsWith('https://')) return imagen;
    return import.meta.env.BASE_URL + imagen;
}

// Arma el objeto de un videojuego nuevo con los datos del formulario.
export function crearVideojuego({ nombre, categoria, precio, descripcion, desarrollador, imagen }) {
    return {
        id: 'propio-' + Date.now().toString(36),
        nombre: nombre.trim(),
        categoria,
        descripcion: descripcion.trim(),
        desarrollador: desarrollador.trim() || 'Sin información',
        precioNormal: Number(precio),
        precioOferta: null,
        imagen: imagen.trim(),
    };
}

// Comprueba que un videojuego tenga los campos y tipos que usa la página.
export function esVideojuegoValido(videojuego) {
    return videojuego !== null && typeof videojuego === 'object'
        && ['id', 'nombre', 'categoria', 'descripcion', 'desarrollador', 'imagen'].every((campo) => typeof videojuego[campo] === 'string')
        && Number.isInteger(videojuego.precioNormal) && videojuego.precioNormal > 0
        && (videojuego.precioOferta === null || Number.isInteger(videojuego.precioOferta));
}
