// Pie de página: datos de la tienda, horario, redes sociales y enlaces a las secciones.
// Las columnas se ordenan con CSS Grid (.pie-grilla): cuatro en escritorio, dos en
// tablet y una en teléfono, sin media queries.
import { TIENDA } from '../datos/tienda.js';

const RUTA_LOGO = import.meta.env.BASE_URL + 'img/logo-pixelplay-mono.svg';

function PiePagina({ secciones }) {
    return (
        <footer className="pie bg-white border-top">
            <div className="container py-5">
                <div className="pie-grilla">
                    <div>
                        <img src={RUTA_LOGO} className="logo mb-3" width="146" height="44" alt={TIENDA.nombre} />
                        <address className="small text-secondary mb-0">
                            {TIENDA.direccion}<br />
                            {TIENDA.ciudad}
                        </address>
                    </div>

                    <div>
                        <h2 className="pie-titulo">Atención</h2>
                        <ul className="list-unstyled small mb-0">
                            <li className="text-secondary">{TIENDA.horario}</li>
                            <li><a href={TIENDA.telefonoEnlace}>{TIENDA.telefono}</a></li>
                            <li><a href={'mailto:' + TIENDA.correo}>{TIENDA.correo}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="pie-titulo">Síguenos</h2>
                        <ul className="list-unstyled small mb-0">
                            {TIENDA.redes.map((red) => (
                                <li key={red.nombre}>
                                    <a href={red.url} target="_blank" rel="noopener noreferrer">
                                        {red.nombre}
                                        <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <nav aria-label="Secciones del sitio">
                        <h2 className="pie-titulo">Secciones</h2>
                        <ul className="list-unstyled small mb-0">
                            {secciones.map((seccion) => (
                                <li key={seccion.id}><a href={'#' + seccion.id}>{seccion.texto}</a></li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <p className="small text-secondary border-top pt-3 mt-4 mb-0">
                    © {new Date().getFullYear()} {TIENDA.nombre} · Proyecto de Diego Carvajal para Desarrollo Frontend I (PFY2201), Duoc UC.
                </p>
            </div>
        </footer>
    );
}

export default PiePagina;
