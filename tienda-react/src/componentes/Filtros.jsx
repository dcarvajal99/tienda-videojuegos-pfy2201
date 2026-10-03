// Buscador y selector de categoría. Los dos usan el evento onChange y avisan al
// componente App con las funciones que recibe por props (onBuscar y onCategoria).
// Mientras corre la espera del debounce, bajo el buscador aparece «Buscando…».
function Filtros({ busqueda, categoria, categorias, buscando, onBuscar, onCategoria }) {
    return (
        <div className="row g-3 mb-4" id="catalogo">
            <div className="col-12 col-sm-7">
                <label className="form-label" htmlFor="campoBusqueda">Buscar juego</label>
                <input
                    className="form-control"
                    id="campoBusqueda"
                    type="search"
                    placeholder="Por ejemplo: spider"
                    value={busqueda}
                    onChange={(evento) => onBuscar(evento.target.value)}
                />
                {/* La línea siempre ocupa su espacio, así el catálogo no salta al aparecer el aviso. */}
                <p className="form-text linea-estado mb-0">
                    {buscando && (
                        <span className="d-inline-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                            Buscando…
                        </span>
                    )}
                </p>
            </div>

            <div className="col-12 col-sm-5">
                <label className="form-label" htmlFor="selectorCategoria">Categoría</label>
                <select
                    className="form-select"
                    id="selectorCategoria"
                    value={categoria}
                    onChange={(evento) => onCategoria(evento.target.value)}
                >
                    {categorias.map((nombre) => (
                        <option key={nombre} value={nombre}>
                            {nombre === 'todas' ? 'Todas las categorías' : nombre}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default Filtros;
