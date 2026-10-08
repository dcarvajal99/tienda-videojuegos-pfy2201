// Sección de inicio: presentación de la tienda y tres cifras del catálogo.
// Las cifras llegan por props desde App, así que cambian solas cuando se agrega
// o se quita un videojuego del catálogo.
function Portada({ juegos, categorias, ofertas }) {
    return (
        <section id="inicio" className="portada-inicio bg-white border-bottom" aria-labelledby="tituloInicio">
            <div className="container py-5">
                <div className="row align-items-center g-4 g-lg-5">
                    <div className="col-lg-7">
                        <p className="text-uppercase small text-secondary mb-2">Tienda online de videojuegos · PlayStation 5</p>
                        <h1 className="display-6 fw-semibold mb-3" id="tituloInicio">
                            Los juegos de PS5 que buscas, con precios en pesos chilenos
                        </h1>
                        <p className="lead text-secondary mb-4">
                            Revisa el catálogo, filtra por categoría y arma tu carrito. Si tienes una duda,
                            escríbenos desde el formulario de contacto.
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            <a className="btn btn-dark" href="#catalogo">Ver catálogo</a>
                            <a className="btn btn-outline-dark" href="#contacto">Contactar</a>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <dl className="cifras mb-0">
                            <div>
                                <dt>Juegos</dt>
                                <dd>{juegos}</dd>
                            </div>
                            <div>
                                <dt>Categorías</dt>
                                <dd>{categorias}</dd>
                            </div>
                            <div>
                                <dt>En oferta</dt>
                                <dd>{ofertas}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Portada;
