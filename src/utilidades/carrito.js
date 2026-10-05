// Funciones del carrito: arman las líneas que se muestran y calculan los totales.
import { precioFinal } from './formato.js';

// Une lo guardado en el carrito ({ id, cantidad }) con los datos del catálogo.
// Si un producto ya no existe en el catálogo, su línea se descarta.
export function armarLineas(items, productos) {
    return items.flatMap((item) => {
        const producto = productos.find((actual) => actual.id === item.id);
        if (!producto) return [];
        return {
            id: item.id,
            cantidad: item.cantidad,
            nombre: producto.nombre,
            imagen: producto.imagen,
            precio: precioFinal(producto),
        };
    });
}

// Suma las unidades de todas las líneas del carrito.
export function contarUnidades(lineas) {
    return lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
}

// Suma precio × cantidad de cada línea.
export function calcularTotal(lineas) {
    return lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);
}
