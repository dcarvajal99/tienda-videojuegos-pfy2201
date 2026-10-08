// Va en el <head>: registra errores y console.error antes de que cargue la app.
window.__errores = [];
window.addEventListener('error', (e) => window.__errores.push(e.message));
window.addEventListener('unhandledrejection', (e) => window.__errores.push(String(e.reason)));
(function () { const original = console.error; console.error = function () { window.__errores.push([].join.call(arguments, ' ')); return original.apply(console, arguments); }; })();
try { localStorage.clear(); } catch { /* sin almacenamiento: nada que limpiar */ }
