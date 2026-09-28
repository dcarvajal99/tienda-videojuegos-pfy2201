// Recorre el arreglo de productos con map() y crea una tarjeta por cada uno.
// Si el filtro no deja ninguno, muestra un aviso en lugar de la cuadrícula.
import TarjetaProducto from './TarjetaProducto.jsx';
import Aviso from './Aviso.jsx';

function ListaProductos({ productos, total, onAgregar }) {
    if (productos.length === 0) {
        return <Aviso tipo="vacio" texto="Ningún juego coincide con la búsqueda. Prueba con otra palabra." />;
    }

    return (
        <>
            <p className="text-secondary small" role="status">
                Mostrando {productos.length} de {total} juegos.
            </p>

            <div className="row row-cols-1 row-cols-sm-2 g-3 g-lg-4">
                {productos.map((producto) => (
                    // key: identificador único que React necesita para reutilizar cada tarjeta.
                    <TarjetaProducto key={producto.id} producto={producto} onAgregar={onAgregar} />
                ))}
            </div>
        </>
    );
}

export default ListaProductos;
