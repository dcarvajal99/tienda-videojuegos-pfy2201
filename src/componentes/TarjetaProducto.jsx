// Tarjeta de un producto. Lo que muestra depende de tres cosas:
// - la vista elegida en App (cuadrícula o lista), que llega por props;
// - cuántas unidades hay en el carrito: con 0 aparece «Agregar al carrito» y con
//   1 o más el botón pasa a «En el carrito», junto a otro para quitar una unidad;
// - si los detalles están abiertos, un estado propio de cada tarjeta.
// Tras agregar o quitar, el botón queda un instante en pausa: muestra la confirmación
// y no repite la acción si llega un doble clic.
import { useState, useRef } from 'react';
import { formatearPesos, calcularDescuento, resumir } from '../utilidades/formato.js';
import { CANTIDAD_MAXIMA } from '../hooks/useCarrito.js';
import { useAccionBreve } from '../hooks/useAccionBreve.js';
import ImagenJuego from './ImagenJuego.jsx';
import BotonConConfirmacion from './BotonConConfirmacion.jsx';

function TarjetaProducto({ producto, vista, cantidad, onAgregar, onQuitar, onEliminar }) {
    // Estado local: solo esta tarjeta necesita saber si sus detalles están abiertos.
    const [detallesAbiertos, setDetallesAbiertos] = useState(false);
    // Referencia al botón principal, para devolverle el foco si desaparece el botón «−».
    const botonPrincipal = useRef(null);
    // Pausas breves después de agregar y de quitar.
    const [agregando, agregarConPausa] = useAccionBreve(600);
    const [quitando, quitarConPausa] = useAccionBreve(400);

    const descuento = calcularDescuento(producto);
    const enOferta = descuento > 0;
    const enCarrito = cantidad > 0;
    const textoBoton = !enCarrito
        ? 'Agregar al carrito'
        : 'En el carrito (' + cantidad + ') · ' + (cantidad >= CANTIDAD_MAXIMA ? 'Máximo' : 'Agregar otra');

    // Clase del botón principal: confirmación durante la pausa, borde si ya está en el carrito.
    let claseBoton = 'btn btn-dark flex-grow-1';
    if (agregando) claseBoton = 'btn btn-confirmado flex-grow-1';
    else if (enCarrito) claseBoton = 'btn btn-outline-dark flex-grow-1';

    function agregar() {
        // En el máximo no se agrega nada, así que no hay qué confirmar: App solo avisa.
        if (cantidad >= CANTIDAD_MAXIMA) {
            onAgregar(producto.id);
            return;
        }
        agregarConPausa(() => onAgregar(producto.id));
    }

    function quitarUna() {
        quitarConPausa(() => {
            if (cantidad === 1) botonPrincipal.current.focus(); // El botón «−» está por desaparecer.
            onQuitar(producto.id);
        });
    }

    return (
        <div className="col">
            <article className={vista === 'lista' ? 'card h-100 tarjeta-lista' : 'card h-100'}>
                <ImagenJuego
                    className="card-img-top portada"
                    imagen={producto.imagen}
                    width="800"
                    height="800"
                    loading="lazy"
                    alt={'Portada de ' + producto.nombre}
                />

                <div className="card-body d-flex flex-column">
                    <p className="text-uppercase text-secondary small mb-1">{producto.categoria}</p>
                    <h2 className="card-title h6">{producto.nombre}</h2>
                    <p className="card-text small text-secondary mb-2">{resumir(producto.descripcion)}</p>

                    {/* Botón que cambia de texto según el estado de la tarjeta */}
                    <button
                        className="btn btn-link btn-sm p-0 align-self-start mb-2"
                        type="button"
                        aria-expanded={detallesAbiertos}
                        onClick={() => setDetallesAbiertos((abiertos) => !abiertos)}
                    >
                        {detallesAbiertos ? 'Ocultar detalles' : 'Ver detalles'}
                    </button>

                    {detallesAbiertos && (
                        <dl className="small detalles mb-3">
                            <dt>Desarrollador</dt>
                            <dd>{producto.desarrollador}</dd>
                            <dt>Plataforma</dt>
                            <dd>PlayStation 5</dd>
                            <dt>Descuento</dt>
                            <dd>
                                {enOferta
                                    ? 'Ahorras ' + formatearPesos(producto.precioNormal - producto.precioOferta)
                                    : 'Sin descuento esta semana'}
                            </dd>
                        </dl>
                    )}

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

                    {/* Renderizado condicional: «Agregar al carrito» pasa a «En el carrito».
                        El botón principal es siempre el mismo elemento, así no pierde el foco. */}
                    <div className="d-flex gap-2 acciones">
                        <button
                            ref={botonPrincipal}
                            className={claseBoton}
                            type="button"
                            aria-disabled={agregando}
                            onClick={agregar}
                        >
                            {agregando ? '✓ Agregado' : textoBoton}
                        </button>
                        {enCarrito && (
                            <button
                                className="btn btn-outline-dark"
                                type="button"
                                aria-label={'Quitar una unidad de ' + producto.nombre}
                                aria-disabled={quitando}
                                onClick={quitarUna}
                            >
                                −
                            </button>
                        )}
                    </div>

                    {/* Quitar el juego del catálogo pide confirmación antes de borrarlo */}
                    <div className="mt-2">
                        <BotonConConfirmacion
                            texto="Quitar del catálogo"
                            pregunta={'¿Quitar ' + producto.nombre + ' del catálogo?'}
                            textoConfirmar="Sí, quitar"
                            claseBoton="btn btn-link btn-sm p-0 text-secondary"
                            onConfirmar={() => onEliminar(producto.id)}
                        />
                    </div>
                </div>
            </article>
        </div>
    );
}

export default TarjetaProducto;
