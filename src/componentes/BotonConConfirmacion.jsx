// Botón para acciones que borran algo. El primer clic no borra: muestra la pregunta con
// «Sí» y «Cancelar», y deja el foco en «Cancelar», la opción segura. Si se cancela, el
// foco vuelve al botón original. Lo usan el carrito (vaciar), las tarjetas (quitar del
// catálogo) y la administración (restablecer el catálogo).
import { useState, useRef, useEffect } from 'react';

function BotonConConfirmacion({ texto, pregunta, textoConfirmar, claseBoton, onConfirmar }) {
    const [confirmando, setConfirmando] = useState(false);
    const botonInicial = useRef(null);
    const botonCancelar = useRef(null);
    // El botón que debe recibir el foco existe recién después del render: se anota aquí
    // y el efecto lo enfoca.
    const focoPendiente = useRef(null);

    useEffect(() => {
        if (!focoPendiente.current) return;
        focoPendiente.current.current?.focus();
        focoPendiente.current = null;
    });

    function preguntar() {
        setConfirmando(true);
        focoPendiente.current = botonCancelar;
    }

    function cancelar() {
        setConfirmando(false);
        focoPendiente.current = botonInicial;
    }

    function confirmar() {
        setConfirmando(false);
        onConfirmar(); // Quien usa el botón decide adónde va el foco si algo desaparece.
    }

    if (!confirmando) {
        return (
            <button ref={botonInicial} className={claseBoton} type="button" onClick={preguntar}>
                {texto}
            </button>
        );
    }

    return (
        <div className="confirmacion">
            <p className="small mb-2">{pregunta}</p>
            <div className="d-flex gap-2">
                <button className="btn btn-dark btn-sm flex-grow-1" type="button" onClick={confirmar}>
                    {textoConfirmar}
                </button>
                <button ref={botonCancelar} className="btn btn-outline-secondary btn-sm flex-grow-1" type="button" onClick={cancelar}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default BotonConConfirmacion;
