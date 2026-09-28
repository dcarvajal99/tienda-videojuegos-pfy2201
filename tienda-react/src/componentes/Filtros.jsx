// Buscador y selector de categoría. Los dos usan el evento onChange y avisan al
// componente App con las funciones que recibe por props (onBuscar y onCategoria).
function Filtros({ busqueda, categoria, categorias, onBuscar, onCategoria }) {
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
