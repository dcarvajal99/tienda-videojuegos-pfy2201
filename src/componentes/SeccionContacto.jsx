// Sección de contacto: el formulario y los datos de la tienda. Desde 992 px quedan en
// dos columnas; en pantallas chicas, uno bajo el otro.
import FormularioContacto from './FormularioContacto.jsx';
import { TIENDA } from '../datos/tienda.js';

function SeccionContacto() {
    return (
        <section id="contacto" className="bg-white border-top" aria-labelledby="tituloContacto">
            <div className="container py-5">
                <h2 className="h3 mb-2" id="tituloContacto">Contacto</h2>
                <p className="text-secondary mb-4">
                    ¿Buscas un juego que no está en el catálogo o tienes una duda con tu compra? Escríbenos.
                </p>

                <div className="row g-4 g-lg-5">
                    <div className="col-lg-7">
                        <FormularioContacto />
                    </div>

                    <div className="col-lg-5">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="h6 mb-3">También puedes encontrarnos</h3>
                                <address className="mb-0">
                                    <dl className="small detalles mb-0">
                                        <dt>Dirección</dt>
                                        <dd>{TIENDA.direccion}, {TIENDA.ciudad}</dd>
                                        <dt>Atención</dt>
                                        <dd>{TIENDA.horario}</dd>
                                        <dt>Teléfono</dt>
                                        <dd><a href={TIENDA.telefonoEnlace}>{TIENDA.telefono}</a></dd>
                                        <dt>Correo</dt>
                                        <dd><a href={'mailto:' + TIENDA.correo}>{TIENDA.correo}</a></dd>
                                    </dl>
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default SeccionContacto;
