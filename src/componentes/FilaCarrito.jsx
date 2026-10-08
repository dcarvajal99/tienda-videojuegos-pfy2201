// Una línea del carrito. Los dos botones usan onClick: uno quita una unidad y el
// otro elimina el producto completo. Durante la pausa que sigue a cada acción,
// los botones se ven desactivados y no responden.
import { formatearPesos } from '../utilidades/formato.js';
import ImagenJuego from './ImagenJuego.jsx';

function FilaCarrito({ linea, bloqueado, onQuitar, onEliminar }) {
    return (
        <li className="d-flex gap-3 py-2 border-bottom">
            <ImagenJuego
                className="miniatura"
                imagen={linea.imagen}
                width="48"
                height="48"
                alt=""
            />

            <div className="flex-grow-1">
                <p className="mb-1 small fw-medium">{linea.nombre}</p>
                <p className="mb-2 small text-secondary">
                    {linea.cantidad} × {formatearPesos(linea.precio)} = {formatearPesos(linea.precio * linea.cantidad)}
                </p>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        aria-disabled={bloqueado}
                        onClick={() => onQuitar(linea.id)}
                    >
                        Quitar una
                        <span className="visually-hidden"> unidad de {linea.nombre}</span>
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        type="button"
                        aria-disabled={bloqueado}
                        onClick={() => onEliminar(linea.id)}
                    >
                        Eliminar
                        <span className="visually-hidden"> {linea.nombre} del carrito</span>
                    </button>
                </div>
            </div>
        </li>
    );
}

export default FilaCarrito;
