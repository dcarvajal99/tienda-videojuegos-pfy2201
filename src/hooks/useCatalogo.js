// Hook propio del catálogo. Carga public/productos.json y le aplica los cambios que
// hizo la persona: juegos agregados y juegos quitados. Esos cambios se guardan en
// localStorage; el archivo original no se modifica y siempre se puede restablecer.
import { useState, useEffect, useMemo } from 'react';
import { useEstadoGuardado } from './useEstadoGuardado.js';
import { esVideojuegoValido } from '../utilidades/catalogo.js';

const URL_CATALOGO = import.meta.env.BASE_URL + 'productos.json';
const CLAVE_CAMBIOS = 'pixelplay-react-catalogo';
const SIN_CAMBIOS = { agregados: [], eliminados: [] };

export function useCatalogo() {
    const [base, setBase] = useState([]);           // Juegos del archivo
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    // Cada vez que cambia este número, el efecto vuelve a pedir el catálogo.
    const [intento, setIntento] = useState(0);
    const [cambios, setCambios] = useEstadoGuardado(CLAVE_CAMBIOS, SIN_CAMBIOS, limpiarCambios);

    // Efecto secundario: la petición al archivo JSON. Se ejecuta al montar la página
    // y de nuevo cuando se pulsa «Reintentar».
    useEffect(() => {
        const controlador = new AbortController();

        fetch(URL_CATALOGO, { signal: controlador.signal })
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error('El servidor respondió ' + respuesta.status + '.');
                return respuesta.json();
            })
            .then((datos) => {
                setBase(datos.productos);
                setCategorias(datos.categorias);
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

    // Catálogo visible: el del archivo sin los quitados, más los agregados al final.
    // useMemo mantiene el mismo arreglo mientras no cambien sus datos, así los cálculos
    // que dependen de él en App (filtro, categorías, carrito) no se repiten de más.
    const productos = useMemo(
        () => base.filter((producto) => !cambios.eliminados.includes(producto.id)).concat(cambios.agregados),
        [base, cambios],
    );
    const modificado = cambios.agregados.length > 0 || cambios.eliminados.length > 0;

    function reintentar() {
        setCargando(true);
        setError('');
        setIntento((anterior) => anterior + 1);
    }

    function agregarVideojuego(videojuego) {
        setCambios((actuales) => ({ ...actuales, agregados: [...actuales.agregados, videojuego] }));
    }

    function eliminarVideojuego(id) {
        setCambios((actuales) => {
            // Un juego agregado por la persona simplemente se borra de la lista de agregados;
            // uno del archivo se anota como quitado.
            if (actuales.agregados.some((videojuego) => videojuego.id === id)) {
                return { ...actuales, agregados: actuales.agregados.filter((videojuego) => videojuego.id !== id) };
            }
            return { ...actuales, eliminados: [...actuales.eliminados, id] };
        });
    }

    function restablecer() {
        setCambios(SIN_CAMBIOS);
    }

    return {
        productos, categorias, cargando, error, modificado,
        agregados: cambios.agregados.length,
        eliminados: cambios.eliminados.length,
        reintentar, agregarVideojuego, eliminarVideojuego, restablecer,
    };
}

// Revisa los cambios guardados: descarta lo que no tenga la forma esperada.
function limpiarCambios(guardado) {
    if (!guardado || !Array.isArray(guardado.agregados) || !Array.isArray(guardado.eliminados)) return null;
    return {
        agregados: guardado.agregados.filter(esVideojuegoValido),
        eliminados: guardado.eliminados.filter((id) => typeof id === 'string'),
    };
}
