// Panel del carrito: líneas, contador de productos y total a pagar.
// Muestra una de cuatro cosas: el aviso de carga, un aviso si el catálogo no cargó,
// el carrito vacío o la lista.
import FilaCarrito from './FilaCarrito.jsx';
import Aviso from './Aviso.jsx';
import { formatearPesos } from '../utilidades/formato.js';

function Carrito({ lineas, unidades, total, cargando, sinCatalogo, mensaje, onQuitar, onEliminar, onVaciar }) {
    const vacio = lineas.length === 0;

    return (
        <aside className="card panel-carrito" aria-labelledby="tituloCarrito">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0" id="tituloCarrito">Tu carrito</h2>
                    <span className="badge text-bg-light border">
                        {unidades} {unidades === 1 ? 'producto' : 'productos'}
                    </span>
                </div>

                {cargando && <Aviso tipo="carga" texto="Cargando el carrito…" />}

                {/* Sin catálogo no hay nombres ni precios: el carrito guardado espera a que cargue. */}
                {!cargando && sinCatalogo && (
                    <p className="text-secondary small mb-0">
                        Tu carrito se mostrará cuando el catálogo vuelva a cargar.
                    </p>
                )}

                {!cargando && !sinCatalogo && vacio && (
                    <p className="text-secondary small mb-0">
                        Tu carrito está vacío. Usa el botón «Agregar al carrito» de cada juego.
                    </p>
                )}

                {!cargando && !sinCatalogo && !vacio && (
                    <>
                        <ul className="list-unstyled mb-3">
                            {lineas.map((linea) => (
                                <FilaCarrito
                                    key={linea.id}
                                    linea={linea}
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
