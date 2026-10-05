// Panel del carrito: líneas, contador de productos y total a pagar.
// Muestra una de cuatro cosas: el aviso de carga, un aviso si el catálogo no cargó,
// el carrito vacío o la lista. Vaciar el carrito pide confirmación.
import { useState, useRef, useEffect } from 'react';
import FilaCarrito from './FilaCarrito.jsx';
import Aviso from './Aviso.jsx';
import { useAccionBreve } from '../hooks/useAccionBreve.js';
import { formatearPesos } from '../utilidades/formato.js';

function Carrito({ lineas, unidades, total, cargando, sinCatalogo, mensaje, onQuitar, onEliminar, onVaciar }) {
    const vacio = lineas.length === 0;

    // Pausa compartida por todas las líneas: después de quitar o eliminar, los botones
    // esperan un instante. Así un doble clic no alcanza a borrar la línea que sube a
    // ocupar el lugar de la eliminada.
    const [ocupado, ejecutar] = useAccionBreve(400);
    // Vaciar es la única acción que borra todo: el primer clic pide confirmar.
    const [confirmando, setConfirmando] = useState(false);

    // Cuando una acción hace desaparecer el botón que tenía el foco, el foco pasa a
    // otro elemento. El destino se anota en el evento y se aplica después del render.
    const titulo = useRef(null);
    const botonVaciar = useRef(null);
    const botonCancelar = useRef(null);
    const focoPendiente = useRef(null);

    useEffect(() => {
        if (!focoPendiente.current) return;
        focoPendiente.current.current?.focus();
        focoPendiente.current = null;
    });

    function quitar(id) {
        ejecutar(() => {
            const linea = lineas.find((actual) => actual.id === id);
            if (linea && linea.cantidad === 1) focoPendiente.current = titulo; // La línea va a desaparecer.
            setConfirmando(false);
            onQuitar(id);
        });
    }

    function eliminar(id) {
        ejecutar(() => {
            focoPendiente.current = titulo;
            setConfirmando(false);
            onEliminar(id);
        });
    }

    function pedirConfirmacion() {
        setConfirmando(true);
        focoPendiente.current = botonCancelar; // La opción segura queda enfocada.
    }

    function cancelar() {
        setConfirmando(false);
        focoPendiente.current = botonVaciar;
    }

    function confirmarVaciado() {
        setConfirmando(false);
        focoPendiente.current = titulo;
        onVaciar();
    }

    return (
        <aside className="card panel-carrito" aria-labelledby="tituloCarrito">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h6 mb-0" id="tituloCarrito" ref={titulo} tabIndex={-1}>Tu carrito</h2>
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
                                    bloqueado={ocupado}
                                    onQuitar={quitar}
                                    onEliminar={eliminar}
                                />
                            ))}
                        </ul>

                        <p className="d-flex justify-content-between border-top pt-3 mb-3">
                            <span className="fw-semibold">Total</span>
                            <span className="fw-semibold">{formatearPesos(total)}</span>
                        </p>

                        {/* Renderizado condicional: «Vaciar carrito» o la pregunta de confirmación. */}
                        {confirmando ? (
                            <div className="confirmacion">
                                <p className="small mb-2">
                                    ¿Vaciar el carrito? Se quitarán {unidades} {unidades === 1 ? 'producto' : 'productos'}.
                                </p>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-dark btn-sm flex-grow-1" type="button" onClick={confirmarVaciado}>
                                        Sí, vaciar
                                    </button>
                                    <button
                                        ref={botonCancelar}
                                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                                        type="button"
                                        onClick={cancelar}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                ref={botonVaciar}
                                className="btn btn-outline-secondary btn-sm w-100"
                                type="button"
                                onClick={pedirConfirmacion}
                            >
                                Vaciar carrito
                            </button>
                        )}
                    </>
                )}

                {/* Región que anuncia el último cambio del carrito a los lectores de pantalla. */}
                <p className="small text-secondary mt-3 mb-0" role="status">{mensaje}</p>
            </div>
        </aside>
    );
}

export default Carrito;
