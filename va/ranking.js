// Generat per herramientas/valenciano.py a partir de ../ranking.js. No l'edites a mà.
// Clasificación pública voluntaria: al terminar el reto diario, quien quiera aparece con su apodo.
(function () {
  const RPC = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/ranking_enviar";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const P = location.pathname;
  const JUEGO = /linea/.test(P) ? "linea" : /grupos/.test(P) ? "grupos" : /lletres/.test(P) ? "lletres" : /letras/.test(P) ? "letras" : /cifras|xifres/.test(P) ? "cifras" : "donde";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  // Variables globales de cada juego
  function diario() { try { return st && st.done && !(typeof CUSTOM !== "undefined" && CUSTOM) && !(typeof ARCH !== "undefined" && ARCH); } catch (e) { return false; } }
  function resultado() {
    try {
      if (JUEGO === "donde") return { puntos: PTS(st.won, st.guesses.length), segundos: null };
      return { puntos: score(), segundos: usedSecs() };
    } catch (e) { return null; }
  }
  function token() {
    let t = ls.get("rk-token");
    if (!t) { const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; t = [...crypto.getRandomValues(new Uint8Array(24))].map((x) => A[x % 62]).join(""); ls.set("rk-token", t); }
    return t;
  }
  const verLink = `<a class="rk-link" href="/ranking.html?juego=${JUEGO}">Vore la classificació de hui (en castellà)</a>`;
  const MSG = { apodo: "Eixe sobrenom no val. Usa entre 2 i 20 lletres o números, sense paraulotes.", ocupado: "Eixe sobrenom ja l'ha usat algú hui. Prova'n un altre.", fecha: "Este repte ja no admet resultats.", error: "No s'ha pogut enviar. Torna-ho a provar." };

  const CSS = `.rk-box{border:1.5px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--card)}
.rk-box h3{margin:0;font-size:.95rem}
.rk-box p{margin:0;font-size:.82rem;color:var(--muted)}
.rk-box form{display:flex;gap:8px;flex-wrap:wrap}
.rk-box input{flex:1 1 150px;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink)}
.rk-box button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 14px;background:var(--ink);color:var(--bg);min-height:44px}
.rk-box button:focus-visible,.rk-box input:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
.rk-box .rk-link{font-size:.88rem;font-weight:600;color:var(--ink)}
.rk-box .ok{color:var(--ink);font-weight:600}`;

  function pintar(box) {
    const KEYDIA = `rk-${JUEGO}-${key}`, hecho = ls.get(KEYDIA);
    if (hecho) { box.innerHTML = `<h3>🏆 Classificació pública</h3><p class="ok">Hui ixes com a «${esc(hecho)}».</p>${verLink}`; return; }
    let apodo = ls.get("rk-apodo") || ""; if (!apodo) { const l = ls.get("liga"); if (l && l.nick) apodo = l.nick; }
    box.innerHTML = `<h3>🏆 Vols eixir en la classificació de hui?</h3>
      <p>El teu sobrenom i la teua puntuació seran visibles per a tothom. No poses el teu nom complet.</p>
      <form><label for="rk-apodo" style="position:absolute;left:-9999px">Sobrenom</label>
      <input id="rk-apodo" maxlength="20" autocomplete="nickname" placeholder="El teu sobrenom" value="${esc(apodo)}"><button type="submit">Ix en la classificació</button></form>
      <p class="rk-msg" role="status"></p>${verLink}`;
    const f = box.querySelector("form"), msg = box.querySelector(".rk-msg");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const a = f.querySelector("input").value.trim(), r = resultado();
      if (a.length < 2) { msg.textContent = MSG.apodo; return; }
      if (!r) return;
      const b = f.querySelector("button"); b.disabled = true;
      let res = "error";
      try {
        const x = await fetch(RPC, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ p_juego: JUEGO, p_fecha: key, p_apodo: a, p_puntos: r.puntos, p_segundos: r.segundos, p_token: token() }) });
        if (x.ok) res = await x.json();
      } catch (err) {}
      b.disabled = false;
      if (res === "ok" || res === "repetido") { ls.set(KEYDIA, a); ls.set("rk-apodo", a); pintar(box); return; }
      msg.textContent = MSG[res] || MSG.error;
    };
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
