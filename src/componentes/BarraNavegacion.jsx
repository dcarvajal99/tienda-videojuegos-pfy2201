// Barra de navegación de Bootstrap con los enlaces a las secciones de la página y el
// acceso al carrito. En pantallas chicas el menú se pliega detrás del botón; React
// controla si está abierto con un estado, sin necesitar el JavaScript de Bootstrap.
import { useState, useRef } from 'react';

const RUTA_LOGO = import.meta.env.BASE_URL + 'img/logo-pixelplay-mono.svg';

function BarraNavegacion({ secciones, seccionActiva, unidades }) {
    const [abierto, setAbierto] = useState(false);
    const botonMenu = useRef(null);

    function cerrar() {
        setAbierto(false);
    }

    // Escape cierra el menú abierto y devuelve el foco al botón que lo abrió.
    function alPresionarTecla(evento) {
        if (evento.key === 'Escape' && abierto) {
            setAbierto(false);
            botonMenu.current.focus();
        }
    }

    return (
        <header className="sticky-top">
            <nav className="navbar navbar-expand-lg bg-white border-bottom" aria-label="Principal" onKeyDown={alPresionarTecla}>
                <div className="container">
                    <a className="navbar-brand py-0" href="#inicio" onClick={cerrar}>
                        <img src={RUTA_LOGO} className="logo" width="146" height="44" alt="PixelPlay Store, ir al inicio" />
                    </a>

                    <div className="d-flex align-items-center gap-2 order-lg-last">
                        <a className="btn btn-outline-dark btn-sm" href="#carrito" onClick={cerrar}>
                            Carrito <span className="badge text-bg-dark ms-1">{unidades}</span>
                            <span className="visually-hidden">{unidades === 1 ? ' producto' : ' productos'}</span>
                        </a>
                        <button
                            ref={botonMenu}
                            className="navbar-toggler"
                            type="button"
                            aria-controls="menuPrincipal"
                            aria-expanded={abierto}
                            aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
                            onClick={() => setAbierto((anterior) => !anterior)}
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>

                    {/* Renderizado condicional de la clase: «show» despliega el menú plegado */}
                    <div className={abierto ? 'collapse navbar-collapse show' : 'collapse navbar-collapse'} id="menuPrincipal">
                        <ul className="navbar-nav ms-lg-4 me-auto">
                            {secciones.map((seccion) => {
                                const activa = seccion.id === seccionActiva;
                                return (
                                    <li className="nav-item" key={seccion.id}>
                                        <a
                                            className={activa ? 'nav-link active' : 'nav-link'}
                                            href={'#' + seccion.id}
                                            aria-current={activa ? 'location' : undefined}
                                            onClick={cerrar}
                                        >
                                            {seccion.texto}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default BarraNavegacion;
