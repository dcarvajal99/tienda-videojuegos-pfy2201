// Portada de un videojuego. Si la imagen no carga (por ejemplo, una dirección externa
// que dejó de existir), se reemplaza por la portada genérica. La usan las tarjetas y
// el carrito.
import { useState } from 'react';
import { rutaImagen, PORTADA_GENERICA } from '../utilidades/catalogo.js';

function ImagenJuego({ imagen, ...atributos }) {
    const [fallo, setFallo] = useState(false);

    return (
        <img
            src={fallo ? PORTADA_GENERICA : rutaImagen(imagen)}
            onError={() => setFallo(true)}
            {...atributos}
        />
    );
}

export default ImagenJuego;
