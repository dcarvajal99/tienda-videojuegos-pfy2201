// Debounce: devuelve el valor recibido, pero solo cuando deja de cambiar durante
// `espera` milisegundos. Así el filtro del catálogo no corre con cada tecla, sino
// cuando la persona hace una pausa al escribir.
import { useState, useEffect } from 'react';

export function useDebounce(valor, espera) {
    const [diferido, setDiferido] = useState(valor);

    useEffect(() => {
        const temporizador = setTimeout(() => setDiferido(valor), espera);
        // Si el valor cambia antes de cumplirse la espera, el temporizador anterior se
        // cancela y la cuenta empieza de nuevo.
        return () => clearTimeout(temporizador);
    }, [valor, espera]);

    return diferido;
}
