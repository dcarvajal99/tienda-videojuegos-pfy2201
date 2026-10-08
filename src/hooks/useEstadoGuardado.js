// useState que además se guarda en localStorage y se recupera al volver a abrir la
// página. `limpiar` revisa lo guardado y devuelve el valor a usar, o null si no sirve
// (por ejemplo, si alguien editó el almacenamiento a mano). Lo usan el carrito y los
// cambios del catálogo.
import { useState, useEffect } from 'react';

export function useEstadoGuardado(clave, inicial, limpiar) {
    // Inicialización perezosa: localStorage se lee una sola vez, en el primer render.
    const [valor, setValor] = useState(() => leer(clave, inicial, limpiar));

    // Efecto secundario: cada vez que cambia el valor, se guarda.
    useEffect(() => {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
        } catch {
            // Navegación privada o almacenamiento lleno: la página sigue funcionando sin guardar.
        }
    }, [clave, valor]);

    return [valor, setValor];
}

function leer(clave, inicial, limpiar) {
    try {
        const texto = localStorage.getItem(clave);
        if (texto === null) return inicial;
        const limpio = limpiar(JSON.parse(texto));
        return limpio === null ? inicial : limpio;
    } catch {
        return inicial;
    }
}
