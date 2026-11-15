/* ==========================================================
   Motor de la libreta: estado, repetición espaciada, rutas,
   tipos de pregunta, sesiones, examen y laboratorios.
   ========================================================== */
(function () {
  "use strict";

  const T = window.TEMARIO;
  const app = document.getElementById("app");

  /* ---------------- utilidades ---------------- */
  function el(tag, attrs, ...hijos) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "html") n.innerHTML = v;
      else if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const h of hijos.flat()) if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(String(h)));
    return n;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const DIA = 86400000;

  /* Resaltado sencillo de código */
  function resaltar(src, lang) {
    let re;
    if (lang === "py") re = /(#.*$)|("""[\s\S]*?"""|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(def|return|if|elif|else|for|while|in|not|and|or|True|False|None|break|continue|import|from|is|pass|raise|print|len|range)\b/gm;
    else if (lang === "html") re = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][^>]*>)/g;
    else if (lang === "zona") re = /(;.*$)/gm;
    else if (lang === "conf") re = /(#.*$)/gm;
    else return esc(src);
    let out = "", ult = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(ult, m.index));
      const cls = m[1] ? "com" : lang === "html" ? "tag" : m[2] ? "str" : "kw";
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      ult = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(ult));
  }
  function bloqueCodigo(src, lang) { return el("pre", { class: "codigo", html: resaltar(src, lang || "py") }); }

  /* ---------------- catálogo ---------------- */
  const ITEMS = {};
  const RAPIDOS = new Set(["test", "escribe", "ordena", "bugs", "gen"]);
  for (const mid of T.orden) {
    const m = T.materias[mid];
    for (const t of m.temas) {
      t.items = t.items || [];
      t.labs = t.labs || [];
      (T.labsExtra[mid + "." + t.id] || []).forEach((l) => t.labs.push(l));
      t.items.forEach((it, i) => { it.id = it.id || `${mid}.${t.id}.${i}`; it.mat = mid; it.tema = t.id; ITEMS[it.id] = it; });
      t.labs.forEach((l, i) => { l.id = l.id || `${mid}.${t.id}.lab${i}`; l.mat = mid; l.tema = t.id; ITEMS[l.id] = l; });
    }
  }
  const temaDe = (mid, tid) => T.materias[mid].temas.find((t) => t.id === tid);

  /* ---------------- estado (localStorage) ---------------- */
  const CLAVE = "libreta-smr-v1";
  let E = { items: {}, labs: {} };
  try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && g.items) E = Object.assign(E, g); } catch (e) {}
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {} }
  const est = (id) => E.items[id] || { caja: 0, due: 0, vistas: 0, fallos: 0, ult: 0 };
  const INTERVALOS = [0, 1, 3, 7, 14, 30];
  function registrar(id, ok) {
    const s = Object.assign({}, est(id));
    s.vistas++;
    if (ok) { s.caja = Math.min(5, s.caja + 1); s.due = Date.now() + INTERVALOS[s.caja] * DIA; }
    else { s.caja = 1; s.fallos++; s.ult = Date.now(); s.due = Date.now() + 10 * 60000; }
    E.items[id] = s; guardar();
  }
  const pendiente = (id) => { const s = est(id); return s.vistas > 0 && s.due <= Date.now(); };
  const labEst = (id) => E.labs[id] || { hecho: false, intentos: 0, codigo: null };
  function dominio(t) {
    const rap = t.items;
    let suma = 0;
    rap.forEach((it) => (suma += est(it.id).caja / 5));
    t.labs.forEach((l) => (suma += labEst(l.id).hecho ? 1 : 0));
    const total = rap.length + t.labs.length;
    return total ? suma / total : 0;
  }
  const dominioMat = (m) => { const ts = m.temas; return ts.reduce((a, t) => a + dominio(t), 0) / ts.length; };
  const todosRapidos = () => Object.values(ITEMS).filter((i) => RAPIDOS.has(i.tipo));

  /* ---------------- tema claro / oscuro ---------------- */
  const temaBtn = document.getElementById("temaBtn");
  function aplicarTema(t) {
    if (t) document.documentElement.setAttribute("data-theme", t); else document.documentElement.removeAttribute("data-theme");
    const oscuro = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    temaBtn.textContent = oscuro ? "papel" : "pizarra";
  }
  let temaGuardado = null; try { temaGuardado = localStorage.getItem("libreta-tema"); } catch (e) {}
  aplicarTema(temaGuardado);
  temaBtn.addEventListener("click", () => {
    const oscuro = temaBtn.textContent === "papel";
    const nuevo = oscuro ? "light" : "dark";
    try { localStorage.setItem("libreta-tema", nuevo); } catch (e) {}
    aplicarTema(nuevo);
  });

  /* ---------------- teclado ---------------- */
  let teclas = null;
  document.addEventListener("keydown", (e) => {
    if (!teclas) return;
    const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    teclas(e, enCampo);
  });

  /* ---------------- rutas ---------------- */
  let SES = null;
  function ir(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener("hashchange", render);
  function render() {
    teclas = null;
    const h = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    app.innerHTML = "";
    let pest = "inicio";
    if (h[0] === "m" && T.materias[h[1]]) { vistaMateria(h[1]); pest = h[1]; }
    else if (h[0] === "t" && T.materias[h[1]] && temaDe(h[1], h[2])) { vistaTema(h[1], h[2]); pest = h[1]; }
    else if (h[0] === "lab" && ITEMS[h[1]]) { vistaLab(ITEMS[h[1]]); pest = ITEMS[h[1]].mat; }
    else if (h[0] === "sesion" && SES) { vistaSesion(); pest = SES.pest || "inicio"; }
    else if (h[0] === "errores") { vistaErrores(); pest = "errores"; }
    else vistaInicio();
    document.querySelectorAll(".pestanas a").forEach((a) => a.classList.toggle("activa", a.dataset.pest === pest));
    window.scrollTo(0, 0);
  }

  /* ======================================================
     PORTADA
     ====================================================== */
  function vistaInicio() {
    const debidas = todosRapidos().filter((i) => pendiente(i.id)).length;
    const empezado = Object.keys(E.items).length > 0;
    const textoHoy = !empezado
      ? "Aún no has empezado. Elige una asignatura o lánzate a una ronda mezclada."
      : debidas > 0
        ? `Te tocan ${debidas} ${debidas === 1 ? "tarjeta" : "tarjetas"} que estás a punto de olvidar.`
        : "Hoy vas al día. Una ronda mezclada nunca sobra.";

    app.append(
      el("h1", { class: "titular" },
        el("span", { class: "linea" }, "Repasa,"),
        el("span", { class: "linea" }, el("span", { class: "tachado" }, "memoriza"), " ", el("em", null, "falla")),
        el("span", { class: "linea" }, "y entiende."),
      ),
      el("div", { class: "intro" },
        el("p", null, "Preguntas cortas sacadas de tus prácticas. Si fallas, el boli rojo te dice ", el("span", { class: "subrayado" }, "por qué"), ", y lo que falles vuelve a salir justo antes de que se te olvide."),
        el("div", { class: "postit", role: "note" },
          el("h3", null, "para hoy"),
          el("p", null, textoHoy),
          el("button", { class: "btn mini", type: "button", onclick: () => empezarSesion(sesionHoy()) }, "Empezar ronda"),
        ),
      ),
    );

    const lista = el("ol", { class: "indice" });
    T.orden.forEach((mid, i) => {
      const m = T.materias[mid];
      const pct = Math.round(dominioMat(m) * 100);
      lista.append(el("li", null, el("a", { href: "#/m/" + mid },
        el("span", { class: "num" }, String(i + 1).padStart(2, "0")),
        el("span", { class: "nombre" }, el("span", { class: "relleno", style: `width:${Math.max(pct, 0)}%` }), m.nombre),
        el("span", { class: "flecha", "aria-hidden": "true" }, "→"),
        el("span", { class: "que" }, m.sub),
      )));
    });
    app.append(lista);

    app.append(el("section", { class: "como" },
      el("div", null,
        el("h2", null, "Cómo se usa sin morir de aburrimiento"),
        el("ol", null,
          el("li", null, el("b", null, "Primero pregunta, luego chuleta. "), "Intentar responder antes de leer hace que se quede mucho mejor, aunque falles."),
          el("li", null, el("b", null, "Rondas de 8 preguntas. "), "Cinco minutos y listo. Mejor tres rondas sueltas que una tarde entera."),
          el("li", null, el("b", null, "«Ni idea» no es rendirse. "), "Te enseña la respuesta y la explicación, y la pregunta vuelve más tarde."),
          el("li", null, el("b", null, "Mezcla asignaturas. "), "La ronda de hoy junta Python, HTML y redes: cuesta un poco más y se aprende el doble."),
          el("li", null, el("b", null, "Laboratorios. "), "Escribes código de verdad (Python, HTML, ficheros de zona, dhcpd.conf) y te corrige línea a línea."),
        ),
      ),
      el("div", null,
        el("p", { class: "nota-mano" }, "El subrayado amarillo de cada asignatura crece según lo que dominas."),
        el("p", { class: "suave chico" }, "Tu progreso se guarda solo en este navegador."),
      ),
    ));
  }

  /* ======================================================
     ASIGNATURA
     ====================================================== */
  function vistaMateria(mid) {
    const m = T.materias[mid];
    app.append(
      el("div", { class: "cabecera-mat" },
        el("p", { class: "migas" }, el("a", { href: "#/" }, "libreta"), " / ", m.nombre.toLowerCase()),
        el("h1", null, m.nombre),
        el("p", null, m.intro),
      ),
      el("div", { class: "acciones" },
        el("button", { class: "btn", type: "button", onclick: () => empezarSesion(sesionMateria(mid)) }, "Ronda mezclada"),
        el("button", { class: "btn claro", type: "button", onclick: () => empezarSesion(sesionExamen(mid)) }, "Simulacro de examen"),
      ),
    );
    const ul = el("ul", { class: "temas" });
    m.temas.forEach((t) => {
      const pct = Math.round(dominio(t) * 100);
      const nlabs = t.labs.length;
      ul.append(el("li", null, el("a", { href: `#/t/${mid}/${t.id}` },
        el("span", null,
          el("span", { class: "tnombre" }, t.nombre),
          el("span", { class: "tdesc" }, t.desc),
          el("span", { class: "barra-subra", "aria-hidden": "true" }, el("i", { style: `width:${pct}%` })),
        ),
        el("span", { class: "estado" }, t.items.length + " preguntas" + (nlabs ? ` · ${nlabs} labs` : "")),
      )));
    });
    app.append(ul);
  }

  /* ======================================================
     TEMA
     ====================================================== */
  function vistaTema(mid, tid) {
    const m = T.materias[mid], t = temaDe(mid, tid);
    const visto = t.items.some((i) => est(i.id).vistas > 0);
    app.append(
      el("p", { class: "migas" }, el("a", { href: "#/" }, "libreta"), " / ", el("a", { href: "#/m/" + mid }, m.nombre.toLowerCase())),
      el("h1", { class: "tema-h1" }, t.nombre),
      el("p", { class: "suave" }, t.desc),
    );
    if (t.items.length) {
      app.append(el("div", { class: "acciones" },
        el("button", { class: "btn", type: "button", onclick: () => empezarSesion(sesionTema(mid, tid)) }, visto ? "Otra ronda" : "Ponte a prueba"),
        !visto ? el("span", { class: "nota-mano", style: "font-size:18px" }, "← antes de leer la chuleta, en serio") : null,
      ));
    }
    if (t.chuleta) {
      const det = el("details", { class: "chuleta-plegable bloque" },
        el("summary", null, "chuleta del tema"),
        el("div", { class: "chuleta", html: t.chuleta }),
      );
      if (visto) det.open = true;
      app.append(det);
      det.querySelectorAll("pre.codigo[data-lang]").forEach((p) => { p.innerHTML = resaltar(p.textContent, p.dataset.lang); });
    }
    if (t.labs.length) {
      const ul = el("ul", { class: "labs" });
      t.labs.forEach((l) => {
        const s = labEst(l.id);
        ul.append(el("li", null, el("a", { href: "#/lab/" + l.id },
          el("span", { class: "lnom" }, l.titulo),
          el("span", { class: "lest" + (s.hecho ? " hecho" : "") }, s.hecho ? "✓ superado" : s.intentos ? "a medias" : (l.nivel || "pendiente")),
        )));
      });
      app.append(el("section", { class: "bloque" },
        el("h2", null, "Laboratorio", el("small", null, t.labsTexto || "escribe el código y te lo corrijo")),
        ul,
      ));
    }
  }

  /* ======================================================
     CONSTRUCCIÓN DE SESIONES
     ====================================================== */
  function elegir(items, n) {
    const ahora = Date.now();
    const debidas = items.filter((i) => est(i.id).vistas > 0 && est(i.id).due <= ahora);
    const nuevas = items.filter((i) => est(i.id).vistas === 0);
    const resto = items.filter((i) => est(i.id).vistas > 0 && est(i.id).due > ahora).sort((a, b) => est(a.id).caja - est(b.id).caja);
    const sel = [...barajar(debidas), ...barajar(nuevas), ...resto].slice(0, n);
    return barajar(sel);
  }
  function sesionTema(mid, tid) {
    const t = temaDe(mid, tid);
    return { titulo: t.nombre, pest: mid, cola: elegir(t.items, 8), modo: "practica", volver: `#/t/${mid}/${tid}`, otra: () => sesionTema(mid, tid) };
  }
  function sesionMateria(mid) {
    const its = T.materias[mid].temas.flatMap((t) => t.items);
    return { titulo: "Ronda mezclada · " + T.materias[mid].nombre, pest: mid, cola: elegir(its, 10), modo: "practica", volver: "#/m/" + mid, otra: () => sesionMateria(mid) };
  }
  function sesionHoy() {
    const todos = todosRapidos();
    let cola = barajar(todos.filter((i) => pendiente(i.id))).slice(0, 15);
    if (cola.length < 8) {
      // completa con preguntas nuevas, repartidas entre asignaturas (intercalado)
      const nuevas = {};
      T.orden.forEach((m) => (nuevas[m] = barajar(todos.filter((i) => i.mat === m && est(i.id).vistas === 0 && !cola.includes(i)))));
      let k = 0;
      while (cola.length < 10 && T.orden.some((m) => nuevas[m].length)) {
        const m = T.orden[k++ % T.orden.length];
        if (nuevas[m].length) cola.push(nuevas[m].pop());
      }
      if (cola.length < 8) cola = cola.concat(elegir(todos.filter((i) => !cola.includes(i)), 10 - cola.length));
    }
    return { titulo: "Ronda de hoy", pest: "inicio", cola: barajar(cola), modo: "practica", volver: "#/", otra: sesionHoy };
  }
  function sesionErrores() {
    const cola = todosRapidos().filter((i) => est(i.id).fallos > 0 && est(i.id).caja < 3).sort((a, b) => est(b.id).ult - est(a.id).ult).slice(0, 12);
    return { titulo: "Repasando mis fallos", pest: "errores", cola: barajar(cola), modo: "practica", volver: "#/errores", otra: sesionErrores };
  }
  function sesionExamen(mid) {
    const m = T.materias[mid];
    // reparte las preguntas entre temas para que el simulacro cubra todo
    const porTema = m.temas.map((t) => barajar(t.items.filter((i) => RAPIDOS.has(i.tipo))));
    const cola = [];
    let k = 0;
    while (cola.length < 15 && porTema.some((p) => p.length)) { const p = porTema[k++ % porTema.length]; if (p.length) cola.push(p.pop()); }
    return { titulo: "Simulacro · " + m.nombre, pest: mid, cola: barajar(cola), modo: "examen", volver: "#/m/" + mid, otra: () => sesionExamen(mid) };
  }
  function empezarSesion(s) {
    if (!s.cola.length) { alert("No hay preguntas para esta ronda todavía."); return; }
    SES = Object.assign(s, { i: 0, primera: new Map(), repetidas: new Set(), revision: [], inicio: Date.now() });
    ir("#/sesion");
  }

  /* ======================================================
     SESIÓN
     ====================================================== */
  function vistaSesion() {
    if (SES.i >= SES.cola.length) return vistaResumen();
    const item = SES.cola[SES.i];
    const total = SES.cola.length;
    app.append(el("div", { class: "sesion-top" },
      el("button", { class: "salir", type: "button", onclick: () => { SES = null; ir(SES_volver); } }, "← salir"),
      el("div", { class: "lapiz", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": total, "aria-valuenow": SES.i }, el("i", { style: `width:${(SES.i / total) * 100}%` })),
      el("span", { class: "contador" }, `${SES.i + 1} / ${total}`),
    ));
    const SES_volver = SES.volver;
    const tarjeta = el("section", { class: "tarjeta", "aria-live": "polite" });
    app.append(tarjeta);
    const tema = temaDe(item.mat, item.tema);
    tarjeta.append(el("span", { class: "etiqueta" }, `${T.materias[item.mat].nombre.toLowerCase()} · ${tema.nombre.toLowerCase()}`));

    const examen = SES.modo === "examen";
    const zonaSig = el("div", { class: "botonera" });

    pintarItem(item, tarjeta, examen, (ok, nodoCorr) => {
      const primeraVez = !SES.primera.has(item.id);
      if (primeraVez) { SES.primera.set(item.id, ok); registrar(item.id, ok); }
      if (examen) {
        if (nodoCorr) tarjeta.append(nodoCorr);
        SES.revision.push({ item, ok, nodo: tarjeta });
        SES.i++; teclas = null;
        render();
        return;
      }
      if (nodoCorr) tarjeta.append(nodoCorr);
      if (!ok && !SES.repetidas.has(item.id)) {
        SES.repetidas.add(item.id);
        const pos = Math.min(SES.i + 4, SES.cola.length);
        SES.cola.splice(pos, 0, item);
        tarjeta.append(el("p", { class: "repite" }, "↻ Esta vuelve a salir dentro de un rato, para que se quede."));
      }
      const sig = el("button", { class: "btn", type: "button", onclick: siguiente }, SES.i + 1 >= SES.cola.length ? "Ver resumen →" : "Siguiente →");
      zonaSig.append(sig, el("span", { class: "atajo" }, "Intro"));
      tarjeta.append(zonaSig);
      sig.focus({ preventScroll: true });
      teclas = (e) => { if (e.key === "Enter") { e.preventDefault(); siguiente(); } };
    });
    function siguiente() { SES.i++; render(); }
  }

  function vistaResumen() {
    const s = SES;
    const unicos = [...s.primera.entries()];
    const bien = unicos.filter(([, ok]) => ok).length;
    const fallados = unicos.filter(([, ok]) => !ok).map(([id]) => ITEMS[id]);
    app.append(el("p", { class: "migas" }, el("a", { href: s.volver }, "← volver")));

    if (s.modo === "examen") {
      const nota = unicos.length ? (bien / unicos.length) * 10 : 0;
      const comentario = nota >= 9 ? "Esto está dominado." : nota >= 7 ? "Muy bien. Repasa lo de abajo y a por el 9." : nota >= 5 ? "Aprobado, pero hay huecos: los tienes abajo explicados." : "Todavía no. Mira cada fallo con calma y haz rondas del tema que más cojee.";
      app.append(el("div", { class: "resumen" },
        el("h1", null, "Simulacro corregido"),
        el("div", { class: "nota-examen", "aria-label": "Nota" }, nota.toFixed(1).replace(".", ",")),
        el("p", null, `${bien} de ${unicos.length} bien. ${comentario}`),
      ));
      const fallos = s.revision.filter((r) => !r.ok);
      if (fallos.length) {
        const ul = el("ol", { class: "repaso-lista" });
        fallos.forEach((r) => {
          const n = r.nodo; n.querySelectorAll("button").forEach((b) => (b.disabled = true));
          ul.append(el("li", null, n));
        });
        app.append(el("h2", { style: "font-size:32px;margin-top:40px" }, "Tus fallos, corregidos"), ul);
      }
    } else {
      const frase = !unicos.length ? "" : bien === unicos.length ? "Todo a la primera. Mañana te pregunto otra vez, por si acaso." : `Has acertado ${bien} de ${unicos.length} a la primera. Lo que has fallado ya lo has vuelto a ver, y volverá en tu próxima ronda.`;
      app.append(el("div", { class: "resumen" }, el("h1", null, bien === unicos.length ? "Limpio." : "Ronda hecha."), el("p", null, frase)));
      if (fallados.length) {
        const ul = el("ul", { class: "repaso-lista" });
        fallados.forEach((it) => ul.append(el("li", null, el("div", { class: "rq", html: it.q }), it.exp ? el("div", { class: "explica", html: it.exp }) : null)));
        app.append(el("h2", { style: "font-size:30px;margin-top:36px" }, "Lo que te llevas de esta ronda"), ul);
      }
    }
    app.append(el("div", { class: "acciones", style: "margin-top:40px" },
      el("button", { class: "btn", type: "button", onclick: () => empezarSesion(s.otra()) }, s.modo === "examen" ? "Otro simulacro" : "Otra ronda"),
      el("a", { class: "btn claro", href: s.volver }, "Volver"),
    ));
  }

  /* ======================================================
     MIS FALLOS
     ====================================================== */
  function vistaErrores() {
    app.append(el("h1", { class: "tema-h1" }, "Mis fallos"), el("p", { class: "suave" }, "Lo que has fallado hace poco y todavía no has consolidado. Cuando lo aciertes varias veces seguidas, desaparece de aquí."));
    const lista = todosRapidos().filter((i) => est(i.id).fallos > 0 && est(i.id).caja < 3).sort((a, b) => est(b.id).ult - est(a.id).ult);
    const labs = Object.values(ITEMS).filter((i) => !RAPIDOS.has(i.tipo) && labEst(i.id).intentos > 0 && !labEst(i.id).hecho);
    if (!lista.length && !labs.length) { app.append(el("p", { class: "vacio" }, "Nada por aquí. O no has fallado… o no has empezado 😉")); return; }
    if (lista.length) {
      app.append(el("div", { class: "acciones" }, el("button", { class: "btn", type: "button", onclick: () => empezarSesion(sesionErrores()) }, "Repasar mis fallos")));
      const ul = el("ul", { class: "errores-lista" });
      lista.forEach((it) => {
        const s = est(it.id);
        ul.append(el("li", null,
          el("span", null, el("span", { class: "eq", html: it.q }), el("br"), el("span", { class: "suave chico" }, `${T.materias[it.mat].nombre} · ${temaDe(it.mat, it.tema).nombre}`)),
          el("span", { class: "em" }, s.fallos === 1 ? "1 fallo" : s.fallos + " fallos"),
        ));
      });
      app.append(ul);
    }
    if (labs.length) {
      app.append(el("h2", { style: "font-size:28px;margin-top:40px" }, "Laboratorios a medias"));
      const ul = el("ul", { class: "labs" });
      labs.forEach((l) => ul.append(el("li", null, el("a", { href: "#/lab/" + l.id }, el("span", { class: "lnom" }, l.titulo), el("span", { class: "lest" }, labEst(l.id).intentos + " intentos")))));
      app.append(ul);
    }
  }

  /* ======================================================
     CORRECCIÓN COMÚN
     ====================================================== */
  const FRASES_OK = ["¡Bien!", "Exacto.", "Eso es.", "Correcto.", "Clavado."];
  const FRASES_NO = ["Casi…", "No exactamente.", "Ojo aquí.", "Fallo, y de aquí se aprende.", "Nop."];
  function correccion(ok, o) {
    o = o || {};
    const n = el("div", { class: "correccion" });
    n.append(el("div", { class: "veredicto " + (ok ? "ok" : "no") }, o.veredicto || (ok ? azar(FRASES_OK) : azar(FRASES_NO))));
    if (o.especifico) n.append(el("div", { class: "explica", html: `<span class="titulo">Lo que ha pasado</span>${o.especifico}` }));
    if (!ok && o.correcta) n.append(el("div", { class: "solucion-correcta", html: "La respuesta era: " + o.correcta }));
    if (o.exp) n.append(el("div", { class: "explica", html: `<span class="titulo">${ok ? "Para fijarlo" : "Por qué"}</span>${o.exp}` }));
    if (o.truco) n.append(el("div", { class: "truco", html: "<b>Truco:</b> " + o.truco }));
    n.querySelectorAll("pre.codigo[data-lang]").forEach((p) => { p.innerHTML = resaltar(p.textContent, p.dataset.lang); });
    return n;
  }
  function cabeceraPregunta(cont, it) {
    cont.append(el("h2", { class: "pregunta", html: it.q }));
    if (it.extra) cont.append(el("p", { class: "enunciado-extra", html: it.extra }));
    if (it.code) cont.append(bloqueCodigo(it.code, it.lang || "py"));
  }

  /* ======================================================
     TIPOS DE PREGUNTA
     ====================================================== */
  function pintarItem(it, cont, examen, fin) {
    if (it.tipo === "gen") {
      const g = window.GENERADORES[it.gen];
      const inst = Object.assign({ tipo: "escribe" }, g());
      return pintarItem(Object.assign(inst, { id: it.id, mat: it.mat, tema: it.tema }), cont, examen, fin);
    }
    const f = { test: tipoTest, escribe: tipoEscribe, ordena: tipoOrdena, bugs: tipoBugs }[it.tipo];
    f(it, cont, examen, fin);
  }

  /* --- test --- */
  function tipoTest(it, cont, examen, fin) {
    cabeceraPregunta(cont, it);
    const ops = barajar(it.ops.map((o, i) => ({ t: o[0], ok: !!o[1], why: o[2], i })));
    const ul = el("ul", { class: "opciones" });
    const botones = [];
    let hecho = false;
    ops.forEach((o, k) => {
      const b = el("button", { class: "opcion", type: "button", onclick: () => elegirOp(k) },
        el("span", { class: "caja", "aria-hidden": "true" }, String(k + 1)),
        el("span", { class: "txt", html: o.t }),
      );
      botones.push(b);
      ul.append(el("li", null, b));
    });
    cont.append(ul);
    const nada = el("button", { class: "ni-idea", type: "button", onclick: () => elegirOp(-1) }, "ni idea, enséñamelo");
    cont.append(el("div", { class: "botonera" }, nada, el("span", { class: "atajo" }, "teclas 1–" + ops.length)));
    teclas = (e, enCampo) => { if (enCampo) return; const n = parseInt(e.key, 10); if (n >= 1 && n <= ops.length) elegirOp(n - 1); };

    function elegirOp(k) {
      if (hecho) return; hecho = true; teclas = null; nada.disabled = true;
      const elegida = ops[k];
      const ok = !!(elegida && elegida.ok);
      botones.forEach((b, j) => {
        b.disabled = true;
        const o = ops[j];
        if (o.ok) { b.classList.add("bien"); }
        if (j === k && !o.ok) {
          b.classList.add("mal");
          if (o.why) b.append(el("span", { class: "porque", html: o.why }));
        }
        if (j === k) b.classList.add("sel");
      });
      const correcta = ops.find((o) => o.ok);
      fin(ok, correccion(ok, { exp: it.exp, truco: it.truco, correcta: k === -1 ? correcta.t : null, veredicto: k === -1 ? "Vale, aquí la tienes:" : null }));
    }
  }

  /* --- escribe --- */
  function normaliza(s, modo) {
    s = String(s).trim();
    if (modo === "codigo") return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/'/g, '"').replace(/\s+/g, "");
    if (modo === "conf") return s.toLowerCase().replace(/[‘’“”']/g, '"').replace(/\s+/g, "");
    if (modo === "html") return s.toLowerCase().replace(/[‘’'“”"]/g, "").replace(/\s*=\s*/g, "=").replace(/\s+/g, " ").replace(/\s*(\/?>)/g, "$1").replace(/<\s+/g, "<");
    if (modo === "num") return s.replace(/\s+/g, "").replace(",", ".").replace(/\.$/, "");
    if (modo === "ip") return s.replace(/\s+/g, "");
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’“”"']/g, "").replace(/\s+/g, " ").replace(/[.;]$/, "").trim();
  }
  function tipoEscribe(it, cont, examen, fin) {
    cabeceraPregunta(cont, it);
    const modo = it.modo || "texto";
    const inp = el("input", { class: "campo", type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Tu respuesta", placeholder: it.placeholder || "escribe aquí…" });
    const form = el("form", { onsubmit: (e) => { e.preventDefault(); comprobar(false); } }, inp);
    cont.append(form);
    const btn = el("button", { class: "btn", type: "button", onclick: () => comprobar(false) }, "Comprobar");
    const nada = el("button", { class: "ni-idea", type: "button", onclick: () => comprobar(true) }, "ni idea, enséñamelo");
    cont.append(el("div", { class: "botonera" }, btn, nada, it.pista && !examen ? el("button", { class: "ni-idea", type: "button", onclick: (e) => { e.target.replaceWith(el("span", { class: "nota-mano", style: "font-size:17px", html: "pista: " + it.pista })); } }, "dame una pista") : null));
    setTimeout(() => inp.focus({ preventScroll: true }), 30);
    let hecho = false;
    function comprobar(rendido) {
      if (hecho) return;
      const v = inp.value;
      if (!rendido && !v.trim()) { inp.focus(); return; }
      hecho = true; inp.readOnly = true; btn.disabled = true; nada.disabled = true;
      const nv = normaliza(v, modo);
      const ok = !rendido && it.sol.some((s) => normaliza(s, modo) === nv);
      inp.classList.add(ok ? "bien" : "mal");
      let especifico = null;
      if (!ok && !rendido && it.fallos) {
        for (const f of it.fallos) if (f.si.some((s) => normaliza(s, modo) === nv)) { especifico = f.why; break; }
      }
      fin(ok, correccion(ok, { especifico, exp: it.exp, truco: it.truco, correcta: `<code>${esc(it.sol[0])}</code>`, veredicto: rendido ? "Vale, aquí la tienes:" : null }));
    }
  }

  /* --- ordena --- */
  function tipoOrdena(it, cont, examen, fin) {
    cabeceraPregunta(cont, it);
    let orden = barajar(it.items.map((t, i) => i));
    if (orden.every((v, i) => v === i)) orden.reverse();
    const ul = el("ol", { class: "ordenar" });
    cont.append(ul);
    let hecho = false;
    function pinta() {
      ul.innerHTML = "";
      orden.forEach((idx, pos) => {
        ul.append(el("li", null,
          el("span", { html: it.items[idx] }),
          el("span", { class: "flechas" },
            el("button", { type: "button", "aria-label": "Subir", disabled: hecho || pos === 0, onclick: () => mover(pos, -1) }, "↑"),
            el("button", { type: "button", "aria-label": "Bajar", disabled: hecho || pos === orden.length - 1, onclick: () => mover(pos, 1) }, "↓"),
          ),
        ));
      });
    }
    function mover(pos, d) { const j = pos + d; [orden[pos], orden[j]] = [orden[j], orden[pos]]; pinta(); ul.children[j].querySelectorAll("button")[d < 0 ? 0 : 1]?.focus(); }
    pinta();
    const btn = el("button", { class: "btn", type: "button", onclick: () => comprobar(false) }, "Comprobar orden");
    const nada = el("button", { class: "ni-idea", type: "button", onclick: () => comprobar(true) }, "ni idea, enséñamelo");
    cont.append(el("div", { class: "botonera" }, btn, nada));
    function comprobar(rendido) {
      if (hecho) return; hecho = true; btn.disabled = true; nada.disabled = true;
      const ok = !rendido && orden.every((v, i) => v === i);
      pinta();
      [...ul.children].forEach((li, pos) => {
        const bien = orden[pos] === pos;
        li.classList.add(bien ? "bien" : "mal");
        if (!bien) li.append(el("span", { class: "debia", html: "aquí iba: " + it.items[pos] }));
      });
      fin(ok, correccion(ok, { exp: it.exp, truco: it.truco, veredicto: rendido ? "Este es el orden:" : null }));
    }
  }

  /* --- caza el error --- */
  function tipoBugs(it, cont, examen, fin) {
    cabeceraPregunta(cont, it);
    const nerr = Object.keys(it.errores).length;
    cont.append(el("p", { class: "enunciado-extra" }, `Pulsa las líneas que tengan error (hay ${nerr}). Cuidado: alguna línea rara es correcta.`));
    const marcadas = new Set();
    const caja = el("div", { class: "fichero" }, el("div", { class: "ftitulo" }, it.archivo));
    const ol = el("ol");
    const lis = [];
    it.lineas.forEach((txt, i) => {
      const n = i + 1;
      const b = el("button", { type: "button", "aria-pressed": "false", onclick: () => toggle(n) }, el("span", { class: "n" }, String(n)), el("span", null, txt || " "));
      const li = el("li", null, b);
      lis[n] = li; ol.append(li);
    });
    caja.append(ol); cont.append(caja);
    let hecho = false;
    function toggle(n) {
      if (hecho) return;
      if (marcadas.has(n)) marcadas.delete(n); else marcadas.add(n);
      lis[n].classList.toggle("marcada", marcadas.has(n));
      lis[n].firstChild.setAttribute("aria-pressed", marcadas.has(n));
      cnt.textContent = `${marcadas.size} marcadas`;
    }
    const cnt = el("span", { class: "atajo" }, "0 marcadas");
    const btn = el("button", { class: "btn", type: "button", onclick: () => corregir(false) }, "Corregir");
    const nada = el("button", { class: "ni-idea", type: "button", onclick: () => corregir(true) }, "enséñame los errores");
    cont.append(el("div", { class: "botonera" }, btn, nada, cnt));
    function nota(li, html) { li.append(el("div", { class: "nota-linea", html })); }
    function corregir(rendido) {
      if (hecho) return; hecho = true; btn.disabled = true; nada.disabled = true;
      let encontrados = 0, falsos = 0;
      for (const k in it.errores) {
        const n = +k, e = it.errores[k];
        const li = lis[n]; li.classList.remove("marcada");
        const tipo = e.tipo ? ` <span class="suave">[${e.tipo}]</span>` : "";
        if (marcadas.has(n)) { encontrados++; li.classList.add("res-acierto"); nota(li, `<b style="color:var(--ok)">✓ bien visto.</b>${tipo} ${e.why}<br>Corregida: <code>${esc(e.fix)}</code>`); }
        else { li.classList.add("res-fallo"); nota(li, `<b style="color:var(--rojo)">✗ se te pasó.</b>${tipo} ${e.why}<br>Corregida: <code>${esc(e.fix)}</code>`); }
      }
      marcadas.forEach((n) => {
        if (it.errores[n]) return;
        falsos++;
        const li = lis[n]; li.classList.remove("marcada"); li.classList.add("res-falso");
        nota(li, `<b style="color:var(--rojo)">Esta está bien.</b> ${(it.trampas && it.trampas[n]) || "No tiene ningún error."}`);
      });
      for (const k in it.trampas || {}) if (!marcadas.has(+k)) nota(lis[+k], `<b style="color:var(--azul)">Trampa esquivada:</b> ${it.trampas[k]}`);
      const ok = !rendido && encontrados === nerr && falsos === 0;
      fin(ok, correccion(ok, {
        veredicto: rendido ? "Aquí están, explicados:" : ok ? "Todos, y sin falsos positivos." : `${encontrados} de ${nerr}${falsos ? `, y ${falsos} ${falsos === 1 ? "línea correcta marcada" : "líneas correctas marcadas"}` : ""}.`,
        exp: it.exp,
      }));
    }
  }

  /* ======================================================
     LABORATORIOS
     ====================================================== */
  function vistaLab(l) {
    const m = T.materias[l.mat], t = temaDe(l.mat, l.tema);
    const s = labEst(l.id);
    app.append(
      el("p", { class: "migas" }, el("a", { href: "#/" }, "libreta"), " / ", el("a", { href: "#/m/" + l.mat }, m.nombre.toLowerCase()), " / ", el("a", { href: `#/t/${l.mat}/${l.tema}` }, t.nombre.toLowerCase())),
      el("h1", { class: "tema-h1", style: "font-size:clamp(34px,5vw,58px)" }, l.titulo),
      el("div", { class: "enunciado-lab", html: l.enunciado }),
    );
    app.querySelectorAll(".enunciado-lab pre.codigo[data-lang]").forEach((p) => { p.innerHTML = resaltar(p.textContent, p.dataset.lang); });

    const esHtml = l.tipo === "html";
    const esPy = l.tipo === "py";
    const ed = el("textarea", { class: "editor", spellcheck: "false", autocapitalize: "off", autocomplete: "off", "aria-label": "Editor de código" });
    ed.value = s.codigo != null ? s.codigo : (l.inicio || "");
    preparaEditor(ed, esPy);
    const rejilla = el("div", { class: "lab-rejilla" + (esHtml ? " html" : "") }, el("div", { class: "editor-wrap" }, ed));
    let vista = null;
    if (esHtml) {
      vista = el("iframe", { class: "vista", title: "Vista previa", sandbox: "" });
      rejilla.append(el("div", null, el("div", { class: "vista-tit" }, "así se ve tu página ↓"), vista));
      const refrescar = () => { vista.srcdoc = ed.value; };
      let tmr; ed.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(refrescar, 300); });
      refrescar();
    }
    app.append(rejilla);
    let tg; ed.addEventListener("input", () => { clearTimeout(tg); tg = setTimeout(() => { E.labs[l.id] = Object.assign(labEst(l.id), { codigo: ed.value }); guardar(); }, 400); });

    const res = el("div", { class: "bloque", style: "margin-top:22px" });
    const btnComp = el("button", { class: "btn", type: "button", onclick: comprobar }, esPy ? "▶ Ejecutar pruebas" : "Corregir");
    const btnSol = el("button", { class: "btn claro", type: "button", disabled: s.intentos < 1 && !s.hecho, onclick: verSol }, "Ver solución");
    const btnPista = l.pista ? el("button", { class: "ni-idea", type: "button", onclick: (e) => e.target.replaceWith(el("span", { class: "nota-mano", style: "font-size:17px", html: "pista: " + l.pista })) }, "pista") : null;
    const btnReset = el("button", { class: "ni-idea", type: "button", onclick: () => { if (confirm("¿Volver al código inicial? Perderás lo escrito.")) { ed.value = l.inicio || ""; ed.dispatchEvent(new Event("input")); } } }, "empezar de cero");
    app.append(el("div", { class: "botonera" }, btnComp, btnSol, btnPista, btnReset), res);
    if (!s.intentos && !s.hecho) app.append(el("p", { class: "suave chico" }, "La solución se desbloquea cuando lo hayas intentado una vez."));

    async function comprobar() {
      res.innerHTML = "";
      btnComp.disabled = true;
      let resultado;
      try {
        if (esPy) resultado = await comprobarPython(l, ed.value, res);
        else resultado = comprobarChecks(l, ed.value);
      } finally { btnComp.disabled = false; }
      if (!resultado) return;
      const st = labEst(l.id);
      st.intentos++; st.codigo = ed.value;
      if (resultado.ok) st.hecho = true;
      E.labs[l.id] = st; guardar();
      btnSol.disabled = false;
      res.innerHTML = "";
      res.append(el("div", { class: "veredicto " + (resultado.ok ? "ok" : "no") }, resultado.ok ? azar(["¡Superado!", "Todo en verde.", "Perfecto, a la primera o no, cuenta igual."]) : `Te faltan ${resultado.fallos} ${resultado.fallos === 1 ? "cosa" : "cosas"}`));
      if (resultado.extra) res.append(resultado.extra);
      res.append(resultado.lista);
      if (resultado.ok && l.exp) res.append(el("div", { class: "explica", style: "margin-top:16px", html: `<span class="titulo">Para fijarlo</span>${l.exp}` }));
    }
    function verSol() {
      if (res.querySelector(".sol-lab")) return;
      const lang = esPy ? "py" : esHtml ? "html" : l.lang || "conf";
      res.append(el("div", { class: "sol-lab bloque" },
        el("h2", null, "Una solución posible", el("small", null, "compárala con la tuya, no la copies sin entenderla")),
        bloqueCodigo(l.sol, lang),
        l.exp ? el("div", { class: "explica", html: `<span class="titulo">Por qué así</span>${l.exp}` }) : null,
      ));
      res.querySelector(".sol-lab").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function preparaEditor(ed, python) {
    ed.addEventListener("keydown", (e) => {
      const ini = ed.selectionStart, fin = ed.selectionEnd, v = ed.value;
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const iniLinea = v.lastIndexOf("\n", ini - 1) + 1;
          if (v.slice(iniLinea, iniLinea + 4) === "    ") { ed.value = v.slice(0, iniLinea) + v.slice(iniLinea + 4); ed.selectionStart = ed.selectionEnd = Math.max(iniLinea, ini - 4); }
        } else { ed.setRangeText("    ", ini, fin, "end"); }
        ed.dispatchEvent(new Event("input"));
      } else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
        const iniLinea = v.lastIndexOf("\n", ini - 1) + 1;
        const linea = v.slice(iniLinea, ini);
        let sangria = (linea.match(/^\s*/) || [""])[0];
        if (python && /:\s*(#.*)?$/.test(linea)) sangria += "    ";
        e.preventDefault();
        ed.setRangeText("\n" + sangria, ini, fin, "end");
        ed.dispatchEvent(new Event("input"));
      }
    });
  }

  /* --- labs con comprobaciones (HTML, zonas DNS, dhcpd.conf, texto) --- */
  function comprobarChecks(l, src) {
    const ctx = window.H.contexto(l.tipo, src, l.origen);
    const lista = el("ul", { class: "resultados" });
    let fallos = 0;
    l.checks.forEach((c) => {
      let r;
      try { r = c.f(ctx); } catch (e) { r = false; }
      const ok = r === true;
      if (!ok) fallos++;
      const det = !ok ? (typeof r === "string" ? r : c.why) : null;
      lista.append(el("li", { class: ok ? "ok" : "no" },
        el("span", { class: "marca", "aria-label": ok ? "bien" : "mal" }, ok ? "✓" : "✗"),
        el("span", null, el("span", { html: c.d }), det ? el("span", { class: "det", html: det }) : null),
      ));
    });
    let extra = null;
    if (ctx.avisos && ctx.avisos.length) {
      extra = el("div", { class: "aviso", style: "margin-bottom:14px", html: "<b>El boli rojo ha visto esto al leer tu fichero:</b><br>" + ctx.avisos.join("<br>") });
    }
    return { ok: fallos === 0, fallos, lista, extra };
  }

  /* --- labs de Python --- */
  const ERRORES_PY = {
    SyntaxError: "Error de sintaxis: Python no entiende cómo está escrito. Revisa los <code>:</code> al final de <code>def</code>, <code>if</code>, <code>for</code>, <code>while</code>, paréntesis y comillas sin cerrar.",
    IndentationError: "Error de sangría: las líneas de dentro de un bloque deben ir 4 espacios más a la derecha que la línea con <code>:</code>, y todas igual de alineadas.",
    TabError: "Mezclas tabuladores y espacios. Usa siempre 4 espacios.",
    NameError: "Usas un nombre (variable o función) que no existe en ese momento. ¿Está bien escrito? ¿Lo has creado antes de usarlo?",
    TypeError: "Operas con tipos que no encajan (por ejemplo sumar un número y una cadena, o llamar a una función con más o menos argumentos de la cuenta).",
    IndexError: "Te sales de la lista: pides una posición que no existe. Recuerda que los índices van de 0 a <code>len(lista) - 1</code>.",
    KeyError: "Buscas en el diccionario una clave que no está. Comprueba antes con <code>if clave in dic:</code>.",
    ZeroDivisionError: "Divides entre cero. ¿Has contemplado la lista vacía?",
    NotImplementedError: "La función todavía tiene el <code>raise NotImplementedError</code> de la plantilla: bórralo y escribe tu código.",
    AttributeError: "Usas un método que ese tipo no tiene (por ejemplo <code>.append</code> sobre una tupla o una cadena).",
    ValueError: "Un valor no válido para esa operación (por ejemplo <code>.remove(x)</code> de algo que no está en la lista).",
    UnboundLocalError: "Usas una variable antes de darle valor dentro de la función. Inicialízala al principio.",
    RecursionError: "La función se llama a sí misma sin parar.",
  };
  async function comprobarPython(l, codigo, res) {
    const lista = el("ul", { class: "resultados" });
    // reglas del enunciado (prohibido usar max(), sum(), comprensiones...)
    const sinComentarios = codigo.replace(/#.*$/gm, "");
    const reglas = [];
    (l.prohibido || []).forEach(([re, msg]) => { if (new RegExp(re).test(sinComentarios)) reglas.push(msg); });
    (l.requiere || []).forEach(([re, msg]) => { if (!new RegExp(re).test(sinComentarios)) reglas.push(msg); });

    res.append(el("p", { class: "cargando" }, window.Py.listo ? "Ejecutando tus pruebas" : "Arrancando Python en el navegador (la primera vez tarda unos segundos)"));
    let r;
    try { r = await window.Py.ejecutar(codigo, l.tests); }
    catch (err) {
      res.innerHTML = "";
      res.append(el("div", { class: "aviso", html: err.message === "timeout"
        ? "<b>Tu código no termina.</b> Lleva varios segundos ejecutándose: casi seguro que un <code>while</code> nunca llega a ser falso. ¿Actualizas el índice (<code>i += 1</code>) en todos los caminos?"
        : "<b>No he podido cargar Python.</b> Los laboratorios de Python necesitan conexión a Internet la primera vez (se descarga Pyodide). Comprueba la conexión y vuelve a intentarlo." }));
      if (err.message === "timeout") { return { ok: false, fallos: 1, lista }; }
      return null;
    }
    let fallos = 0;
    if (r.error) {
      fallos++;
      const exp = ERRORES_PY[r.error.tipo] || "";
      lista.append(el("li", { class: "no" }, el("span", { class: "marca" }, "✗"),
        el("span", null, el("span", { html: `Tu código no llega a ejecutarse: <code>${esc(r.error.tipo)}</code>${r.error.linea ? " en la línea " + r.error.linea : ""}.` }),
          el("span", { class: "det", html: `${exp}${r.error.msg ? `<br><code>${esc(r.error.msg)}</code>` : ""}` }))));
    } else {
      r.tests.forEach((t) => {
        if (!t.ok) fallos++;
        let det = null;
        if (!t.ok) {
          if (t.excepcion) det = `Tu función lanza <code>${esc(t.excepcion.tipo)}</code>${t.excepcion.linea ? " (línea " + t.excepcion.linea + ")" : ""}. ${ERRORES_PY[t.excepcion.tipo] || esc(t.excepcion.msg)}`;
          else if (t.obtenido !== undefined) {
            det = `Devuelve <code>${esc(t.obtenido)}</code> y se esperaba <code>${esc(t.esperado)}</code>.`;
            if (t.obtenido === "None") det += " <br>¿Te falta el <code>return</code>? ¿O usas <code>print()</code> en vez de devolver el resultado?";
            else if (/^\(/.test(t.esperado) && /^\[/.test(t.obtenido)) det += " <br>Devuelves una lista y se pide una tupla: usa <code>return (a, b)</code>.";
            else if (/^\[/.test(t.esperado) && /^\(/.test(t.obtenido)) det += " <br>Devuelves una tupla y se pide una lista.";
          } else det = "La comprobación no se cumple.";
          if (/^assert (original|inventario_original)\b/.test(t.test.split("\n").pop()) && !t.excepcion) det = "Has modificado la lista que te pasaron como argumento. Crea una lista nueva (o una copia con <code>lista[:]</code>) y trabaja sobre ella.";
        }
        lista.append(el("li", { class: t.ok ? "ok" : "no" }, el("span", { class: "marca" }, t.ok ? "✓" : "✗"),
          el("span", null, el("code", null, t.test.split("\n").pop()), det ? el("span", { class: "det", html: det }) : null)));
      });
    }
    reglas.forEach((msg) => { fallos++; lista.append(el("li", { class: "no" }, el("span", { class: "marca" }, "✗"), el("span", null, "Norma del enunciado", el("span", { class: "det", html: msg })))); });
    let extra = null;
    if (r.salida && r.salida.trim()) extra = el("div", null, el("div", { class: "vista-tit" }, "lo que has imprimido con print():"), el("div", { class: "salida-py" }, r.salida));
    return { ok: fallos === 0, fallos, lista, extra };
  }

  /* arranque */
  render();
  window.LIBRETA = { ITEMS, E, registrar };
})();
