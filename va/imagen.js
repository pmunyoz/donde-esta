// Generat per herramientas/valenciano.py a partir de ../imagen.js. No l'edites a mà.
// Imagen del resultado para compartir (historias de Instagram, estados de WhatsApp…).
// Añade el botón «Compartir imagen» junto al de WhatsApp en la pantalla final y dibuja
// la imagen a partir del mismo texto que se comparte (shareText() de cada juego).
(function () {
  const W = 1080, H = 1350;
  const JUEGO = /lletres/.test(location.pathname) ? "letras" : /xifres/.test(location.pathname) ? "cifras" : "donde";
  const NOMBRE = { donde: "¿Dónde está?", letras: "Lletres del dia", cifras: "Xifres del dia", grupos: "Grups del dia", linea: "Línia del temps" }[JUEGO];
  const C = { fondo: "#1B2F45", tarjeta: "#22374E", amarillo: "#E3A21A", claro: "#E6EEF4", suave: "#93A6B8" };
  const DISP = '"Bricolage Grotesque", "Archivo", system-ui, sans-serif';
  const BODY = '"Archivo", system-ui, sans-serif';
  const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ajustar(ctx, txt, max, size, font, peso) { let s = size; do { ctx.font = `${peso} ${s}px ${font}`; s -= 2; } while (ctx.measureText(txt).width > max && s > 20); }

  async function dibujar(texto) {
    try { await document.fonts.ready; } catch (e) {}
    const lineas = texto.split("\n").filter((l) => l.trim() && !/^https?:\/\//.test(l.trim()));
    const titulo = lineas.shift() || NOMBRE;
    // «Cifras del día nº 3 — 17/30 puntos» → cabecera y puntuación
    const m = titulo.match(/^(.*?)\s+—\s+(.*)$/);
    const cab = m ? m[1] : titulo, puntos = m ? m[2] : "";
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = C.fondo; ctx.fillRect(0, 0, W, H);
    // Marca
    ctx.fillStyle = C.amarillo; ctx.font = `800 40px ${DISP}`; ctx.textBaseline = "alphabetic";
    ctx.fillText("Piensa un rato", 90, 140);
    // Juego y número
    ctx.fillStyle = C.claro; ajustar(ctx, cab, W - 180, 86, DISP, 800); ctx.fillText(cab, 90, 250);
    // Puntuación en tarjeta amarilla
    let y = 310;
    if (puntos) {
      rr(ctx, 90, y, W - 180, 230, 36); ctx.fillStyle = C.amarillo; ctx.fill();
      ctx.fillStyle = C.fondo; ajustar(ctx, puntos, W - 260, 120, DISP, 800);
      const pw = ctx.measureText(puntos).width; ctx.fillText(puntos, (W - pw) / 2, y + 160);
      y += 290;
    }
    // Líneas del resultado (cuadritos de colores, «exacto», etc.)
    const n = Math.min(lineas.length, 8), alto = Math.min(110, (H - 230 - y) / Math.max(n, 1));
    rr(ctx, 90, y, W - 180, alto * n + 60, 36); ctx.fillStyle = C.tarjeta; ctx.fill();
    ctx.fillStyle = C.claro;
    lineas.slice(0, 8).forEach((l, i) => {
      ctx.font = `600 ${Math.round(alto * 0.62)}px ${BODY}, ${EMO}`;
      ajustar(ctx, l, W - 260, Math.round(alto * 0.62), `${BODY}, ${EMO}`, 600);
      const lw = ctx.measureText(l).width;
      ctx.fillText(l, (W - lw) / 2, y + 30 + alto * (i + 0.75));
    });
    // Invitación
    ctx.fillStyle = C.suave; ctx.font = `500 38px ${BODY}`;
    const inv = "T'atrevixes? Juga gratis a";
    ctx.fillText(inv, (W - ctx.measureText(inv).width) / 2, H - 150);
    ctx.fillStyle = C.amarillo; ctx.font = `800 58px ${DISP}`;
    const url = "piensaunrato.es";
    ctx.fillText(url, (W - ctx.measureText(url).width) / 2, H - 80);
    return new Promise((res) => cv.toBlob(res, "image/png"));
  }

  async function compartir(btn) {
    if (typeof window.shareText !== "function") return;
    const txt = btn.textContent; btn.disabled = true; btn.textContent = "Preparant…";
    try {
      const blob = await dibujar(window.shareText());
      const file = new File([blob], `piensaunrato-${JUEGO}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `Juga a piensaunrato.es` });
      } else {
        // Sin «compartir» del sistema (ordenador): se descarga la imagen
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        btn.textContent = "Imatge baixada"; setTimeout(() => { btn.textContent = txt; }, 2500);
        return;
      }
    } catch (e) { /* el usuario canceló */ }
    finally { btn.disabled = false; if (btn.textContent === "Preparant…") btn.textContent = txt; }
  }

  // Pone el botón junto al de WhatsApp cada vez que se dibuja la pantalla final
  function poner() {
    const wa = document.querySelector("#end #wa");
    if (!wa || wa.parentElement.querySelector(".img-share")) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "img-share";
    b.innerHTML = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 15l-5-5L5 21"/></svg> Compartix la imatge';
    b.onclick = () => compartir(b);
    wa.after(b);
    wa.parentElement.classList.add("share-row");
  }
  const css = document.createElement("style");
  css.textContent = ".img-share{font:inherit;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 18px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);flex:1 1 180px}.img-share:hover{border-color:var(--signal)}.img-share:focus-visible{outline:2px solid var(--ink);outline-offset:2px}.img-share:disabled{opacity:.6}"
    // WhatsApp e imagen: mismo ancho y alto (uno debajo del otro en móvil, lado a lado si cabe)
    + ".share-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;align-items:stretch}"
    + ".share-row>#wa,.share-row>.img-share{width:100%;max-width:none;min-height:48px;box-sizing:border-box;margin:0;padding:10px 8px;border:1.5px solid transparent;font-size:.95rem;white-space:nowrap;line-height:1.2;text-align:center}"
    + ".share-row>.img-share{border-color:var(--line)}"
    + ".share-row>:not(#wa):not(.img-share){grid-column:1/-1}";
  document.head.appendChild(css);
  document.addEventListener("DOMContentLoaded", () => {
    const end = document.getElementById("end");
    if (!end) return;
    new MutationObserver(poner).observe(end, { childList: true, subtree: true });
    poner();
  });
  window.ImagenResultado = { dibujar };
})();
