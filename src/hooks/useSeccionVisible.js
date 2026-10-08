// Indica qué sección de la página está a la vista, para marcarla en la barra de
// navegación. Usa IntersectionObserver, una API del navegador que avisa cuando un
// elemento entra o sale de una zona de la pantalla.
import { useState, useEffect } from 'react';

export function useSeccionVisible(ids) {
    const [visible, setVisible] = useState(ids[0]);
    const clave = ids.join(','); // El efecto se repite solo si cambia la lista de secciones.

    useEffect(() => {
        const secciones = clave.split(',').map((id) => document.getElementById(id)).filter(Boolean);
        // La «zona» es una franja en el tercio superior de la pantalla, bajo la barra fija.
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) setVisible(entrada.target.id);
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        secciones.forEach((seccion) => observador.observe(seccion));
        // Limpieza: deja de observar al desmontar o si cambian las secciones.
        return () => observador.disconnect();
    }, [clave]);

    return visible;
}
