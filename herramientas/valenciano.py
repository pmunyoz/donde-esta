"""Genera la versió en valencià de Xifres del dia i Lletres del dia a partir dels jocs en castellà.

Ús:  python herramientas/valenciano.py
Crea va/xifres.html, va/lletres.html i les còpies traduïdes dels scripts compartits (va/*.js).

Cada traducció és un parell (castellà, valencià). Si un text en castellà ja no apareix (perquè
s'ha canviat el joc), el generador s'atura i diu quin: cal afegir o corregir el parell.
Les traduccions es poden revisar a herramientas/traducciones_va.md, que es genera alhora.
"""
import json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import paraules_va as P

OUT = ROOT / "va"
REVISIO = []  # (fitxer, castellà, valencià) per al document de revisió

class Falta(Exception):
    pass

def aplicar(text, parells, fitxer, revisar=True):
    for es, va in parells:
        if es not in text:
            raise Falta(f"{fitxer}: no trobe «{es[:90]}»")
        text = text.replace(es, va)
        if revisar:
            REVISIO.append((fitxer, es, va))
    return text

def wa(text):
    from urllib.parse import quote
    return "https://wa.me/?text=" + quote(text, safe="")

# ---------------------------------------------------------------- textos comuns
COMUNS = [
    ('<html lang="es">', '<html lang="ca-ES-valencia">'),
    ('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="ca_ES">'),
    ('<meta property="og:site_name" content="¿Dónde está? · Letras del día">', '<meta property="og:site_name" content="Piensa un rato">'),
    ('toLocaleDateString("es-ES"', 'toLocaleDateString("ca-ES"'),
    ('<ol class="steps" id="steps" aria-label="Progreso">', '<ol class="steps" id="steps" aria-label="Progrés">'),
    ('`Reto para clase${CUSTOM.au?`<br>de ${escH(CUSTOM.au)}`:""}`:`Reto nº ${NUM}<br>', '`Repte per a classe${CUSTOM.au?`<br>de ${escH(CUSTOM.au)}`:""}`:`Repte núm. ${NUM}<br>'),
    ('"Reto personalizado"', '"Repte personalitzat"'),
    ('`Creado por ${escH(CUSTOM.au)}. `', '`Creat per ${escH(CUSTOM.au)}. `'),
    ('<b>Reto de un día anterior</b><span>No cuenta para tus estadísticas ni para la liga.', '<b>Repte d\'un dia anterior</b><span>No compta per a les teues estadístiques ni per a la lliga.'),
    ('Ver todos los días</a>', 'Vore tots els dies</a>'),
    ('Ir al reto de hoy</a>', 'Ves al repte de hui</a>'),
    ('Ir al reto del día</a>', 'Ves al repte del dia</a>'),
    ('<button class="btn" id="go">Empezar</button>', '<button class="btn" id="go">Comença</button>'),
    ('El reloj se pone en marcha al pulsar y no se detiene si recargas la página.', 'El rellotge es posa en marxa quan prems i no s\'atura si tornes a carregar la pàgina.'),
    ('"Muy bien"', '"Molt bé"'), ('"Bien jugado"', '"Ben jugat"'), ('"Se puede mejorar"', '"Es pot millorar"'),
    ('"Otra vez será"', '"Una altra vegada serà"'), ('"Mañana más"', '"Demà més"'),
    ('</span> de ${MAXP} puntos. ${verdict(score())}.</h2>', '</span> de ${MAXP} punts. ${verdict(score())}.</h2>'),
    ('<small>Jugados</small>', '<small>Jugats</small>'), ('<small>Media</small>', '<small>Mitjana</small>'),
    ('<small>Mejor</small>', '<small>Millor</small>'), ('<small>Racha</small>', '<small>Ratxa</small>'),
    ('Compartir por WhatsApp', 'Compartix per WhatsApp'),
    ('`Siguiente en ${', '`El següent en ${'),
    ('<b>¿Te ha gustado? Invítame a un café</b><small>Los juegos son gratis. Con un café me ayudas a mantenerlos y a crear más.</small>',
     '<b>T\'ha agradat? Convida\'m a un café</b><small>Els jocs són gratuïts. Amb un café m\'ajudes a mantindre\'ls i a crear-ne més.</small>'),
    ('<h3>Más juegos</h3>', '<h3>Més jocs</h3>'), ('<h3>Y además</h3>', '<h3>I a més</h3>'),
    ('<b>Juega los días anteriores</b><small>¿Te perdiste algún reto? Todavía puedes jugarlo.</small>', '<b>Juga els dies anteriors</b><small>T\'has perdut algun repte? Encara pots jugar-lo. (En castellà.)</small>'),
    ('<b>¿Eres profe?</b><small>Crea tu propio reto y compártelo con tu clase.</small>', '<b>Eres profe?</b><small>Crea el teu propi repte i compartix-lo amb la classe. (En castellà.)</small>'),
    # Lliga
    ('<h3>Liga de amigos</h3>', '<h3>Lliga d\'amics</h3>'),
    ('<p>Te han invitado a la liga <b class="code">${esc(urlLiga)}</b>. Elige un apodo para entrar.</p>', '<p>T\'han convidat a la lliga <b class="code">${esc(urlLiga)}</b>. Tria un sobrenom per a entrar.</p>'),
    ('<label class="lbl" for="nick">Tu apodo</label>', '<label class="lbl" for="nick">El teu sobrenom</label>'),
    ('placeholder="Por ejemplo, Paco"', 'placeholder="Per exemple, Pep"'),
    ('>Entrar en la liga</button>', '>Entra en la lliga</button>'),
    ('data-act="create">Crear liga</button>', 'data-act="create">Crea una lliga</button>'),
    ('<label class="lbl" for="code">¿Ya tienes un código?</label>', '<label class="lbl" for="code">Ja tens un codi?</label>'),
    ('placeholder="Código"', 'placeholder="Codi"'), ('data-act="join">Unirme</button>', 'data-act="join">Uneix-me</button>'),
    ('<h3>Liga <span class="code">', '<h3>Lliga <span class="code">'),
    ('<span class="who">Juegas como <b>', '<span class="who">Jugues com a <b>'),
    ('data-act="invite">Copiar invitación</button>', 'data-act="invite">Copia la invitació</button>'),
    ('Invitar por WhatsApp</a>', 'Convida per WhatsApp</a>'),
    ('data-act="refresh">Actualizar</button>', 'data-act="refresh">Actualitza</button>'),
    ('data-act="leave">Salir</button>', 'data-act="leave">Ix</button>'),
    ('<h4>Hoy</h4>', '<h4>Hui</h4>'),
    ('Termina el reto para ver cómo han quedado los demás.', 'Acaba el repte per a vore com han quedat els altres.'),
    ('<th>Apodo</th>', '<th>Sobrenom</th>'), ('<th>Puntos</th>', '<th>Punts</th>'), ('<th>Tiempo</th>', '<th>Temps</th>'), ('<th>Días</th>', '<th>Dies</th>'),
    ('Aún no hay resultados de hoy.', 'Encara no hi ha resultats de hui.'),
    ('<h4>Últimos 7 días</h4>', '<h4>Últims 7 dies</h4>'),
    ('Todavía nadie ha jugado esta semana.', 'Encara no ha jugat ningú esta setmana.'),
    ('"Escribe un apodo para que tus amigos te reconozcan."', '"Escriu un sobrenom perquè els teus amics et reconeguen."'),
    ('"El código de liga tiene al menos 4 letras o números."', '"El codi de la lliga té almenys 4 lletres o números."'),
    ('"Enlace copiado"', '"Enllaç copiat"'), ('"Copia el enlace de arriba"', '"Copia l\'enllaç de dalt"'),
    ('"Actualizando…"', '"Actualitzant…"'),
    ('"No se pudo enviar tu resultado. Se reintentará al volver a abrir la página."', '"No s\'ha pogut enviar el teu resultat. Es tornarà a intentar quan tornes a obrir la pàgina."'),
    ('"No se pudo cargar la clasificación."', '"No s\'ha pogut carregar la classificació."'),
    ('ligaErr.startsWith("No se pudo cargar")', 'ligaErr.startsWith("No s\'ha pogut carregar")'),
]

PEU_ES = re.compile(r'<p class="osm">Más juegos:.*?</p>', re.S)
def peu(actual):
    altres = {"xifres": '<a href="va/lletres.html">Lletres del dia</a>', "lletres": '<a href="va/xifres.html">Xifres del dia</a>'}[actual]
    castella = {"xifres": "cifras.html", "lletres": "letras.html"}[actual]
    return ('<p class="osm">Més jocs: <a href="./">¿Dónde está?</a> · ' + altres +
            ' · <a href="grupos.html">Grupos del día</a> · <a href="archivo.html">Dies anteriors</a> · <a href="soluciones.html">Solucions</a> · <a href="https://ko-fi.com/pascualmunoz" target="_blank" rel="noopener">Convida\'m a un café</a>'
            ' · <a href="sugerencias.html">Suggeriments</a> · <a href="ranking.html">Classificació</a> · <a href="logros.html">Assoliments</a> · <a href="acerca.html">Qui som</a> · <a href="privacidad.html">Privacitat</a>'
            f' · <a href="{castella}" lang="es" hreflang="es">En castellano</a></p>')

def nav(actual):
    a = lambda k: ' aria-current="page"' if k == actual else ""
    return ('<nav aria-label="Jocs"><ul class="games"><li><a href="./"><span aria-hidden="true">📍</span> ¿Dónde está?</a></li>'
            f'<li><a href="va/lletres.html"{a("lletres")}><span aria-hidden="true">🔤</span> Lletres</a></li>'
            f'<li><a href="va/xifres.html"{a("xifres")}><span aria-hidden="true">🔢</span> Xifres</a></li>'
            '<li><a href="grupos.html"><span aria-hidden="true">🧩</span> Grupos</a></li></ul></nav>')

def scripts_va(html, fitxer):
    # Rutes des de l'arrel (amb <base href="/">) i scripts compartits traduïts
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">', 1)
    for js in ["avisos.js", "imagen.js", "logros.js", "estadisticas.js", "ranking.js", "clase.js"]:
        tag = f'<script src="{js}"></script>'
        if tag not in html:
            raise Falta(f"{fitxer}: no trobe {tag}")
        html = html.replace(tag, f'<script src="va/{js}"></script>')
    return html

def capcalera(html, fitxer, titol, desc, url, nom):
    html = re.sub(r"<title>.*?</title>", f"<title>{titol}</title>", html, count=1)
    for patro in [r'(<meta name="description" content=")[^"]*', r'(<meta property="og:description" content=")[^"]*', r'(<meta name="twitter:description" content=")[^"]*']:
        html = re.sub(patro, lambda m: m.group(1) + desc, html, count=1)
    for patro in [r'(<meta property="og:title" content=")[^"]*', r'(<meta name="twitter:title" content=")[^"]*']:
        html = re.sub(patro, lambda m: m.group(1) + titol, html, count=1)
    html = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, html, count=1)
    html = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, html, count=1)
    ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": nom, "url": url, "description": desc,
          "applicationCategory": "GameApplication", "operatingSystem": "Qualsevol (navegador web)", "inLanguage": "ca-ES-valencia",
          "isAccessibleForFree": True, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}, "author": {"@type": "Person", "name": "Pascual Muñoz"}}
    html, n = re.subn(r'<script type="application/ld\+json">.*?</script>', "<script type=\"application/ld+json\">" + json.dumps(ld, ensure_ascii=False) + "</script>", html, count=1, flags=re.S)
    if not n:
        raise Falta(f"{fitxer}: no trobe les dades estructurades")
    return html

def alternatives(html, es_url, va_url):
    alt = f'<link rel="alternate" hreflang="es" href="{es_url}">\n<link rel="alternate" hreflang="ca-ES-valencia" href="{va_url}">\n'
    html = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', "", html)
    return html.replace("<link rel=\"canonical\"", alt + "<link rel=\"canonical\"", 1)

# ---------------------------------------------------------------- Xifres del dia
def xifres():
    f = "cifras.html"
    h = (ROOT / f).read_text(encoding="utf-8")
    url = "https://piensaunrato.es/va/xifres.html"
    desc = "Cada dia, tres reptes de números: sis xifres i un objectiu, amb sumes, restes, multiplicacions i divisions. Gratuït, en valencià i sense registre."
    h = capcalera(h, f, "Xifres del dia · Joc diari de números", desc, url, "Xifres del dia")
    h = alternatives(h, "https://piensaunrato.es/cifras.html", url)
    h = scripts_va(h, f)
    h, n = PEU_ES.subn(peu("xifres"), h, count=1)
    if not n: raise Falta(f"{f}: no trobe el peu")
    h, n = re.subn(r'<nav aria-label="Juegos">.*?</nav>', nav("xifres"), h, count=1, flags=re.S)
    if not n: raise Falta(f"{f}: no trobe la barra de jocs")
    h = h.replace('href="cifras.html"', 'href="va/xifres.html"').replace('href="letras.html"', 'href="va/lletres.html"')
    rec = re.search(r'<p class="recom"><a class="wa" href="[^"]*"', h)
    if not rec: raise Falta(f"{f}: no trobe el botó de recomanar")
    h = h.replace(rec.group(0), '<p class="recom"><a class="wa" href="' + wa("Et recomane Xifres del dia: cada dia, sis números i una xifra objectiu: suma, resta, multiplica i dividix per a arribar-hi. Gratuït i sense registre 👉 https://piensaunrato.es/va/xifres.html\nI si t'agrada, també hi ha Lletres del dia.") + '"')
    h = aplicar(h, COMUNS + [
        ('Recomienda Cifras del día por WhatsApp', 'Recomana Xifres del dia per WhatsApp'),
        ('<h1>Cifras<br><span>del día</span></h1>', '<h1>Xifres<br><span>del dia</span></h1>'),
        ('<p class="how">Tres rondas. En cada una, seis números y una cifra objetivo: combínalos con sumas, restas, multiplicaciones y divisiones para llegar lo más cerca posible.</p>',
         '<p class="how">Tres rondes. En cada una, sis números i una xifra objectiu: combina\'ls amb sumes, restes, multiplicacions i divisions per a arribar el més a prop possible.</p>'),
        ('<h2>Cómo se juega a Cifras del día</h2>', '<h2>Com es juga a Xifres del dia</h2>'),
        ('<p>Cada día hay tres rondas nuevas, iguales para todos: fácil, media y difícil. En cada una tienes seis números y una cifra objetivo de tres cifras. Elige un número, una operación y otro número; el resultado sustituye a los dos y puedes seguir operando con él. Cada número se usa una sola vez, las restas tienen que dar positivo y las divisiones, exactas.</p>',
         '<p>Cada dia hi ha tres rondes noves, iguals per a tothom: fàcil, mitjana i difícil. En cada una tens sis números i una xifra objectiu de tres xifres. Tria un número, una operació i un altre número; el resultat substituïx els dos i pots continuar operant-hi. Cada número s\'usa una sola vegada, les restes han de donar positiu i les divisions, exactes.</p>'),
        ('<p>Llegar exacto vale 10 puntos; quedarse a 1 o 2, 7 puntos; a 5 o menos, 5; a 10 o menos, 3; y a 25 o menos, 1. Tienes un minuto y medio por ronda, y siempre existe al menos una forma de llegar exacto.</p>',
         '<p>Arribar-hi exacte val 10 punts; quedar-se a 1 o 2, 7 punts; a 5 o menys, 5; a 10 o menys, 3; i a 25 o menys, 1. Tens un minut i mig per ronda, i sempre hi ha almenys una manera d\'arribar-hi exacte.</p>'),
        ('<h2>Para profesores</h2>', '<h2>Per al professorat</h2>'),
        ('<p>Elige tus propios números y objetivos, o genera rondas al azar adaptadas a la edad de tus alumnos, y compártelas con un enlace o un código QR. Ideal para practicar el cálculo mental. <a href="profes.html#cifras">Crear un reto para clase</a></p>',
         '<p>Tria els teus propis números i objectius, o genera rondes a l\'atzar adaptades a l\'edat de l\'alumnat, i compartix-les amb un enllaç o un codi QR. Ideal per a practicar el càlcul mental. <a href="profes.html#cifras">Crea un repte per a classe (en castellà)</a></p>'),
        ('{name:"Fácil",', '{name:"Fàcil",'), ('{name:"Media",', '{name:"Mitjana",'),
        ('"sin límite de tiempo":ROUND_T===90?"un minuto y medio por ronda":ROUND_T===60?"un minuto por ronda":`${ROUND_T/60} minutos por ronda`',
         '"sense límit de temps":ROUND_T===90?"un minut i mig per ronda":ROUND_T===60?"un minut per ronda":`${ROUND_T/60} minuts per ronda`'),
        ('`Una solución: ${', '`Una solució: ${'),
        ('`No se puede llegar exacto. Lo más cerca posible es ${', '`No s\'hi pot arribar exacte. El més pròxim possible és ${'),
        ('${NR} ronda${NR>1?"s":""}, ${tTxt}. ', '${NR} ${NR>1?"rondes":"ronda"}, ${tTxt}. '),
        ('`<b>Este enlace de reto no funciona</b><span>Puede que esté incompleto. Mientras tanto, aquí tienes el reto del día.</span>`',
         '`<b>Aquest enllaç de repte no funciona</b><span>Pot ser que estiga incomplet. Mentrestant, ací tens el repte del dia.</span>`'),
        ('"La resta tiene que dar un número positivo."', '"La resta ha de donar un número positiu."'),
        ('"La división tiene que ser exacta."', '"La divisió ha de ser exacta."'),
        ('`${NR} ronda${NR>1?"s":""} preparada${NR>1?"s":""} por tu profe`:"Tres rondas, cada vez más difíciles"',
         '`${NR} ${NR>1?"rondes preparades":"ronda preparada"} pel teu profe`:"Tres rondes, cada vegada més difícils"'),
        ('<li>Toca un número, una operación y otro número. El resultado sustituye a los dos y puedes seguir con él.</li>',
         '<li>Toca un número, una operació i un altre número. El resultat substituïx els dos i pots continuar amb ell.</li>'),
        ('<li>Cada número se usa una vez. Las restas deben dar positivo y las divisiones, exactas.</li>',
         '<li>Cada número s\'usa una sola vegada. Les restes han de donar positiu i les divisions, exactes.</li>'),
        ('`Tienes ${tTxt}.`:"No hay límite de tiempo."} Cuenta el número más cercano que consigas:',
         '`Tens ${tTxt}.`:"No hi ha límit de temps."} Compta el número més pròxim que aconseguixques:'),
        ('[["Exacto",10],', '[["Exacte",10],'),
        ('"¡Exacto! +10 puntos":`Te quedaste en ${r.v}, a ${r.d}. ${r.pts?`+${r.pts} punto${r.pts>1?"s":""}`:"0 puntos"}`',
         '"Exacte! +10 punts":`Et quedares en ${r.v}, a ${r.d}. ${r.pts?`+${r.pts} punt${r.pts>1?"s":""}`:"0 punts"}`'),
        ('Más cerca: <b>', 'Més a prop: <b>'),
        ('mmss(ROUND_T):"Sin límite"', 'mmss(ROUND_T):"Sense límit"'),
        ('l.textContent="Sin límite"', 'l.textContent="Sense límit"'),
        ('aria-label="Objetivo ${R.target}"', 'aria-label="Objectiu ${R.target}"'),
        ('({"+":"más","−":"menos","×":"por","÷":"entre"})', '({"+":"més","−":"menys","×":"per","÷":"entre"})'),
        ('id="undo" ${st.ops.length?"":"disabled"}>Deshacer</button>', 'id="undo" ${st.ops.length?"":"disabled"}>Desfés</button>'),
        ('id="reset" ${st.ops.length?"":"disabled"}>Empezar de nuevo</button>', 'id="reset" ${st.ops.length?"":"disabled"}>Torna a començar</button>'),
        ('id="give">Entregar ${B.best}</button>', 'id="give">Lliura ${B.best}</button>'),
        ('`Cifras · ${CUSTOM.ti||"Reto para clase"}`:`Cifras del día nº ${NUM}`} — ${score()}/${MAXP} puntos', '`Xifres · ${CUSTOM.ti||"Repte per a classe"}`:`Xifres del dia núm. ${NUM}`} — ${score()}/${MAXP} punts'),
        ('(r.d===0?" exacto":', '(r.d===0?" exacte":'),
        ('<small> · tú ${r.v}', '<small> · tu ${r.v}'),
        ('<span aria-hidden="true">🔤</span>Letras</a>', '<span aria-hidden="true">🔤</span>Lletres</a>'),
        ('<th>Exactos</th>', '<th>Exactes</th>'),
        ('Se suman los puntos de cada día (máximo ${MAXP} por día). Si hay empate hoy, gana quien haya tardado menos.', 'Se sumen els punts de cada dia (màxim ${MAXP} per dia). Si hi ha empat hui, guanya qui haja tardat menys.'),
        ('Compite con tus amigos: crea una liga y pásales el enlace, o únete con su código. Es la misma liga que en ¿Dónde está? y Letras del día.',
         'Competix amb els teus amics: crea una lliga i passa\'ls l\'enllaç, o uneix-te amb el seu codi. És la mateixa lliga que a ¿Dónde está? i Lletres del dia.'),
        ('`Únete a mi liga de Cifras del día (código ${liga.code}): ${invite()}`', '`Uneix-te a la meua lliga de Xifres del dia (codi ${liga.code}): ${invite()}`'),
    ], f)
    # La targeta de Lletres encara diu «Letras del día» abans de traduir: s'ordena perquè quede bé
    return h

# ---------------------------------------------------------------- Lletres del dia
def lletres():
    f = "letras.html"
    h = (ROOT / f).read_text(encoding="utf-8")
    url = "https://piensaunrato.es/va/lletres.html"
    desc = "Cada dia, cinc paraules en valencià amb les lletres mesclades, de 5 a 10 lletres. Un minut per paraula i fins a 25 punts. Gratuït i sense registre."
    h = capcalera(h, f, "Lletres del dia · Joc diari de paraules desordenades", desc, url, "Lletres del dia")
    h = alternatives(h, "https://piensaunrato.es/letras.html", url)
    h = scripts_va(h, f)
    h, n = PEU_ES.subn(peu("lletres"), h, count=1)
    if not n: raise Falta(f"{f}: no trobe el peu")
    h, n = re.subn(r'<nav aria-label="Juegos">.*?</nav>', nav("lletres"), h, count=1, flags=re.S)
    if not n: raise Falta(f"{f}: no trobe la barra de jocs")
    h = h.replace('href="letras.html"', 'href="va/lletres.html"').replace('href="cifras.html"', 'href="va/xifres.html"')
    rec = re.search(r'<p class="recom"><a class="wa" href="[^"]*"', h)
    if not rec: raise Falta(f"{f}: no trobe el botó de recomanar")
    h = h.replace(rec.group(0), '<p class="recom"><a class="wa" href="' + wa("Et recomane Lletres del dia: cada dia, cinc paraules en valencià amb les lletres mesclades i un minut per a cadascuna. Gratuït i sense registre 👉 https://piensaunrato.es/va/lletres.html\nI si t'agrada, també hi ha Xifres del dia.") + '"')
    # Paraules en valencià
    llistes = json.dumps([P.L5, P.L6, P.L7, P.L8, P.L10], ensure_ascii=False, separators=(",", ":"))
    h, n = re.subn(r"const LISTS=\[\[.*?\]\];", lambda m: f"const LISTS={llistes};", h, count=1, flags=re.S)
    if not n: raise Falta(f"{f}: no trobe les llistes de paraules")
    # Les llistes antigues de Letras (LISTS0) no s'usen en valencià: sempre les paraules en valencià
    h, n = re.subn(r"const LISTS0=\[\[.*?\]\];\n?", "", h, count=1, flags=re.S)
    h = h.replace('(key<="2026-11-26"?LISTS0:LISTS).map(pick)', 'LISTS.map(pick)')
    if "LISTS0" in h: raise Falta(f"{f}: queda alguna referència a LISTS0")
    h = aplicar(h, [
        # Dades pròpies: altres partides, lliga i estadístiques que les de Letras
        ('const SK=CUSTOM?"lt-r-"+CUSTOM.id:"lt-"+key;', 'const SK=CUSTOM?"ll-r-"+CUSTOM.id:"ll-"+key;'),
        ('localStorage.getItem("lt-stats")', 'localStorage.getItem("ll-stats")'),
        ('localStorage.setItem("lt-stats"', 'localStorage.setItem("ll-stats"'),
        ('const MODE="letras";', 'const MODE="lletres";'),
        ('contarPartida("letras",', 'contarPartida("lletres",'),
        ('Estadisticas.mostrar(document.getElementById("global"),"letras",', 'Estadisticas.mostrar(document.getElementById("global"),"lletres",'),
        # La Ç és una lletra pròpia (com la Ñ en castellà)
        ('.replace(/Ñ/g,"\\u0001")', '.replace(/Ñ/g,"\\u0001").replace(/Ç/g,"\\u0002")'),
        ('.replace(/\\u0001/g,"Ñ")', '.replace(/\\u0001/g,"Ñ").replace(/\\u0002/g,"Ç")'),
        ('WORDS=DISP.map(w=>norm(w).replace(/[^A-ZÑ]/g,""))', 'WORDS=DISP.map(w=>norm(w).replace(/[^A-ZÑÇ]/g,""))'),
        ('!/[A-ZÑ]/.test(L)', '!/[A-ZÑÇ]/.test(L)'),
    ], f, revisar=False)
    h = aplicar(h, COMUNS + [
        ('Recomienda Letras del día por WhatsApp', 'Recomana Lletres del dia per WhatsApp'),
        ('<h1>Letras<br><span>del día</span></h1>', '<h1>Lletres<br><span>del dia</span></h1>'),
        ('<p class="how">Cinco palabras con las letras mezcladas, de 5 a 10 letras. Un minuto para cada una y hasta 5 puntos por palabra.</p>',
         '<p class="how">Cinc paraules amb les lletres mesclades, de 5 a 10 lletres. Un minut per a cadascuna i fins a 5 punts per paraula.</p>'),
        ('<h2>Cómo se juega a Letras del día</h2>', '<h2>Com es juga a Lletres del dia</h2>'),
        ('<p>Cada día hay cinco palabras nuevas, iguales para todos, con las letras mezcladas: de 5, 6, 7, 8 y 10 letras. Tienes un minuto para cada una. Si la resuelves en los primeros 12 segundos vale 5 puntos, y pierde uno cada 12 segundos. Puedes tocar las fichas o escribir con el teclado.</p>',
         '<p>Cada dia hi ha cinc paraules noves en valencià, iguals per a tothom, amb les lletres mesclades: de 5, 6, 7, 8 i 10 lletres. Tens un minut per a cadascuna. Si la resols en els primers 12 segons val 5 punts, i en perd un cada 12 segons. Pots tocar les fitxes o escriure amb el teclat. Els accents no compten: només cal ordenar les lletres.</p>'),
        ('<h2>Para profesores</h2>', '<h2>Per al professorat</h2>'),
        ('<p>Crea un reto con tus propias palabras (vocabulario de clase, un tema, un libro) y compártelo con tus alumnos con un enlace o un código QR. <a href="profes.html">Crear un reto para clase</a></p>',
         '<p>Crea un repte amb les teues pròpies paraules (vocabulari de classe, un tema, un llibre) i compartix-lo amb l\'alumnat amb un enllaç o un codi QR. <a href="profes.html">Crea un repte per a classe (en castellà)</a></p>'),
        ('WORD_T===60?"un minuto":WORD_T===120?"dos minutos":WORD_T+" segundos"', 'WORD_T===60?"un minut":WORD_T===120?"dos minuts":WORD_T+" segons"'),
        ('${NW} palabra${NW>1?"s":""}, ${tTxt} cada una. ', '${NW} ${NW>1?"paraules":"paraula"}, ${tTxt} cadascuna. '),
        ('`Ordena las letras de cada palabra. Tienes ${tTxt} para cada una y vale hasta 5 puntos si la sacas rápido.`',
         '`Ordena les lletres de cada paraula. Tens ${tTxt} per a cadascuna i val fins a 5 punts si la traus de pressa.`'),
        ('"<b>Este enlace de reto no funciona</b><span>Puede que se haya copiado incompleto. Mientras tanto, aquí tienes el reto del día.</span>"',
         '"<b>Aquest enllaç de repte no funciona</b><span>Pot ser que s\'haja copiat incomplet. Mentrestant, ací tens el repte del dia.</span>"'),
        ('<small>${n} letras</small>', '<small>${n} lletres</small>'), ('<small>letras</small>', '<small>lletres</small>'),
        ('NW===5&&WORD_T===60?"Cinco palabras, cinco minutos":`${NW} palabra${NW>1?"s":""}, ${tTxt} cada una`',
         'NW===5&&WORD_T===60?"Cinc paraules, cinc minuts":`${NW} ${NW>1?"paraules":"paraula"}, ${tTxt} cadascuna`'),
        ('<li>Ordena las letras para formar la palabra. Puedes tocar las fichas o escribir con el teclado.</li>',
         '<li>Ordena les lletres per a formar la paraula. Pots tocar les fitxes o escriure amb el teclat.</li>'),
        ('<li>Cada palabra tiene ${tTxt}. Si se acaba, pasa a la siguiente y cuenta como fallada.</li>',
         '<li>Cada paraula té ${tTxt}. Si s\'acaba, passa a la següent i compta com a fallada.</li>'),
        ('<li>Cuanto antes la saques, más vale:</li>', '<li>Com més prompte la traus, més val:</li>'),
        ('aria-label="Quitar ${LET[k][t]}"', 'aria-label="Lleva ${LET[k][t]}"'),
        ('aria-label="Letra ${LET[k][i]}"', 'aria-label="Lletra ${LET[k][i]}"'),
        ('`¡Bien! +${st.res[reveal].pts} puntos`', '`Molt bé! +${st.res[reveal].pts} punts`'),
        ('`¡Bien! +${r.pts} puntos`', '`Molt bé! +${r.pts} punts`'),
        ('id="worth">Vale 5 puntos</span>', 'id="worth">Val 5 punts</span>'),
        ('`Palabra ${showK+1} de ${NW}`:`Palabra ${k+1} de ${NW} · ${n} letras`', '`Paraula ${showK+1} de ${NW}`:`Paraula ${k+1} de ${NW} · ${n} lletres`'),
        ('<div class="label">Palabra ${NW} de ${NW}</div>', '<div class="label">Paraula ${NW} de ${NW}</div>'),
        ('id="clear">Borrar</button>', 'id="clear">Esborra</button>'), ('id="mix">Mezclar</button>', 'id="mix">Mescla</button>'), ('id="skip">Pasar</button>', 'id="skip">Passa</button>'),
        ('"Esa no es. Sigue probando."', '"No és eixa. Continua provant."'),
        ('w.textContent=`Vale ${v} punto${v>1?"s":""}`', 'w.textContent=`Val ${v} punt${v>1?"s":""}`'),
        ('`No queda ninguna ${L}.`', '`No en queda cap, de ${L}.`'),
        ('`Letras · ${CUSTOM.ti||"Reto para clase"}`:`Letras del día nº ${NUM}`', '`Lletres · ${CUSTOM.ti||"Repte per a classe"}`:`Lletres del dia núm. ${NUM}`'),
        ('<span aria-hidden="true">🔢</span>Cifras</a>', '<span aria-hidden="true">🔢</span>Xifres</a>'),
        ('<th>Aciertos</th>', '<th>Encerts</th>'),
        ('Se suman los puntos de cada día (máximo 25 por día). Si hay empate hoy, gana quien haya tardado menos.', 'Se sumen els punts de cada dia (màxim 25 per dia). Si hi ha empat hui, guanya qui haja tardat menys.'),
        ('Compite con tus amigos: crea una liga y pásales el enlace, o únete con su código. Es la misma liga que en ¿Dónde está?.',
         'Competix amb els teus amics: crea una lliga i passa\'ls l\'enllaç, o uneix-te amb el seu codi. Esta lliga té la seua pròpia classificació de Lletres.'),
        ('`Únete a mi liga de Letras del día (código ${liga.code}): ${invite()}`', '`Uneix-te a la meua lliga de Lletres del dia (codi ${liga.code}): ${invite()}`'),
    ], f)
    return h

# ---------------------------------------------------------------- scripts compartits
JS = {
    "estadisticas.js": [
        ('toLocaleString("es-ES")', 'toLocaleString("ca-ES")'),
        ('`<h3>${archivo ? "Ese día" : "Hoy"}, entre todos</h3><p class="gl-line">${archivo ? "Pocos jugaron ese reto, así que no hay estadísticas." : "Eres de los primeros en jugar el reto de hoy. Vuelve más tarde para ver cómo te comparas con los demás."}</p>`',
         '`<h3>${archivo ? "Aquell dia" : "Hui"}, entre tots</h3><p class="gl-line">${archivo ? "Pocs van jugar aquell repte, així que no hi ha estadístiques." : "Eres dels primers a jugar el repte de hui. Torna més tard per a vore com quedes respecte als altres."}</p>`'),
        ('`<h3>${archivo ? "Ese día" : "Hoy"}, entre todos</h3>\n', '`<h3>${archivo ? "Aquell dia" : "Hui"}, entre tots</h3>\n'),
        ('${archivo ? "jugaron" : "han jugado"} · media <b>', '${archivo ? "van jugar" : "han jugat"} · mitjana <b>'),
        ('` · has superado al <b>${pct} %</b>`', '` · has superat el <b>${pct} %</b>`'),
        ('aria-label="Cuántos jugadores sacaron cada puntuación"', 'aria-label="Quants jugadors van traure cada puntuació"'),
        ('${archivo ? "Quedaste" : "Vas"} <b>${puesto}.º</b> de ', '${archivo ? "Vas quedar en la posició" : "Vas en la posició"} <b>${puesto}</b> de '),
    ],
    "ranking.js": [
        ('Ver la clasificación de hoy</a>', 'Vore la classificació de hui (en castellà)</a>'),
        ('apodo: "Ese apodo no vale. Usa entre 2 y 20 letras o números, sin palabras malsonantes."', 'apodo: "Eixe sobrenom no val. Usa entre 2 i 20 lletres o números, sense paraulotes."'),
        ('ocupado: "Ese apodo ya lo ha usado alguien hoy. Prueba con otro."', 'ocupado: "Eixe sobrenom ja l\'ha usat algú hui. Prova\'n un altre."'),
        ('fecha: "Este reto ya no admite resultados."', 'fecha: "Este repte ja no admet resultats."'),
        ('error: "No se ha podido enviar. Inténtalo de nuevo."', 'error: "No s\'ha pogut enviar. Torna-ho a provar."'),
        ('<h3>🏆 Clasificación pública</h3><p class="ok">Sales hoy como «${esc(hecho)}».</p>', '<h3>🏆 Classificació pública</h3><p class="ok">Hui ixes com a «${esc(hecho)}».</p>'),
        ('<h3>🏆 ¿Sales en la clasificación de hoy?</h3>', '<h3>🏆 Vols eixir en la classificació de hui?</h3>'),
        ('<p>Tu apodo y tu puntuación serán visibles para todo el mundo. No pongas tu nombre completo.</p>', '<p>El teu sobrenom i la teua puntuació seran visibles per a tothom. No poses el teu nom complet.</p>'),
        ('>Apodo</label>', '>Sobrenom</label>'), ('placeholder="Tu apodo"', 'placeholder="El teu sobrenom"'),
        ('<button type="submit">Salir en la clasificación</button>', '<button type="submit">Ix en la classificació</button>'),
    ],
    "logros.js": [
        ('${n.length > 1 ? `¡${n.length} logros nuevos!` : "¡Logro nuevo!"} ${n.map((l) => l.nombre).join(", ")}</b><small>Ver todos tus logros</small>',
         '${n.length > 1 ? `${n.length} assoliments nous!` : "Assoliment nou!"} ${n.map((l) => l.nombre).join(", ")}</b><small>Vore tots els teus assoliments (en castellà)</small>'),
        ('"Primer paso", "Termina tu primer reto."', '"Primer pas", "Acaba el teu primer repte."'),
        ('"Trío del día", "Juega tres juegos distintos el mismo día."', '"Trio del dia", "Juga tres jocs diferents el mateix dia."'),
        ('"Póker del día", "Juega los cuatro juegos el mismo día."', '"Pòquer del dia", "Juga els quatre jocs el mateix dia."'),
        ('"Todo encaja", "Descubre los cuatro grupos de Grupos del día."', '"Tot encaixa", "Descobrix els quatre grups de Grupos del día."'),
        ('"Sin un fallo", "Descubre los cuatro grupos sin fallar ni una vez."', '"Sense cap error", "Descobrix els quatre grups sense fallar ni una vegada."'),
        ('"Gran clasificador", "Descubre los cuatro grupos en 10 retos."', '"Gran classificador", "Descobrix els quatre grups en 10 reptes."'),
        ('"Semana completa", "Haz el trío del día en 7 días distintos."', '"Setmana completa", "Fes el trio del dia 7 dies diferents."'),
        ('"Calentando", "Juega 3 días seguidos."', '"Escalfant", "Juga 3 dies seguits."'),
        ('"Una semana sin fallar", "Juega 7 días seguidos."', '"Una setmana sense fallar", "Juga 7 dies seguits."'),
        ('"Constancia", "Juega 30 días seguidos."', '"Constància", "Juga 30 dies seguits."'),
        ('"Viaje en el tiempo", "Juega un reto de un día anterior."', '"Viatge en el temps", "Juga un repte d\'un dia anterior."'),
        ('"Veterano", "Termina 50 retos."', '"Veterà", "Acaba 50 reptes."'),
        ('"Ojo de halcón", "Acierta ¿Dónde está? al primer intento."', '"Ull de falcó", "Encerta ¿Dónde está? al primer intent."'),
        ('"Geógrafo", "Acierta 10 retos de ¿Dónde está?."', '"Geògraf", "Encerta 10 reptes de ¿Dónde está?."'),
        ('"Brújula infalible", "Acierta 5 días seguidos de ¿Dónde está?."', '"Brúixola infal·lible", "Encerta 5 dies seguits de ¿Dónde está?."'),
        ('"Pleno de letras", "Consigue 25 de 25 en Letras del día."', '"Ple de lletres", "Aconseguix 25 de 25 en Lletres del dia."'),
        ('"Diccionario andante", "Acierta 100 palabras en Letras."', '"Diccionari ambulant", "Encerta 100 paraules en Lletres."'),
        ('"Rayo", "Ordena una palabra en 5 segundos o menos."', '"Llamp", "Ordena una paraula en 5 segons o menys."'),
        ('"¡Exacto!", "Llega exacto a una cifra."', '"Exacte!", "Arriba exacte a una xifra."'),
        ('"Pleno de cifras", "Llega exacto en las tres rondas de un día."', '"Ple de xifres", "Arriba exacte en les tres rondes d\'un dia."'),
        ('"Calculadora humana", "Llega exacto 25 veces en Cifras."', '"Calculadora humana", "Arriba exacte 25 vegades en Xifres."'),
    ],
    "imagen.js": [
        ('const JUEGO = /grupos/.test(location.pathname) ? "grupos" : /letras/.test(location.pathname) ? "letras" : /cifras/.test(location.pathname) ? "cifras" : "donde";',
         'const JUEGO = /lletres/.test(location.pathname) ? "letras" : /xifres/.test(location.pathname) ? "cifras" : "donde";'),
        ('{ donde: "¿Dónde está?", letras: "Letras del día", cifras: "Cifras del día", grupos: "Grupos del día" }', '{ donde: "¿Dónde está?", letras: "Lletres del dia", cifras: "Xifres del dia", grupos: "Grups del dia" }'),
        ('const inv = "¿Te atreves? Juega gratis en";', 'const inv = "T\'atrevixes? Juga gratis a";'),
        ('text: `Juega en piensaunrato.es`', 'text: `Juga a piensaunrato.es`'),
        ('"Preparando…"', '"Preparant…"'), ('"Imagen descargada"', '"Imatge baixada"'),
        (' Compartir imagen\';', ' Compartix la imatge\';'),
    ],
    "avisos.js": [
        ('"En iPhone, primero añade la web a la pantalla de inicio (Compartir › Añadir a pantalla de inicio) y ábrela desde allí."', '"En iPhone, primer afig la web a la pantalla d\'inici (Compartir › Afegir a la pantalla d\'inici) i obri-la des d\'allí."'),
        ('"Has bloqueado las notificaciones de esta web. Puedes permitirlas en los ajustes del navegador."', '"Has bloquejat les notificacions d\'esta web. Pots permetre-les en la configuració del navegador."'),
        ('"Te avisaremos cada mañana cuando salgan los retos nuevos."', '"T\'avisarem cada matí quan isquen els reptes nous."'),
        ('"Una notificación cada mañana cuando salgan los retos nuevos. Nada más."', '"Una notificació cada matí quan isquen els reptes nous. Res més."'),
        ('>Desactivar</button>', '>Desactiva</button>'), ('>Activar</button>', '>Activa</button>'),
        ('"Aviso diario activado" : "¿Te aviso cada mañana?"', '"Avís diari activat" : "T\'avise cada matí?"'),
        ('"Un momento…"', '"Un moment…"'),
        ('"Sin tu permiso no podemos avisarte. Puedes cambiarlo en los ajustes del navegador."', '"Sense el teu permís no podem avisar-te. Pots canviar-ho en la configuració del navegador."'),
        ('"No se ha podido activar ahora. Inténtalo de nuevo más tarde."', '"Ara no s\'ha pogut activar. Torna-ho a provar més tard."'),
    ],
    "clase.js": [
        ('const JUEGO = /grupos/.test(location.pathname) ? "grupos" : /letras/.test(location.pathname) ? "letras" : /cifras/.test(location.pathname) ? "cifras" : "donde";',
         'const JUEGO = /lletres/.test(location.pathname) ? "letras" : /xifres/.test(location.pathname) ? "cifras" : "donde";'),
        ('`<h3>Resultado enviado</h3><p class="ok">✓ Tu profe ya tiene tu resultado como «${esc(enviado.nombre)}».</p>`', '`<h3>Resultat enviat</h3><p class="ok">✓ El teu profe ja té el teu resultat com a «${esc(enviado.nombre)}».</p>`'),
        ('<h3>Envía tu resultado a tu profe</h3>', '<h3>Envia el teu resultat al teu profe</h3>'),
        ('<p>Escribe tu nombre (o el que te diga tu profe) para salir en la clasificación de la clase.</p>', '<p>Escriu el teu nom (o el que et diga el teu profe) per a eixir en la classificació de la classe.</p>'),
        ('>Tu nombre</label>', '>El teu nom</label>'), ('placeholder="Tu nombre"', 'placeholder="El teu nom"'), ('<button type="submit">Enviar</button>', '<button type="submit">Envia</button>'),
        ('"Escribe tu nombre."', '"Escriu el teu nom."'), ('"Enviando…"', '"Enviant…"'),
        ('"Ese nombre ya está en la clasificación. Prueba con otro, por ejemplo añadiendo tu inicial."', '"Eixe nom ja està en la classificació. Prova\'n un altre, per exemple afegint-hi la inicial."'),
        ('b.textContent = "Enviar"; return; }', 'b.textContent = "Envia"; return; }'),
        ('`<h3>Resultado enviado</h3><p class="ok">✓ Ya sales en la clasificación como «${esc(nombre)}».</p>`', '`<h3>Resultat enviat</h3><p class="ok">✓ Ja ixes en la classificació com a «${esc(nombre)}».</p>`'),
        ('"No se ha podido enviar. Revisa la conexión e inténtalo otra vez."; b.disabled = false; b.textContent = "Enviar";', '"No s\'ha pogut enviar. Revisa la connexió i torna-ho a provar."; b.disabled = false; b.textContent = "Envia";'),
    ],
}

def main():
    OUT.mkdir(exist_ok=True)
    try:
        (OUT / "xifres.html").write_text(xifres(), encoding="utf-8")
        (OUT / "lletres.html").write_text(lletres(), encoding="utf-8")
        for js, parells in JS.items():
            (OUT / js).write_text("// Generat per herramientas/valenciano.py a partir de ../" + js + ". No l'edites a mà.\n" +
                                  aplicar((ROOT / js).read_text(encoding="utf-8"), parells, js), encoding="utf-8")
    except Falta as e:
        sys.exit(f"ERROR: {e}")
    # Document per a revisar
    md = ["# Traducciones al valenciano (para revisar)", "",
          "Generado por `herramientas/valenciano.py`. Cada fila: texto en castellano → texto en valenciano.",
          "Para corregir algo, cambia la parte en valenciano en `herramientas/valenciano.py` (o las palabras en `paraules_va.py`) y vuelve a ejecutarlo.", ""]
    actual = None
    for fitxer, es, va in REVISIO:
        if fitxer != actual:
            md += ["", f"## {fitxer}", "", "| Castellano | Valenciano |", "|---|---|"]; actual = fitxer
        if es == va: continue
        cel = lambda s: s.replace("|", "\\|").replace("\n", " ")
        md.append(f"| {cel(es)} | {cel(va)} |")
    md += ["", "## Palabras de Lletres del dia", ""]
    for n, L in [(5, P.L5), (6, P.L6), (7, P.L7), (8, P.L8), (10, P.L10)]:
        md += [f"**{n} letras ({len(L)}):** " + ", ".join(L), ""]
    (ROOT / "herramientas" / "traducciones_va.md").write_text("\n".join(md), encoding="utf-8")
    print("Fet: va/xifres.html, va/lletres.html i", ", ".join("va/" + j for j in JS))

if __name__ == "__main__":
    main()
