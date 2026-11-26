// Estadísticas de todos los jugadores del reto diario (agregadas en Supabase, sin datos personales).
// Uso: Estadisticas.mostrar(elemento, "donde"|"letras"|"cifras", "AAAA-MM-DD", misPuntos, maximo, esArchivo)
(function () {
  const RPC = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/estadisticas_dia";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const CSS = `
.global{border:1.5px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px;background:var(--card)}
.global:empty{display:none}
.global h3{margin:0;font-size:.95rem}
.global .gl-line{margin:0;font-size:.88rem;color:var(--muted)}
.global .gl-line b{color:var(--ink)}
.global .gl-bars{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:6px;align-items:end;height:92px}
.global .gl-bar{display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;height:100%}
.global .gl-bar i{display:block;width:100%;border-radius:6px 6px 2px 2px;background:var(--line);min-height:3px}
.global .gl-bar.me i{background:var(--signal)}
.global .gl-bar span{font-size:.7rem;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.global .gl-bar.me span{color:var(--ink);font-weight:700}`;
  let styled = false;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function pedir(juego, fecha) {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_juego: juego, p_fecha: fecha })
    });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  // Agrupa las puntuaciones en 6 tramos (o menos si el máximo es pequeño)
  function tramos(max) {
    const n = Math.min(6, max + 1), out = [];
    for (let i = 0; i < n; i++) {
      const lo = Math.round(i * (max + 1) / n), hi = Math.round((i + 1) * (max + 1) / n) - 1;
      out.push({ lo, hi, label: lo === hi ? String(lo) : `${lo}–${hi}` });
    }
    return out;
  }

  function pintar(el, d, mis, max, archivo) {
    const total = +d.total || 0;
    if (total < 3) {
      el.innerHTML = `<h3>${archivo ? "Ese día" : "Hoy"}, entre todos</h3><p class="gl-line">${archivo ? "Pocos jugaron ese reto, así que no hay estadísticas." : "Eres de los primeros en jugar el reto de hoy. Vuelve más tarde para ver cómo te comparas con los demás."}</p>`;
      return;
    }
    const pts = d.puntos || {};
    let menos = 0;
    for (const k in pts) if (+k < mis) menos += pts[k];
    const pct = Math.round(100 * menos / total);
    const media = String(d.media).replace(".", ",");
    const T = tramos(max).map((t) => {
      let n = 0;
      for (const k in pts) if (+k >= t.lo && +k <= t.hi) n += pts[k];
      return { ...t, n, me: mis >= t.lo && mis <= t.hi };
    });
    const top = Math.max(1, ...T.map((t) => t.n));
    el.innerHTML = `<h3>${archivo ? "Ese día" : "Hoy"}, entre todos</h3>
      <p class="gl-line"><b>${total.toLocaleString("es-ES")}</b> ${archivo ? "jugaron" : "han jugado"} · media <b>${esc(media)}</b> de ${max}${pct > 0 ? ` · has superado al <b>${pct} %</b>` : ""}</p>
      <div class="gl-bars" style="--n:${T.length}" role="img" aria-label="Cuántos jugadores sacaron cada puntuación">
        ${T.map((t) => `<div class="gl-bar${t.me ? " me" : ""}"><i style="height:${Math.round(70 * t.n / top)}px"></i><span>${t.label}</span></div>`).join("")}
      </div>`;
  }

  window.Estadisticas = {
    mostrar(el, juego, fecha, mis, max, archivo) {
      if (!el) return;
      if (!styled) { const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); styled = true; }
      // Esperar un momento para que cuente también la partida que se acaba de terminar
      setTimeout(async () => {
        try { pintar(el, await pedir(juego, fecha), mis, max, archivo); } catch (e) { el.innerHTML = ""; }
      }, 1200);
    }
  };
})();
