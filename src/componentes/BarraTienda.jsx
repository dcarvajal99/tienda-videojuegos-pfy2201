// Cabecera de la tienda. Recibe por props las unidades del carrito y las muestra
// en una insignia; es un componente de presentación, no guarda estado.
const RUTA_LOGO = import.meta.env.BASE_URL + 'img/logo-pixelplay-mono.svg';

function BarraTienda({ unidades }) {
    return (
        <header className="border-bottom bg-white">
            <div className="container d-flex align-items-center justify-content-between py-3">
                <a className="d-inline-flex text-decoration-none" href="#catalogo">
                    <img src={RUTA_LOGO} className="logo" width="146" height="44" alt="PixelPlay Store" />
                </a>

                <p className="mb-0 d-flex align-items-center gap-2">
                    <span className="text-secondary small">Carrito</span>
                    <span className="badge text-bg-dark">{unidades}</span>
                    <span className="visually-hidden">
                        {unidades === 1 ? 'producto en el carrito' : 'productos en el carrito'}
                    </span>
                </p>
            </div>
        </header>
    );
}

export default BarraTienda;
