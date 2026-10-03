// Hook propio del carrito. Guarda solo qué productos se eligieron y cuántas
// unidades de cada uno; el nombre, la imagen y el precio se toman del catálogo.
// El carrito se guarda en localStorage para que sobreviva a una recarga.
import { useState, useEffect } from 'react';

const CLAVE = 'pixelplay-react-carrito';
export const CANTIDAD_MAXIMA = 10; // Tope de unidades por producto.

export function useCarrito() {
    // Inicialización perezosa: localStorage se lee una sola vez, en el primer render.
    const [items, setItems] = useState(leerGuardado);

    // Efecto secundario: cada vez que cambia el carrito, se guarda.
    useEffect(() => {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(items));
        } catch {
            // Navegación privada o almacenamiento lleno: el carrito sigue funcionando sin guardarse.
        }
    }, [items]);

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

// Lee el carrito guardado y descarta cualquier dato que no tenga la forma esperada.
function leerGuardado() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE));
        return Array.isArray(guardado) ? guardado.filter(esItemValido) : [];
    } catch {
        return [];
    }
}

function esItemValido(item) {
    return item !== null && typeof item === 'object' && typeof item.id === 'string'
        && Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= CANTIDAD_MAXIMA;
}
