// Retos personalizados: se guardan dentro del propio enlace (?reto=...), sin servidor.
// El contenido va ligeramente cifrado para que los alumnos no lean la respuesta en la dirección.
(function () {
  const KEY = new TextEncoder().encode("dondeesta");
  function encode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let s = "";
    bytes.forEach((v, i) => { s += String.fromCharCode(v ^ KEY[i % KEY.length]); });
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decode(str) {
    try {
      let s = str.replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      const bin = atob(s);
      const bytes = Uint8Array.from(bin, (c, i) => c.charCodeAt(0) ^ KEY[i % KEY.length]);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return null; }
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  // type: "l" (Letras), "d" (¿Dónde está?) o "c" (Cifras). Devuelve null si no hay reto, {error:true} si el enlace está roto.
  function read(type) {
    const p = new URLSearchParams(location.search).get("reto");
    if (!p) return null;
    const r = decode(p);
    if (!r || r.k !== type) return { error: true };
    r.id = hash(p);
    return r;
  }
  window.Reto = { encode, decode, read, hash };
})();
