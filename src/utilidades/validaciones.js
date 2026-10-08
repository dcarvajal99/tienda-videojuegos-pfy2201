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
