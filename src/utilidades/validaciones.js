// Reglas de validación de los formularios. Cada función recibe los valores y devuelve
// un objeto con un mensaje por cada campo con problemas; vacío si todo está bien.

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LARGO_MENSAJE = { minimo: 10, maximo: 500 };

export function validarContacto({ nombre, email, mensaje }) {
    const errores = {};

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) errores.nombre = 'Escribe tu nombre.';
    else if (nombreLimpio.length < 3) errores.nombre = 'El nombre debe tener al menos 3 letras.';
    else if (!PATRON_NOMBRE.test(nombreLimpio)) errores.nombre = 'Usa solo letras y espacios.';

    const emailLimpio = email.trim();
    if (!emailLimpio) errores.email = 'Escribe tu correo.';
    else if (!PATRON_EMAIL.test(emailLimpio)) errores.email = 'Revisa el correo: debe tener la forma nombre@dominio.cl.';

    const mensajeLimpio = mensaje.trim();
    if (!mensajeLimpio) errores.mensaje = 'Escribe tu mensaje.';
    else if (mensajeLimpio.length < LARGO_MENSAJE.minimo) {
        errores.mensaje = 'El mensaje es muy corto: faltan ' + (LARGO_MENSAJE.minimo - mensajeLimpio.length) + ' caracteres.';
    } else if (mensajeLimpio.length > LARGO_MENSAJE.maximo) {
        errores.mensaje = 'El mensaje no puede pasar de ' + LARGO_MENSAJE.maximo + ' caracteres.';
    }

    return errores;
}

export const PRECIO = { minimo: 1000, maximo: 999990 };
export const LARGO_DESCRIPCION = { minimo: 10, maximo: 140 };

// Valida el formulario para agregar un videojuego. `nombresExistentes` evita repetir
// un juego que ya está en el catálogo (sin distinguir mayúsculas ni tildes).
export function validarVideojuego({ nombre, categoria, precio, descripcion, desarrollador, imagen }, nombresExistentes) {
    const errores = {};

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) errores.nombre = 'Escribe el nombre del juego.';
    else if (nombreLimpio.length < 2) errores.nombre = 'El nombre debe tener al menos 2 caracteres.';
    else if (nombresExistentes.includes(comparable(nombreLimpio))) errores.nombre = 'Ese juego ya está en el catálogo.';

    if (!categoria) errores.categoria = 'Elige una categoría.';

    const precioTexto = String(precio).trim();
    const valor = Number(precioTexto);
    if (!precioTexto) errores.precio = 'Escribe el precio.';
    else if (!Number.isInteger(valor)) errores.precio = 'El precio debe ser un número entero, sin puntos ni comas.';
    else if (valor < PRECIO.minimo || valor > PRECIO.maximo) {
        errores.precio = 'El precio debe estar entre $1.000 y $999.990.';
    }

    const descripcionLimpia = descripcion.trim();
    if (!descripcionLimpia) errores.descripcion = 'Escribe una descripción corta.';
    else if (descripcionLimpia.length < LARGO_DESCRIPCION.minimo) {
        errores.descripcion = 'La descripción es muy corta: faltan ' + (LARGO_DESCRIPCION.minimo - descripcionLimpia.length) + ' caracteres.';
    }

    if (desarrollador.trim().length > 60) errores.desarrollador = 'El desarrollador no puede pasar de 60 caracteres.';

    const imagenLimpia = imagen.trim();
    if (imagenLimpia && !esUrlSegura(imagenLimpia)) errores.imagen = 'La imagen debe ser una dirección que empiece con https://.';

    return errores;
}

// Texto sin tildes, mayúsculas ni espacios de más, para comparar nombres.
export function comparable(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function esUrlSegura(texto) {
    try {
        return new URL(texto).protocol === 'https:';
    } catch {
        return false;
    }
}
