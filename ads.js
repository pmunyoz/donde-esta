// Anuncios de Google AdSense, en modo discreto. APAGADOS mientras CLIENT o SLOT estén vacíos:
// en ese caso no se carga nada de Google.
//
// Reglas para que no molesten al jugar:
//  - El código de Google solo se carga al terminar la partida (pantalla final) o en las páginas
//    de días anteriores y de clasificación. Durante el juego no hay nada de publicidad, ni siquiera cargada.
//  - Un único anuncio por pantalla, debajo de todo, con su hueco reservado para que nada salte.
//  - Solo bloques manuales (SLOT). En el panel de AdSense, DESACTIVA los «Anuncios automáticos»
//    (o al menos los formatos «Anclados» y «Viñeta»), porque son los que tapan la pantalla.
//
// Para activarlos:
//  1. Cuando AdSense apruebe la web, copia tu ID de editor (empieza por "ca-pub-") en CLIENT.
//  2. Crea en AdSense un bloque «Anuncio de display» adaptable y pon su número en SLOT.
//  3. Sube un archivo ads.txt a la raíz del dominio con la línea que te da AdSense.
//  4. En AdSense > Privacidad y mensajes, activa el mensaje de consentimiento para Europa (RGPD).
(function () {
  const CLIENT = "ca-pub-8361369070531250";   // p. ej. "ca-pub-1234567890123456"
  const SLOT = "8510435358";     // p. ej. "1234567890"
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
    css.textContent = ".ad-slot{margin-top:4px;min-height:120px;max-height:320px;overflow:hidden;text-align:center}.ad-slot::before{content:'Publicidad';display:block;font-size:.7rem;color:var(--muted);margin-bottom:4px}";
    document.head.appendChild(css);
  }

  // Rellena los huecos <div class="ad-slot"></div> que aún estén vacíos.
  // Solo se llama desde la pantalla final y desde las páginas de días anteriores y de clasificación.
  function fill() {
    if (!CLIENT || !SLOT) return;
    const slots = document.querySelectorAll(".ad-slot:not([data-done])");
    if (!slots.length) return;
    load();
    slots.forEach(function (el, i) {
      if (i > 0) return; // un solo anuncio por pantalla
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

  window.Ads = { fill: fill, enabled: !!(CLIENT && SLOT) };
})();
