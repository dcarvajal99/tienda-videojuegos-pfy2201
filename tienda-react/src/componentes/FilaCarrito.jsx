// Una línea del carrito. Los dos botones usan onClick: uno quita una unidad y el
// otro elimina el producto completo.
import { formatearPesos } from '../utilidades/formato.js';

function FilaCarrito({ item, onQuitar, onEliminar }) {
    return (
        <li className="d-flex gap-3 py-2 border-bottom">
            <img
                className="miniatura"
                src={import.meta.env.BASE_URL + item.imagen}
                width="64"
                height="36"
                alt=""
            />

            <div className="flex-grow-1">
                <p className="mb-1 small fw-medium">{item.nombre}</p>
                <p className="mb-2 small text-secondary">
                    {item.cantidad} × {formatearPesos(item.precio)} = {formatearPesos(item.precio * item.cantidad)}
                </p>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => onQuitar(item.id)}
                    >
                        Quitar una
                        <span className="visually-hidden"> unidad de {item.nombre}</span>
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        onClick={() => onEliminar(item.id)}
                    >
                        Eliminar
                        <span className="visually-hidden"> {item.nombre} del carrito</span>
                    </button>
                </div>
            </div>
        </li>
    );
}

export default FilaCarrito;
