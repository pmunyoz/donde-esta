// Modo clase en directo: en un reto de profe con clasificación (reto.cl), al terminar
// el alumno escribe su nombre y envía el resultado al panel del profe (clase.html).
(function () {
  const RPC = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/clase_enviar";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const JUEGO = /grupos/.test(location.pathname) ? "grupos" : /letras/.test(location.pathname) ? "letras" : /cifras/.test(location.pathname) ? "cifras" : "donde";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Las variables de cada juego son globales del documento (const de nivel superior)
  function reto() { try { return typeof CUSTOM !== "undefined" && CUSTOM && /^[A-Z0-9]{8,12}$/.test(CUSTOM.cl || "") ? CUSTOM : null; } catch (e) { return null; } }
  function resultado() {
    try {
      if (JUEGO === "donde") return { puntos: PTS(st.won, st.guesses.length), aciertos: st.won ? 1 : 0, segundos: null };
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
    if (enviado) { box.innerHTML = `<h3>Resultado enviado</h3><p class="ok">✓ Tu profe ya tiene tu resultado como «${esc(enviado.nombre)}».</p>`; return; }
    box.innerHTML = `<h3>Envía tu resultado a tu profe</h3>
      <p>Escribe tu nombre (o el que te diga tu profe) para salir en la clasificación de la clase.</p>
      <form><label class="sr" for="clase-nombre" style="position:absolute;left:-9999px">Tu nombre</label>
      <input id="clase-nombre" maxlength="30" autocomplete="off" placeholder="Tu nombre" required><button type="submit">Enviar</button></form>
      <p class="msg" role="status"></p>`;
    const f = box.querySelector("form"), msg = box.querySelector(".msg");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const nombre = f.querySelector("input").value.trim();
      if (!nombre) { msg.textContent = "Escribe tu nombre."; return; }
      const b = f.querySelector("button"); b.disabled = true; b.textContent = "Enviando…";
      try {
        const r = await fetch(RPC, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ p_clase: R.cl, p_juego: JUEGO, p_nombre: nombre, p_puntos: res.puntos, p_aciertos: res.aciertos, p_segundos: res.segundos }) });
        if (!r.ok) throw new Error(r.status);
        if (!(await r.json())) { msg.textContent = "Ese nombre ya está en la clasificación. Prueba con otro, por ejemplo añadiendo tu inicial."; b.disabled = false; b.textContent = "Enviar"; return; }
        try { localStorage.setItem(LS, JSON.stringify({ nombre })); } catch (e2) {}
        box.innerHTML = `<h3>Resultado enviado</h3><p class="ok">✓ Ya sales en la clasificación como «${esc(nombre)}».</p>`;
      } catch (err) { msg.textContent = "No se ha podido enviar. Revisa la conexión e inténtalo otra vez."; b.disabled = false; b.textContent = "Enviar"; }
    };
  }
  const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
  const go = () => { const end = document.getElementById("end"); if (!end) return; new MutationObserver(poner).observe(end, { childList: true, subtree: true }); poner(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", go) : go();
})();
