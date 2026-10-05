// Ejecuta una acción y deja el control en pausa durante `duracion` milisegundos.
// Sirve para dos cosas: mostrar una respuesta visible (por ejemplo «✓ Agregado»)
// y evitar que un doble clic rápido repita la acción sin querer.
import { useState, useEffect, useRef } from 'react';

export function useAccionBreve(duracion) {
    const [enPausa, setEnPausa] = useState(false); // Para dibujar el estado en pantalla.
    const bloqueo = useRef(false);                  // Para decidir al instante, sin esperar un render.
    const temporizador = useRef(null);

    // Si el componente desaparece durante la pausa, el temporizador se cancela.
    useEffect(() => () => clearTimeout(temporizador.current), []);

    function ejecutar(accion) {
        if (bloqueo.current) return; // Clic repetido durante la pausa: se ignora.
        bloqueo.current = true;
        setEnPausa(true);
        accion();
        temporizador.current = setTimeout(() => {
            bloqueo.current = false;
            setEnPausa(false);
        }, duracion);
    }

    return [enPausa, ejecutar];
}
