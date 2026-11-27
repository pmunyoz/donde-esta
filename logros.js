// Logros de Piensa un rato. Se calculan con las partidas guardadas en este navegador
// (dd-AAAA-MM-DD, lt-…, cf-…, gr-… y tl-…), así que no hace falta cuenta ni servidor.
(function () {
  const VISTOS = "logros-vistos";
  const ymd = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const get = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };

  function datos() {
    const D = { donde: [], letras: [], cifras: [], grupos: [], linea: [], jugados: new Set(), porFecha: {} };
    let keys = [];
    try { keys = Object.keys(localStorage); } catch (e) {}
    for (const k of keys) {
      const m = k.match(/^(dd|lt|ll|cf|gr|tl)-(\d{4}-\d{2}-\d{2})$/);  // ll = Lletres del dia (valencià)
      if (!m) continue;
      const s = get(k);
      if (!s || !s.done) continue;
      const fecha = m[2], jugado = s.t1 ? ymd(s.t1) : fecha, archivo = jugado !== fecha;
      D.jugados.add(jugado);
      (D.porFecha[fecha] = D.porFecha[fecha] || new Set()).add(m[1] === "ll" ? "lt" : m[1]);
      if (m[1] === "dd") D.donde.push({ fecha, archivo, won: !!s.won, n: (s.guesses || []).length });
      else if (m[1] === "lt" || m[1] === "ll") { const r = s.res || []; D.letras.push({ fecha, archivo, pts: r.reduce((a, x) => a + (x.pts || 0), 0), ok: r.filter((x) => x.ok).length, rapida: Math.min(99, ...r.filter((x) => x.ok).map((x) => x.s ?? 99)) }); }
      else if (m[1] === "tl") D.linea.push({ fecha, archivo, ok: (s.res || []).filter(Boolean).length, won: !!s.won, mist: s.mist || 0 });
      else if (m[1] === "gr") D.grupos.push({ fecha, archivo, pts: s.score != null ? s.score : (s.found || []).length * 5, won: !!s.won, mist: s.mist || 0 });
      else { const r = s.res || []; D.cifras.push({ fecha, archivo, pts: r.reduce((a, x) => a + (x.pts || 0), 0), exactas: r.filter((x) => x.d === 0).length }); }
    }
    // Racha conjunta: días seguidos (por día de juego) con al menos un reto terminado
    const dias = [...D.jugados].sort();
    let max = 0, cur = 0, prev = null;
    for (const d of dias) {
      const t = new Date(d + "T12:00:00");
      cur = prev && Math.round((t - prev) / 864e5) === 1 ? cur + 1 : 1;
      max = Math.max(max, cur); prev = t;
    }
    const hoy = ymd(Date.now()), ayer = ymd(Date.now() - 864e5);
    D.rachaActual = D.jugados.has(hoy) || D.jugados.has(ayer) ? cur : 0;
    D.rachaMax = max;
    D.trios = Object.values(D.porFecha).filter((s) => s.size >= 3).length;
    D.pokers = Object.values(D.porFecha).filter((s) => s.size >= 4).length;
    D.plenos = Object.values(D.porFecha).filter((s) => s.size >= 5).length;
    D.archivo = [...D.donde, ...D.letras, ...D.cifras, ...D.grupos, ...D.linea].filter((x) => x.archivo).length;
    D.total = D.donde.length + D.letras.length + D.cifras.length + D.grupos.length + D.linea.length;
    // Aciertos seguidos en ¿Dónde está? (por fecha del reto diario)
    let seg = 0, segMax = 0, p = null;
    for (const r of D.donde.filter((x) => !x.archivo).sort((a, b) => a.fecha < b.fecha ? -1 : 1)) {
      const t = new Date(r.fecha + "T12:00:00");
      seg = r.won ? (p && Math.round((t - p) / 864e5) === 1 && seg > 0 ? seg + 1 : 1) : 0;
      segMax = Math.max(segMax, seg); p = t;
    }
    D.dondeSeguidos = segMax;
    return D;
  }

  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  // [id, icono, nombre, descripción, función que devuelve [valor, meta]]
  const LISTA = [
    ["primero", "🌱", "Primer paso", "Termina tu primer reto.", (D) => [D.total, 1]],
    ["trio", "🎯", "Trío del día", "Juega tres juegos distintos el mismo día.", (D) => [D.trios, 1]],
    ["poker", "🃏", "Póker del día", "Juega cuatro juegos distintos el mismo día.", (D) => [D.pokers, 1]],
    ["pleno", "🌟", "Pleno del día", "Juega los cinco juegos el mismo día.", (D) => [D.plenos, 1]],
    ["trio7", "🏆", "Semana completa", "Haz el trío del día en 7 días distintos.", (D) => [D.trios, 7]],
    ["racha3", "🔥", "Calentando", "Juega 3 días seguidos.", (D) => [D.rachaMax, 3]],
    ["racha7", "📆", "Una semana sin fallar", "Juega 7 días seguidos.", (D) => [D.rachaMax, 7]],
    ["racha30", "💎", "Constancia", "Juega 30 días seguidos.", (D) => [D.rachaMax, 30]],
    ["archivo", "⏳", "Viaje en el tiempo", "Juega un reto de un día anterior.", (D) => [D.archivo, 1]],
    ["veterano", "🎖️", "Veterano", "Termina 50 retos.", (D) => [D.total, 50]],
    ["donde1", "🦅", "Ojo de halcón", "Acierta ¿Dónde está? al primer intento.", (D) => [D.donde.some((x) => x.won && x.n === 1) ? 1 : 0, 1]],
    ["donde10", "🗺️", "Geógrafo", "Acierta 10 retos de ¿Dónde está?.", (D) => [D.donde.filter((x) => x.won).length, 10]],
    ["donde5", "🧭", "Brújula infalible", "Acierta 5 días seguidos de ¿Dónde está?.", (D) => [D.dondeSeguidos, 5]],
    ["letras25", "📚", "Pleno de letras", "Consigue 25 de 25 en Letras del día.", (D) => [D.letras.some((x) => x.pts >= 25) ? 1 : 0, 1]],
    ["letras100", "📖", "Diccionario andante", "Acierta 100 palabras en Letras.", (D) => [sum(D.letras, (x) => x.ok), 100]],
    ["letrasrayo", "⚡", "Rayo", "Ordena una palabra en 5 segundos o menos.", (D) => [D.letras.some((x) => x.rapida <= 5) ? 1 : 0, 1]],
    ["cifras1", "✔️", "¡Exacto!", "Llega exacto a una cifra.", (D) => [sum(D.cifras, (x) => x.exactas) > 0 ? 1 : 0, 1]],
    ["cifras3", "🧮", "Pleno de cifras", "Llega exacto en las tres rondas de un día.", (D) => [D.cifras.some((x) => x.exactas >= 3) ? 1 : 0, 1]],
    ["cifras25", "🤖", "Calculadora humana", "Llega exacto 25 veces en Cifras.", (D) => [sum(D.cifras, (x) => x.exactas), 25]],
    ["grupos1", "🧩", "Todo encaja", "Descubre los cuatro grupos de Grupos del día.", (D) => [D.grupos.some((x) => x.won) ? 1 : 0, 1]],
    ["grupos0", "🌈", "Sin un fallo", "Descubre los cuatro grupos sin fallar ni una vez.", (D) => [D.grupos.some((x) => x.won && x.mist === 0) ? 1 : 0, 1]],
    ["grupos10", "🗂️", "Gran clasificador", "Descubre los cuatro grupos en 10 retos.", (D) => [D.grupos.filter((x) => x.won).length, 10]],
    ["linea1", "⏳", "Viajero en el tiempo", "Completa una Línea del tiempo.", (D) => [D.linea.some((x) => x.won) ? 1 : 0, 1]],
    ["linea0", "📜", "Historiador", "Completa una Línea del tiempo sin fallar.", (D) => [D.linea.some((x) => x.won && x.mist === 0) ? 1 : 0, 1]],
    ["linea50", "🏛️", "Memoria de elefante", "Coloca bien 50 sucesos en Línea del tiempo.", (D) => [D.linea.reduce((a, x) => a + x.ok, 0), 50]]
  ];

  function estado() {
    const D = datos();
    return { D, logros: LISTA.map(([id, ic, nombre, desc, f]) => { const [v, meta] = f(D); return { id, ic, nombre, desc, v: Math.min(v, meta), meta, ok: v >= meta }; }) };
  }

  let nuevosSesion = null;
  function nuevos() {
    if (nuevosSesion) return nuevosSesion;
    const { logros } = estado();
    let vistos = get(VISTOS);
    const primeraVez = !Array.isArray(vistos);
    vistos = new Set(primeraVez ? [] : vistos);
    const ok = logros.filter((l) => l.ok);
    // La primera vez no se anuncian los que ya se tenían de antes, salvo «Primer paso»
    nuevosSesion = primeraVez ? ok.filter((l) => l.id === "primero" && ok.length === 1) : ok.filter((l) => !vistos.has(l.id));
    try { localStorage.setItem(VISTOS, JSON.stringify(ok.map((l) => l.id))); } catch (e) {}
    return nuevosSesion;
  }

  const CSS = `.logro-nuevo{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:2px solid var(--signal);background:var(--card);color:var(--ink);text-decoration:none;animation:logro-in .5s ease-out}
.logro-nuevo .ic{font-size:1.8rem;line-height:1}
.logro-nuevo b{display:block}
.logro-nuevo small{color:var(--muted)}
@keyframes logro-in{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.logro-nuevo{animation:none}}`;
  let styled = false;

  window.Logros = {
    estado,
    // Muestra los logros recién conseguidos justo debajo del título de la pantalla final
    avisar(endBox) {
      if (!endBox) return;
      const n = nuevos();
      if (!n.length || endBox.querySelector(".logro-nuevo")) return;
      if (!styled) { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      const a = document.createElement("a");
      a.className = "logro-nuevo"; a.href = "logros.html";
      a.innerHTML = `<span class="ic" aria-hidden="true">${n[0].ic}</span><span><b>${n.length > 1 ? `¡${n.length} logros nuevos!` : "¡Logro nuevo!"} ${n.map((l) => l.nombre).join(", ")}</b><small>Ver todos tus logros</small></span>`;
      const h2 = endBox.querySelector("h2");
      h2 ? h2.after(a) : endBox.prepend(a);
    }
  };
})();
