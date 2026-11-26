"""Comprueba los retos diarios de los próximos días en los tres juegos.

Abre cada juego en un Chrome sin interfaz con la fecha simulada y revisa:
- ¿Dónde está?: el lugar tiene nombre, provincia y dos pistas, y ninguna pista contiene el nombre.
- Letras del día: cinco palabras de 5, 6, 7, 8 y 10 letras, solo letras, sin repetir y bien desordenadas.
- Cifras del día: tres rondas con solución exacta, y la solución mostrada llega de verdad al objetivo.
Además avisa si un lugar o una palabra se repite dentro del periodo.

Uso: python tests/comprobar_retos.py [días]   (por defecto 30, empezando hoy)
"""
import datetime, functools, http.server, re, socketserver, sys, threading, unicodedata
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIAS = int(sys.argv[1]) if len(sys.argv) > 1 else 30

def norm(s):
    s = s.upper().replace("Ñ", "\x01")
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return s.replace("\x01", "Ñ")

def comprobar_cifras(r):
    errores = []
    if not r["exact"]:
        return ["sin solución exacta"]
    disponibles = list(r["n"])
    ultimo = None
    for paso in r["sol"]:
        m = re.fullmatch(r"(\d+) ([+−×÷]) (\d+) = (\d+)", paso)
        if not m:
            return [f"paso ilegible «{paso}»"]
        a, op, b, res = int(m[1]), m[2], int(m[3]), int(m[4])
        for v in (a, b):
            if v in disponibles:
                disponibles.remove(v)
            else:
                return [f"usa {v}, que no está disponible en «{paso}»"]
        calc = {"+": a + b, "−": a - b, "×": a * b, "÷": a / b if b else None}[op]
        if calc != res or res <= 0:
            return [f"cuenta incorrecta «{paso}»"]
        disponibles.append(res)
        ultimo = res
    if r["target"] not in r["n"] and ultimo != r["target"]:
        errores.append(f"la solución acaba en {ultimo}, no en {r['target']}")
    return errores

def main():
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    H = functools.partial(Silencioso, directory=str(ROOT))
    srv = socketserver.TCPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/"
    errores, avisos = [], []
    vistos_lugar, vistas_palabra = {}, {}
    hoy = datetime.date.today()
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(timezone_id="Europe/Madrid")
        # Nada de red externa: ni liga, ni contador, ni anuncios, ni estadísticas
        ctx.route(re.compile(r"^https?://(?!127\.0\.0\.1)"), lambda r: r.fulfill(status=200, body="", content_type="text/plain"))
        pg = ctx.new_page()
        fallos_js = []
        pg.on("pageerror", lambda e: fallos_js.append(str(e)))
        for i in range(DIAS):
            d = hoy + datetime.timedelta(days=i)
            pg.clock.set_fixed_time(datetime.datetime(d.year, d.month, d.day, 12, 0))
            etiqueta = d.isoformat()
            # ¿Dónde está?
            pg.goto(base + "index.html"); pg.wait_for_timeout(150)
            tc = pg.evaluate("typeof TC!=='undefined'?TC.slice(0,6):null")
            if not tc or not tc[0]:
                errores.append(f"{etiqueta} ¿Dónde está?: no hay lugar")
            else:
                nombre = tc[0]
                if not tc[3]: errores.append(f"{etiqueta} ¿Dónde está? ({nombre}): falta la provincia")
                for k in (4, 5):
                    if not (tc[k] or "").strip(): errores.append(f"{etiqueta} ¿Dónde está? ({nombre}): falta la pista {k-3}")
                    elif norm(nombre) in norm(re.sub(r"<[^>]+>", "", tc[k])): errores.append(f"{etiqueta} ¿Dónde está? ({nombre}): la pista {k-3} contiene el nombre")
                pista = pg.evaluate("clues().slice(-1)[0][1]")
                letras = sum(1 for c in nombre if c.isalpha())
                if f"tiene {letras} letras" not in pista: errores.append(f"{etiqueta} ¿Dónde está? ({nombre}): la pista de letras dice «{pista}»")
                if nombre in vistos_lugar: avisos.append(f"{etiqueta} ¿Dónde está?: {nombre} ya salió el {vistos_lugar[nombre]}")
                vistos_lugar.setdefault(nombre, etiqueta)
            # Letras del día
            pg.goto(base + "letras.html"); pg.wait_for_timeout(150)
            w = pg.evaluate("typeof WORDS!=='undefined'?{d:DISP.slice(),w:WORDS.slice(),l:LET.map(x=>x.join(''))}:null")
            if not w:
                errores.append(f"{etiqueta} Letras: no hay palabras")
            else:
                largos = [len(x) for x in w["w"]]
                if largos != [5, 6, 7, 8, 10]: errores.append(f"{etiqueta} Letras: longitudes {largos} en {w['d']}")
                for disp, pal, mez in zip(w["d"], w["w"], w["l"]):
                    if not re.fullmatch(r"[A-ZÑ]+", pal): errores.append(f"{etiqueta} Letras: «{disp}» tiene caracteres raros")
                    if mez == pal: errores.append(f"{etiqueta} Letras: «{disp}» no sale desordenada")
                    if pal in vistas_palabra: avisos.append(f"{etiqueta} Letras: {disp} ya salió el {vistas_palabra[pal]}")
                    vistas_palabra.setdefault(pal, etiqueta)
                if len(set(w["w"])) < 5: errores.append(f"{etiqueta} Letras: palabras repetidas {w['d']}")
            # Cifras del día
            pg.goto(base + "cifras.html"); pg.wait_for_timeout(150)
            rounds = pg.evaluate("typeof ROUNDS!=='undefined'?ROUNDS.map(r=>({name:r.name,target:r.target,n:r.n.slice(),sol:r.sol.slice(),exact:r.exact!==false})):null")
            if not rounds or len(rounds) != 3:
                errores.append(f"{etiqueta} Cifras: no hay tres rondas")
            else:
                for r in rounds:
                    for e in comprobar_cifras(r):
                        errores.append(f"{etiqueta} Cifras ({r['name']}, {r['target']} con {r['n']}): {e}")
            for e in fallos_js:
                errores.append(f"{etiqueta}: error de JavaScript: {e}")
            fallos_js.clear()
        b.close()
    srv.shutdown()
    print(f"Revisados {DIAS} días desde {hoy.isoformat()}.")
    for a in avisos: print("AVISO:", a)
    for e in errores: print("ERROR:", e)
    if errores:
        sys.exit(1)
    print("Todo correcto." if not avisos else "Sin errores (revisa los avisos).")

if __name__ == "__main__":
    main()
