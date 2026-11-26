// Anuncios de Google AdSense. APAGADOS mientras CLIENT esté vacío: no se carga nada de Google.
//
// Para activarlos:
//  1. Cuando AdSense apruebe la web, copia tu ID de editor (empieza por "ca-pub-") en CLIENT.
//  2. Opcional: crea un bloque de anuncio adaptable en AdSense y pon su número en SLOT.
//     Sin SLOT solo funcionan los anuncios automáticos que configures en el panel de AdSense.
//  3. Sube un archivo ads.txt a la raíz del dominio con la línea que te da AdSense.
//  4. En AdSense > Privacidad y mensajes, activa el mensaje de consentimiento para Europa (RGPD).
//     Google lo muestra solo; no hace falta tocar nada aquí.
(function () {
  const CLIENT = "";   // p. ej. "ca-pub-1234567890123456"
  const SLOT = "";     // p. ej. "1234567890"
  let loaded = false;

  function load() {
    if (loaded || !CLIENT) return;
    loaded = true;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(CLIENT);
    document.head.appendChild(s);
    const css = document.createElement("style");
    css.textContent = ".ad-slot{margin-top:4px;min-height:100px;text-align:center}.ad-slot::before{content:'Publicidad';display:block;font-size:.7rem;color:var(--muted);margin-bottom:4px}";
    document.head.appendChild(css);
  }

  // Rellena los huecos <div class="ad-slot"></div> que aún estén vacíos.
  function fill() {
    if (!CLIENT) return;
    load();
    if (!SLOT) return;
    document.querySelectorAll(".ad-slot:not([data-done])").forEach(function (el) {
      el.dataset.done = "1";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.dataset.adClient = CLIENT;
      ins.dataset.adSlot = SLOT;
      ins.dataset.adFormat = "auto";
      ins.dataset.fullWidthResponsive = "true";
      el.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  window.Ads = { fill: fill, enabled: !!CLIENT };
  if (CLIENT) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fill);
    else fill();
  }
})();
