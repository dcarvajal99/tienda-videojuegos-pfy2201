// Panel del carrito: líneas, contador de productos y total a pagar.
// Muestra una de cuatro cosas: el aviso de carga, un aviso si el catálogo no cargó,
// el carrito vacío o la lista. Vaciar el carrito pide confirmación (BotonConConfirmacion).
import { useRef, useEffect } from 'react';
import FilaCarrito from './FilaCarrito.jsx';
import Aviso from './Aviso.jsx';
import BotonConConfirmacion from './BotonConConfirmacion.jsx';
import { useAccionBreve } from '../hooks/useAccionBreve.js';
import { formatearPesos } from '../utilidades/formato.js';

function Carrito({ lineas, unidades, total, cargando, sinCatalogo, mensaje, onQuitar, onEliminar, onVaciar }) {
    const vacio = lineas.length === 0;

    // Pausa compartida por todas las líneas: después de quitar o eliminar, los botones
    // esperan un instante. Así un doble clic no alcanza a borrar la línea que sube a
    // ocupar el lugar de la eliminada.
    const [ocupado, ejecutar] = useAccionBreve(400);

    // Cuando una acción hace desaparecer el botón que tenía el foco, el foco pasa a
    // otro elemento. El destino se anota en el evento y se aplica después del render.
    const titulo = useRef(null);
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
            onQuitar(id);
        });
    }

    function eliminar(id) {
        ejecutar(() => {
            focoPendiente.current = titulo;
            onEliminar(id);
        });
    }

    function vaciar() {
        focoPendiente.current = titulo; // La lista y el botón desaparecen.
        onVaciar();
    }

    return (
        <aside className="card panel-carrito" id="carrito" aria-labelledby="tituloCarrito">
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

                        <BotonConConfirmacion
                            texto="Vaciar carrito"
                            pregunta={'¿Vaciar el carrito? Se quitarán ' + unidades + (unidades === 1 ? ' producto.' : ' productos.')}
                            textoConfirmar="Sí, vaciar"
                            claseBoton="btn btn-outline-secondary btn-sm w-100"
                            onConfirmar={vaciar}
                        />
                    </>
                )}

                {/* Región que anuncia el último cambio del carrito a los lectores de pantalla. */}
                <p className="small text-secondary mt-3 mb-0" role="status">{mensaje}</p>
            </div>
        </aside>
    );
}

export default Carrito;
