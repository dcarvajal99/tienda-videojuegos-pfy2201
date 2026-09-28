// Componente raíz: guarda el estado de la aplicación y reparte datos y funciones
// a los componentes hijos mediante props.
import { useState, useEffect } from 'react';
import BarraTienda from './componentes/BarraTienda.jsx';
import Filtros from './componentes/Filtros.jsx';
import ListaProductos from './componentes/ListaProductos.jsx';
import Carrito from './componentes/Carrito.jsx';
import Aviso from './componentes/Aviso.jsx';
import { precioFinal, normalizarTexto } from './utilidades/formato.js';

const URL_CATALOGO = import.meta.env.BASE_URL + 'productos.json';
const CANTIDAD_MAXIMA = 10; // Tope de unidades por producto, igual que en la tienda original.

function App() {
    // Un useState por cada dato que cambia en pantalla.
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('todas');
    const [carrito, setCarrito] = useState([]);
    const [mensaje, setMensaje] = useState('');

    // useEffect con arreglo vacío: se ejecuta una sola vez, al montar el componente.
    useEffect(() => {
        const controlador = new AbortController();

        fetch(URL_CATALOGO, { signal: controlador.signal })
            .then((respuesta) => {
                if (!respuesta.ok) throw new Error('El servidor respondió ' + respuesta.status);
                return respuesta.json();
            })
            .then((datos) => {
                setProductos(datos.productos);
                setCargando(false);
            })
            .catch((fallo) => {
                if (fallo.name === 'AbortError') return; // El componente se desmontó antes de responder.
                setError('No pudimos cargar el catálogo. ' + fallo.message);
                setCargando(false);
            });

        // Función de limpieza: cancela la petición si el componente se desmonta.
        return () => controlador.abort();
    }, []);

    // Segundo useEffect: cada vez que cambia el carrito, refleja el total en el título de la pestaña.
    useEffect(() => {
        const unidades = contarUnidades(carrito);
        document.title = unidades > 0
            ? '(' + unidades + ') PixelPlay Store en React'
            : 'PixelPlay Store en React | Catálogo y carrito de compras';
    }, [carrito]);

    // --- Funciones del carrito: se pasan como props a los componentes hijos ---

    function agregarProducto(producto) {
        setCarrito((actual) => {
            const enCarrito = actual.find((item) => item.id === producto.id);

            if (!enCarrito) {
                return [...actual, {
                    id: producto.id,
                    nombre: producto.nombre,
                    imagen: producto.imagen,
                    precio: precioFinal(producto),
                    cantidad: 1,
                }];
            }
            if (enCarrito.cantidad >= CANTIDAD_MAXIMA) {
                return actual; // No se pasa del tope.
            }
            return actual.map((item) => (
                item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
            ));
        });

        const enCarrito = carrito.find((item) => item.id === producto.id);
        setMensaje(enCarrito && enCarrito.cantidad >= CANTIDAD_MAXIMA
            ? 'Máximo ' + CANTIDAD_MAXIMA + ' unidades de ' + producto.nombre + '.'
            : 'Agregaste ' + producto.nombre + ' al carrito.');
    }

    function quitarUnidad(id) {
        setCarrito((actual) => actual.flatMap((item) => {
            if (item.id !== id) return item;
            return item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : [];
        }));
        setMensaje('Quitaste una unidad del carrito.');
    }

    function eliminarProducto(id) {
        const item = carrito.find((producto) => producto.id === id);
        setCarrito((actual) => actual.filter((producto) => producto.id !== id));
        setMensaje('Eliminaste ' + (item ? item.nombre : 'el producto') + ' del carrito.');
    }

    function vaciarCarrito() {
        setCarrito([]);
        setMensaje('El carrito quedó vacío.');
    }

    // --- Datos derivados: se recalculan en cada render, no necesitan estado propio ---

    const categorias = ['todas', ...new Set(productos.map((producto) => producto.categoria))];
    const visibles = filtrarProductos(productos, busqueda, categoria);
    const unidades = contarUnidades(carrito);
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

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
                        {cargando && <Aviso tipo="carga" texto="Cargando el catálogo…" />}
                        {!cargando && error && <Aviso tipo="error" texto={error} />}
                        {!cargando && !error && (
                            <ListaProductos
                                productos={visibles}
                                total={productos.length}
                                onAgregar={agregarProducto}
                            />
                        )}
                    </div>

                    <div className="col-12 col-lg-4">
                        <Carrito
                            items={carrito}
                            unidades={unidades}
                            total={total}
                            mensaje={mensaje}
                            onQuitar={quitarUnidad}
                            onEliminar={eliminarProducto}
                            onVaciar={vaciarCarrito}
                        />
                    </div>
                </div>
            </main>

            <footer className="border-top py-4 mt-4">
                <div className="container">
                    <p className="mb-0 small text-secondary">
                        PixelPlay Store · Diego Carvajal · Desarrollo Frontend I (PFY2201) · Semana 7
                    </p>
                </div>
            </footer>
        </>
    );
}

// Suma las unidades de todas las líneas del carrito.
function contarUnidades(items) {
    return items.reduce((suma, item) => suma + item.cantidad, 0);
}

// Aplica el texto buscado y la categoría elegida sobre el catálogo completo.
function filtrarProductos(productos, busqueda, categoria) {
    const texto = normalizarTexto(busqueda).trim();

    return productos.filter((producto) => {
        const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
        if (!coincideCategoria) return false;
        if (texto === '') return true;

        const contenido = normalizarTexto(producto.nombre + ' ' + producto.descripcion);
        return texto.split(/\s+/).every((palabra) => contenido.includes(palabra));
    });
}

export default App;
