// Generat per herramientas/valenciano.py a partir de ../avisos.js. No l'edites a mà.
// Aviso diario opcional: «Ya están los retos de hoy». Añade un botón en la pantalla final.
(function () {
  const RPC = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/rpc/";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  const PUBLICA = "BAvgq56et2iWAWfvSzTBgn5VbKKsgY1vT1fGFL49lJKkSCRo74LZa_A0PdbzRZt6Ul1za914IQpTt1IKSUQoW-o";
  const soporta = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  const b64 = (s) => { const p = "=".repeat((4 - s.length % 4) % 4); const r = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(r, (c) => c.charCodeAt(0)); };
  const rpc = (fn, body) => fetch(RPC + fn, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => { if (!r.ok) throw new Error(r.status); });
  const registro = () => navigator.serviceWorker.register("/sw.js");

  async function activo() {
    if (!soporta || Notification.permission !== "granted") return false;
    const reg = await navigator.serviceWorker.getRegistration("/");
    return !!(reg && await reg.pushManager.getSubscription());
  }
  async function activar() {
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") throw new Error("permiso");
    const reg = await registro(); await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(PUBLICA) });
    const j = sub.toJSON();
    await rpc("suscribir", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
  }
  async function desactivar() {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub) { await rpc("desuscribir", { p_endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe(); }
  }

  const CSS = `.aviso-dia{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:var(--card);border:1.5px solid var(--line);color:var(--ink)}
.aviso-dia .ic{font-size:1.5rem;line-height:1;flex:none}
.aviso-dia .txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.aviso-dia small{color:var(--muted);font-size:.8rem}
.aviso-dia button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:10px;padding:10px 14px;background:var(--ink);color:var(--bg);white-space:nowrap;min-height:44px}
.aviso-dia button.off{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
.aviso-dia button:focus-visible{outline:2px solid var(--signal);outline-offset:2px}`;

  async function pintar(box, aviso) {
    const on = await activo();
    let sub, boton = "";
    if (!soporta && ios && !instalada) sub = "En iPhone, primer afig la web a la pantalla d'inici (Compartir › Afegir a la pantalla d'inici) i obri-la des d'allí.";
    else if (!soporta) { box.remove(); return; }
    else if (Notification.permission === "denied") sub = "Has bloquejat les notificacions d'esta web. Pots permetre-les en la configuració del navegador.";
    else { sub = on ? "T'avisarem cada matí quan isquen els reptes nous." : "Una notificació cada matí quan isquen els reptes nous. Res més."; boton = on ? `<button class="off" data-a="off">Desactiva</button>` : `<button data-a="on">Activa</button>`; }
    box.innerHTML = `<span class="ic" aria-hidden="true">${on ? "🔔" : "🔕"}</span><span class="txt"><b>${on ? "Avís diari activat" : "T'avise cada matí?"}</b><small>${aviso || sub}</small></span>${boton}`;
    const b = box.querySelector("button");
    if (b) b.onclick = async () => {
      b.disabled = true; b.textContent = "Un moment…";
      let aviso = "";
      try { b.dataset.a === "on" ? await activar() : await desactivar(); }
      catch (e) { aviso = e.message === "permiso" ? "Sense el teu permís no podem avisar-te. Pots canviar-ho en la configuració del navegador." : "Ara no s'ha pogut activar. Torna-ho a provar més tard."; }
      pintar(box, aviso);
    };
  }

  function poner() {
    const end = document.querySelector("#end .end");
    if (!end || end.querySelector(".aviso-dia")) return;
    if (!soporta && !(ios && !instalada)) return;
    const box = document.createElement("div"); box.className = "aviso-dia";
    const ref = end.querySelector(".cafe");
    ref ? ref.after(box) : end.appendChild(box);
    pintar(box);
  }
  const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
  document.addEventListener("DOMContentLoaded", () => {
    const end = document.getElementById("end"); if (!end) return;
    new MutationObserver(poner).observe(end, { childList: true, subtree: true }); poner();
  });
  window.AvisoDiario = { activo, activar, desactivar };
})();
