// Componente raíz: une los dos hooks propios (catálogo y carrito), guarda el estado
// de la interfaz y reparte datos y funciones a los componentes hijos mediante props.
// Así un cambio en una sección se refleja en las demás: agregar un juego actualiza la
// lista, el filtro, las cifras de la portada y el estado de la administración.
import { useState, useEffect, useMemo, useRef } from 'react';
import BarraNavegacion from './componentes/BarraNavegacion.jsx';
import Portada from './componentes/Portada.jsx';
import SeccionAdministrar from './componentes/SeccionAdministrar.jsx';
import SeccionContacto from './componentes/SeccionContacto.jsx';
import Filtros from './componentes/Filtros.jsx';
import SelectorVista from './componentes/SelectorVista.jsx';
import ListaProductos from './componentes/ListaProductos.jsx';
import Carrito from './componentes/Carrito.jsx';
import Aviso from './componentes/Aviso.jsx';
import { useCatalogo } from './hooks/useCatalogo.js';
import { useCarrito, CANTIDAD_MAXIMA } from './hooks/useCarrito.js';
import { useDebounce } from './hooks/useDebounce.js';
import { useSeccionVisible } from './hooks/useSeccionVisible.js';
import { listarCategorias, filtrarProductos } from './utilidades/catalogo.js';
import { armarLineas, contarUnidades, calcularTotal } from './utilidades/carrito.js';
import { comparable } from './utilidades/validaciones.js';

const ESPERA_BUSQUEDA = 300; // Milisegundos sin escribir antes de filtrar.

// Secciones de la página: la barra de navegación arma sus enlaces con esta lista.
const SECCIONES = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'catalogo', texto: 'Catálogo' },
    { id: 'administrar', texto: 'Administrar' },
    { id: 'contacto', texto: 'Contacto' },
];

function App() {
    const catalogo = useCatalogo();
    const carrito = useCarrito();

    // Estado propio de la interfaz.
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('todas');
    const [vista, setVista] = useState('cuadricula'); // 'cuadricula' o 'lista'
    const [mensaje, setMensaje] = useState('');        // Último cambio del carrito
    const [avisoCatalogo, setAvisoCatalogo] = useState(''); // Último cambio del catálogo

    // Si una tarjeta desaparece con el foco dentro, el foco pasa al título del catálogo.
    // La acción lo anota y el efecto lo aplica después del render, cuando la tarjeta ya no está.
    const tituloCatalogo = useRef(null);
    const enfocarCatalogo = useRef(false);
    useEffect(() => {
        if (!enfocarCatalogo.current) return;
        enfocarCatalogo.current = false;
        tituloCatalogo.current?.focus();
    });

    // Debounce: la búsqueda se aplica 300 ms después de la última tecla. Si el campo
    // queda vacío, el catálogo completo vuelve de inmediato, sin esperar.
    const busquedaDiferida = useDebounce(busqueda, ESPERA_BUSQUEDA);
    const busquedaAplicada = busqueda.trim() === '' ? '' : busquedaDiferida;
    const buscando = busqueda.trim() !== busquedaAplicada.trim();

    // Datos derivados. useMemo evita repetir un cálculo cuando no cambió lo que usa:
    // agregar al carrito o cambiar la vista ya no vuelve a filtrar el catálogo.
    const categorias = useMemo(() => listarCategorias(catalogo.productos), [catalogo.productos]);
    const visibles = useMemo(
        () => filtrarProductos(catalogo.productos, busquedaAplicada, categoria),
        [catalogo.productos, busquedaAplicada, categoria],
    );
    const lineas = useMemo(() => armarLineas(carrito.items, catalogo.productos), [carrito.items, catalogo.productos]);
    const unidades = contarUnidades(lineas);
    const total = calcularTotal(lineas);
    const ofertas = catalogo.productos.filter((producto) => producto.precioOferta).length;
    const nombresExistentes = useMemo(
        () => catalogo.productos.map((producto) => comparable(producto.nombre)),
        [catalogo.productos],
    );
    const seccionActiva = useSeccionVisible(SECCIONES.map((seccion) => seccion.id));

    // Efecto: la cantidad de productos del carrito se refleja en el título de la pestaña.
    useEffect(() => {
        document.title = unidades > 0
            ? '(' + unidades + ') PixelPlay Store en React'
            : 'PixelPlay Store en React | Catálogo y carrito de compras';
    }, [unidades]);

    // --- Acciones del carrito: cada una cambia el carrito y deja un mensaje ---

    function agregar(id) {
        if (carrito.cantidadDe(id) >= CANTIDAD_MAXIMA) {
            setMensaje('Máximo ' + CANTIDAD_MAXIMA + ' unidades de ' + nombreDe(id) + '.');
            return;
        }
        carrito.agregar(id);
        setMensaje('Agregaste ' + nombreDe(id) + ' al carrito.');
    }

    function quitarUnidad(id) {
        carrito.quitarUnidad(id);
        setMensaje('Quitaste una unidad de ' + nombreDe(id) + '.');
    }

    function eliminar(id) {
        carrito.eliminar(id);
        setMensaje('Eliminaste ' + nombreDe(id) + ' del carrito.');
    }

    function vaciar() {
        carrito.vaciar();
        setMensaje('El carrito quedó vacío.');
    }

    // --- Acciones del catálogo: agregar, quitar y restablecer ---

    function agregarVideojuego(videojuego) {
        catalogo.agregarVideojuego(videojuego);
        // Se limpian los filtros para que el juego nuevo quede a la vista en el catálogo.
        setBusqueda('');
        setCategoria('todas');
        setAvisoCatalogo('Agregaste ' + videojuego.nombre + ' al catálogo.');
    }

    function quitarDelCatalogo(id) {
        const nombre = nombreDe(id);
        catalogo.eliminarVideojuego(id);
        carrito.eliminar(id); // Un juego que ya no se vende tampoco queda en el carrito.
        setAvisoCatalogo('Quitaste ' + nombre + ' del catálogo.');
        enfocarCatalogo.current = true;
    }

    function restablecerCatalogo() {
        // Los juegos agregados desaparecen: también salen del carrito.
        catalogo.productos.filter((producto) => producto.id.startsWith('propio-'))
            .forEach((producto) => carrito.eliminar(producto.id));
        catalogo.restablecer();
        setAvisoCatalogo('El catálogo volvió a su versión original.');
    }

    function nombreDe(id) {
        const producto = catalogo.productos.find((actual) => actual.id === id);
        return producto ? producto.nombre : 'el producto';
    }

    return (
        <>
            <BarraNavegacion secciones={SECCIONES} seccionActiva={seccionActiva} unidades={unidades} />

            <main>
                <Portada juegos={catalogo.productos.length} categorias={categorias.length - 1} ofertas={ofertas} />

                <section id="catalogo" className="container py-5" aria-labelledby="tituloCatalogo">
                    <h2 className="h3 mb-2" id="tituloCatalogo" ref={tituloCatalogo} tabIndex={-1}>Catálogo</h2>
                    <p className="text-secondary mb-4">
                        Busca por nombre o filtra por categoría, y agrega los juegos que quieras al carrito.
                    </p>

                    <div className="row g-4 g-lg-5">
                        <div className="col-12 col-lg-8">
                            <Filtros
                                busqueda={busqueda}
                                categoria={categoria}
                                categorias={categorias}
                                buscando={buscando}
                                onBuscar={setBusqueda}
                                onCategoria={setCategoria}
                            />

                            {/* Renderizado condicional: carga, error o catálogo */}
                            {catalogo.cargando && <Aviso tipo="carga" texto="Cargando el catálogo…" />}
                            {!catalogo.cargando && catalogo.error && (
                                <Aviso tipo="error" texto={catalogo.error} onReintentar={catalogo.reintentar} />
                            )}
                            {!catalogo.cargando && !catalogo.error && (
                                <>
                                    {/* Región que anuncia los cambios del catálogo; sin texto no ocupa espacio */}
                                    <p className={avisoCatalogo ? 'small mb-3' : 'visually-hidden'} role="status">{avisoCatalogo}</p>
                                    <SelectorVista vista={vista} onCambiar={setVista} />
                                    <ListaProductos
                                        productos={visibles}
                                        total={catalogo.productos.length}
                                        vista={vista}
                                        pendiente={buscando}
                                        cantidadEnCarrito={carrito.cantidadDe}
                                        onAgregar={agregar}
                                        onQuitar={quitarUnidad}
                                        onEliminar={quitarDelCatalogo}
                                    />
                                </>
                            )}
                        </div>

                        <div className="col-12 col-lg-4">
                            <Carrito
                                lineas={lineas}
                                unidades={unidades}
                                total={total}
                                cargando={catalogo.cargando}
                                sinCatalogo={Boolean(catalogo.error)}
                                mensaje={mensaje}
                                onQuitar={quitarUnidad}
                                onEliminar={eliminar}
                                onVaciar={vaciar}
                            />
                        </div>
                    </div>
                </section>

                <SeccionAdministrar
                    catalogo={catalogo}
                    nombresExistentes={nombresExistentes}
                    onAgregar={agregarVideojuego}
                    onRestablecer={restablecerCatalogo}
                />

                <SeccionContacto />
            </main>

            <footer className="border-top py-4">
                <div className="container">
                    <p className="mb-0 small text-secondary">
                        PixelPlay Store · Diego Carvajal · Desarrollo Frontend I (PFY2201)
                    </p>
                </div>
            </footer>
        </>
    );
}

export default App;
