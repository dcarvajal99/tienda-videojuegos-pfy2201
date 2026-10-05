// Funciones reutilizables de formato y cálculo.
// Están fuera de los componentes para poder usarlas desde cualquiera de ellos.

const FORMATO_PESOS = new Intl.NumberFormat('es-CL');

// Convierte 59990 en "$59.990".
export function formatearPesos(valor) {
    return '$' + FORMATO_PESOS.format(valor);
}

// Precio que se le cobra al cliente: el de oferta si existe, si no el normal.
export function precioFinal(producto) {
    return producto.precioOferta ?? producto.precioNormal;
}

// Porcentaje de descuento redondeado; devuelve 0 cuando el producto no está en oferta.
export function calcularDescuento(producto) {
    if (!producto.precioOferta) return 0;
    return Math.round((1 - producto.precioOferta / producto.precioNormal) * 100);
}

// Recorta la descripción para que todas las tarjetas muestren un resumen parejo.
export function resumir(texto, limite = 110) {
    if (texto.length <= limite) return texto;
    const corte = texto.lastIndexOf(' ', limite);
    return texto.slice(0, corte > 0 ? corte : limite) + '…';
}

// Quita tildes y mayúsculas para que "yotei" encuentre "Ghost of Yōtei".
export function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
