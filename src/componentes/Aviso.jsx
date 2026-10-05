// Componente reutilizable para los mensajes de estado de la página:
// carga, error (con botón para reintentar) y búsqueda sin resultados.
function Aviso({ tipo, texto, onReintentar }) {
    if (tipo === 'carga') {
        return (
            <p className="d-flex align-items-center gap-2 text-secondary" role="status">
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                {texto}
            </p>
        );
    }

    if (tipo === 'error') {
        return (
            <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0"
                role="alert">
                <span>{texto}</span>
                {onReintentar && (
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={onReintentar}>
                        Reintentar
                    </button>
                )}
            </div>
        );
    }

    return <p className="text-secondary mb-0" role="status">{texto}</p>;
}

export default Aviso;
