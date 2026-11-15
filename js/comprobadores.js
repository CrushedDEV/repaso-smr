/* ==========================================================
   Comprobadores para los laboratorios (HTML, zonas DNS,
   dhcpd.conf) y generadores de ejercicios de redes.
   ========================================================== */
(function () {
  "use strict";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------------- HTML ---------------- */
  const H = {
    esc,
    q: (doc, sel) => doc.querySelector(sel),
    qa: (doc, sel) => [...doc.querySelectorAll(sel)],
    a: (el, n) => (el && el.getAttribute(n) != null ? el.getAttribute(n).trim().toLowerCase() : null),
    txt: (el) => (el ? el.textContent.replace(/\s+/g, " ").trim() : ""),
    norm: (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(),
    tiene: (el, s) => H.norm(H.txt(el)).includes(H.norm(s)),
    /* ¿está centrado el elemento? (align=center, dentro de <center> o de algo con align=center) */
    centrado(el) {
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        if (n.tagName === "CENTER") return true;
        if (H.a(n, "align") === "center") return true;
        const st = (n.getAttribute("style") || "").replace(/\s/g, "").toLowerCase();
        if (st.includes("text-align:center")) return true;
        if (n.tagName === "BODY") break;
      }
      return false;
    },
    /* ¿el texto aparece dentro de una etiqueta concreta (b/strong, i/em...)? */
    dentroDe(doc, texto, etiquetas) {
      return H.qa(doc, etiquetas).some((e) => H.tiene(e, texto));
    },
    /* fuente aplicada: <font face> o style font-family alrededor */
    fuente(el) {
      const cands = [el, ...el.querySelectorAll("*")];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) cands.push(n);
      for (const n of cands) {
        const f = H.a(n, "face") || ((n.getAttribute("style") || "").toLowerCase().match(/font-family:\s*([^;]+)/) || [])[1];
        if (f) return f.replace(/['"]/g, "");
      }
      return "";
    },
    color(el) {
      const cands = [el, ...el.querySelectorAll("font")];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) cands.push(n);
      for (const n of cands) {
        const c = (n.tagName === "FONT" && H.a(n, "color")) || ((n.getAttribute("style") || "").toLowerCase().match(/(?:^|;)\s*color:\s*([^;]+)/) || [])[1];
        if (c) return c.trim();
      }
      return "";
    },
    /* color del texto que contiene una palabra */
    colorDe(doc, texto) {
      const cand = H.qa(doc, "font, span, b, strong, td, th, p").filter((e) => H.tiene(e, texto));
      cand.sort((x, y) => H.txt(x).length - H.txt(y).length);
      return cand.length ? H.color(cand[0]) : "";
    },
    /* hr: comprueba atributos históricos */
    hr(hr, ancho, grosor) {
      if (!hr) return "No encuentro ninguna línea horizontal <code>&lt;hr&gt;</code>.";
      const fallos = [];
      if (ancho && H.a(hr, "width") !== ancho) fallos.push(`<code>width="${ancho}"</code> (tienes ${H.a(hr, "width") ? `"${esc(H.a(hr, "width"))}"` : "nada"})`);
      if (grosor && H.a(hr, "size") !== grosor) fallos.push(`<code>size="${grosor}"</code> (el grosor va en <code>size</code>, en píxeles)`);
      if (H.a(hr, "align") !== "center") fallos.push('<code>align="center"</code>');
      if (!hr.hasAttribute("noshade")) fallos.push("<code>noshade</code> (sin sombra, no lleva valor)");
      return fallos.length ? "Le falta: " + fallos.join(", ") : true;
    },
    /* Cuenta columnas reales de cada fila teniendo en cuenta colspan y rowspan */
    rejilla(table) {
      const filas = [...table.rows];
      const ocupado = [];
      const anchos = [];
      filas.forEach((tr, r) => {
        ocupado[r] = ocupado[r] || [];
        let c = 0;
        [...tr.cells].forEach((td) => {
          while (ocupado[r][c]) c++;
          const cs = Math.max(1, parseInt(td.getAttribute("colspan") || "1", 10) || 1);
          const rs = Math.max(1, parseInt(td.getAttribute("rowspan") || "1", 10) || 1);
          for (let i = 0; i < rs; i++) for (let j = 0; j < cs; j++) { ocupado[r + i] = ocupado[r + i] || []; ocupado[r + i][c + j] = true; }
          c += cs;
        });
        anchos[r] = ocupado[r].length;
      });
      return anchos;
    },
    columnasIguales(table, n) {
      const anchos = H.rejilla(table);
      const malas = anchos.map((w, i) => (w !== n ? i + 1 : 0)).filter(Boolean);
      if (!malas.length) return true;
      return `Las filas ${malas.join(", ")} no ocupan ${n} columnas (ocupan ${malas.map((m) => anchos[m - 1]).join(", ")}). Si una celda tiene <code>rowspan</code>, no la vuelvas a escribir en las filas de abajo; si tiene <code>colspan</code>, quita las celdas que «tapa».`;
    },
    celda(doc, texto) {
      const c = H.qa(doc, "td, th").filter((e) => H.tiene(e, texto));
      c.sort((x, y) => H.txt(x).length - H.txt(y).length);
      return c[0] || null;
    },
    negrita(el) {
      if (!el) return false;
      if (el.tagName === "TH") return true;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) if (/^(B|STRONG|TH)$/.test(n.tagName)) return true;
      return !!el.querySelector("b, strong");
    },
    filaCon(doc, texto) {
      return H.qa(doc, "tr").find((tr) => H.tiene(tr, texto)) || null;
    },
  };

  /* ---------------- Zonas DNS (BIND) ---------------- */
  const TIPOS = ["SOA", "NS", "A", "AAAA", "MX", "CNAME", "PTR", "TXT", "SRV"];
  H.zona = function (src, origen) {
    const avisos = [];
    const lineas = src.split(/\r?\n/);
    // une el SOA entre paréntesis y quita comentarios
    const logicas = [];
    let acum = null, nIni = 0;
    lineas.forEach((l, i) => {
      const sin = l.replace(/;.*$/, "");
      if (acum != null) {
        acum += " " + sin;
        if (sin.includes(")")) { logicas.push({ t: acum.replace(/[()]/g, " "), n: nIni, sangria: false }); acum = null; }
        return;
      }
      if (!sin.trim()) return;
      if (sin.includes("(") && !sin.includes(")")) { acum = sin; nIni = i + 1; return; }
      logicas.push({ t: sin.replace(/[()]/g, " "), n: i + 1, sangria: /^\s/.test(sin) });
    });
    if (acum != null) avisos.push(`Línea ${nIni}: abres un paréntesis <code>(</code> en el SOA y nunca lo cierras.`);

    const z = { ttl: null, soa: null, recs: [], avisos, origen };
    const abs = (n) => {
      if (n === "@") return origen + ".";
      if (n.endsWith(".")) return n.toLowerCase();
      return (n + "." + origen + ".").toLowerCase();
    };
    z.abs = abs;
    let ultimo = origen + ".";
    logicas.forEach(({ t, n, sangria }) => {
      const tok = t.trim().split(/\s+/);
      if (tok[0].toUpperCase() === "$TTL") { z.ttl = tok[1]; return; }
      if (tok[0].toUpperCase() === "$ORIGIN") return;
      let i = 0, dueno;
      if (sangria) dueno = ultimo;
      else { dueno = abs(tok[0]); i = 1; }
      // ttl / clase opcionales
      while (i < tok.length && (/^\d+$/.test(tok[i]) || /^(IN|CH|HS)$/i.test(tok[i]))) i++;
      const tipo = (tok[i] || "").toUpperCase();
      if (!TIPOS.includes(tipo)) { avisos.push(`Línea ${n}: no reconozco el tipo de registro en <code>${esc(t.trim())}</code>. ¿Falta <code>IN</code> o el tipo (A, NS, MX...)?`); return; }
      if (!/\bIN\b/i.test(tok.slice(0, i).join(" "))) avisos.push(`Línea ${n}: falta la clase <code>IN</code> (BIND la acepta porque es la de por defecto, pero en clase se escribe siempre).`);
      const datos = tok.slice(i + 1);
      ultimo = dueno;
      const rec = { dueno, tipo, datos, n, crudo: t.trim() };
      if (tipo === "SOA") { z.soa = rec; return; }
      z.recs.push(rec);
      // errores típicos
      if (tipo === "A" && !/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(datos[0] || "")) avisos.push(`Línea ${n}: <code>${esc(datos[0] || "")}</code> no es una IPv4 válida para un registro A (sin máscara, sin nombres: solo los 4 números).`);
      const nombreDato = tipo === "MX" ? datos[1] : ["NS", "CNAME", "PTR"].includes(tipo) ? datos[0] : null;
      if (tipo === "MX" && !/^\d+$/.test(datos[0] || "")) avisos.push(`Línea ${n}: al MX le falta la prioridad (un número antes del nombre del servidor de correo).`);
      if (nombreDato && !nombreDato.endsWith(".") && /in-addr\.arpa$/i.test(origen) && !/^\d/.test(nombreDato)) avisos.push(`Línea ${n}: <code>${esc(nombreDato)}</code> sin punto final, en una zona inversa, se convierte en <code>${esc(nombreDato + "." + origen + ".")}</code>. Aquí los nombres van siempre completos: <code>${esc(nombreDato.includes(".") ? nombreDato : nombreDato + ".dominio.lan")}.</code>`);
      else if (nombreDato && !nombreDato.endsWith(".") && nombreDato.includes(".")) avisos.push(`Línea ${n}: <code>${esc(nombreDato)}</code> no termina en punto, así que BIND le pega el dominio detrás y queda <code>${esc(nombreDato + "." + origen + ".")}</code>`);
      if (nombreDato && /^\d+\.\d+\.\d+\.\d+$/.test(nombreDato)) avisos.push(`Línea ${n}: un ${tipo} apunta a un <b>nombre</b>, no a una IP.`);
    });
    // SOA
    if (z.soa) {
      const d = z.soa.datos;
      if (d[1] && d[1].includes("@")) avisos.push(`Línea ${z.soa.n}: en el SOA el correo se escribe con punto en vez de @: <code>${esc(d[1].replace("@", "."))}${d[1].endsWith(".") ? "" : "."}</code>`);
      const nums = d.slice(2);
      if (nums.length !== 5 || !nums.every((x) => /^\d+[smhdwSMHDW]?$/.test(x))) avisos.push(`Línea ${z.soa.n}: el SOA necesita exactamente 5 valores numéricos después del correo: serial, refresh, retry, expire y TTL negativo.`);
      z.soa.ns = d[0] ? abs(d[0]) : "";
      z.soa.mail = d[1] ? abs(d[1]) : "";
      z.soa.nums = nums;
    }
    // CNAME no puede convivir con otros registros ni NS/MX apuntar a CNAME
    const cnames = new Set(z.recs.filter((r) => r.tipo === "CNAME").map((r) => r.dueno));
    z.recs.forEach((r) => {
      if (r.tipo !== "CNAME" && cnames.has(r.dueno)) avisos.push(`Línea ${r.n}: <code>${esc(r.dueno)}</code> ya es un alias (CNAME); un nombre con CNAME no puede tener más registros.`);
      if ((r.tipo === "NS" || r.tipo === "MX") && cnames.has(abs(r.tipo === "MX" ? r.datos[1] || "" : r.datos[0] || ""))) avisos.push(`Línea ${r.n}: un ${r.tipo} no puede apuntar a un alias (CNAME): tiene que apuntar al nombre que tiene el registro A.`);
    });
    return z;
  };
  /* busca un registro: dueño relativo o absoluto, tipo y dato (absolutizado si es nombre) */
  H.rec = function (z, dueno, tipo, dato) {
    const d = z.abs(dueno);
    return z.recs.find((r) => {
      if (r.dueno !== d || r.tipo !== tipo) return false;
      if (dato == null) return true;
      if (tipo === "A") return r.datos[0] === dato;
      if (tipo === "MX") return r.datos[0] === String(dato[0]) && z.abs(r.datos[1] || "") === z.abs(dato[1]);
      return z.abs(r.datos[0] || "") === z.abs(dato);
    });
  };
  /* mensaje de error de un registro que falta, mirando qué se ha puesto en su lugar */
  H.faltaRec = function (z, dueno, tipo, dato) {
    if (H.rec(z, dueno, tipo, dato)) return true;
    const d = z.abs(dueno);
    const mismo = z.recs.filter((r) => r.dueno === d);
    if (!mismo.length) return `No encuentro ningún registro para <code>${esc(dueno)}</code>.`;
    const delTipo = mismo.find((r) => r.tipo === tipo);
    if (delTipo) return `El ${tipo} de <code>${esc(dueno)}</code> está, pero el dato no es correcto (línea ${delTipo.n}: <code>${esc(delTipo.crudo)}</code>).`;
    const r = mismo[0];
    if (dueno === "@") return `No encuentro ningún registro <code>${tipo}</code> para el dominio (<code>@</code>).`;
    return `Para <code>${esc(dueno)}</code> has puesto un registro <code>${r.tipo}</code> y tocaba <code>${tipo}</code> (línea ${r.n}).`;
  };

  /* ---------------- dhcpd.conf ---------------- */
  H.dhcp = function (src) {
    const avisos = [];
    const lineas = src.split(/\r?\n/);
    lineas.forEach((l, i) => {
      const s = l.replace(/#.*$/, "").trim();
      if (!s) return;
      if (!/[;{}]$/.test(s)) avisos.push(`Línea ${i + 1}: falta el punto y coma <code>;</code> al final de <code>${esc(s)}</code>. dhcpd no arrancará.`);
    });
    // parser por bloques
    const limpio = src.replace(/#.*$/gm, "");
    const raiz = { cab: "global", st: [], hijos: [] };
    const pila = [raiz];
    let buf = "";
    for (const ch of limpio) {
      if (ch === "{") { const b = { cab: buf.trim().replace(/\s+/g, " "), st: [], hijos: [] }; pila[pila.length - 1].hijos.push(b); pila.push(b); buf = ""; }
      else if (ch === ";") { if (buf.trim()) pila[pila.length - 1].st.push(buf.trim().replace(/\s+/g, " ")); buf = ""; }
      else if (ch === "}") { if (buf.trim()) pila[pila.length - 1].st.push(buf.trim().replace(/\s+/g, " ")); buf = ""; if (pila.length > 1) pila.pop(); else avisos.push("Hay una llave <code>}</code> de más."); }
      else buf += ch;
    }
    if (pila.length > 1) avisos.push("Te falta cerrar alguna llave <code>}</code>.");
    const d = { avisos, global: raiz.st, subnets: [], hosts: [] };
    const todos = (b) => [b, ...b.hijos.flatMap(todos)];
    todos(raiz).forEach((b) => {
      let m;
      if ((m = b.cab.match(/^subnet\s+(\S+)\s+netmask\s+(\S+)$/i))) {
        d.subnets.push({ red: m[1], mascara: m[2], st: b.st, ranges: b.st.filter((s) => /^range\s/i.test(s)).map((s) => s.split(/\s+/).slice(1)) });
      } else if ((m = b.cab.match(/^host\s+(\S+)$/i))) {
        const mac = (b.st.find((s) => /^hardware ethernet/i.test(s)) || "").split(/\s+/)[2] || "";
        const ip = (b.st.find((s) => /^fixed-address/i.test(s)) || "").split(/\s+/)[1] || "";
        d.hosts.push({ nombre: m[1], mac, ip, st: b.st });
      } else if (b.cab !== "global") avisos.push(`No entiendo la cabecera de bloque <code>${esc(b.cab)}</code>. ¿Es <code>subnet ... netmask ...</code> o <code>host nombre</code>?`);
    });
    const buscar = (lista, re) => (lista.find((s) => re.test(s)) || null);
    d.valor = (nombre, ambito) => {
      const lista = ambito || [...d.global, ...d.subnets.flatMap((s) => s.st)];
      const s = buscar(lista, new RegExp("^" + nombre.replace(/ /g, "\\s+") + "\\s", "i"));
      return s ? s.replace(new RegExp("^" + nombre.replace(/ /g, "\\s+") + "\\s+", "i"), "").replace(/"/g, "").trim() : null;
    };
    return d;
  };
  H.macValida = (m) => /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(m || "");

  /* ---------------- IPs ---------------- */
  const IP = {
    aNum: (s) => { const p = String(s).trim().split("."); if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || +x > 255)) return null; return ((+p[0] << 24) >>> 0) + (+p[1] << 16) + (+p[2] << 8) + +p[3]; },
    aTxt: (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."),
    mascara: (pref) => (pref === 0 ? 0 : (0xffffffff << (32 - pref)) >>> 0),
  };
  H.IP = IP;

  /* contexto para cada tipo de laboratorio */
  H.contexto = function (tipo, src, origen) {
    if (tipo === "html") {
      const doc = new DOMParser().parseFromString(src, "text/html");
      return { src, doc, avisos: [] };
    }
    if (tipo === "zona") { const z = H.zona(src, origen); return { src, z, avisos: z.avisos }; }
    if (tipo === "dhcp") { const d = H.dhcp(src); return { src, d, avisos: d.avisos }; }
    return { src, avisos: [], lineas: src.split(/\r?\n/) };
  };
  window.H = H;

  /* ==========================================================
     GENERADORES (preguntas infinitas de redes)
     ========================================================== */
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const elige = (a) => a[Math.floor(Math.random() * a.length)];
  function redAzar() {
    const pref = elige([16, 20, 21, 22, 22, 23, 23, 24, 25, 26, 26, 27, 28, 29]);
    const base = elige([[10, r(0, 255), r(0, 255), r(1, 254)], [172, r(16, 31), r(0, 255), r(1, 254)], [192, 168, r(0, 255), r(1, 254)]]);
    const ip = IP.aNum(base.join("."));
    const m = IP.mascara(pref);
    const red = (ip & m) >>> 0;
    const bc = (red | (~m >>> 0)) >>> 0;
    return { pref, ip, m, red, bc, hosts: Math.pow(2, 32 - pref) - 2 };
  }
  /* explica el cálculo con el método del «salto» (número mágico) */
  function explicaRed(R) {
    const oct = Math.floor((R.pref - 1) / 8); // octeto «interesante» (0..3)
    const mOct = (R.m >>> (24 - oct * 8)) & 255;
    const salto = 256 - mOct;
    const ipOct = (R.ip >>> (24 - oct * 8)) & 255;
    const inicio = Math.floor(ipOct / salto) * salto;
    const nombres = ["1º", "2º", "3º", "4º"];
    return `<p>/${R.pref} → máscara <code>${IP.aTxt(R.m)}</code>. Quedan ${32 - R.pref} bits de host → 2<sup>${32 - R.pref}</sup> − 2 = <b>${R.hosts}</b> equipos.</p>
<p>El octeto que «manda» es el ${nombres[oct]} (máscara ${mOct}). Salto = 256 − ${mOct} = <b>${salto}</b>. Las redes van de ${salto} en ${salto}: …, ${inicio}, ${inicio + salto}, …</p>
<p>${ipOct} cae en el bloque que empieza en ${inicio} → red <code>${IP.aTxt(R.red)}</code>, difusión <code>${IP.aTxt(R.bc)}</code> (el siguiente bloque menos 1).</p>
<p>Primera útil: <code>${IP.aTxt(R.red + 1)}</code> · Última útil: <code>${IP.aTxt(R.bc - 1)}</code></p>`;
  }
  const TRUCO_SALTO = "Salto = 256 − valor de la máscara en el octeto que no es 255 ni 0. La red es el múltiplo del salto que queda justo por debajo; la difusión, el siguiente múltiplo menos 1.";

  const G = {
    mascara() {
      const R = redAzar();
      return { q: `¿Qué máscara en decimal corresponde a <code>/${R.pref}</code>?`, sol: [IP.aTxt(R.m)], modo: "ip", placeholder: "255.255.…", exp: `<p>/${R.pref} = ${R.pref} unos seguidos. Cada 8 unos son un 255; lo que sobra se convierte con 128, 192, 224, 240, 248, 252, 254.</p><p>Resultado: <code>${IP.aTxt(R.m)}</code></p>`, truco: "Tabla rápida de bits sueltos: 1→128, 2→192, 3→224, 4→240, 5→248, 6→252, 7→254." };
    },
    red() {
      const R = redAzar();
      return { q: `Un equipo tiene la IP <code>${IP.aTxt(R.ip)}/${R.pref}</code>. ¿Cuál es la <b>dirección de red</b>?`, sol: [IP.aTxt(R.red)], modo: "ip", exp: explicaRed(R), truco: TRUCO_SALTO };
    },
    difusion() {
      const R = redAzar();
      return { q: `Red de <code>${IP.aTxt(R.ip)}/${R.pref}</code>: ¿cuál es la <b>dirección de difusión</b> (broadcast)?`, sol: [IP.aTxt(R.bc)], modo: "ip", exp: explicaRed(R), truco: TRUCO_SALTO,
        fallos: [{ si: [IP.aTxt((R.red & 0xffffff00) | 255)], why: "Has puesto .255 en el último octeto por costumbre de las /24. Con otra máscara la difusión no tiene por qué acabar ahí: depende del bloque." }] };
    },
    hosts() {
      const R = redAzar();
      return { q: `¿Cuántos equipos (direcciones útiles) caben en una red <code>/${R.pref}</code>?`, sol: [String(R.hosts)], modo: "num", exp: `<p>Bits de host = 32 − ${R.pref} = ${32 - R.pref}. Direcciones = 2<sup>${32 - R.pref}</sup> = ${R.hosts + 2}. Se restan 2 (la de red y la de difusión): <b>${R.hosts}</b>.</p>`,
        fallos: [{ si: [String(R.hosts + 2)], why: "Has contado todas las direcciones, pero la de red y la de difusión no se pueden dar a ningún equipo: hay que restar 2." }] };
    },
    ultima() {
      const R = redAzar();
      return { q: `En la red de <code>${IP.aTxt(R.ip)}/${R.pref}</code>, ¿cuál es la <b>última IP utilizable</b>? (la que se suele dar al router)`, sol: [IP.aTxt(R.bc - 1)], modo: "ip", exp: explicaRed(R), truco: "Última útil = difusión − 1." };
    },
    valida() {
      // ¿se puede asignar esta IP a un equipo? Trampas del tipo x.x.9.255 en /22
      const pref = elige([21, 22, 23]);
      const R0 = redAzar();
      const m = IP.mascara(pref);
      const red = (R0.ip & m) >>> 0, bc = (red | (~m >>> 0)) >>> 0;
      const tipo = elige(["255medio", "0medio", "bc", "red", "normal"]);
      let ip;
      if (tipo === "255medio") ip = red + 255;
      else if (tipo === "0medio") ip = red + 256;
      else if (tipo === "bc") ip = bc;
      else if (tipo === "red") ip = red;
      else ip = red + r(1, 200);
      const valida = ip !== red && ip !== bc;
      const R = { pref, ip, m, red, bc, hosts: Math.pow(2, 32 - pref) - 2 };
      return { tipo: "test", q: `Red <code>${IP.aTxt(red)}/${pref}</code>. ¿Se puede asignar la IP <code>${IP.aTxt(ip)}</code> a un equipo?`,
        ops: [["Sí, es una IP de host válida", valida, valida ? "" : `No: es la dirección de ${ip === red ? "red" : "difusión"} de esta red.`], ["No, es la dirección de red o de difusión", !valida, valida ? `Parece «rara» por acabar en .${ip & 255}, pero en una /${pref} la red y la difusión son ${IP.aTxt(red)} y ${IP.aTxt(bc)}. Todo lo de en medio es válido.` : ""]],
        exp: explicaRed(R), truco: "En redes más grandes que /24, una IP acabada en .0 o .255 puede ser perfectamente válida. Lo único prohibido es la primera (red) y la última (difusión) del bloque entero." };
    },
    concesion() {
      const horas = elige([2, 4, 6, 8, 12, 24]); // horas pares: T2 (87,5 %) cae en minutos exactos
      const h = r(7, 22), mi = elige([0, 10, 15, 20, 30, 40, 45, 50]);
      const base = h * 60 + mi;
      const fmt = (min) => { min = ((min % 1440) + 1440) % 1440; return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(Math.round(min % 60)).padStart(2, "0"); };
      const T1 = base + horas * 60 * 0.5, T2 = base + horas * 60 * 0.875, Fin = base + horas * 60;
      const cual = elige(["T1", "T2", "fin"]);
      const val = cual === "T1" ? T1 : cual === "T2" ? T2 : Fin;
      const preg = { T1: "intentará <b>renovar</b> con su servidor (T1)", T2: "pedirá la renovación a <b>cualquier</b> servidor (T2, rebinding)", fin: "<b>caduca</b> la concesión si no ha renovado" }[cual];
      return { q: `Un portátil recibe a las <code>${fmt(base)}</code> una concesión de <b>${horas} h</b> (${horas * 3600} s). ¿A qué hora ${preg}?`, sol: [fmt(val), fmt(val).replace(/^0/, "")], modo: "ip", placeholder: "hh:mm",
        exp: `<p>T1 = 50 % de la concesión = ${horas * 30} min → <code>${fmt(T1)}</code> (unicast a su servidor, DHCPREQUEST).</p><p>T2 = 87,5 % = ${horas * 60 * 0.875} min → <code>${fmt(T2)}</code> (broadcast, a cualquier servidor).</p><p>Fin = 100 % → <code>${fmt(Fin)}</code>: si nadie le ha contestado, suelta la IP y vuelve a empezar con DISCOVER.</p>`,
        truco: "T1 a la mitad, T2 a los 7/8. Mitad = renovar con el mío; 7/8 = ¡que me renueve cualquiera!" };
    },
    segundos() {
      const v = elige([[1, "hora", 3600], [2, "horas", 7200], [6, "horas", 21600], [8, "horas", 28800], [12, "horas", 43200], [1, "día", 86400], [1, "semana", 604800], [2, "semanas", 1209600], [30, "minutos", 1800], [15, "minutos", 900]]);
      return { q: `¿Cuántos segundos son <b>${v[0]} ${v[1]}</b>? (así se escriben los tiempos en dhcpd.conf y en el SOA)`, sol: [String(v[2])], modo: "num", exp: `<p>1 min = 60 s · 1 h = 3600 s · 1 día = 86400 s · 1 semana = 604800 s.</p><p>${v[0]} ${v[1]} = <b>${v[2]}</b> s.</p>` };
    },
    inversa() {
      const a = elige([[192, 168, r(0, 99)], [10, r(0, 50), r(0, 9)], [172, r(16, 31), r(0, 20)]]);
      const h = r(1, 254);
      const cual = elige(["zona", "ptr"]);
      if (cual === "zona") return { q: `La red es <code>${a.join(".")}.0/24</code>. ¿Cómo se llama su <b>zona inversa</b>?`, sol: [`${a[2]}.${a[1]}.${a[0]}.in-addr.arpa`, `${a[2]}.${a[1]}.${a[0]}.in-addr.arpa.`], modo: "ip", exp: `<p>Se toman los octetos de la parte de red <b>al revés</b> y se añade <code>.in-addr.arpa</code>: <code>${a[2]}.${a[1]}.${a[0]}.in-addr.arpa</code></p><p>En <code>named.conf.local</code>: <code>zone "${a[2]}.${a[1]}.${a[0]}.in-addr.arpa" { type master; file "/etc/bind/db.${a.join(".")}"; };</code></p>`,
        fallos: [{ si: [`${a.join(".")}.in-addr.arpa`], why: "Has escrito los octetos en el orden normal. En la zona inversa van al revés, porque el DNS lee los nombres de derecha a izquierda (de lo general a lo concreto)." }] };
      return { q: `En la zona inversa <code>${a[2]}.${a[1]}.${a[0]}.in-addr.arpa</code>, ¿qué escribes como <b>nombre</b> del registro PTR del equipo <code>${a.join(".")}.${h}</code>?`, sol: [String(h)], modo: "ip", exp: `<p>Dentro de la zona ya se da por puesta la parte de red, así que solo se escribe lo que falta: <code>${h}</code>.</p><pre class="codigo" data-lang="zona">${h}    IN  PTR  equipo.dominio.lan.</pre><p>Si escribieras la IP completa sin punto final, BIND le pegaría la zona detrás: <code>${a.join(".")}.${h}.${a[2]}.${a[1]}.${a[0]}.in-addr.arpa.</code> — un nombre absurdo.</p>`,
        fallos: [{ si: [`${a.join(".")}.${h}`], why: "La IP completa no: dentro de la zona solo se pone lo que falta para completar el nombre, en este caso el último octeto." }] };
    },
    inversa22() {
      // zona inversa de clase B (como en el hotel) donde los PTR llevan dos octetos
      const b = r(16, 31), o3 = r(8, 11), o4 = r(1, 254);
      return { q: `La zona inversa es <code>${b}.172.in-addr.arpa</code> (red 172.${b}.8.0/22). ¿Qué escribes como nombre del PTR de <code>172.${b}.${o3}.${o4}</code>?`, sol: [`${o4}.${o3}`], modo: "ip",
        exp: `<p>La zona ya cubre <code>172.${b}</code>, así que faltan los dos últimos octetos, <b>al revés</b>: <code>${o4}.${o3}</code></p><pre class="codigo" data-lang="zona">${o4}.${o3}    IN  PTR  equipo.hoteljaizkibel.lan.</pre>`,
        fallos: [{ si: [`${o3}.${o4}`], why: "Están al derecho. En la inversa todo va al revés: primero el 4º octeto y luego el 3º." }] };
    },
  };
  window.GENERADORES = G;
})();
