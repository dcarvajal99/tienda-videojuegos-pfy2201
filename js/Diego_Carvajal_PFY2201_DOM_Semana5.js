/* =============================================================================
   PixelPlay Store — JavaScript de la página
   Asignatura : Desarrollo Frontend I (PFY2201)
   Actividad  : Exp 2 · Semana 5 — "Manipulando el DOM con JavaScript para mejorar la interactividad"
   Autor      : Diego Carvajal

   Qué hace este archivo:
     - Carga el catálogo desde data/catalogo.json con la Fetch API y construye
       los filtros y las tarjetas creando elementos del DOM.
     - Consulta el valor del dólar en la API pública de mindicador.cl.
     - Responde a click (filtros, Consultar, Reintentar y Ver todos los juegos),
       a mouseover (resaltar una tarjeta) y a submit (validar el formulario de
       contacto).
     - Conserva el ajuste del carrusel de la Semana 4 (pausa y alto estable).

   Mapa del archivo, con el paso de la actividad que resuelve cada sección:
      1. Constantes y referencias al DOM
      2. Arranque y registro de eventos ........ Paso 2
      3. Utilidades reutilizables .............. Pasos 1 y 4
      4. Carga de datos con Fetch API .......... Pasos 2 y 3
      5. Construcción del catálogo ............. Paso 1
      6. Filtros por categoría (click) ......... Pasos 1 y 2
      7. Consultar por un juego (click) ........ Paso 2
      8. Resaltado de tarjetas (mouseover) ..... Paso 2
      9. Validación del formulario (submit) .... Pasos 1 y 2
     10. Carrusel de destacados (Semana 4)

   Flujo al cargar la página: iniciarPagina() activa el carrusel, registra los
   eventos y pide, por separado, el catálogo y el dólar.

   Regla de seguridad: los textos que llegan del JSON, de la API o de lo que
   escribe el usuario se insertan siempre con textContent, propiedades o
   setAttribute, nunca como HTML. Así ningún dato puede inyectar etiquetas.
   ========================================================================== */

'use strict';


// ===== 1. Constantes y referencias al DOM =====

const URL_CATALOGO = 'data/catalogo.json';
const URL_DOLAR = 'https://mindicador.cl/api/dolar';
const URL_PUBLICADA = 'https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/';
const TODAS = 'Todas';
const CAMPOS_VALIDADOS = ['nombre', 'correo', 'telefono', 'mensaje'];
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PATRON_TELEFONO = /^(\+?56)?\d{9}$/;   // se aplica después de quitar espacios y guiones

// Elementos de index.html que el script lee o modifica
const contenido = document.getElementById('contenido');
const tituloCatalogo = document.getElementById('titulo-catalogo');
const bloqueFiltros = document.getElementById('bloqueFiltros');
const filtrosCategorias = document.getElementById('filtrosCategorias');
const indicadorCarga = document.getElementById('indicadorCarga');
const resumenCatalogo = document.getElementById('resumenCatalogo');
const estadoCatalogo = document.getElementById('estadoCatalogo');
const listaJuegos = document.getElementById('listaJuegos');
const referenciaDolar = document.getElementById('referenciaDolar');
const formulario = document.getElementById('formularioContacto');
const campoJuego = document.getElementById('juego');
const sugerenciasJuegos = document.getElementById('catalogoJuegos');
const mensajeFormulario = document.getElementById('mensajeFormulario');

// Datos del catálogo una vez cargados; los usan los filtros y el resumen
let catalogo = { categorias: [], juegos: [] };

// Intentos fallidos seguidos de cargar el catálogo; se muestran en el aviso
let intentosFallidos = 0;


// ===== 2. Arranque y registro de eventos =====

// iniciarPagina()
// Punto de entrada: activa el carrusel, conecta los eventos y pide los datos.
// El catálogo y el dólar se cargan por separado: si uno falla, el otro sigue.
function iniciarPagina() {
    iniciarCarrusel();
    registrarEventos();
    cargarCatalogo();
    cargarDolar();
}

// registrarEventos()
// Conecta en un solo lugar los eventos del catálogo y del formulario (los del
// carrusel se registran dentro de iniciarCarrusel()). Varios usan delegación:
// el evento se escucha en un contenedor que existe desde el principio y sirve
// también para los botones y tarjetas que el script crea después.
function registrarEventos() {
    // click: filtros por categoría, botones Consultar y botones de los avisos
    filtrosCategorias.addEventListener('click', manejarClicFiltro);
    contenido.addEventListener('click', prellenarConsulta);
    estadoCatalogo.addEventListener('click', manejarClicEstado);

    // mouseover y mouseout resaltan la tarjeta bajo el puntero; focusin y
    // focusout hacen lo mismo con el teclado, con las mismas funciones
    listaJuegos.addEventListener('mouseover', resaltarTarjeta);
    listaJuegos.addEventListener('mouseout', quitarResaltado);
    listaJuegos.addEventListener('focusin', resaltarTarjeta);
    listaJuegos.addEventListener('focusout', quitarResaltado);

    // submit: el script valida con sus propios mensajes en lugar de los del
    // navegador; input corrige los mensajes mientras se escribe y reset los borra
    formulario.noValidate = true;
    formulario.addEventListener('submit', validarFormulario);
    formulario.addEventListener('input', revalidarCampo);
    formulario.addEventListener('reset', limpiarFormulario);
}


// ===== 3. Utilidades reutilizables =====

// crearElemento(etiqueta, clases, texto)
// Crea un elemento con createElement y le asigna sus clases y, si se indica,
// su texto. Evita repetir estas líneas en cada parte que arma contenido.
function crearElemento(etiqueta, clases, texto) {
    const elemento = document.createElement(etiqueta);
    if (clases) {
        elemento.className = clases;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// crearBoton(id, texto)
// Crea un botón de Bootstrap con un id, para los avisos que genera el script.
function crearBoton(id, texto) {
    const boton = crearElemento('button', 'btn btn-outline-dark btn-sm', texto);
    boton.type = 'button';
    boton.id = id;
    return boton;
}

// crearAviso(clasesExtra)
// Crea el recuadro gris de los avisos (error, categoría vacía y resumen de la
// consulta). Las clases extra ajustan sus márgenes.
function crearAviso(clasesExtra) {
    let clases = 'alert bg-body-tertiary border';
    if (clasesExtra) {
        clases += ' ' + clasesExtra;
    }
    return crearElemento('div', clases);
}

// crearParrafoContacto(clases, textoAntes, textoEnlace)
// Arma un párrafo que termina en un enlace al formulario de contacto. Une el
// texto y el enlace con appendChild en vez de escribir HTML.
function crearParrafoContacto(clases, textoAntes, textoEnlace) {
    const parrafo = crearElemento('p', clases);
    const enlace = crearElemento('a', '', textoEnlace);
    enlace.href = '#contacto';
    parrafo.appendChild(document.createTextNode(textoAntes));
    parrafo.appendChild(enlace);
    parrafo.appendChild(document.createTextNode('.'));
    return parrafo;
}

// vaciarElemento(elemento)
// Elimina uno a uno los hijos de un elemento con remove().
function vaciarElemento(elemento) {
    while (elemento.firstChild) {
        elemento.firstChild.remove();
    }
}

// formatearPesos(valor)
// Da formato chileno a un monto entero: 59990 se muestra como $59.990.
function formatearPesos(valor) {
    return '$' + valor.toLocaleString('es-CL');
}


// ===== 4. Carga de datos con Fetch API (Pasos 2 y 3) =====

// obtenerJSON(url)
// Única función que usa fetch. Devuelve una promesa que se cumple con los
// datos ya convertidos desde JSON, o que se rechaza si la carga falla.
function obtenerJSON(url) {
    return fetch(url).then((respuesta) => {
        // fetch solo rechaza si no hubo respuesta (red caída, CORS o file://).
        // Un 404 o un 500 llegan como respuesta: hay que convertirlos en error.
        if (!respuesta.ok) {
            throw new Error('La petición a ' + url + ' respondió ' + respuesta.status);
        }
        return respuesta.json(); // un JSON mal escrito también rechaza esta promesa
    });
}

// cargarCatalogo()
// Pide data/catalogo.json y encadena las promesas: then construye el catálogo,
// catch muestra el aviso de error y finally oculta el indicador de carga.
function cargarCatalogo() {
    mostrarCargando();
    obtenerJSON(URL_CATALOGO)
        .then(iniciarCatalogo)
        .catch(mostrarErrorCatalogo)
        .finally(ocultarCargando);   // pase lo que pase, el indicador se oculta
}

// mostrarCargando()
// Prepara el estado de carga: quita el párrafo de respaldo o un aviso anterior,
// vacía la cuadrícula, oculta los filtros y muestra el indicador.
function mostrarCargando() {
    vaciarElemento(estadoCatalogo);
    vaciarElemento(listaJuegos);
    bloqueFiltros.hidden = true;
    indicadorCarga.hidden = false;
    resumenCatalogo.textContent = 'Cargando catálogo…';
}

// ocultarCargando()
// Oculta el indicador de carga, tanto si la carga resultó como si falló.
function ocultarCargando() {
    indicadorCarga.hidden = true;
}

// mostrarErrorCatalogo(error)
// Se ejecuta en el catch: deja el detalle en la consola y muestra en la página
// un aviso comprensible, sin filtros ni tarjetas a medio construir.
function mostrarErrorCatalogo(error) {
    console.error('No se pudo cargar el catálogo:', error);
    // Si falló a mitad de construirlo, también se quitan los filtros y las
    // sugerencias del formulario que ya se habían creado
    catalogo = { categorias: [], juegos: [] };
    vaciarElemento(listaJuegos);
    vaciarElemento(filtrosCategorias);
    vaciarElemento(sugerenciasJuegos);
    vaciarElemento(estadoCatalogo);
    bloqueFiltros.hidden = true;
    // Sin conexión, un reintento falla al instante y la página quedaría igual:
    // desde el segundo intento el mensaje dice cuál es, así se nota (y se anuncia)
    intentosFallidos++;
    let mensaje = 'No pudimos cargar el catálogo.';
    if (intentosFallidos > 1) {
        mensaje = 'No pudimos cargar el catálogo (intento ' + intentosFallidos + ').';
    }
    resumenCatalogo.textContent = mensaje;
    estadoCatalogo.appendChild(crearAvisoError(mensaje));
}

// crearAvisoError(mensaje)
// Arma el aviso de error con el mensaje recibido. Si la página se abrió como
// archivo (file://), el navegador nunca permitirá leer el JSON: en vez de
// Reintentar ofrece la versión publicada.
function crearAvisoError(mensaje) {
    const aviso = crearAviso();
    aviso.appendChild(crearElemento('p', 'fw-semibold mb-2', mensaje));
    if (location.protocol === 'file:') {
        aviso.appendChild(crearElemento('p', 'mb-3',
            'Abriste la página como archivo (file://) y el navegador no permite que lea ' +
            'data/catalogo.json de esa forma. Mírala en la versión publicada o ábrela con ' +
            'un servidor local (python3 -m http.server).'));
        const enlace = crearElemento('a', 'btn btn-outline-dark btn-sm', 'Ver la versión publicada');
        enlace.href = URL_PUBLICADA;
        aviso.appendChild(enlace);
    } else {
        aviso.appendChild(crearParrafoContacto('mb-3',
            'Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, escríbenos desde el ',
            'formulario de contacto'));
        aviso.appendChild(crearBoton('botonReintentar', 'Reintentar'));
    }
    return aviso;
}

// manejarClicEstado(evento)
// click delegado en los avisos del catálogo: sus botones no existen al cargar
// la página, así que se reconocen por su id al momento del clic.
function manejarClicEstado(evento) {
    if (evento.target.closest('#botonReintentar')) {
        reintentarCarga();
    } else if (evento.target.closest('#botonVerTodos')) {
        verTodosLosJuegos();
    }
}

// reintentarCarga()
// Vuelve a pedir el catálogo. Antes lleva el foco al título, porque el botón
// que se acaba de pulsar va a desaparecer y el foco no debe perderse.
function reintentarCarga() {
    tituloCatalogo.focus();
    cargarCatalogo();
}

// cargarDolar()
// Segunda fuente externa, independiente del catálogo: el valor del dólar
// observado desde la API pública mindicador.cl.
function cargarDolar() {
    obtenerJSON(URL_DOLAR)
        .then(mostrarDolar)
        .catch(mostrarDolarNoDisponible);
}

// mostrarDolar(datos)
// Lee el valor más reciente de la serie (el primero) y lo muestra con su fecha.
// Si la respuesta no trae lo esperado, lanza un error que atrapa el catch.
function mostrarDolar(datos) {
    const ultimo = Array.isArray(datos.serie) ? datos.serie[0] : undefined;
    if (!ultimo || typeof ultimo.valor !== 'number' || isNaN(Date.parse(ultimo.fecha))) {
        throw new Error('mindicador.cl respondió con un formato inesperado');
    }
    // La fecha llega en hora UTC: se muestra según la hora de Chile
    const fecha = new Date(ultimo.fecha).toLocaleDateString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago'
    });
    referenciaDolar.textContent = 'Precios en pesos chilenos. Referencia: US$ 1 = ' +
        formatearPesos(Math.round(ultimo.valor)) + ' (dólar observado del ' + fecha + ', vía mindicador.cl).';
    referenciaDolar.hidden = false;
}

// mostrarDolarNoDisponible(error)
// Si la API no responde bien, lo avisa en una línea sin tocar el catálogo.
function mostrarDolarNoDisponible(error) {
    console.warn('No se pudo leer el dólar de mindicador.cl:', error);
    referenciaDolar.textContent = 'Precios en pesos chilenos. La referencia del dólar no está disponible en este momento.';
    referenciaDolar.hidden = false;
}


// ===== 5. Construcción del catálogo en el DOM (Paso 1) =====

// iniciarCatalogo(datos)
// Se ejecuta en el then con los datos del JSON. Comprueba su formato, guarda
// los datos y construye filtros, sugerencias del formulario y tarjetas.
function iniciarCatalogo(datos) {
    if (!datos || !Array.isArray(datos.categorias) || !Array.isArray(datos.juegos)) {
        throw new Error('data/catalogo.json no tiene el formato esperado');
    }
    catalogo = datos;
    crearFiltros(catalogo.categorias, catalogo.juegos);
    llenarSugerencias(catalogo.juegos);
    aplicarFiltro(TODAS);
    intentosFallidos = 0;   // solo cuando el catálogo quedó construido entero
}

// mostrarJuegos(juegos, categoria)
// Único camino para dibujar la cuadrícula: elimina las tarjetas anteriores y
// agrega una por juego con appendChild. Si no hay juegos, muestra un aviso.
function mostrarJuegos(juegos, categoria) {
    vaciarElemento(listaJuegos);
    vaciarElemento(estadoCatalogo);
    juegos.forEach((juego) => {
        listaJuegos.appendChild(crearTarjeta(juego));
    });
    if (juegos.length === 0) {
        estadoCatalogo.appendChild(crearEstadoVacio(categoria));
    }
    actualizarResumen(juegos.length, categoria);
}

// crearTarjeta(juego)
// Arma la tarjeta de un juego con createElement y appendChild, con las mismas
// clases de Bootstrap que tenían las tarjetas escritas a mano en la Semana 4.
// Todo texto del JSON entra con textContent o como propiedad.
function crearTarjeta(juego) {
    const columna = crearElemento('div', 'col-12 col-md-6 col-xl-4');
    const tarjeta = crearElemento('article', 'card h-100');

    // loading, width y height antes que src: la portada se descarga en diferido
    // y su espacio queda reservado, así la página no salta al llegar
    const imagen = crearElemento('img', 'card-img-top h-auto');
    imagen.setAttribute('loading', 'lazy');
    imagen.width = 1024;
    imagen.height = 1024;
    imagen.src = juego.imagen;
    imagen.alt = 'Portada del videojuego ' + juego.titulo;

    const cuerpo = crearElemento('div', 'card-body');
    cuerpo.appendChild(crearElemento('p', 'small text-uppercase fw-semibold text-body-secondary mb-2', juego.categoria));
    cuerpo.appendChild(crearElemento('h3', 'card-title h6', juego.titulo));
    cuerpo.appendChild(crearElemento('p', 'card-text small text-body-secondary',
        juego.descripcion + ' Desarrollado por ' + juego.desarrollador + '.'));

    const pie = crearElemento('footer', 'card-footer bg-transparent d-flex align-items-center justify-content-between gap-2');
    pie.appendChild(crearElemento('p', 'fw-semibold mb-0', formatearPesos(juego.precio)));
    const consultar = crearElemento('a', 'btn btn-outline-dark btn-sm', 'Consultar');
    consultar.href = '#contacto';
    consultar.setAttribute('aria-label', 'Consultar por ' + juego.titulo);
    consultar.dataset.juego = juego.titulo;   // lo lee prellenarConsulta()
    pie.appendChild(consultar);

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(cuerpo);
    tarjeta.appendChild(pie);
    columna.appendChild(tarjeta);
    return columna;
}

// actualizarResumen(cantidad, categoria)
// Escribe cuántos juegos se están mostrando. Como el párrafo es una región
// role="status", los lectores de pantalla lo anuncian al cambiar.
function actualizarResumen(cantidad, categoria) {
    let texto = 'Mostrando ' + cantidad + ' de ' + catalogo.juegos.length + ' juegos';
    if (categoria !== TODAS) {
        texto += ' en ' + categoria;
    }
    resumenCatalogo.textContent = texto + '.';
}

// crearEstadoVacio(categoria)
// Aviso para una categoría sin productos, con un botón para volver a verlos
// todos. Si el catálogo completo estuviera vacío, el botón no tendría sentido.
function crearEstadoVacio(categoria) {
    const aviso = crearAviso();
    const conBoton = categoria !== TODAS;
    if (conBoton) {
        aviso.appendChild(crearElemento('p', 'mb-2', 'Todavía no hay productos en ' + categoria + '.'));
    } else {
        aviso.appendChild(crearElemento('p', 'mb-2', 'Todavía no hay juegos publicados en el catálogo.'));
    }
    aviso.appendChild(crearParrafoContacto(conBoton ? 'mb-3' : 'mb-0',
        '¿Buscas algo en particular? ', 'Pregúntanos en el formulario de contacto'));
    if (conBoton) {
        aviso.appendChild(crearBoton('botonVerTodos', 'Ver todos los juegos'));
    }
    return aviso;
}

// llenarSugerencias(juegos)
// Crea una opción por juego en la lista de sugerencias del campo «Juego de
// interés», que antes estaba escrita a mano en el HTML.
function llenarSugerencias(juegos) {
    vaciarElemento(sugerenciasJuegos);
    juegos.forEach((juego) => {
        const opcion = document.createElement('option');
        opcion.value = juego.titulo;
        sugerenciasJuegos.appendChild(opcion);
    });
}


// ===== 6. Filtros por categoría: evento click (Pasos 1 y 2) =====

// crearFiltros(categorias, juegos)
// Crea un botón por categoría, más «Todas», cada uno con la cantidad de juegos
// que muestra, y hace visible el bloque de filtros.
function crearFiltros(categorias, juegos) {
    vaciarElemento(filtrosCategorias);
    [TODAS].concat(categorias).forEach((categoria) => {
        const cantidad = filtrarJuegos(juegos, categoria).length;
        filtrosCategorias.appendChild(crearBotonFiltro(categoria, cantidad));
    });
    bloqueFiltros.hidden = false;
}

// crearBotonFiltro(categoria, cantidad)
// Arma un filtro: li > button con la categoría y un badge con la cantidad.
// aria-pressed indica a los lectores de pantalla si está activo.
function crearBotonFiltro(categoria, cantidad) {
    const item = document.createElement('li');
    const boton = crearElemento('button', 'btn btn-outline-dark btn-sm', categoria + ' ');
    boton.type = 'button';
    boton.dataset.categoria = categoria;
    boton.setAttribute('aria-pressed', 'false');
    boton.appendChild(crearElemento('span', 'badge text-bg-light border fw-normal', String(cantidad)));
    item.appendChild(boton);
    return item;
}

// filtrarJuegos(juegos, categoria)
// Devuelve los juegos de una categoría, o todos. La usan los filtros al
// dibujar y los botones para calcular sus cantidades.
function filtrarJuegos(juegos, categoria) {
    if (categoria === TODAS) {
        return juegos;
    }
    return juegos.filter((juego) => juego.categoria === categoria);
}

// manejarClicFiltro(evento)
// click delegado en la lista de filtros: identifica el botón pulsado, aunque
// el clic caiga sobre el número del badge, y aplica su categoría.
function manejarClicFiltro(evento) {
    const boton = evento.target.closest('button[data-categoria]');
    if (boton) {
        aplicarFiltro(boton.dataset.categoria);
    }
}

// aplicarFiltro(categoria)
// Marca el filtro elegido y vuelve a dibujar la cuadrícula solo con sus juegos.
function aplicarFiltro(categoria) {
    marcarFiltroActivo(categoria);
    mostrarJuegos(filtrarJuegos(catalogo.juegos, categoria), categoria);
}

// marcarFiltroActivo(categoria)
// Cambia el estilo de los botones con classList: el activo queda relleno y
// su aria-pressed pasa a true; los demás vuelven al contorno.
function marcarFiltroActivo(categoria) {
    filtrosCategorias.querySelectorAll('button[data-categoria]').forEach((boton) => {
        const activo = boton.dataset.categoria === categoria;
        boton.classList.toggle('active', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
}

// verTodosLosJuegos()
// Botón del aviso de categoría vacía. El foco pasa a «Todas» antes de que el
// aviso, con el botón pulsado, se elimine.
function verTodosLosJuegos() {
    filtrosCategorias.querySelector('button[data-categoria="' + TODAS + '"]').focus();
    aplicarFiltro(TODAS);
}


// ===== 7. Consultar por un juego: evento click (Paso 2) =====

// prellenarConsulta(evento)
// click delegado en el contenido principal: sirve para los Consultar del
// carrusel y de las tarjetas. Copia el título del juego en el formulario; el
// enlace sigue su camino normal y lleva a la sección Contacto.
function prellenarConsulta(evento) {
    const enlace = evento.target.closest('a[data-juego]');
    if (enlace) {
        campoJuego.value = enlace.dataset.juego;
        vaciarElemento(mensajeFormulario);   // empieza una consulta nueva
    }
}


// ===== 8. Resaltado de tarjetas: evento mouseover (Paso 2) =====

// resaltarTarjeta(evento)
// Con mouseover (puntero) o focusin (teclado) pinta con el acento el borde de
// la tarjeta sobre la que está el usuario, agregando una clase.
function resaltarTarjeta(evento) {
    const tarjeta = evento.target.closest('.card');
    if (tarjeta) {
        tarjeta.classList.add('tarjeta-resaltada');
    }
}

// quitarResaltado(evento)
// Con mouseout o focusout quita la clase. relatedTarget es el elemento al que
// pasa el puntero o el foco: si sigue dentro de la misma tarjeta (por ejemplo,
// de la imagen al texto), el resaltado se mantiene.
function quitarResaltado(evento) {
    const tarjeta = evento.target.closest('.card');
    if (tarjeta && !tarjeta.contains(evento.relatedTarget)) {
        tarjeta.classList.remove('tarjeta-resaltada');
    }
}


// ===== 9. Validación del formulario: evento submit (Pasos 1 y 2) =====

// validarFormulario(evento)
// Se ejecuta al enviar. preventDefault() evita que la página se recargue; si
// hay errores, los muestra y lleva el foco al primero; si no, resume la consulta.
function validarFormulario(evento) {
    evento.preventDefault();
    vaciarElemento(mensajeFormulario);
    let primerInvalido = null;
    CAMPOS_VALIDADOS.forEach((id) => {
        const campo = document.getElementById(id);
        if (!validarCampo(campo) && !primerInvalido) {
            primerInvalido = campo;
        }
    });
    if (primerInvalido) {
        // Si se envió con Enter desde ese mismo campo, ya tiene el foco y focus()
        // no haría nada: se quita y se devuelve para que el lector de pantalla
        // vuelva a anunciar el campo, ahora con su mensaje de error
        if (document.activeElement === primerInvalido) {
            primerInvalido.blur();
        }
        primerInvalido.focus();
        return;
    }
    // Orden obligatorio: reset() dispara el evento reset, y limpiarFormulario()
    // borraría un resumen creado antes. Primero se leen los datos, luego se
    // limpia el formulario y al final se muestra el resumen.
    const consulta = leerConsulta();
    formulario.reset();
    mostrarConfirmacion(consulta);
}

// validarCampo(campo)
// Revisa un campo y muestra o quita su mensaje. Devuelve true si está bien.
function validarCampo(campo) {
    const mensaje = mensajeDeError(campo);
    if (mensaje) {
        mostrarError(campo, mensaje);
        return false;
    }
    limpiarError(campo);
    return true;
}

// mensajeDeError(campo)
// Reúne las reglas de validación en un solo lugar. Devuelve el mensaje que
// corresponde al valor del campo, o un texto vacío si no hay error.
function mensajeDeError(campo) {
    const valor = campo.value.trim();
    switch (campo.id) {
        case 'nombre':
            if (valor.length < 2) {
                return 'Escribe tu nombre (al menos 2 caracteres).';
            }
            return '';
        case 'correo':
            if (valor === '') {
                return 'Escribe tu correo electrónico.';
            }
            // Además del patrón se respeta la validación del navegador para
            // type="email", que rechaza por ejemplo un punto final o una tilde
            if (!PATRON_CORREO.test(valor) || campo.validity.typeMismatch) {
                return 'Revisa el correo: debe tener la forma nombre@dominio.cl.';
            }
            return '';
        case 'telefono':
            // Es opcional: solo se revisa si se escribió algo
            if (valor !== '' && !PATRON_TELEFONO.test(valor.replace(/[\s-]/g, ''))) {
                return 'Escribe un teléfono de 9 dígitos, con o sin +56 (por ejemplo, +56 9 1234 5678), o déjalo vacío.';
            }
            return '';
        case 'mensaje':
            if (valor === '') {
                return 'Escribe tu consulta.';
            }
            if (valor.length < 10) {
                return 'Cuéntanos un poco más: al menos 10 caracteres.';
            }
            return '';
        default:
            return '';
    }
}

// mostrarError(campo, mensaje)
// Marca el campo con la clase is-invalid de Bootstrap (borde rojo), avisa a
// los lectores de pantalla con aria-invalid y escribe el mensaje bajo el campo.
function mostrarError(campo, mensaje) {
    campo.classList.add('is-invalid');
    campo.setAttribute('aria-invalid', 'true');
    document.getElementById('error-' + campo.id).textContent = mensaje;
}

// limpiarError(campo)
// Deshace lo que hace mostrarError().
function limpiarError(campo) {
    campo.classList.remove('is-invalid');
    campo.removeAttribute('aria-invalid');
    document.getElementById('error-' + campo.id).textContent = '';
}

// revalidarCampo(evento)
// input delegado en el formulario: mientras se escribe en un campo que ya
// tenía error, lo vuelve a revisar para quitar el mensaje apenas quede bien.
function revalidarCampo(evento) {
    if (evento.target.classList.contains('is-invalid')) {
        validarCampo(evento.target);
    }
}

// leerConsulta()
// Lee del DOM los datos del formulario y los devuelve en un objeto, con los
// textos tal como se ven en pantalla.
function leerConsulta() {
    const motivo = document.getElementById('motivo');
    const entrega = formulario.querySelector('input[name="entrega"]:checked');
    return {
        nombre: document.getElementById('nombre').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim() || 'No indicado',
        juego: campoJuego.value.trim() || 'No indicado',
        motivo: motivo.options[motivo.selectedIndex].text,
        entrega: entrega.labels[0].textContent,
        novedades: document.getElementById('novedades').checked ? 'Sí' : 'No'
    };
}

// mostrarConfirmacion(consulta)
// Crea el resumen de la consulta enviada y lo agrega bajo el formulario. Lo
// escrito por el usuario entra como texto: aunque contenga etiquetas, se
// muestra literal y no se interpreta como HTML.
function mostrarConfirmacion(consulta) {
    const aviso = crearAviso('mt-3 mb-0');
    aviso.appendChild(crearElemento('p', 'fw-semibold mb-2',
        'Gracias, ' + consulta.nombre + '. Este es el resumen de tu consulta:'));

    const lista = crearElemento('ul', 'list-group list-group-flush small mb-2');
    lista.appendChild(crearFilaResumen('Correo', consulta.correo));
    lista.appendChild(crearFilaResumen('Teléfono', consulta.telefono));
    lista.appendChild(crearFilaResumen('Juego de interés', consulta.juego));
    lista.appendChild(crearFilaResumen('Motivo', consulta.motivo));
    lista.appendChild(crearFilaResumen('Forma de entrega', consulta.entrega));
    lista.appendChild(crearFilaResumen('Novedades por correo', consulta.novedades));
    aviso.appendChild(lista);

    aviso.appendChild(crearElemento('p', 'small text-body-secondary mb-0',
        'Sitio de práctica: la consulta no se envía a ningún servidor.'));
    mensajeFormulario.appendChild(aviso);
}

// crearFilaResumen(etiqueta, valor)
// Una fila del resumen: la etiqueta en negrita y el valor como nodo de texto.
function crearFilaResumen(etiqueta, valor) {
    const fila = crearElemento('li', 'list-group-item bg-transparent px-0');
    fila.appendChild(crearElemento('strong', '', etiqueta + ': '));
    fila.appendChild(document.createTextNode(valor));
    return fila;
}

// limpiarFormulario()
// Se ejecuta con el evento reset (botón Limpiar o formulario.reset()): quita
// los mensajes de error y el resumen de una consulta anterior.
function limpiarFormulario() {
    CAMPOS_VALIDADOS.forEach((id) => {
        limpiarError(document.getElementById(id));
    });
    vaciarElemento(mensajeFormulario);
}


// ===== 10. Carrusel de destacados (Semana 4) =====

// iniciarCarrusel()
// Ajustes al carrusel de Bootstrap, trasladados sin cambios desde la Semana 4:
// 1) Alto estable, para que la página no salte al cambiar de diapositiva.
// 2) Rotación detenible. Bootstrap solo la detiene con el mouse encima; quien
//    navega con teclado o lector de pantalla también necesita poder pararla
//    (WCAG 2.2.2), y el enlace que tiene enfocado no debe desaparecer al
//    cambiar la diapositiva. Se detiene con el botón Pausar y mientras el
//    foco del teclado esté dentro del carrusel.
function iniciarCarrusel() {
    const elemento = document.getElementById('carruselDestacados');
    const boton = document.getElementById('botonPausa');
    if (!elemento || !boton || !window.bootstrap) return;

    // 1) Alto estable. Cada diapositiva mide distinto según cuántas líneas
    // ocupe su descripción en ese ancho de pantalla. El contenedor toma el
    // alto de la más alta y se recalcula cuando carga la tipografía y cuando
    // cambia el tamaño de la ventana.
    const interior = elemento.querySelector('.carousel-inner');
    const igualarAlto = () => {
        interior.style.minHeight = '';
        const altos = [...interior.children].map((item) => {
            const oculta = !item.classList.contains('active');
            if (oculta) item.style.display = 'block';
            const alto = item.offsetHeight;
            if (oculta) item.style.display = '';
            return alto;
        });
        interior.style.minHeight = `${Math.max(...altos)}px`;
    };
    igualarAlto();
    document.fonts.ready.then(igualarAlto);
    window.addEventListener('resize', igualarAlto);

    // 2) Rotación detenible. El carrusel avanza solo si nadie lo pausó y el
    // foco no está dentro. Quien pidió reducir el movimiento empieza en pausa.
    let pausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let focoDentro = false;
    let aplicado = null;

    // Recrea el carrusel con ride 'carousel' (avanza solo) o false (queda
    // quieto: ni el mouse ni las flechas lo vuelven a poner en marcha).
    // Solo actúa cuando el estado cambia.
    const aplicar = () => {
        const automatico = !pausado && !focoDentro;
        if (automatico === aplicado) return;

        // Recrearlo a mitad de un cambio de diapositiva dejaría dos activas
        // a la vez: se espera a que Bootstrap termine la transición.
        if (elemento.querySelector('.carousel-item-next, .carousel-item-prev')) {
            elemento.addEventListener('slid.bs.carousel', aplicar, { once: true });
            return;
        }

        const anterior = bootstrap.Carousel.getInstance(elemento);
        if (anterior) {
            // dispose() no detiene los temporizadores de la instancia: se
            // detienen antes, para que no queden corriendo sobre ella.
            anterior.pause();
            clearTimeout(anterior.touchTimeout);
            anterior.dispose();
        }
        new bootstrap.Carousel(elemento, { ride: automatico ? 'carousel' : false });
        aplicado = automatico;
    };

    // Pausa mientras el foco del teclado está dentro del carrusel
    elemento.addEventListener('focusin', () => {
        focoDentro = true;
        aplicar();
    });
    elemento.addEventListener('focusout', (evento) => {
        if (elemento.contains(evento.relatedTarget)) return;
        focoDentro = false;
        aplicar();
    });

    const actualizarBoton = () => {
        boton.textContent = pausado ? 'Reanudar' : 'Pausar';
    };

    aplicar();
    actualizarBoton();
    boton.hidden = false;

    boton.addEventListener('click', () => {
        pausado = !pausado;
        aplicar();
        actualizarBoton();
    });
}


// ===== Arranque =====
// El script se carga con defer: al llegar a esta línea el HTML ya está leído
// y Bootstrap ya está disponible.
iniciarPagina();
