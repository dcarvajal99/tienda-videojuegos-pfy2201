// Dos botones para alternar entre la vista de cuadrícula y la de lista.
// El botón activo se marca con aria-pressed y con un estilo distinto.
const OPCIONES = [
    { valor: 'cuadricula', texto: 'Cuadrícula' },
    { valor: 'lista', texto: 'Lista' },
];

function SelectorVista({ vista, onCambiar }) {
    return (
        <div className="d-flex align-items-center gap-2 mb-3">
            <span className="small text-secondary" id="etiquetaVista">Ver como</span>
            <div className="btn-group btn-group-sm" role="group" aria-labelledby="etiquetaVista">
                {OPCIONES.map((opcion) => {
                    const activa = vista === opcion.valor;
                    return (
                        <button
                            key={opcion.valor}
                            className={activa ? 'btn btn-dark' : 'btn btn-outline-secondary'}
                            type="button"
                            aria-pressed={activa}
                            onClick={() => onCambiar(opcion.valor)}
                        >
                            {opcion.texto}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SelectorVista;
