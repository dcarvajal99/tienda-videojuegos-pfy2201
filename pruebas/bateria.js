// Batería de pruebas funcionales de la tienda. Se inyecta al final del <body> del build,
// corre en el navegador real y envía los resultados por POST al servidor de pruebas.
(async () => {
    const NAV = new URLSearchParams(location.search).get('nav');
    if (!NAV) return; // Sin ?nav= la página funciona normal (la usa el barrido de anchos).
    const resultados = [];
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    const hasta = async (condicion, maximo = 10000) => {
        const inicio = Date.now();
        while (!condicion()) {
            if (Date.now() - inicio > maximo) throw new Error('tiempo agotado esperando la condición');
            await esperar(50);
        }
    };
    const afirmar = (condicion, mensaje) => { if (!condicion) throw new Error(mensaje); };
    const prueba = async (nombre, fn) => {
        try { resultados.push({ nombre, ok: true, detalle: (await fn()) || '' }); }
        catch (e) { resultados.push({ nombre, ok: false, detalle: String(e && e.message || e) }); }
    };
    const escribir = (selector, valor) => {
        const campo = document.querySelector(selector);
        const prototipo = { SELECT: HTMLSelectElement.prototype, TEXTAREA: HTMLTextAreaElement.prototype }[campo.tagName] || HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(campo, valor);
        campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    };
    const tarjetas = () => [...document.querySelectorAll('#catalogo article')];
    const nombres = () => tarjetas().map((t) => t.querySelector('h2').textContent);
    const boton = (ambito, texto) => [...ambito.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(texto));

    await hasta(() => tarjetas().length > 0, 15000).catch(() => {});

    await prueba('Catálogo cargado desde productos.json', async () => {
        afirmar(tarjetas().length === 6, 'se esperaban 6 tarjetas y hay ' + tarjetas().length);
        const rutas = [...new Set(tarjetas().map((t) => t.querySelector('img').src))];
        const estados = await Promise.all(rutas.map((ruta) => fetch(ruta).then((r) => r.ok)));
        afirmar(estados.every(Boolean), 'alguna portada no responde');
        return '6 tarjetas con imagen, nombre, precio y descripción';
    });

    await prueba('Filtro por categoría', async () => {
        escribir('#selectorCategoria', 'Carreras y simulación'); await esperar(80);
        afirmar(nombres().length === 1 && nombres()[0] === 'Gran Turismo 7', 'resultado: ' + nombres().join(', '));
        escribir('#selectorCategoria', 'todas'); await esperar(80);
        afirmar(tarjetas().length === 6, 'no volvió al catálogo completo');
        return '«Carreras y simulación» deja 1 juego';
    });

    await prueba('Búsqueda con debounce', async () => {
        escribir('#campoBusqueda', 'ragnarok'); await esperar(60);
        afirmar(document.querySelector('.linea-estado').textContent.includes('Buscando'), 'no aparece «Buscando…»');
        await esperar(450);
        afirmar(nombres().length === 1 && nombres()[0].startsWith('God of War'), 'resultado: ' + nombres().join(', '));
        escribir('#campoBusqueda', ''); await esperar(80);
        afirmar(tarjetas().length === 6, 'no volvió al catálogo completo');
        return '«ragnarok» encuentra God of War Ragnarök';
    });

    await prueba('Carrito: agregar, contador y total', async () => {
        tarjetas()[0].querySelector('.acciones button').click(); await esperar(100);
        tarjetas()[3].querySelector('.acciones button').click(); await esperar(700);
        const contador = document.querySelector('header .badge').textContent;
        const total = document.querySelector('#carrito').textContent;
        afirmar(contador === '2', 'contador de la barra: ' + contador);
        afirmar(total.includes('$90.980'), 'el total no es $90.980');
        afirmar(tarjetas()[0].querySelector('.acciones button').textContent.startsWith('En el carrito'), 'el botón no cambió a «En el carrito»');
        return 'contador 2 y total $90.980';
    });

    await prueba('Contacto: validación de campos vacíos', async () => {
        const formulario = document.querySelector('.formulario-contacto');
        formulario.querySelector('button[type=submit]').click(); await esperar(80);
        const errores = formulario.querySelectorAll('.invalid-feedback').length;
        afirmar(errores === 3, 'errores mostrados: ' + errores);
        afirmar(document.activeElement.id === 'contacto-nombre', 'el foco no fue al primer campo con error');
        return '3 errores y foco en «Nombre»';
    });

    await prueba('Contacto: envío válido', async () => {
        escribir('#contacto-nombre', 'Diego Carvajal');
        escribir('#contacto-email', 'diego@correo.cl');
        escribir('#contacto-mensaje', '¿Tienen Astro Bot en edición física?');
        await esperar(30);
        document.querySelector('.formulario-contacto button[type=submit]').click();
        await hasta(() => document.querySelector('.formulario-contacto .alert-success'), 4000);
        return 'confirmación «Gracias, Diego…»';
    });

    await prueba('Agregar un videojuego al catálogo', async () => {
        const seccion = document.getElementById('administrar');
        escribir('#juego-nombre', 'EA Sports FC 26');
        escribir('#juego-categoria', 'Deportes');
        escribir('#juego-precio', '54990');
        escribir('#juego-descripcion', 'Fútbol con ligas y clubes licenciados de todo el mundo.');
        await esperar(30);
        boton(seccion, 'Agregar al catálogo').click(); await esperar(150);
        afirmar(tarjetas().length === 7, 'tarjetas: ' + tarjetas().length);
        afirmar(document.querySelector('.cifras dd').textContent === '7', 'la portada no se actualizó');
        return '7 juegos; la portada también suma 1';
    });

    await prueba('Quitar un videojuego del catálogo', async () => {
        const ultima = tarjetas()[tarjetas().length - 1];
        boton(ultima, 'Quitar del catálogo').click(); await esperar(80);
        boton(ultima, 'Sí, quitar').click(); await esperar(150);
        afirmar(tarjetas().length === 6, 'tarjetas: ' + tarjetas().length);
        afirmar(document.activeElement.id === 'tituloCatalogo', 'el foco no pasó al título del catálogo');
        return 'vuelve a 6 juegos, con confirmación';
    });

    await prueba('Menú de navegación plegable', async () => {
        const conmutador = document.querySelector('.navbar-toggler');
        conmutador.click(); await esperar(80);
        afirmar(conmutador.getAttribute('aria-expanded') === 'true' && document.getElementById('menuPrincipal').classList.contains('show'), 'no se abrió');
        conmutador.click(); await esperar(80);
        afirmar(conmutador.getAttribute('aria-expanded') === 'false', 'no se cerró');
        return innerWidth < 992 ? 'se abre y se cierra' : 'se abre y se cierra (en escritorio el menú está siempre visible)';
    });

    await prueba('Sin desborde horizontal', async () => {
        const extra = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        afirmar(extra <= 0, 'la página se desborda ' + extra + ' px');
        return 'ancho ' + document.documentElement.clientWidth + ' px';
    });

    await prueba('Sin errores en la consola', async () => {
        afirmar(window.__errores.length === 0, window.__errores.join(' | '));
        return '0 errores';
    });

    try { localStorage.clear(); } catch { /* sin almacenamiento: nada que limpiar */ }
    const datos = { nav: NAV, agente: navigator.userAgent, ancho: innerWidth, resultados };
    await fetch('/resultado?nav=' + encodeURIComponent(NAV), { method: 'POST', body: JSON.stringify(datos) });
    if (NAV.startsWith('safari')) location.replace('about:blank');
})();
