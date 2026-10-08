// Hook propio del carrito. Guarda solo qué productos se eligieron y cuántas
// unidades de cada uno; el nombre, la imagen y el precio se toman del catálogo.
// El carrito se guarda en localStorage (con useEstadoGuardado) para que sobreviva a una recarga.
import { useEstadoGuardado } from './useEstadoGuardado.js';

const CLAVE = 'pixelplay-react-carrito';
export const CANTIDAD_MAXIMA = 10; // Tope de unidades por producto.

export function useCarrito() {
    const [items, setItems] = useEstadoGuardado(CLAVE, [], limpiarGuardado);

    function cantidadDe(id) {
        const item = items.find((actual) => actual.id === id);
        return item ? item.cantidad : 0;
    }

    function agregar(id) {
        setItems((actuales) => {
            const enCarrito = actuales.find((item) => item.id === id);
            if (!enCarrito) return [...actuales, { id, cantidad: 1 }];
            if (enCarrito.cantidad >= CANTIDAD_MAXIMA) return actuales;
            return actuales.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item));
        });
    }

    function quitarUnidad(id) {
        setItems((actuales) => actuales.flatMap((item) => {
            if (item.id !== id) return item;
            return item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : [];
        }));
    }

    function eliminar(id) {
        setItems((actuales) => actuales.filter((item) => item.id !== id));
    }

    function vaciar() {
        setItems([]);
    }

    return { items, cantidadDe, agregar, quitarUnidad, eliminar, vaciar };
}

// Revisa el carrito guardado: descarta los ítems que no tengan la forma esperada.
function limpiarGuardado(guardado) {
    return Array.isArray(guardado) ? guardado.filter(esItemValido) : null;
}

function esItemValido(item) {
    return item !== null && typeof item === 'object' && typeof item.id === 'string'
        && Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= CANTIDAD_MAXIMA;
}
