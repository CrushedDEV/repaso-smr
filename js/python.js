/* ==========================================================
   Python en el navegador (Pyodide) dentro de un Web Worker,
   para poder cortar bucles infinitos sin colgar la página.
   ========================================================== */
(function () {
  "use strict";
  const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

  const AYUDANTE = `
import ast, json, io, sys, traceback

def _linea_usuario(tb):
    linea = None
    for fr in traceback.extract_tb(tb):
        if fr.filename == "tu_codigo.py":
            linea = fr.lineno
    return linea

def __ejecutar(codigo, tests):
    salida = io.StringIO()
    viejo = sys.stdout
    sys.stdout = salida
    res = {"error": None, "tests": [], "salida": ""}
    try:
        _correr(codigo, tests, res)
    finally:
        sys.stdout = viejo
    res["salida"] = salida.getvalue()[:4000]
    return json.dumps(res)

def _correr(codigo, tests, res):
    G = {"__name__": "__main__"}
    if True:
        try:
            comp = compile(codigo, "tu_codigo.py", "exec")
        except SyntaxError as e:
            res["error"] = {"tipo": type(e).__name__, "msg": str(e.msg), "linea": e.lineno}
            return
        try:
            exec(comp, G)
        except Exception as e:
            res["error"] = {"tipo": type(e).__name__, "msg": str(e), "linea": _linea_usuario(e.__traceback__)}
            return
        for t in tests:
            r = {"test": t, "ok": False}
            try:
                arbol = ast.parse(t)
                cuerpo = arbol.body
                previas = cuerpo[:-1]
                ultima = cuerpo[-1]
                if previas:
                    exec(compile(ast.Module(body=previas, type_ignores=[]), "prueba", "exec"), G)
                if isinstance(ultima, ast.Assert) and isinstance(ultima.test, ast.Compare) and len(ultima.test.ops) == 1 and type(ultima.test.ops[0]).__name__ in ("Eq", "Is"):
                    izq = eval(compile(ast.Expression(ultima.test.left), "prueba", "eval"), G)
                    der = eval(compile(ast.Expression(ultima.test.comparators[0]), "prueba", "eval"), G)
                    op = type(ultima.test.ops[0]).__name__
                    r["ok"] = bool(izq == der) if op == "Eq" else (izq is der)
                    if not r["ok"]:
                        r["obtenido"] = repr(izq)
                        r["esperado"] = repr(der)
                else:
                    exec(compile(ast.Module(body=[ultima], type_ignores=[]), "prueba", "exec"), G)
                    r["ok"] = True
            except AssertionError:
                r["ok"] = False
            except Exception as e:
                r["excepcion"] = {"tipo": type(e).__name__, "msg": str(e), "linea": _linea_usuario(e.__traceback__)}
            res["tests"].append(r)
`;

  const WORKER = `
importScripts(${JSON.stringify(PYODIDE + "pyodide.js")});
let py = null;
const listo = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE)} }).then((p) => { py = p; py.runPython(${JSON.stringify(AYUDANTE)}); postMessage({ tipo: "listo" }); })
  .catch((e) => postMessage({ tipo: "fallo", msg: String(e) }));
onmessage = async (e) => {
  await listo;
  const { id, codigo, tests } = e.data;
  try {
    py.globals.set("__codigo", codigo);
    py.globals.set("__tests", py.toPy(tests));
    const r = py.runPython("__ejecutar(__codigo, __tests)");
    postMessage({ tipo: "res", id, res: JSON.parse(r) });
  } catch (err) {
    postMessage({ tipo: "res", id, res: { error: { tipo: "Error", msg: String(err) }, tests: [], salida: "" } });
  }
};`;

  let worker = null, listo = false, esperaListo = null, cont = 0;
  const pendientes = new Map();

  function crear() {
    const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
    worker = new Worker(url);
    listo = false;
    esperaListo = new Promise((ok, ko) => {
      worker.onmessage = (e) => {
        const d = e.data;
        if (d.tipo === "listo") { listo = true; Py.listo = true; ok(); }
        else if (d.tipo === "fallo") { ko(new Error("carga")); }
        else if (d.tipo === "res" && pendientes.has(d.id)) { pendientes.get(d.id).ok(d.res); pendientes.delete(d.id); }
      };
      worker.onerror = () => ko(new Error("carga"));
    });
    esperaListo.catch(() => { worker && worker.terminate(); worker = null; });
  }

  const Py = {
    listo: false,
    async ejecutar(codigo, tests) {
      if (!worker) crear();
      await esperaListo; // la carga inicial no cuenta para el tiempo límite
      const id = ++cont;
      return new Promise((ok, ko) => {
        const tmr = setTimeout(() => {
          pendientes.delete(id);
          worker.terminate(); worker = null; Py.listo = false;
          ko(new Error("timeout"));
        }, 6000);
        pendientes.set(id, { ok: (r) => { clearTimeout(tmr); ok(r); } });
        worker.postMessage({ id, codigo, tests });
      });
    },
  };
  window.Py = Py;
})();
