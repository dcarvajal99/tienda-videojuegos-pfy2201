// Hook propio que carga el catálogo desde public/productos.json.
// Devuelve los productos y el estado de la carga para que App decida qué mostrar.
import { useState, useEffect } from 'react';

const URL_CATALOGO = import.meta.env.BASE_URL + 'productos.json';

export function useCatalogo() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    // Cada vez que cambia este número, el efecto vuelve a pedir el catálogo.
    const [intento, setIntento] = useState(0);

    // Efecto secundario: la petición al archivo JSON. Se ejecuta al montar la
    // página y de nuevo cuando se pulsa «Reintentar».
    useEffect(() => {
        const controlador = new AbortController();

        fetch(URL_CATALOGO, { signal: controlador.signal })
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error('El servidor respondió ' + respuesta.status + '.');
                return respuesta.json();
            })
            .then((datos) => {
                setProductos(datos.productos);
                setCargando(false);
            })
            .catch((fallo) => {
                if (fallo.name === 'AbortError') return; // La página se cerró antes de la respuesta.
                setError('No pudimos cargar el catálogo. ' + fallo.message);
                setCargando(false);
            });

        // Limpieza: si el componente se desmonta, la petición se cancela.
        return () => controlador.abort();
    }, [intento]);

    function reintentar() {
        setCargando(true);
        setError('');
        setIntento((anterior) => anterior + 1);
    }

    return { productos, cargando, error, reintentar };
}
