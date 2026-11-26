// Contador anónimo de partidas terminadas (tabla «partidas» de Supabase).
// Solo guarda el juego, el tipo de partida, la fecha del reto y los puntos: nada que identifique a nadie.
// Las filas no se pueden leer desde la web; el resumen está en la vista «partidas_por_dia» del panel de Supabase.
(function () {
  const URL = "https://lnqigozwqraprajvaoiv.supabase.co/rest/v1/partidas";
  const KEY = "sb_publishable_T2XYHn31Yyt5cwPQ_q_JNQ_7ZgMXqPN";
  window.contarPartida = function (juego, modo, fecha, puntos) {
    try {
      fetch(URL, {
        method: "POST",
        keepalive: true,
        headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ juego: juego, modo: modo, fecha: fecha, puntos: Math.max(0, Math.round(puntos || 0)) })
      }).catch(function () {});
    } catch (e) {}
  };
})();
