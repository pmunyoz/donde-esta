// Generat per herramientas/valenciano.py a partir de ../clase.js. No l'edites a mà.
// Modo clase en directo: en un reto de profe con clasificación (reto.cl), al terminar
// el alumno escribe su nombre y envía el resultado al panel del profe (clase.html).
(function () {
  const RPC = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/clase_enviar";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const JUEGO = /lletres/.test(location.pathname) ? "letras" : /xifres/.test(location.pathname) ? "cifras" : "donde";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Las variables de cada juego son globales del documento (const de nivel superior)
  function reto() { try { return typeof CUSTOM !== "undefined" && CUSTOM && /^[A-Z0-9]{8,12}$/.test(CUSTOM.cl || "") ? CUSTOM : null; } catch (e) { return null; } }
  function resultado() {
    try {
      if (typeof PTS === "function" && Array.isArray(st.guesses)) return { puntos: PTS(st.won, st.guesses.length), aciertos: st.won ? 1 : 0, segundos: null };
      if (JUEGO === "linea") return { puntos: score(), aciertos: aciertos(), segundos: usedSecs() };
      if (JUEGO === "grupos") return { puntos: score(), aciertos: st.found.length, segundos: usedSecs() };
      if (JUEGO === "letras") return { puntos: score(), aciertos: st.res.filter((r) => r.ok).length, segundos: usedSecs() };
      return { puntos: score(), aciertos: exact(), segundos: usedSecs() };
    } catch (e) { return null; }
  }

  const CSS = `.clase-box{border:2px solid var(--signal);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;background:var(--card)}
.clase-box h3{margin:0;font-size:1rem}
.clase-box p{margin:0;font-size:.85rem;color:var(--muted)}
.clase-box form{display:flex;gap:8px;flex-wrap:wrap}
.clase-box input{flex:1 1 160px;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink)}
.clase-box button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 16px;background:var(--signal);color:var(--signal-ink,#3A2600);min-height:44px}
.clase-box .ok{color:var(--hot,#2E8B57);font-weight:600}`;

  function poner() {
    const R = reto(), end = document.querySelector("#end .end");
    if (!R || !end || end.querySelector(".clase-box")) return;
    const res = resultado(); if (!res) return;
    const LS = "clase-" + R.cl;
    let enviado = null; try { enviado = JSON.parse(localStorage.getItem(LS)); } catch (e) {}
    const box = document.createElement("div"); box.className = "clase-box";
    const h2 = end.querySelector("h2"); h2 ? h2.after(box) : end.prepend(box);
    if (enviado) { box.innerHTML = `<h3>Resultat enviat</h3><p class="ok">✓ El teu profe ja té el teu resultat com a «${esc(enviado.nombre)}».</p>`; return; }
    box.innerHTML = `<h3>Envia el teu resultat al teu profe</h3>
      <p>Escriu el teu nom (o el que et diga el teu profe) per a eixir en la classificació de la classe.</p>
      <form><label class="sr" for="clase-nombre" style="position:absolute;left:-9999px">El teu nom</label>
      <input id="clase-nombre" maxlength="30" autocomplete="off" placeholder="El teu nom" required><button type="submit">Envia</button></form>
      <p class="msg" role="status"></p>`;
    const f = box.querySelector("form"), msg = box.querySelector(".msg");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const nombre = f.querySelector("input").value.trim();
      if (!nombre) { msg.textContent = "Escriu el teu nom."; return; }
      const b = f.querySelector("button"); b.disabled = true; b.textContent = "Enviant…";
      try {
        const r = await fetch(RPC, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ p_clase: R.cl, p_juego: JUEGO, p_nombre: nombre, p_puntos: res.puntos, p_aciertos: res.aciertos, p_segundos: res.segundos }) });
        if (!r.ok) throw new Error(r.status);
        if (!(await r.json())) { msg.textContent = "Eixe nom ja està en la classificació. Prova'n un altre, per exemple afegint-hi la inicial."; b.disabled = false; b.textContent = "Envia"; return; }
        try { localStorage.setItem(LS, JSON.stringify({ nombre })); } catch (e2) {}
        box.innerHTML = `<h3>Resultat enviat</h3><p class="ok">✓ Ja ixes en la classificació com a «${esc(nombre)}».</p>`;
      } catch (err) { msg.textContent = "No s'ha pogut enviar. Revisa la connexió i torna-ho a provar."; b.disabled = false; b.textContent = "Envia"; }
    };
  }
  const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
  const go = () => { const end = document.getElementById("end"); if (!end) return; new MutationObserver(poner).observe(end, { childList: true, subtree: true }); poner(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();
