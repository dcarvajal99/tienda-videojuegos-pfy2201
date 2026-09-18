/* =============================================================================
   PixelPlay Store — JavaScript de la página
   Asignatura : Desarrollo Frontend I (PFY2201)
   Actividad  : Exp 2 · Semana 6 — "Optimizando la lógica y rendimiento de una página web con JavaScript"
   Autor      : Diego Carvajal

   Qué hace este archivo:
     - Carga la lista de productos desde assets/js/productos.json con la Fetch
       API, la valida y construye filtros, tarjetas y sugerencias en el DOM.
     - Busca productos con el formulario de búsqueda (evento submit) y filtra
       por categoría desde los botones del catálogo o desde la barra.
     - Agrega productos al carrito (evento click) y muestra su resumen, con
       cantidades y total, en el área «Resumen del carrito».
     - Muestra el detalle de cada producto en un modal de Bootstrap.
     - Conserva lo de las semanas anteriores: dólar de mindicador.cl, resaltado
       de tarjetas, formulario de contacto validado y carrusel detenible.

   Mapa del archivo, con el apartado de la instrucción que resuelve cada sección:
      1. Constantes, estado y referencias ............ —
      2. Arranque (hoisting) y registro de eventos .... Eventos de usuario
      3. Utilidades reutilizables .................... Buenas prácticas
      4. Fetch API y gestión de errores .............. Fetch API · Gestión de errores
      5. Validación y construcción del catálogo ...... Fetch API · Manipulación del DOM
      6. Vista: filtros y búsqueda (submit) .......... Eventos · Manipulación del DOM
      7. Categorías de la barra (click) .............. Barra con categorías
      8. Carrito (click) ............................. Eventos · Manipulación del DOM
      9. Modal de detalle ............................ Componentes de Bootstrap
     10. Consultar por un juego (Semana 5)
     11. Resaltado de tarjetas (Semana 5)
     12. Validación del formulario de contacto (Semana 5)
     13. Carrusel de destacados (Semana 4)

   Optimizaciones: el catálogo se pide una sola vez y se inserta de una vez
   (DocumentFragment); filtrar y buscar solo muestran u ocultan tarjetas ya
   creadas; el carrito actualiza solo la fila cuya cantidad cambia, sin crear
   nodos; los textos de búsqueda se preparan al cargar; los eventos se escuchan
   por delegación, así que su número no depende de la cantidad de productos.

   Regla de seguridad: los textos que llegan del JSON, de la API o de lo que
   escribe el usuario se insertan siempre con textContent, propiedades o
   setAttribute, nunca como HTML. Así ningún dato puede inyectar etiquetas.
   ========================================================================== */

'use strict';


// ===== 1. Constantes, estado y referencias =====
// Todas las constantes y variables de nivel superior van aquí, antes de la
// llamada a iniciarPagina() de la sección 2 (ver la nota de hoisting).

const URL_CATALOGO = 'assets/js/productos.json';
const URL_DOLAR = 'https://mindicador.cl/api/dolar';
const URL_PUBLICADA = 'https://dcarvajal99.github.io/tienda-videojuegos-pfy2201/';
const TODAS = 'Todas';
const TIEMPO_MAXIMO = 8000;                              // ms antes de abandonar una petición
const CLAVE_CARRITO = 'pixelplay-carrito';               // clave en localStorage
const CANTIDAD_MAXIMA = 10;                              // unidades por producto
const PATRON_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PATRON_IMAGEN = /^assets\/img\/[a-z0-9-]+\.jpg$/;
const FORMATO_PESOS = new Intl.NumberFormat('es-CL');    // se crea una sola vez y se reutiliza
const MENSAJES_ERROR = {
    tiempo: 'El catálogo está tardando demasiado en responder',
    red: 'No pudimos conectarnos para cargar el catálogo',
    http: 'No pudimos cargar el catálogo',
    formato: 'El catálogo llegó con datos que no podemos mostrar'
};
const CAMPOS_VALIDADOS = ['nombre', 'correo', 'telefono', 'mensaje'];
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PATRON_TELEFONO = /^(\+?56)?\d{9}$/;   // se aplica después de quitar espacios y guiones

// Elementos de index.html que el script lee o modifica
const contenido = document.getElementById('contenido');
const barraNavegacion = document.getElementById('barraNavegacion');
const menuPrincipal = document.getElementById('menuPrincipal');
const enlaceCarrito = document.getElementById('enlaceCarrito');
const contadorCarrito = document.getElementById('contadorCarrito');
const cantidadCarrito = document.getElementById('cantidadCarrito');
const textoContador = document.getElementById('textoContador');
const tituloCatalogo = document.getElementById('titulo-catalogo');
const formularioBusqueda = document.getElementById('formularioBusqueda');
const campoBusqueda = document.getElementById('campoBusqueda');
const bloqueFiltros = document.getElementById('bloqueFiltros');
const filtrosCategorias = document.getElementById('filtrosCategorias');
const indicadorCarga = document.getElementById('indicadorCarga');
const resumenCatalogo = document.getElementById('resumenCatalogo');
const estadoCatalogo = document.getElementById('estadoCatalogo');
const notaOrigen = document.getElementById('notaOrigen');
const listaProductos = document.getElementById('listaProductos');
const referenciaDolar = document.getElementById('referenciaDolar');
const tituloCarrito = document.getElementById('titulo-carrito');
const respaldoCarrito = document.getElementById('respaldoCarrito');
const estadoCarrito = document.getElementById('estadoCarrito');
const listaCarrito = document.getElementById('listaCarrito');
const controlesCarrito = document.getElementById('controlesCarrito');
const unidadesCarrito = document.getElementById('unidadesCarrito');
const totalCarrito = document.getElementById('totalCarrito');
const botonFinalizar = document.getElementById('botonFinalizar');
const botonVaciar = document.getElementById('botonVaciar');
const mensajeCarrito = document.getElementById('mensajeCarrito');
const modalProducto = document.getElementById('modalProducto');
const tituloModalProducto = document.getElementById('tituloModalProducto');
const cuerpoModalProducto = document.getElementById('cuerpoModalProducto');
const botonAgregarModal = document.getElementById('botonAgregarModal');
const formulario = document.getElementById('formularioContacto');
const campoJuego = document.getElementById('juego');
const sugerenciasJuegos = document.getElementById('catalogoJuegos');
const mensajeFormulario = document.getElementById('mensajeFormulario');

// Estado de la página
let catalogo = { categorias: [], productos: [] };
let productosPorId = new Map();        // id → producto (carrito, modal y validación de clics)
let filasCarrito = new Map();          // id → { fila, textoDetalle, textoSubtotal, restar, sumar, cantidad }
let vista = { categoria: TODAS, busqueda: '' };
let carrito = [];                      // [{ id, cantidad }] en orden de llegada
let intentosFallidos = 0;
let cargandoCatalogo = false;          // evita dos cargas a la vez (doble clic en Reintentar)
let catalogoDesdeCopia = false;        // true si se leyó la copia publicada (file://)
let idPendienteModal = '';             // producto a agregar cuando el modal termine de cerrarse


// ===== 2. Arranque (hoisting) y registro de eventos =====

// Hoisting: esta llamada está antes de las funciones que usa. Las declaraciones
// function se elevan al inicio del script y se pueden llamar desde aquí; las
// constantes y variables (const/let) no, y por eso están todas arriba, en la
// sección 1. Ordena el archivo por tema, con el arranque a la vista; no cambia
// el rendimiento.
iniciarPagina();

// iniciarPagina()
// Punto de entrada: activa el carrusel y el carrito, conecta los eventos y pide
// los datos. El catálogo y el dólar se cargan por separado: si uno falla, el
// otro sigue.
function iniciarPagina() {
    iniciarCarrusel();
    iniciarCarrito();
    registrarEventos();
    cargarCatalogo();
    cargarDolar();
}

// registrarEventos()
// Conecta en un solo lugar los eventos de la página (los del carrusel se
// registran dentro de iniciarCarrusel()). Casi todos usan delegación: el evento
// se escucha en un contenedor que existe desde el principio y sirve para los
// botones que el script crea después, así que la cantidad de escuchas no crece
// con la cantidad de productos.
function registrarEventos() {
    // click: categorías y Carrito de la barra, y todos los «Agregar al carrito»
    barraNavegacion.addEventListener('click', manejarClicNavegacion);
    document.addEventListener('click', manejarClicAgregar);

    // submit: buscar sin recargar la página; reset e input limpian la búsqueda
    formularioBusqueda.addEventListener('submit', buscarProductos);
    formularioBusqueda.addEventListener('reset', limpiarBusqueda);
    campoBusqueda.addEventListener('input', revisarBusquedaVacia);

    // click: filtros, avisos del catálogo y Consultar del carrusel
    filtrosCategorias.addEventListener('click', manejarClicFiltro);
    estadoCatalogo.addEventListener('click', manejarClicEstado);
    contenido.addEventListener('click', prellenarConsulta);

    // mouseover y mouseout resaltan la tarjeta bajo el puntero; focusin y
    // focusout hacen lo mismo con el teclado, con las mismas funciones
    listaProductos.addEventListener('mouseover', resaltarTarjeta);
    listaProductos.addEventListener('mouseout', quitarResaltado);
    listaProductos.addEventListener('focusin', resaltarTarjeta);
    listaProductos.addEventListener('focusout', quitarResaltado);

    // click: botones −, + y Quitar de cada fila, Vaciar y Finalizar compra
    listaCarrito.addEventListener('click', manejarClicCarrito);
    botonVaciar.addEventListener('click', vaciarCarrito);
    botonFinalizar.addEventListener('click', finalizarCompra);

    // Eventos del modal de Bootstrap: llenarlo al abrir, soltar el foco al
    // cerrar y agregar lo pendiente cuando ya terminó de cerrarse
    modalProducto.addEventListener('show.bs.modal', prepararModalProducto);
    modalProducto.addEventListener('hide.bs.modal', soltarFocoModal);
    document.addEventListener('hidden.bs.modal', alCerrarModal);

    // submit del formulario de contacto (Semana 5): mensajes propios en vez de
    // los del navegador; input corrige mientras se escribe y reset los borra
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
// Quita todos los hijos de un elemento de una vez con replaceChildren(): el
// navegador registra un solo cambio en lugar de uno por hijo.
function vaciarElemento(elemento) {
    elemento.replaceChildren();
}

// formatearPesos(valor)
// Da formato chileno a un monto entero: 59990 se muestra como $59.990. Usa un
// formateador creado una sola vez (FORMATO_PESOS) en lugar de uno por llamada.
function formatearPesos(valor) {
    return '$' + FORMATO_PESOS.format(valor);
}

// pluralizar(cantidad, singular, plural)
// Devuelve la cantidad con la palabra en singular o plural: «1 unidad»,
// «3 unidades», «1 producto».
function pluralizar(cantidad, singular, plural) {
    return cantidad + ' ' + (cantidad === 1 ? singular : plural);
}

// normalizarTexto(texto)
// Prepara un texto para comparar: sin tildes (normalize separa la letra de su
// marca y la expresión regular quita la marca), en minúsculas, sin apóstrofos y
// con cualquier otro signo cambiado por un espacio. «Marvel's Spider-Man 2»
// queda como «marvels spider man 2».
function normalizarTexto(texto) {
    return String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['’`´]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

// textoValido(valor)
// true si el valor es un texto con algo más que espacios.
function textoValido(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}


// ===== 4. Fetch API y gestión de errores =====

// obtenerJSON(url)
// Única función que usa fetch. Devuelve una promesa con los datos ya convertidos
// desde JSON. Si la respuesta tarda más de TIEMPO_MAXIMO, AbortController cancela
// la petición; todo error sale clasificado (tiempo, red, http o formato) para
// mostrar un mensaje que explique lo que pasó.
function obtenerJSON(url) {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO);
    return fetch(url, { signal: controlador.signal })
        .then((respuesta) => {
            // Un 404 o un 500 llegan como respuesta: hay que convertirlos en error
            if (!respuesta.ok) {
                throw crearErrorCarga('http', 'La petición a ' + url + ' respondió ' + respuesta.status);
            }
            return respuesta.json();   // un JSON mal escrito rechaza esta promesa
        })
        .catch((error) => {
            throw clasificarError(error);
        })
        .finally(() => clearTimeout(temporizador));
}

// crearErrorCarga(tipo, detalle)
// Crea un Error con el detalle técnico y una propiedad tipo que decide el
// mensaje que se muestra en la página.
function crearErrorCarga(tipo, detalle) {
    const error = new Error(detalle);
    error.tipo = tipo;
    return error;
}

// clasificarError(error)
// Da un tipo a un error que no lo trae: petición cancelada por el tiempo máximo,
// JSON mal escrito, o cualquier otro fallo de red (sin conexión o CORS).
function clasificarError(error) {
    if (error.tipo) {
        return error;
    }
    let tipo = 'red';
    if (error.name === 'AbortError') {
        tipo = 'tiempo';
    } else if (error.name === 'SyntaxError') {
        tipo = 'formato';
    }
    return crearErrorCarga(tipo, error.message);
}

// urlCatalogo()
// Dirección del catálogo. Abierta como archivo (file://), la página no puede
// leer el JSON local: va directo a la copia publicada en GitHub Pages, que
// permite la lectura desde cualquier origen. Las imágenes siguen siendo las
// de la carpeta local.
function urlCatalogo() {
    catalogoDesdeCopia = location.protocol === 'file:';
    return catalogoDesdeCopia ? URL_PUBLICADA + URL_CATALOGO : URL_CATALOGO;
}

// cargarCatalogo()
// Pide el catálogo y encadena las promesas: then lo valida y construye, catch
// muestra el aviso de error y finally termina el estado de carga. La bandera
// evita dos cargas a la vez.
function cargarCatalogo() {
    if (cargandoCatalogo) {
        return;
    }
    cargandoCatalogo = true;
    mostrarCargando();
    obtenerJSON(urlCatalogo())
        .then(iniciarCatalogo)
        .catch(mostrarErrorCatalogo)
        .finally(terminarCarga);
}

// mostrarCargando()
// Prepara el estado de carga: quita el párrafo de respaldo o un aviso anterior,
// oculta búsqueda, filtros y nota, y muestra el indicador.
function mostrarCargando() {
    vaciarElemento(estadoCatalogo);
    vaciarElemento(listaProductos);
    formularioBusqueda.hidden = true;
    bloqueFiltros.hidden = true;
    notaOrigen.hidden = true;
    indicadorCarga.hidden = false;
    resumenCatalogo.textContent = 'Cargando catálogo…';
    estadoCarrito.textContent = 'Preparando tu carrito…';
}

// terminarCarga()
// Se ejecuta en el finally: oculta el indicador y permite una nueva carga,
// tanto si la anterior resultó como si falló.
function terminarCarga() {
    indicadorCarga.hidden = true;
    cargandoCatalogo = false;
}

// mostrarErrorCatalogo(error)
// Se ejecuta en el catch: deja el detalle en la consola, retira lo que alcanzó a
// construirse y muestra un aviso comprensible. Desde el segundo intento indica
// su número, para que un reintento que falla al instante no parezca ignorado.
function mostrarErrorCatalogo(error) {
    console.error('No se pudo cargar el catálogo:', error);
    catalogo = { categorias: [], productos: [] };
    productosPorId.clear();
    vaciarElemento(listaProductos);
    vaciarElemento(filtrosCategorias);
    vaciarElemento(sugerenciasJuegos);
    vaciarElemento(estadoCatalogo);
    marcarFiltroActivo('');
    formularioBusqueda.hidden = true;
    bloqueFiltros.hidden = true;
    notaOrigen.hidden = true;
    intentosFallidos++;
    const base = MENSAJES_ERROR[error.tipo] || MENSAJES_ERROR.http;
    const mensaje = intentosFallidos > 1 ? base + ' (intento ' + intentosFallidos + ').' : base + '.';
    resumenCatalogo.textContent = mensaje;
    estadoCatalogo.appendChild(crearAvisoError(mensaje, error.tipo));
    mostrarCarritoNoDisponible();
}

// crearAvisoError(mensaje, tipo)
// Arma el aviso de error con el mensaje, una ayuda según el caso y los botones.
// Si la página se abrió como archivo, explica qué pasó con la copia publicada
// (no respondió, o respondió sin un catálogo válido) y ofrece abrirla.
function crearAvisoError(mensaje, tipo) {
    const aviso = crearAviso();
    aviso.appendChild(crearElemento('p', 'fw-semibold mb-2', mensaje));
    if (catalogoDesdeCopia) {
        let explicacion = 'la página intentó leer la copia publicada y no respondió. Revisa tu conexión ' +
            'y pulsa Reintentar, o abre la versión publicada.';
        if (tipo === 'http' || tipo === 'formato') {
            explicacion = 'la página leyó la copia publicada, pero no trae un catálogo que esta versión pueda ' +
                'mostrar. Abre la versión publicada o sirve la carpeta con un servidor local (python3 -m http.server).';
        }
        aviso.appendChild(crearElemento('p', 'mb-3', 'Abriste la página como archivo (file://). Como el navegador ' +
            'no deja leer assets/js/productos.json de esa forma, ' + explicacion));
        const acciones = crearElemento('div', 'd-flex flex-wrap gap-2');
        acciones.appendChild(crearBoton('botonReintentar', 'Reintentar'));
        const enlace = crearElemento('a', 'btn btn-outline-dark btn-sm', 'Ver la versión publicada');
        enlace.href = URL_PUBLICADA;
        acciones.appendChild(enlace);
        aviso.appendChild(acciones);
    } else {
        let ayuda = 'Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, escríbenos desde el ';
        if (tipo === 'formato') {
            ayuda = 'Inténtalo de nuevo en unos minutos. Si el problema sigue, escríbenos desde el ';
        }
        aviso.appendChild(crearParrafoContacto('mb-3', ayuda, 'formulario de contacto'));
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
        verTodosLosProductos();
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


// ===== 5. Validación y construcción del catálogo =====

// validarCatalogo(datos)
// Revisa la estructura del JSON y cada producto antes de construir nada. Las
// categorías repetidas se unen; los productos incompletos, repetidos o de una
// categoría desconocida se descartan (con un aviso en la consola);
// si no queda ninguno, o falta la estructura, lanza un error de formato.
function validarCatalogo(datos) {
    if (!datos || !Array.isArray(datos.categorias) || !Array.isArray(datos.productos)) {
        throw crearErrorCarga('formato', 'productos.json no tiene categorias y productos');
    }
    // Sin repetidas y sin «Todas», que es el valor del filtro que muestra todo
    const categorias = [...new Set(datos.categorias.filter(textoValido))].filter((categoria) => categoria !== TODAS);
    const idsVistos = new Set();
    const productos = datos.productos
        .filter((producto) => {
            const valido = esProductoValido(producto, categorias) && !idsVistos.has(producto.id);
            if (valido) {
                idsVistos.add(producto.id);
            } else {
                console.warn('Producto descartado:', producto);
            }
            return valido;
        })
        .map(prepararProducto);
    if (productos.length === 0) {
        throw crearErrorCarga('formato', 'ningún producto válido');
    }
    return { categorias, productos };
}

// esProductoValido(producto, categorias)
// Reglas de cada producto: id en minúsculas con guiones, textos no vacíos,
// categoría conocida, precio entero y positivo, e imagen dentro de assets/img/
// (así un JSON alterado no puede apuntar a otro sitio).
function esProductoValido(producto, categorias) {
    return producto !== null && typeof producto === 'object'
        && typeof producto.id === 'string' && PATRON_ID.test(producto.id)
        && textoValido(producto.nombre)
        && textoValido(producto.descripcion)
        && textoValido(producto.desarrollador)
        && categorias.includes(producto.categoria)
        && Number.isInteger(producto.precio) && producto.precio > 0
        && typeof producto.imagen === 'string' && PATRON_IMAGEN.test(producto.imagen);
}

// prepararProducto(producto)
// Copia limpia del producto con solo sus campos, más el texto de búsqueda ya
// normalizado: se calcula una vez aquí y no en cada búsqueda. textoCompacto,
// sin espacios, permite encontrar «spiderman» en «Spider-Man».
function prepararProducto(producto) {
    const textoBusqueda = normalizarTexto(producto.nombre + ' ' + producto.categoria + ' ' + producto.desarrollador);
    return {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        desarrollador: producto.desarrollador,
        precio: producto.precio,
        imagen: producto.imagen,
        textoBusqueda: textoBusqueda,
        textoCompacto: textoBusqueda.replace(/ /g, '')
    };
}

// iniciarCatalogo(datos)
// Se ejecuta en el then con los datos del JSON: los valida, arma el índice por
// id, crea filtros, sugerencias y tarjetas (estas últimas en una sola inserción),
// muestra la vista inicial y dibuja el carrito guardado.
function iniciarCatalogo(datos) {
    const limpio = validarCatalogo(datos);
    catalogo = limpio;
    productosPorId = new Map(limpio.productos.map((producto) => [producto.id, producto]));
    crearFiltros(limpio.categorias, limpio.productos);
    llenarSugerencias(limpio.productos);
    listaProductos.appendChild(crearTarjetas(limpio.productos));   // una sola inserción en la página
    vista = { categoria: TODAS, busqueda: '' };
    campoBusqueda.value = '';
    mostrarVista();
    formularioBusqueda.hidden = false;
    if (catalogoDesdeCopia) {
        notaOrigen.textContent = 'Abriste la página como archivo (file://): el catálogo se leyó desde la copia ' +
            'publicada de assets/js/productos.json. Las imágenes, la hoja de estilos y el script son los de esta carpeta.';
        notaOrigen.hidden = false;
    }
    sincronizarCarrito();
    actualizarCarrito('');
    intentosFallidos = 0;   // solo cuando el catálogo quedó construido entero
}

// crearTarjetas(productos)
// Crea todas las tarjetas dentro de un DocumentFragment, que todavía no está en
// la página, y las inserta con un solo appendChild: la lista cambia una vez (un
// registro de mutación del DOM) en lugar de seis.
function crearTarjetas(productos) {
    const fragmento = document.createDocumentFragment();
    productos.forEach((producto) => {
        fragmento.appendChild(crearTarjeta(producto));
    });
    return fragmento;
}

// crearTarjeta(producto)
// Arma la tarjeta de un producto con createElement: imagen, categoría, nombre,
// precio y los botones «Agregar al carrito» y «Ver detalle». data-id identifica
// la columna para mostrarla u ocultarla sin volver a crearla.
function crearTarjeta(producto) {
    const columna = crearElemento('div', 'col-12 col-sm-6 col-xxl-4');
    columna.dataset.id = producto.id;
    const tarjeta = crearElemento('article', 'card h-100');

    // loading, decoding, width y height antes que src: la portada se descarga en
    // diferido y su espacio queda reservado, así la página no salta al llegar
    const imagen = crearElemento('img', 'card-img-top h-auto');
    imagen.setAttribute('loading', 'lazy');
    imagen.setAttribute('decoding', 'async');
    imagen.width = 800;
    imagen.height = 800;
    imagen.src = producto.imagen;
    imagen.alt = 'Portada del videojuego ' + producto.nombre;

    const cuerpo = crearElemento('div', 'card-body d-flex flex-column');
    cuerpo.appendChild(crearElemento('p', 'small text-uppercase fw-semibold text-body-secondary mb-2', producto.categoria));
    cuerpo.appendChild(crearElemento('h3', 'card-title h6', producto.nombre));
    cuerpo.appendChild(crearElemento('p', 'fs-5 fw-semibold mt-auto mb-0', formatearPesos(producto.precio)));

    const pie = crearElemento('footer', 'card-footer bg-transparent d-grid gap-2');
    const agregar = crearElemento('button', 'btn btn-dark btn-sm', 'Agregar al carrito');
    agregar.type = 'button';
    agregar.dataset.agregar = producto.id;   // lo lee manejarClicAgregar()
    agregar.setAttribute('aria-label', 'Agregar al carrito: ' + producto.nombre);
    pie.appendChild(agregar);
    // «Ver detalle» abre el modal de Bootstrap: sin su JavaScript no se crea
    if (window.bootstrap) {
        const detalle = crearElemento('button', 'btn btn-outline-dark btn-sm', 'Ver detalle');
        detalle.type = 'button';
        detalle.dataset.bsToggle = 'modal';
        detalle.dataset.bsTarget = '#modalProducto';
        detalle.dataset.producto = producto.id;
        detalle.setAttribute('aria-label', 'Ver detalle: ' + producto.nombre);
        pie.appendChild(detalle);
    }

    tarjeta.appendChild(imagen);
    tarjeta.appendChild(cuerpo);
    tarjeta.appendChild(pie);
    columna.appendChild(tarjeta);
    return columna;
}

// llenarSugerencias(productos)
// Crea una opción por producto en la lista de sugerencias del campo «Juego de
// interés» del formulario de contacto, también en un solo fragmento.
function llenarSugerencias(productos) {
    const fragmento = document.createDocumentFragment();
    productos.forEach((producto) => {
        const opcion = document.createElement('option');
        opcion.value = producto.nombre;
        fragmento.appendChild(opcion);
    });
    vaciarElemento(sugerenciasJuegos);
    sugerenciasJuegos.appendChild(fragmento);
}


// ===== 6. Vista: filtros y búsqueda (submit) =====

// contarPorCategoria(productos)
// Cuenta los productos de cada categoría en una sola pasada con reduce:
// { 'Acción y aventura': 3, 'Plataformas': 1, ... }.
function contarPorCategoria(productos) {
    return productos.reduce((conteo, producto) => {
        conteo[producto.categoria] = (conteo[producto.categoria] || 0) + 1;
        return conteo;
    }, {});
}

// crearFiltros(categorias, productos)
// Crea un botón por categoría, más «Todas», con la cantidad de productos de
// cada una, y hace visible el bloque de filtros.
function crearFiltros(categorias, productos) {
    const conteo = contarPorCategoria(productos);
    const fragmento = document.createDocumentFragment();
    [TODAS].concat(categorias).forEach((categoria) => {
        const cantidad = categoria === TODAS ? productos.length : (conteo[categoria] || 0);
        fragmento.appendChild(crearBotonFiltro(categoria, cantidad));
    });
    vaciarElemento(filtrosCategorias);
    filtrosCategorias.appendChild(fragmento);
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
// Cambia la categoría de la vista y la vuelve a mostrar. Una búsqueda activa se
// conserva: el filtro la refina.
function aplicarFiltro(categoria) {
    vista.categoria = categoria;
    mostrarVista();
}

// marcarFiltroActivo(categoria)
// Cambia el estilo de los filtros con classList: el activo queda relleno y su
// aria-pressed pasa a true. En el menú de la barra marca la misma categoría con
// active y aria-current.
function marcarFiltroActivo(categoria) {
    filtrosCategorias.querySelectorAll('button[data-categoria]').forEach((boton) => {
        const activo = boton.dataset.categoria === categoria;
        boton.classList.toggle('active', activo);
        boton.setAttribute('aria-pressed', String(activo));
    });
    menuPrincipal.querySelectorAll('.dropdown-item[data-categoria]').forEach((item) => {
        const activo = item.dataset.categoria === categoria;
        item.classList.toggle('active', activo);
        if (activo) {
            item.setAttribute('aria-current', 'true');
        } else {
            item.removeAttribute('aria-current');
        }
    });
}

// buscarProductos(evento)
// Evento submit del formulario de búsqueda. preventDefault() evita que la
// página se recargue; la búsqueda nueva recorre todas las categorías.
function buscarProductos(evento) {
    evento.preventDefault();
    vista.busqueda = campoBusqueda.value.trim();
    vista.categoria = TODAS;
    mostrarVista();
}

// limpiarBusqueda()
// Evento reset (botón Limpiar): borra solo el texto buscado y conserva la
// categoría elegida.
function limpiarBusqueda() {
    vista.busqueda = '';
    mostrarVista();
}

// revisarBusquedaVacia()
// Evento input: si el campo queda vacío (también con la «x» del campo de
// búsqueda o con Esc) y había una búsqueda activa, vuelve a mostrar todo.
function revisarBusquedaVacia() {
    if (campoBusqueda.value.trim() === '' && vista.busqueda !== '') {
        vista.busqueda = '';
        mostrarVista();
    }
}

// obtenerPalabras(texto)
// Divide lo buscado en palabras ya normalizadas: una sola normalización por
// búsqueda, porque los productos ya traen la suya.
function obtenerPalabras(texto) {
    return normalizarTexto(texto).split(' ').filter(Boolean);
}

// productoVisible(producto, palabras)
// true si el producto es de la categoría elegida y contiene todas las palabras
// buscadas (en su texto normalizado o en la versión sin espacios).
function productoVisible(producto, palabras) {
    const enCategoria = vista.categoria === TODAS || producto.categoria === vista.categoria;
    return enCategoria && palabras.every((palabra) =>
        producto.textoBusqueda.includes(palabra) || producto.textoCompacto.includes(palabra));
}

// mostrarVista()
// Único camino que decide qué tarjetas se ven. No crea ni elimina tarjetas:
// solo cambia el atributo hidden de las columnas que deben cambiar. Luego
// marca el filtro, muestra el aviso si no hay resultados y actualiza el resumen.
function mostrarVista() {
    const palabras = obtenerPalabras(vista.busqueda);
    // Una búsqueda de solo signos («!!!») no deja palabras: no coincide con nada
    const sinPalabras = vista.busqueda !== '' && palabras.length === 0;
    const visibles = sinPalabras ? [] : catalogo.productos.filter((producto) => productoVisible(producto, palabras));
    const idsVisibles = new Set(visibles.map((producto) => producto.id));
    for (const columna of listaProductos.children) {
        const ocultar = !idsVisibles.has(columna.dataset.id);
        if (columna.hidden !== ocultar) {
            columna.hidden = ocultar;   // solo toca lo que cambia
        }
    }
    marcarFiltroActivo(vista.categoria);
    vaciarElemento(estadoCatalogo);
    if (visibles.length === 0) {
        estadoCatalogo.appendChild(crearAvisoSinResultados());
    }
    actualizarResumen(visibles.length);
}

// actualizarResumen(cantidad)
// Escribe cuántos productos se ven o cuántos resultados dio la búsqueda. El
// párrafo es una región role="status": los lectores de pantalla lo anuncian.
function actualizarResumen(cantidad) {
    let texto;
    if (vista.busqueda) {
        texto = pluralizar(cantidad, 'resultado', 'resultados') + ' para «' + vista.busqueda + '»';
    } else {
        texto = 'Mostrando ' + cantidad + ' de ' + catalogo.productos.length + ' productos';
    }
    if (vista.categoria !== TODAS) {
        texto += ' en ' + vista.categoria;
    }
    resumenCatalogo.textContent = texto + '.';
}

// crearAvisoSinResultados()
// Aviso cuando la búsqueda no encuentra nada o la categoría no tiene productos,
// con un enlace a contacto y el botón «Ver todos los productos».
function crearAvisoSinResultados() {
    const aviso = crearAviso();
    if (vista.busqueda) {
        let texto = 'No encontramos productos para «' + vista.busqueda + '»';
        if (vista.categoria !== TODAS) {
            texto += ' en ' + vista.categoria;
        }
        aviso.appendChild(crearElemento('p', 'mb-2 text-break', texto + '.'));   // text-break: una palabra larga no desborda
        aviso.appendChild(crearElemento('p', 'mb-2', 'Prueba con otro nombre, una categoría o el estudio que lo desarrolló.'));
    } else {
        aviso.appendChild(crearElemento('p', 'mb-2', 'Pronto tendremos productos en ' + vista.categoria + '.'));
    }
    aviso.appendChild(crearParrafoContacto('mb-3', '¿Buscas algo en particular? ', 'Pregúntanos en el formulario de contacto'));
    aviso.appendChild(crearBoton('botonVerTodos', 'Ver todos los productos'));
    return aviso;
}

// verTodosLosProductos()
// Botón del aviso sin resultados. El foco pasa al filtro «Todas» antes de que
// el aviso, con el botón pulsado, desaparezca; luego se borra la búsqueda.
function verTodosLosProductos() {
    filtrosCategorias.querySelector('button[data-categoria="' + TODAS + '"]').focus();
    campoBusqueda.value = '';
    vista = { categoria: TODAS, busqueda: '' };
    mostrarVista();
}


// ===== 7. Categorías de la barra de navegación (click) =====

// manejarClicNavegacion(evento)
// click delegado en la barra. Una categoría del menú filtra el catálogo y el
// enlace Carrito lleva al resumen. En esos dos casos la página hace el salto
// ella misma y después pone el foco en el título de destino: si dejara el salto
// al enlace, Chrome quitaría el foco al llegar al ancla. En móvil, con el menú
// abierto, primero se cierra el menú y después se navega, para que el título no
// quede tapado por la barra fija.
function manejarClicNavegacion(evento) {
    const enlace = evento.target.closest('a[href^="#"]');
    if (!enlace) {
        return;
    }
    let destino = null;
    if (enlace.dataset.categoria && seleccionarCategoriaMenu(enlace.dataset.categoria)) {
        destino = tituloCatalogo;
    } else if (enlace === enlaceCarrito) {
        destino = tituloCarrito;
    }
    const menuMovilAbierto = Boolean(window.bootstrap) && menuPrincipal.classList.contains('show')
        && window.matchMedia('(max-width: 991.98px)').matches;
    if (!destino && !menuMovilAbierto) {
        return;   // un enlace normal sigue su camino
    }
    evento.preventDefault();
    if (menuMovilAbierto) {
        cerrarMenuMovil(enlace.hash, destino);
    } else {
        navegarA(enlace.hash, destino);
    }
}

// seleccionarCategoriaMenu(categoria)
// Elegir una categoría en la barra es navegar a ella: borra la búsqueda y
// muestra la categoría completa. Devuelve false si el catálogo no cargó; en ese
// caso el enlace solo navega hasta el aviso de carga o de error.
function seleccionarCategoriaMenu(categoria) {
    if (productosPorId.size === 0) {
        return false;
    }
    campoBusqueda.value = '';
    vista.busqueda = '';
    aplicarFiltro(categoria);
    return true;
}

// cerrarMenuMovil(hash, destino)
// Cierra el menú colapsado con la API de Bootstrap y navega cuando termina de
// cerrarse (evento hidden.bs.collapse, una sola vez).
function cerrarMenuMovil(hash, destino) {
    menuPrincipal.addEventListener('hidden.bs.collapse', () => navegarA(hash, destino), { once: true });
    bootstrap.Collapse.getOrCreateInstance(menuPrincipal, { toggle: false }).hide();
}

// navegarA(hash, destino)
// Lleva la página al ancla y, si se indica, pone el foco en el elemento destino
// sin desplazar de nuevo. Si el ancla ya es la actual, cambiar location.hash no
// haría nada, así que se desplaza con scrollIntoView (respeta scroll-padding-top).
function navegarA(hash, destino) {
    if (location.hash === hash) {
        document.getElementById(hash.slice(1)).scrollIntoView();
    } else {
        location.hash = hash;
    }
    if (destino) {
        destino.focus({ preventScroll: true });
    }
}


// ===== 8. Carrito (click) =====

// iniciarCarrito()
// Quita el párrafo de respaldo, recupera el carrito guardado y muestra el enlace
// de la barra. El carrito se dibuja cuando llega el catálogo, que trae precios.
function iniciarCarrito() {
    respaldoCarrito.remove();
    carrito = leerCarritoGuardado();
    estadoCarrito.textContent = 'Preparando tu carrito…';
    enlaceCarrito.hidden = false;
}

// leerCarritoGuardado()
// Lee el carrito de localStorage y conserva solo entradas válidas: id con el
// formato esperado, cantidad entera entre 1 y 10, sin repetidos. Si el
// almacenamiento está bloqueado o el dato está dañado, empieza vacío.
function leerCarritoGuardado() {
    try {
        const guardado = JSON.parse(window.localStorage.getItem(CLAVE_CARRITO) || '[]');
        if (!Array.isArray(guardado)) {
            return [];
        }
        const vistos = new Set();
        return guardado
            .filter((item) => {
                const valido = item !== null && typeof item === 'object'
                    && typeof item.id === 'string' && PATRON_ID.test(item.id) && !vistos.has(item.id)
                    && Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= CANTIDAD_MAXIMA;
                if (valido) {
                    vistos.add(item.id);
                }
                return valido;
            })
            .map((item) => ({ id: item.id, cantidad: item.cantidad }));
    } catch (error) {
        console.warn('No se pudo leer el carrito guardado:', error);
        return [];
    }
}

// guardarCarrito()
// Guarda el carrito en localStorage, solo con id y cantidad: los precios
// salen siempre del catálogo. Si el almacenamiento falla, el carrito sigue
// funcionando en memoria.
function guardarCarrito() {
    try {
        window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.warn('No se pudo guardar el carrito:', error);
    }
}

// sincronizarCarrito()
// Descarta del carrito guardado los productos que ya no están en el catálogo.
function sincronizarCarrito() {
    const antes = carrito.length;
    carrito = carrito.filter((item) => productosPorId.has(item.id));
    if (carrito.length < antes) {
        console.warn('Se descartaron ' + (antes - carrito.length) + ' productos guardados que ya no están en el catálogo');
    }
}

// manejarClicAgregar(evento)
// click delegado en todo el documento para los «Agregar al carrito» de las
// tarjetas y del modal. Desde el modal, primero se cierra y el producto se
// agrega cuando Bootstrap ya devolvió el foco (ver alCerrarModal).
function manejarClicAgregar(evento) {
    const boton = evento.target.closest('[data-agregar]');
    if (!boton || !productosPorId.has(boton.dataset.agregar)) {
        return;
    }
    const instanciaModal = window.bootstrap ? bootstrap.Modal.getInstance(modalProducto) : null;
    if (modalProducto.contains(boton) && instanciaModal) {
        idPendienteModal = boton.dataset.agregar;
        instanciaModal.hide();
    } else {
        agregarAlCarrito(boton.dataset.agregar);   // el foco queda en el botón
    }
}

// agregarAlCarrito(id)
// Agrega una unidad del producto: si no estaba, crea su entrada; si ya estaba,
// suma una unidad hasta el máximo.
function agregarAlCarrito(id) {
    const producto = productosPorId.get(id);
    const item = carrito.find((entrada) => entrada.id === id);
    if (!item) {
        carrito.push({ id: id, cantidad: 1 });
        actualizarCarrito('Agregaste ' + producto.nombre + ' al carrito.');
    } else if (item.cantidad >= CANTIDAD_MAXIMA) {
        actualizarCarrito('Ya tienes el máximo de ' + CANTIDAD_MAXIMA + ' unidades de ' + producto.nombre + '.');
    } else {
        item.cantidad++;
        actualizarCarrito('Agregaste otra unidad de ' + producto.nombre + '.');
    }
}

// manejarClicCarrito(evento)
// click delegado en la lista del carrito: los botones −, + y Quitar de cada
// fila dicen su acción y su producto en data-accion y data-id.
function manejarClicCarrito(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton || !productosPorId.has(boton.dataset.id)) {
        return;
    }
    const id = boton.dataset.id;
    if (boton.dataset.accion === 'sumar') {
        cambiarCantidad(id, 1);
    } else if (boton.dataset.accion === 'restar') {
        cambiarCantidad(id, -1);
    } else if (boton.dataset.accion === 'quitar') {
        enfocarTrasQuitar(quitarDelCarrito(id));
    }
}

// cambiarCantidad(id, cambio)
// Suma o resta una unidad dentro de los límites 1 y 10. En un límite no cambia
// nada y explica el motivo en la línea de estado.
function cambiarCantidad(id, cambio) {
    const item = carrito.find((entrada) => entrada.id === id);
    if (!item) {
        return;
    }
    const nombre = productosPorId.get(id).nombre;
    const nueva = item.cantidad + cambio;
    if (nueva < 1) {
        actualizarCarrito(nombre + ' tiene 1 unidad. Para sacarlo del carrito, usa Quitar.');
    } else if (nueva > CANTIDAD_MAXIMA) {
        actualizarCarrito('Ya tienes el máximo de ' + CANTIDAD_MAXIMA + ' unidades de ' + nombre + '.');
    } else {
        item.cantidad = nueva;
        actualizarCarrito(nombre + ': ' + pluralizar(nueva, 'unidad', 'unidades') + '.');
    }
}

// quitarDelCarrito(id)
// Quita el producto del carrito y devuelve la posición que tenía su fila, para
// saber a dónde llevar el foco.
function quitarDelCarrito(id) {
    const indice = carrito.findIndex((entrada) => entrada.id === id);
    const nombre = productosPorId.get(id).nombre;
    carrito = carrito.filter((entrada) => entrada.id !== id);
    actualizarCarrito('Quitaste ' + nombre + ' del carrito.');
    return indice;
}

// enfocarTrasQuitar(indice)
// Lleva el foco al «Quitar» de la fila que quedó en esa posición o, si era la
// última, al de la anterior. Sin filas, al título del carrito.
function enfocarTrasQuitar(indice) {
    const filas = listaCarrito.children;
    const fila = filas[indice] || filas[indice - 1];
    if (fila) {
        fila.querySelector('[data-accion="quitar"]').focus();
    } else {
        tituloCarrito.focus();
    }
}

// vaciarCarrito()
// Quita todos los productos. El foco pasa al título antes de que el botón
// pulsado quede desactivado.
function vaciarCarrito() {
    carrito = [];
    tituloCarrito.focus();
    actualizarCarrito('Quitamos todos los productos.');
}

// finalizarCompra()
// Cierra un pedido simulado: muestra lo que se habría comprado y deja el
// carrito vacío. No hay cobros ni despachos. El resumen del pedido va también
// en la línea de estado, que los lectores de pantalla anuncian.
function finalizarCompra() {
    const totales = calcularTotales();
    if (totales.unidades === 0) {
        return;
    }
    carrito = [];
    tituloCarrito.focus();
    actualizarCarrito('Compra finalizada: pedido simulado de ' + pluralizar(totales.unidades, 'producto', 'productos') +
        ' por ' + formatearPesos(totales.total) + ', sin cobros ni despachos.');
    mensajeCarrito.appendChild(crearAvisoCompra(totales.unidades, totales.total));
}

// crearAvisoCompra(unidades, total)
// Aviso del pedido simulado bajo el resumen del carrito.
function crearAvisoCompra(unidades, total) {
    const aviso = crearAviso('mt-3 mb-0');
    aviso.appendChild(crearElemento('p', 'fw-semibold mb-1',
        'Pedido simulado de ' + pluralizar(unidades, 'producto', 'productos') + ' por ' + formatearPesos(total) + '.'));
    aviso.appendChild(crearElemento('p', 'small text-body-secondary mb-0', 'Sitio de práctica: no se realizan cobros ni despachos.'));
    return aviso;
}

// calcularTotales()
// Suma unidades y total con reduce, con los precios del catálogo (enteros en
// pesos, sin decimales que redondear).
function calcularTotales() {
    return carrito.reduce((totales, item) => {
        totales.unidades += item.cantidad;
        totales.total += productosPorId.get(item.id).precio * item.cantidad;
        return totales;
    }, { unidades: 0, total: 0 });
}

// actualizarCarrito(mensaje)
// Único camino de dibujo del carrito, por clave: quita las filas de productos
// que ya no están, crea solo las nuevas (en un fragmento) y en las demás cambia
// únicamente la fila cuya cantidad cambió. Un cambio de cantidad no crea nodos
// y el foco no se pierde. Después actualiza totales, contador, botones, la
// línea de estado y guarda.
function actualizarCarrito(mensaje) {
    const idsEnCarrito = new Set(carrito.map((item) => item.id));
    filasCarrito.forEach((refs, id) => {
        if (!idsEnCarrito.has(id)) {
            refs.fila.remove();
            filasCarrito.delete(id);
        }
    });
    const fragmento = document.createDocumentFragment();
    carrito.forEach((item) => {
        let refs = filasCarrito.get(item.id);
        if (!refs) {
            refs = crearFilaCarrito(item.id);
            filasCarrito.set(item.id, refs);
            fragmento.appendChild(refs.fila);
        }
        actualizarFilaCarrito(refs, item);
    });
    listaCarrito.appendChild(fragmento);

    const totales = calcularTotales();
    unidadesCarrito.textContent = String(totales.unidades);
    totalCarrito.textContent = formatearPesos(totales.total);
    cantidadCarrito.textContent = String(totales.unidades);
    textoContador.textContent = totales.unidades === 1 ? ' producto' : ' productos';
    contadorCarrito.hidden = false;
    controlesCarrito.hidden = false;
    botonFinalizar.disabled = carrito.length === 0;
    botonVaciar.disabled = carrito.length === 0;
    vaciarElemento(mensajeCarrito);
    estadoCarrito.textContent = textoEstadoCarrito(mensaje, totales.unidades, totales.total);
    guardarCarrito();
}

// crearFilaCarrito(id)
// Crea la fila de un producto: nombre, subtotal, detalle «2 × $54.990» y los
// botones −, + y Quitar. Devuelve las referencias que se actualizan después y
// la cantidad que muestra (0 hasta la primera actualización).
function crearFilaCarrito(id) {
    const nombre = productosPorId.get(id).nombre;
    const fila = crearElemento('li', 'list-group-item px-0 bg-transparent');
    fila.dataset.id = id;

    const arriba = crearElemento('div', 'd-flex justify-content-between gap-2');
    const subtotal = crearElemento('span', 'text-nowrap');
    arriba.appendChild(crearElemento('span', 'fw-semibold', nombre));
    arriba.appendChild(subtotal);

    const abajo = crearElemento('div', 'd-flex align-items-center justify-content-between gap-2 mt-2');
    const detalle = crearElemento('span', 'small text-body-secondary');
    // Nodos de texto creados una sola vez: después solo se cambia su contenido
    const textoSubtotal = document.createTextNode('');
    const textoDetalle = document.createTextNode('');
    subtotal.appendChild(textoSubtotal);
    detalle.appendChild(textoDetalle);
    const acciones = crearElemento('div', 'd-flex gap-1');
    const grupo = crearElemento('div', 'btn-group btn-group-sm');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Cantidad de ' + nombre);
    const restar = crearBotonCarrito('restar', id, '−', 'Restar una unidad de ' + nombre, 'btn btn-outline-dark');
    const sumar = crearBotonCarrito('sumar', id, '+', 'Sumar una unidad de ' + nombre, 'btn btn-outline-dark');
    grupo.appendChild(restar);
    grupo.appendChild(sumar);
    acciones.appendChild(grupo);
    acciones.appendChild(crearBotonCarrito('quitar', id, 'Quitar', 'Quitar del carrito: ' + nombre, 'btn btn-outline-secondary btn-sm'));
    abajo.appendChild(detalle);
    abajo.appendChild(acciones);

    fila.appendChild(arriba);
    fila.appendChild(abajo);
    return { fila, textoDetalle, textoSubtotal, restar, sumar, cantidad: 0 };
}

// crearBotonCarrito(accion, id, texto, etiqueta, clases)
// Crea un botón de la fila del carrito con su acción, su producto y un nombre
// accesible que dice a qué producto afecta.
function crearBotonCarrito(accion, id, texto, etiqueta, clases) {
    const boton = crearElemento('button', clases, texto);
    boton.type = 'button';
    boton.dataset.accion = accion;
    boton.dataset.id = id;
    boton.setAttribute('aria-label', etiqueta);
    return boton;
}

// actualizarFilaCarrito(refs, item)
// Actualiza una fila solo si su cantidad cambió: escribe en los nodos de texto
// que ya existen (no crea nodos) y ajusta − y + en los límites (aria-disabled
// los deja enfocables). Las filas que no cambiaron no se tocan.
function actualizarFilaCarrito(refs, item) {
    if (refs.cantidad === item.cantidad) {
        return;
    }
    refs.cantidad = item.cantidad;
    const precio = productosPorId.get(item.id).precio;
    refs.textoDetalle.data = item.cantidad + ' × ' + formatearPesos(precio);
    refs.textoSubtotal.data = formatearPesos(precio * item.cantidad);
    refs.restar.setAttribute('aria-disabled', String(item.cantidad <= 1));
    refs.sumar.setAttribute('aria-disabled', String(item.cantidad >= CANTIDAD_MAXIMA));
}

// textoEstadoCarrito(mensaje, unidades, total)
// Texto de la línea de estado: la última acción y el resumen del carrito.
function textoEstadoCarrito(mensaje, unidades, total) {
    if (unidades === 0) {
        return mensaje ? mensaje + ' Tu carrito quedó vacío.' : 'Tu carrito está vacío. Agrega productos desde el catálogo.';
    }
    const resumen = 'Carrito: ' + pluralizar(unidades, 'producto', 'productos') + ', total ' + formatearPesos(total) + '.';
    return mensaje ? mensaje + ' ' + resumen : resumen;
}

// mostrarCarritoNoDisponible()
// Sin catálogo no hay precios: se ocultan filas, totales y contador. El
// carrito guardado se conserva y se vuelve a dibujar cuando el catálogo cargue.
function mostrarCarritoNoDisponible() {
    vaciarElemento(listaCarrito);
    filasCarrito.clear();
    vaciarElemento(mensajeCarrito);
    controlesCarrito.hidden = true;
    contadorCarrito.hidden = true;
    estadoCarrito.textContent = 'El carrito estará disponible cuando se cargue el catálogo.';
}


// ===== 9. Modal de detalle =====

// prepararModalProducto(evento)
// Evento show.bs.modal: relatedTarget es el botón «Ver detalle» que abrió el
// modal. Si su producto no existe, se cancela la apertura; si existe, se llena
// el modal y se le da su nombre accesible.
function prepararModalProducto(evento) {
    const disparador = evento.relatedTarget;
    const producto = disparador ? productosPorId.get(disparador.dataset.producto) : undefined;
    if (!producto) {
        evento.preventDefault();
        return;
    }
    llenarModalProducto(producto);
    modalProducto.setAttribute('aria-labelledby', 'tituloModalProducto');
}

// llenarModalProducto(producto)
// Escribe el detalle del producto en el único modal de la página: título,
// portada, categoría, descripción, estudio y precio, y prepara su botón
// «Agregar al carrito».
function llenarModalProducto(producto) {
    tituloModalProducto.textContent = producto.nombre;
    vaciarElemento(cuerpoModalProducto);
    const fila = crearElemento('div', 'row g-4');
    const columnaImagen = crearElemento('div', 'col-sm-5');
    const imagen = crearElemento('img', 'img-fluid rounded');
    imagen.width = 800;
    imagen.height = 800;
    imagen.setAttribute('decoding', 'async');
    imagen.src = producto.imagen;
    imagen.alt = 'Portada del videojuego ' + producto.nombre;
    columnaImagen.appendChild(imagen);
    const columnaTexto = crearElemento('div', 'col-sm-7');
    columnaTexto.appendChild(crearElemento('p', 'small text-uppercase fw-semibold text-body-secondary mb-2', producto.categoria));
    columnaTexto.appendChild(crearElemento('p', '', producto.descripcion));
    columnaTexto.appendChild(crearElemento('p', 'small text-body-secondary', 'Desarrollado por ' + producto.desarrollador + '.'));
    columnaTexto.appendChild(crearElemento('p', 'fs-4 fw-semibold mb-0', formatearPesos(producto.precio)));
    fila.appendChild(columnaImagen);
    fila.appendChild(columnaTexto);
    cuerpoModalProducto.appendChild(fila);
    botonAgregarModal.dataset.agregar = producto.id;
    botonAgregarModal.setAttribute('aria-label', 'Agregar al carrito: ' + producto.nombre);
}

// soltarFocoModal()
// Evento hide.bs.modal: Bootstrap marca el modal con aria-hidden al ocultarlo;
// si el foco sigue adentro, el navegador lo advierte. Se suelta antes.
function soltarFocoModal() {
    if (modalProducto.contains(document.activeElement)) {
        document.activeElement.blur();
    }
}

// alCerrarModal(evento)
// Evento hidden.bs.modal, escuchado en document a propósito: Bootstrap devuelve
// el foco a «Ver detalle» con una escucha en el propio modal, y esta corre
// después (fase de burbuja). Así el producto pendiente se agrega con el foco ya
// devuelto y el mensaje del carrito se anuncia fuera del modal.
function alCerrarModal(evento) {
    if (evento.target !== modalProducto) {
        return;
    }
    modalProducto.removeAttribute('aria-labelledby');
    if (idPendienteModal) {
        const id = idPendienteModal;
        idPendienteModal = '';
        agregarAlCarrito(id);
    }
}


// ===== 10. Consultar por un juego (Semana 5) =====

// prellenarConsulta(evento)
// click delegado en el contenido principal: sirve para los tres Consultar del
// carrusel. Copia el título del juego en el formulario; el
// enlace sigue su camino normal y lleva a la sección Contacto.
function prellenarConsulta(evento) {
    const enlace = evento.target.closest('a[data-juego]');
    if (enlace) {
        campoJuego.value = enlace.dataset.juego;
        vaciarElemento(mensajeFormulario);   // empieza una consulta nueva
    }
}


// ===== 11. Resaltado de tarjetas (Semana 5) =====

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


// ===== 12. Validación del formulario de contacto (Semana 5) =====

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


// ===== 13. Carrusel de destacados (Semana 4) =====

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
