// Panel del carrito: lista de líneas, contador de productos y total a pagar.
// Cuando no hay nada, en lugar de la lista muestra un texto de carrito vacío.
import FilaCarrito from './FilaCarrito.jsx';
import { formatearPesos } from '../utilidades/formato.js';

function Carrito({ items, unidades, total, mensaje, onQuitar, onEliminar, onVaciar }) {
    const vacio = items.length === 0;

    return (
        <aside className="card panel-carrito" aria-labelledby="tituloCarrito">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0" id="tituloCarrito">Tu carrito</h2>
                    <span className="badge text-bg-light border">
                        {unidades} {unidades === 1 ? 'producto' : 'productos'}
                    </span>
                </div>

                {vacio ? (
                    <p className="text-secondary small mb-0">
                        Todavía no agregas juegos. Usa el botón «Agregar al carrito» de cada tarjeta.
                    </p>
                ) : (
                    <>
                        <ul className="list-unstyled mb-3">
                            {items.map((item) => (
                                <FilaCarrito
                                    key={item.id}
                                    item={item}
                                    onQuitar={onQuitar}
                                    onEliminar={onEliminar}
                                />
                            ))}
                        </ul>

                        <p className="d-flex justify-content-between border-top pt-3 mb-3">
                            <span className="fw-semibold">Total</span>
                            <span className="fw-semibold">{formatearPesos(total)}</span>
                        </p>

                        <button className="btn btn-outline-secondary btn-sm w-100" type="button" onClick={onVaciar}>
                            Vaciar carrito
                        </button>
                    </>
                )}

                {/* Región que anuncia el último cambio del carrito a los lectores de pantalla. */}
                <p className="small text-secondary mt-3 mb-0" role="status">{mensaje}</p>
            </div>
        </aside>
    );
}

export default Carrito;
