// Componente reutilizable para los tres mensajes de estado de la página:
// carga, error y catálogo sin resultados.
function Aviso({ tipo, texto }) {
    if (tipo === 'carga') {
        return (
            <p className="d-flex align-items-center gap-2 text-secondary" role="status">
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                {texto}
            </p>
        );
    }

    if (tipo === 'error') {
        return <p className="alert alert-danger mb-0" role="alert">{texto}</p>;
    }

    return <p className="text-secondary mb-0" role="status">{texto}</p>;
}

export default Aviso;
