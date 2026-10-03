// Componente raíz: une los dos hooks propios (catálogo y carrito), guarda el estado
// de la interfaz y reparte datos y funciones a los componentes hijos mediante props.
import { useState, useEffect } from 'react';
import BarraTienda from './componentes/BarraTienda.jsx';
import Filtros from './componentes/Filtros.jsx';
import SelectorVista from './componentes/SelectorVista.jsx';
import ListaProductos from './componentes/ListaProductos.jsx';
import Carrito from './componentes/Carrito.jsx';
import Aviso from './componentes/Aviso.jsx';
import { useCatalogo } from './hooks/useCatalogo.js';
import { useCarrito, CANTIDAD_MAXIMA } from './hooks/useCarrito.js';
import { listarCategorias, filtrarProductos } from './utilidades/catalogo.js';
import { armarLineas, contarUnidades, calcularTotal } from './utilidades/carrito.js';

function App() {
    const catalogo = useCatalogo();
    const carrito = useCarrito();

    // Estado propio de la interfaz.
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('todas');
    const [vista, setVista] = useState('cuadricula'); // 'cuadricula' o 'lista'
    const [mensaje, setMensaje] = useState('');

    // Datos derivados: se recalculan en cada render, no necesitan estado propio.
    const categorias = listarCategorias(catalogo.productos);
    const visibles = filtrarProductos(catalogo.productos, busqueda, categoria);
    const lineas = armarLineas(carrito.items, catalogo.productos);
    const unidades = contarUnidades(lineas);
    const total = calcularTotal(lineas);

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

    function nombreDe(id) {
        const producto = catalogo.productos.find((actual) => actual.id === id);
        return producto ? producto.nombre : 'el producto';
    }

    return (
        <>
            <BarraTienda unidades={unidades} />

            <main className="container py-4 py-lg-5">
                <h1 className="h3 mb-2">Catálogo de videojuegos PS5</h1>
                <p className="text-secondary mb-4">
                    Versión de PixelPlay Store construida con componentes funcionales de React.
                </p>

                <div className="row g-4 g-lg-5">
                    <div className="col-12 col-lg-8">
                        <Filtros
                            busqueda={busqueda}
                            categoria={categoria}
                            categorias={categorias}
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
                                <SelectorVista vista={vista} onCambiar={setVista} />
                                <ListaProductos
                                    productos={visibles}
                                    total={catalogo.productos.length}
                                    vista={vista}
                                    cantidadEnCarrito={carrito.cantidadDe}
                                    onAgregar={agregar}
                                    onQuitar={quitarUnidad}
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
            </main>

            <footer className="border-top py-4 mt-4">
                <div className="container">
                    <p className="mb-0 small text-secondary">
                        PixelPlay Store · Diego Carvajal · Desarrollo Frontend I (PFY2201) · Semana 8
                    </p>
                </div>
            </footer>
        </>
    );
}

export default App;
