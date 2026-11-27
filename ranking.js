// Clasificación pública voluntaria. La primera vez se pide un apodo; después, al terminar el reto diario
// se publica solo con ese apodo. Se puede cambiar el apodo, quitarse del día o dejar de publicar solo.
(function () {
  const API = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const P = location.pathname;
  const JUEGO = /linea/.test(P) ? "linea" : /grupos/.test(P) ? "grupos" : /lletres/.test(P) ? "lletres" : /letras/.test(P) ? "letras" : /cifras|xifres/.test(P) ? "cifras" : "donde";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del(k) { try { localStorage.removeItem(k); } catch (e) {} } };

  // Textos (el generador del valenciano los traduce aquí)
  const T = {
    titulo: "🏆 Clasificación de hoy",
    pregunta: "🏆 ¿Sales en la clasificación de hoy?",
    aviso: "Tu apodo y tu puntuación serán visibles para todo el mundo. No pongas tu nombre completo.",
    luego: "A partir de ahora saldrás automáticamente al terminar. Podrás cambiar el apodo o dejar de salir cuando quieras.",
    apodoLbl: "Apodo", apodoPh: "Tu apodo",
    salir: "Salir en la clasificación", guardar: "Guardar", cancelar: "Cancelar",
    publicando: "Publicando tu resultado…",
    sales: "Sales como", cambiar: "Cambiar apodo", quitar: "Quitarme de hoy",
    auto: "Publicar automáticamente al terminar",
    fuera: "Hoy no sales en la clasificación.", volver: "Volver a salir",
    ver: "Ver la clasificación de hoy",
    apodo: "Ese apodo no vale. Usa entre 2 y 20 letras o números, sin palabras malsonantes.",
    ocupado: "Ese apodo ya lo ha usado alguien hoy. Prueba con otro.",
    fecha: "Este reto ya no admite resultados.",
    error: "No se ha podido enviar. Inténtalo de nuevo."
  };

  // Variables globales de cada juego
  function diario() { try { return st && st.done && !(typeof CUSTOM !== "undefined" && CUSTOM) && !(typeof ARCH !== "undefined" && ARCH); } catch (e) { return false; } }
  function resultado() {
    try {
      // ¿Dónde está? cuenta con PTS(); el resto de juegos tienen score() y usedSecs()
      if (typeof PTS === "function" && Array.isArray(st.guesses)) return { puntos: PTS(st.won, st.guesses.length), segundos: null };
      if (typeof score === "function") return { puntos: score(), segundos: typeof usedSecs === "function" ? usedSecs() : null };
      return null;
    } catch (e) { return null; }
  }
  function token() {
    let t = ls.get("rk-token");
    if (!t) { const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; t = [...crypto.getRandomValues(new Uint8Array(24))].map((x) => A[x % 62]).join(""); ls.set("rk-token", t); }
    return t;
  }
  async function rpc(fn, body) {
    try {
      const x = await fetch(API + fn, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return x.ok ? await x.json() : "error";
    } catch (e) { return "error"; }
  }
  // Publica, o cambia el apodo de hoy (si ya estabas, el servidor no toca la puntuación)
  async function enviar(apodo) {
    const r = resultado();
    if (!r) return "error";
    return rpc("ranking_enviar", { p_juego: JUEGO, p_fecha: key, p_apodo: apodo, p_puntos: r.puntos, p_segundos: r.segundos, p_token: token() });
  }

  const verLink = `<a class="rk-link" href="/ranking.html?juego=${JUEGO}">${T.ver}</a>`;
  const CSS = `.rk-box{border:1.5px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--card)}
.rk-box h3{margin:0;font-size:.95rem}
.rk-box p{margin:0;font-size:.82rem;color:var(--muted)}
.rk-box form{display:flex;gap:8px;flex-wrap:wrap}
.rk-box input[type=text]{flex:1 1 150px;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink)}
.rk-box form button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 14px;background:var(--ink);color:var(--bg);min-height:44px}
.rk-box form button.sec{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
.rk-box button:focus-visible,.rk-box input:focus-visible,.rk-box a:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
.rk-box .rk-link{font-size:.88rem;font-weight:600;color:var(--ink)}
.rk-box .ok{color:var(--ink);font-size:.92rem}
.rk-box .acc{display:flex;gap:6px 16px;flex-wrap:wrap}
.rk-box .acc button{font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;background:none;border:0;box-shadow:none;padding:6px 0;color:var(--ink);text-decoration:underline;text-underline-offset:3px;min-height:32px}
.rk-box label.auto{display:flex;align-items:center;gap:8px;font-size:.84rem;color:var(--muted);cursor:pointer}
.rk-box label.auto input{width:18px;height:18px;accent-color:var(--signal)}
.rk-box .rk-msg:empty{display:none}
.rk-box .rk-msg{color:var(--bad,#C0392B)}`;

  const KEYDIA = () => `rk-${JUEGO}-${key}`;
  const FUERA = () => `rk-fuera-${JUEGO}-${key}`;
  const autoOn = () => ls.get("rk-auto") !== false;

  // Formulario de apodo: la primera vez («nuevo»), al cambiarlo o al volver a salir
  function formulario(box, modo, msgInicial) {
    let apodo = ls.get("rk-apodo") || ""; if (!apodo) { const l = ls.get("liga"); if (l && l.nick) apodo = l.nick; }
    const cambio = modo === "cambiar";
    box.innerHTML = `<h3>${cambio ? T.titulo : T.pregunta}</h3>
      <p>${T.aviso}</p>
      <form><label for="rk-apodo" style="position:absolute;left:-9999px">${T.apodoLbl}</label>
      <input type="text" id="rk-apodo" maxlength="20" autocomplete="nickname" placeholder="${T.apodoPh}" value="${esc(apodo)}"><button type="submit">${cambio ? T.guardar : T.salir}</button>${cambio ? `<button type="button" class="sec" data-a="cancelar">${T.cancelar}</button>` : ""}</form>
      ${modo === "nuevo" ? `<p>${T.luego}</p>` : ""}
      <p class="rk-msg" role="status">${msgInicial || ""}</p>${verLink}`;
    const f = box.querySelector("form"), msg = box.querySelector(".rk-msg");
    const c = box.querySelector('[data-a="cancelar"]'); if (c) c.onclick = () => publicado(box);
    f.onsubmit = async (e) => {
      e.preventDefault();
      const a = f.querySelector("input").value.trim();
      if (a.length < 2) { msg.textContent = T.apodo; return; }
      const b = f.querySelector("button"); b.disabled = true;
      const res = await enviar(a);
      b.disabled = false;
      if (res === "ok" || res === "repetido") { ls.set(KEYDIA(), a); ls.set("rk-apodo", a); ls.del(FUERA()); if (modo === "nuevo") ls.set("rk-auto", true); publicado(box); return; }
      msg.textContent = T[res] || T.error;
    };
  }

  // Ya publicado hoy: apodo, cambiarlo, quitarse y la opción de publicar solo
  function publicado(box) {
    box.innerHTML = `<h3>${T.titulo}</h3>
      <p class="ok">${T.sales} <b>«${esc(ls.get(KEYDIA()))}»</b>.</p>
      <div class="acc"><button type="button" data-a="cambiar">${T.cambiar}</button><button type="button" data-a="quitar">${T.quitar}</button></div>
      <label class="auto"><input type="checkbox" data-a="auto"${autoOn() ? " checked" : ""}> ${T.auto}</label>
      <p class="rk-msg" role="status"></p>${verLink}`;
    const msg = box.querySelector(".rk-msg");
    box.querySelector('[data-a="cambiar"]').onclick = () => formulario(box, "cambiar");
    box.querySelector('[data-a="auto"]').onchange = (e) => ls.set("rk-auto", e.target.checked);
    box.querySelector('[data-a="quitar"]').onclick = async (e) => {
      e.target.disabled = true;
      const res = await rpc("ranking_quitar", { p_juego: JUEGO, p_fecha: key, p_token: token() });
      if (res === true || res === false) { ls.del(KEYDIA()); ls.set(FUERA(), true); fuera(box); return; }
      e.target.disabled = false; msg.textContent = T.error;
    };
  }

  // Se quitó hoy de este juego: no se vuelve a publicar solo hasta que lo pida
  function fuera(box) {
    box.innerHTML = `<h3>${T.titulo}</h3><p class="ok">${T.fuera}</p>
      <div class="acc"><button type="button" data-a="volver">${T.volver}</button></div>${verLink}`;
    box.querySelector('[data-a="volver"]').onclick = () => formulario(box, "volver");
  }

  async function pintar(box) {
    if (ls.get(KEYDIA())) return publicado(box);
    if (ls.get(FUERA())) return fuera(box);
    const apodo = ls.get("rk-apodo");
    if (!apodo || !autoOn()) return formulario(box, apodo ? "volver" : "nuevo");
    // Publicación automática con el apodo de siempre
    box.innerHTML = `<h3>${T.titulo}</h3><p>${T.publicando}</p>`;
    const res = await enviar(apodo);
    if (res === "ok" || res === "repetido") { ls.set(KEYDIA(), apodo); return publicado(box); }
    formulario(box, "volver", T[res] || T.error);
  }

  function poner() {
    const end = document.querySelector("#end .end");
    if (!end || end.querySelector(".rk-box") || !diario()) return;
    const box = document.createElement("div"); box.className = "rk-box";
    const ref = end.querySelector("#global") || end.querySelector(".share");
    ref ? ref.after(box) : end.appendChild(box);
    pintar(box);
  }
  const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
  const go = () => { const end = document.getElementById("end"); if (!end) return; new MutationObserver(poner).observe(end, { childList: true, subtree: true }); poner(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();
