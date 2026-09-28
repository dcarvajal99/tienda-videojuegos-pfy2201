// Tarjeta de un producto: imagen, nombre, resumen, precios y botón de compra.
// El botón usa onClick y llama a la función onAgregar que llegó por props.
import { formatearPesos, calcularDescuento, resumir } from '../utilidades/formato.js';

function TarjetaProducto({ producto, onAgregar }) {
    const descuento = calcularDescuento(producto);
    const enOferta = descuento > 0;

    return (
        <div className="col">
            <article className="card h-100">
                <img
                    className="card-img-top portada"
                    src={import.meta.env.BASE_URL + producto.imagen}
                    width="800"
                    height="450"
                    loading="lazy"
                    alt={'Portada de ' + producto.nombre}
                />

                <div className="card-body d-flex flex-column">
                    <p className="text-uppercase text-secondary small mb-1">{producto.categoria}</p>
                    <h2 className="card-title h6">{producto.nombre}</h2>
                    <p className="card-text small text-secondary">{resumir(producto.descripcion)}</p>

                    {/* Renderizado condicional: solo los productos en oferta muestran
                        el precio normal tachado y la etiqueta de descuento. */}
                    <p className="mt-auto mb-3">
                        {enOferta ? (
                            <>
                                <span className="d-block text-secondary small">
                                    Precio normal <s>{formatearPesos(producto.precioNormal)}</s>
                                </span>
                                <span className="fs-5 fw-semibold precio-oferta">
                                    {formatearPesos(producto.precioOferta)}
                                </span>
                                <span className="badge text-bg-dark ms-2">-{descuento}%</span>
                            </>
                        ) : (
                            <>
                                <span className="d-block text-secondary small">Precio normal</span>
                                <span className="fs-5 fw-semibold">{formatearPesos(producto.precioNormal)}</span>
                            </>
                        )}
                    </p>

                    <button className="btn btn-dark w-100" type="button" onClick={() => onAgregar(producto)}>
                        Agregar al carrito
                    </button>
                </div>
            </article>
        </div>
    );
}

export default TarjetaProducto;
