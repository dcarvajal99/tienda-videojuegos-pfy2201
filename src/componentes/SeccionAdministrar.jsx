// Sección para administrar el catálogo: agregar videojuegos y restablecer el catálogo
// original. Los juegos se quitan desde su tarjeta. Los cambios se guardan en este
// navegador; el archivo productos.json no se modifica.
import FormularioVideojuego from './FormularioVideojuego.jsx';
import BotonConConfirmacion from './BotonConConfirmacion.jsx';
import Aviso from './Aviso.jsx';

function SeccionAdministrar({ catalogo, nombresExistentes, onAgregar, onRestablecer }) {
    const disponible = !catalogo.cargando && !catalogo.error;

    return (
        <section id="administrar" className="container py-5" aria-labelledby="tituloAdministrar">
            <h2 className="h3 mb-2" id="tituloAdministrar">Administrar catálogo</h2>
            <p className="text-secondary mb-4">
                Agrega un juego nuevo con el formulario o quita uno con «Quitar del catálogo» en su tarjeta.
                Los cambios se guardan en este navegador.
            </p>

            {/* Renderizado condicional: el formulario necesita las categorías del catálogo */}
            {!disponible && <Aviso tipo="vacio" texto="El formulario estará disponible cuando cargue el catálogo." />}

            {disponible && (
                <div className="row g-4 g-lg-5">
                    <div className="col-lg-7">
                        <div className="card">
                            <div className="card-body">
                                <FormularioVideojuego
                                    categorias={catalogo.categorias}
                                    nombresExistentes={nombresExistentes}
                                    onAgregar={onAgregar}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="h6 mb-3">Estado del catálogo</h3>
                                <dl className="small detalles mb-3">
                                    <dt>Juegos</dt>
                                    <dd>{catalogo.productos.length}</dd>
                                    <dt>Agregados</dt>
                                    <dd>{catalogo.agregados}</dd>
                                    <dt>Quitados</dt>
                                    <dd>{catalogo.eliminados}</dd>
                                </dl>
                                {catalogo.modificado ? (
                                    <BotonConConfirmacion
                                        texto="Restablecer catálogo original"
                                        pregunta="¿Volver al catálogo original? Se borran los juegos agregados y vuelven los quitados."
                                        textoConfirmar="Sí, restablecer"
                                        claseBoton="btn btn-outline-secondary btn-sm w-100"
                                        onConfirmar={onRestablecer}
                                    />
                                ) : (
                                    <p className="small text-secondary mb-0">El catálogo está igual al original.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default SeccionAdministrar;
