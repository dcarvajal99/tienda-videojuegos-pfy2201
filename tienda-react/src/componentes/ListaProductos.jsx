// Recorre los productos con map() y crea una tarjeta por cada uno.
// Si el filtro no deja ninguno, muestra un aviso en lugar de la cuadrícula.
import TarjetaProducto from './TarjetaProducto.jsx';
import Aviso from './Aviso.jsx';

function ListaProductos({ productos, total, vista, cantidadEnCarrito, onAgregar, onQuitar }) {
    if (productos.length === 0) {
        return <Aviso tipo="vacio" texto="Ningún juego coincide con la búsqueda. Prueba con otra palabra." />;
    }

    // La vista de lista usa una columna; la cuadrícula, dos desde 576 px.
    const columnas = vista === 'lista' ? 'row-cols-1' : 'row-cols-1 row-cols-sm-2';

    return (
        <>
            <p className="text-secondary small" role="status">
                Mostrando {productos.length} de {total} juegos.
            </p>

            <div className={'row g-3 g-lg-4 ' + columnas}>
                {productos.map((producto) => (
                    // key: identificador único que React necesita para reutilizar cada tarjeta.
                    <TarjetaProducto
                        key={producto.id}
                        producto={producto}
                        vista={vista}
                        cantidad={cantidadEnCarrito(producto.id)}
                        onAgregar={onAgregar}
                        onQuitar={onQuitar}
                    />
                ))}
            </div>
        </>
    );
}

export default ListaProductos;
