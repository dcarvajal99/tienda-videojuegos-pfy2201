#!/usr/bin/env python3
"""Pruebas de la tienda en navegadores reales (macOS).

Uso:  npm run build && npm run test:navegadores
      python3 pruebas/pruebas.py chrome-1280 firefox-390   (solo algunos)

Copia dist/ a pruebas/salida/, le inyecta la batería (bateria.js) y abre la tienda en
Chrome, Brave, Firefox y Safari a distintos anchos. Cada navegador corre las pruebas y
devuelve el resultado con un POST a este servidor. Al final escribe pruebas/resultados.md.
Los navegadores headless no bajan de 500 px de ventana: a 390 px la tienda corre dentro
de un iframe de ese ancho (movil.html). barrido.html revisa el desborde horizontal de
320 a 1680 px. Safari se abre en segundo plano (open -g) y deja la pestaña en blanco.
"""
import datetime, functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading, time
from pathlib import Path

AQUI = Path(__file__).resolve().parent
PROYECTO = AQUI.parent
SALIDA = AQUI / "salida"
SITIO = SALIDA / "sitio"
RESULTADOS = SALIDA / "resultados"
PUERTO = 8795
RUTA = "tienda-videojuegos-pfy2201"
APPS = {
    "Chrome": "/Applications/Google Chrome.app",
    "Brave": "/Applications/Brave Browser.app",
    "Firefox": "/Applications/Firefox.app",
    "Safari": "/Applications/Safari.app",
}


def preparar():
    if SALIDA.exists():
        shutil.rmtree(SALIDA)
    destino = SITIO / RUTA
    shutil.copytree(PROYECTO / "dist", destino)
    html = (destino / "index.html").read_text(encoding="utf-8")
    cabeza = "<script>\n" + (AQUI / "sonda-cabeza.js").read_text(encoding="utf-8") + "\n</script>"
    bateria = "<script>\n" + (AQUI / "bateria.js").read_text(encoding="utf-8") + "\n</script>"
    html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + cabeza, 1).replace("</body>", bateria + "\n</body>")
    (destino / "index.html").write_text(html, encoding="utf-8")
    for pagina in ("movil.html", "barrido.html"):
        shutil.copy(AQUI / pagina, SITIO / pagina)
    RESULTADOS.mkdir(parents=True)


class Manejador(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        nav = self.path.split("nav=")[-1]
        (RESULTADOS / f"{nav}.json").write_bytes(self.rfile.read(int(self.headers["Content-Length"])))
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):
        pass


def binario(app):
    nombre = {"Chrome": "Google Chrome", "Brave": "Brave Browser", "Firefox": "firefox"}[app]
    return f"{APPS[app]}/Contents/MacOS/{nombre}"


def chromium(app, ancho):
    return lambda url, perfil: [binario(app), "--headless=new", "--disable-gpu", f"--window-size={ancho},900", url]


def firefox(ancho):
    # En headless, Firefox toma el tamaño de la ventana de estas variables de entorno.
    orden = lambda url, perfil: [binario("Firefox"), "-headless", "-no-remote", "-profile", perfil, url]
    orden.entorno = {"MOZ_HEADLESS_WIDTH": str(ancho), "MOZ_HEADLESS_HEIGHT": "900"}
    return orden


def safari(url, perfil):
    subprocess.run(["open", "-g", "-a", "Safari", url])
    return ["true"]


TRABAJOS = {
    "chrome-1280": ("Chrome", chromium("Chrome", 1280)),
    "chrome-390": ("Chrome", chromium("Chrome", 800)),
    "brave-1280": ("Brave", chromium("Brave", 1280)),
    "firefox-1280": ("Firefox", firefox(1280)),
    "firefox-768": ("Firefox", firefox(768)),
    "firefox-390": ("Firefox", firefox(800)),
    "safari": ("Safari", safari),
    "barrido-firefox": ("Firefox", firefox(1700)),
}


def correr(nav, orden_fn, espera=120):
    base = f"http://127.0.0.1:{PUERTO}"
    if nav.startswith("barrido"):
        url = f"{base}/barrido.html"
    elif nav.endswith("-390"):
        url = f"{base}/movil.html?nav={nav}"
    else:
        url = f"{base}/{RUTA}/?nav={nav}"
    perfil = tempfile.mkdtemp(prefix="nav-")
    entorno = dict(os.environ, **getattr(orden_fn, "entorno", {}))
    proceso = subprocess.Popen(orden_fn(url, perfil), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=entorno)
    archivo = RESULTADOS / f"{nav}.json"
    inicio = time.time()
    while not archivo.exists() and time.time() - inicio < espera:
        time.sleep(0.5)
    proceso.terminate()
    try:
        proceso.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proceso.kill()
    shutil.rmtree(perfil, ignore_errors=True)
    return json.loads(archivo.read_text(encoding="utf-8")) if archivo.exists() else None


def version(app):
    plist = f"{APPS[app]}/Contents/Info"
    return subprocess.run(["defaults", "read", plist, "CFBundleShortVersionString"], capture_output=True, text=True).stdout.strip()


def informe(datos):
    filas = ["| Navegador | Versión | Ancho | Pruebas superadas | Fallas |", "|---|---|---|---|---|"]
    barrido = None
    for nav, (app, _) in TRABAJOS.items():
        if nav not in datos:
            continue
        d = datos[nav]
        if d is None:
            filas.append(f"| {app} | {version(app)} | — | sin resultado | — |")
            continue
        if nav.startswith("barrido"):
            barrido = d
            continue
        ok = sum(r["ok"] for r in d["resultados"])
        fallas = "; ".join(r["nombre"] + ": " + r["detalle"] for r in d["resultados"] if not r["ok"]) or "ninguna"
        filas.append(f"| {app} | {version(app)} | {d['ancho']} px | {ok} de {len(d['resultados'])} | {fallas} |")
    nombres = next((d for n, d in datos.items() if d and not n.startswith("barrido")), {"resultados": []})["resultados"]
    texto = ["# Resultados de las pruebas en navegadores", "",
             f"Última ejecución: {datetime.date.today().isoformat()} (macOS).", "", *filas, ""]
    if barrido:
        malos = [r for r in barrido["resultados"] if r["extra"] > 0]
        texto += [f"Barrido de anchos en Firefox, de {barrido['resultados'][0]['ancho']} a {barrido['resultados'][-1]['ancho']} px "
                  f"cada 40 px ({len(barrido['resultados'])} anchos): "
                  + ("sin desborde horizontal." if not malos else "desborde en " + ", ".join(f"{r['ancho']} px" for r in malos) + "."), ""]
    texto += ["Pruebas de la batería (`pruebas/bateria.js`):", ""] + [f"{i}. {r['nombre']}" for i, r in enumerate(nombres, 1)] + [""]
    (AQUI / "resultados.md").write_text("\n".join(texto), encoding="utf-8")


if __name__ == "__main__":
    if not (PROYECTO / "dist").exists():
        sys.exit("Falta dist/: ejecuta primero npm run build")
    preparar()
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), functools.partial(Manejador, directory=str(SITIO)))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    elegidos = sys.argv[1:] or list(TRABAJOS)
    datos = {}
    for nav in elegidos:
        app, orden = TRABAJOS[nav]
        if not Path(APPS[app]).exists():
            print(f"{nav:<16} {app} no está instalado")
            continue
        datos[nav] = correr(nav, orden)
        print(f"{nav:<16} {'listo' if datos[nav] else 'SIN RESULTADO'}")
    servidor.shutdown()
    informe(datos)
    print("Resumen en pruebas/resultados.md")
