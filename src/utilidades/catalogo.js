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
