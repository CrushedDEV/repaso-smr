/* Programación · Exámenes de práctica: ejercicios completos tipo examen, de funciones a programas con input/print */
window.TEMARIO = window.TEMARIO || { materias: {}, orden: [], labsExtra: {} };
(function () {
  const SIN_COMPRENSIONES = ["\\[[^\\]\\n]*\\bfor\\b[^\\]\\n]*\\bin\\b", "Sin comprensiones de listas (<code>[x for x in ...]</code>): en el examen se pide el bucle explícito."];
  const SIN_INPUT = ["\\binput\\s*\\(", "Esta parte es una <b>función</b>: los datos entran por parámetros, nada de <code>input()</code>."];
  const SIN_PRINT = ["\\bprint\\s*\\(", "Esta parte es una <b>función</b>: el resultado se devuelve con <code>return</code>, sin <code>print()</code>."];
  const CON_WHILE = ["\\bwhile\\b", "El enunciado pide resolverlo <b>con un <code>while</code></b>."];
  const CON_MAIN = ["def\\s+main\\s*\\(\\s*\\)\\s*:", "El programa tiene que estar dentro de <code>def main():</code>."];
  const CON_INPUT = ["\\binput\\s*\\(", "Es un programa completo: los datos se piden con <code>input()</code>."];
  const FUNC = [SIN_COMPRENSIONES, SIN_INPUT, SIN_PRINT];
  const PROG = { prohibido: [SIN_COMPRENSIONES], requiere: [CON_MAIN, CON_INPUT] };

  const NOTA_PROG = `<p class="aviso" style="margin-top:12px">Cómo se corrige: las pruebas llaman a <code>main()</code> y le dan los datos como si alguien los tecleara. <b>Lo que pongas dentro de <code>input("…")</code> da igual</b>; se comprueba lo que imprimes con <code>print()</code>, línea a línea y con el texto exacto. No llames tú a <code>main()</code> al final.</p>`;
  const funcion = (cab, todo) => `${cab}\n    # TODO: ${todo}\n    raise NotImplementedError("Completa la función")\n`;
  const programa = (todo) => `def main():\n    # TODO: ${todo}\n    raise NotImplementedError("Escribe el programa")\n`;
  const L = (grupo, desc, o) => Object.assign({ tipo: "py", grupo, grupoDesc: desc }, o);

  /* ======================= EXAMEN 1 ======================= */
  const E1 = "Examen 1 · Taller IbaiondoOn";
  const D1 = "60 minutos. Funciones con condiciones, listas de tuplas, un while y un programa que lee datos hasta «fin».";
  const examen1 = [
    L(E1, D1, { titulo: "Ej. 1 · Presupuesto de una reparación", nivel: "2 puntos",
      enunciado: `<p>Escribe <code>calcular_presupuesto(horas, precio_hora, piezas)</code>:</p><ul><li><code>piezas</code> es una lista con el precio de cada pieza. Las piezas con precio negativo son errores de tecleo: <b>se ignoran</b>.</li><li>Total = horas × precio_hora + suma de las piezas válidas.</li><li>Si el total <b>supera</b> los 200 €, se aplica un 10 % de descuento.</li><li>Si <code>horas</code> o <code>precio_hora</code> son negativos, devuelve <code>None</code>.</li><li>Devuelve el total redondeado a 2 decimales. No modifiques la lista.</li></ul><p><code>calcular_presupuesto(5, 40, [10])</code> → <code>189.0</code> (210 − 10 %)</p>`,
      inicio: funcion("def calcular_presupuesto(horas, precio_hora, piezas):", "calcula el total con las reglas del enunciado"),
      tests: ["assert calcular_presupuesto(2, 30, [15.5, 4.5]) == 80.0", "assert calcular_presupuesto(5, 40, [10]) == 189.0", "assert calcular_presupuesto(3, 25, []) == 75.0", "assert calcular_presupuesto(4, 50, []) == 200.0", "assert calcular_presupuesto(1, 20, [-5, 10]) == 30.0", "assert calcular_presupuesto(-1, 30, [10]) is None", "assert calcular_presupuesto(2, -10, []) is None", "original = [10, -3]\ncalcular_presupuesto(1, 10, original)\nassert original == [10, -3]"],
      prohibido: FUNC,
      sol: "def calcular_presupuesto(horas, precio_hora, piezas):\n    if horas < 0 or precio_hora < 0:\n        return None\n    total = horas * precio_hora\n    for p in piezas:\n        if p >= 0:\n            total += p\n    if total > 200:\n        total = total * 0.9\n    return round(total, 2)",
      exp: "Orden de examen: primero el caso no válido, luego acumulas, luego el descuento y al final redondeas. «Supera» = <code>&gt;</code>: con 200 justos no hay descuento.", pista: "comprueba los negativos lo primero de todo" }),
    L(E1, D1, { titulo: "Ej. 2 · Clasificar reparaciones por estado", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>clasificar_reparaciones(reparaciones)</code>. Recibe una lista de tuplas <code>(cliente, estado)</code> y devuelve un <b>diccionario</b> con <b>siempre</b> estas tres claves: <code>"pendiente"</code>, <code>"en curso"</code> y <code>"terminada"</code>. Cada clave tiene la lista de clientes en ese estado, en el orden en que aparecen. Los estados desconocidos se ignoran.</p><p><code>clasificar_reparaciones([("Ane", "pendiente"), ("Jon", "terminada"), ("Leire", "pendiente")])</code><br>→ <code>{"pendiente": ["Ane", "Leire"], "en curso": [], "terminada": ["Jon"]}</code></p>`,
      inicio: funcion("def clasificar_reparaciones(reparaciones):", "devuelve un diccionario con las tres claves"),
      tests: ['assert clasificar_reparaciones([("Ane", "pendiente"), ("Jon", "terminada"), ("Leire", "pendiente"), ("Iker", "en curso")]) == {"pendiente": ["Ane", "Leire"], "en curso": ["Iker"], "terminada": ["Jon"]}', 'assert clasificar_reparaciones([]) == {"pendiente": [], "en curso": [], "terminada": []}', 'assert clasificar_reparaciones([("Unai", "perdido"), ("Mikel", "terminada")]) == {"pendiente": [], "en curso": [], "terminada": ["Mikel"]}'],
      prohibido: FUNC,
      sol: 'def clasificar_reparaciones(reparaciones):\n    resultado = {"pendiente": [], "en curso": [], "terminada": []}\n    for cliente, estado in reparaciones:\n        if estado in resultado:\n            resultado[estado].append(cliente)\n    return resultado',
      exp: "Si creas el diccionario con las tres claves y listas vacías al principio, el caso vacío sale solo, y <code>if estado in resultado</code> filtra los estados desconocidos.", pista: "crea el diccionario con las tres listas vacías antes del bucle" }),
    L(E1, D1, { titulo: "Ej. 3 · Jornada del taller (while)", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>jornada_taller(tiempos, jornada)</code> <b>con un while</b>. <code>tiempos</code> son los minutos de cada reparación en orden de llegada y <code>jornada</code> los minutos disponibles. Se atienden en orden mientras quepan; en cuanto una no cabe, se para (no se salta). Devuelve <code>(atendidas, minutos_usados, pendientes)</code>, donde <code>pendientes</code> es una lista nueva con las que quedan.</p><p><code>jornada_taller([60, 90, 45, 30], 200)</code> → <code>(3, 195, [30])</code></p>`,
      inicio: funcion("def jornada_taller(tiempos, jornada):", "usa un while y para en la primera que no quepa"),
      tests: ["assert jornada_taller([60, 90, 45, 30], 200) == (3, 195, [30])", "assert jornada_taller([120, 100], 100) == (0, 0, [120, 100])", "assert jornada_taller([], 480) == (0, 0, [])", "assert jornada_taller([50, 50], 100) == (2, 100, [])", "original = [30, 40]\njornada_taller(original, 30)\nassert original == [30, 40]"],
      prohibido: FUNC, requiere: [CON_WHILE],
      sol: "def jornada_taller(tiempos, jornada):\n    i = 0\n    usados = 0\n    while i < len(tiempos) and usados + tiempos[i] <= jornada:\n        usados += tiempos[i]\n        i += 1\n    atendidas = i\n    pendientes = []\n    while i < len(tiempos):\n        pendientes.append(tiempos[i])\n        i += 1\n    return (atendidas, usados, pendientes)",
      exp: "El primer while avanza mientras quepa la siguiente. Al salir, <code>i</code> apunta a la primera que no cabe: desde ahí todo son pendientes (también vale <code>tiempos[i:]</code>, que crea una lista nueva).", pista: "while i < len(tiempos) and usados + tiempos[i] <= jornada:" }),
    L(E1, D1, { titulo: "Ej. 4 · Programa: inventario hasta «fin»", nivel: "3 puntos · programa completo",
      enunciado: `<p>Escribe un programa (dentro de <code>def main():</code>) que:</p><ol><li>Pida nombres de producto con <code>input()</code> hasta que se escriba <code>fin</code>.</li><li>Por cada producto pida sus unidades (número entero). Si son negativas, imprime <code>Unidades no válidas</code> y ese producto no cuenta.</li><li>Al terminar imprima:<pre class="codigo" data-lang="conf">Productos: 2
Total unidades: 8
Más unidades: ratón</pre>Si hay empate de unidades, gana el primero. Si no se ha guardado ningún producto, imprime solo <code>Inventario vacío</code>.</li></ol><p>Ejemplo: tecleando <code>ratón</code>, <code>5</code>, <code>teclado</code>, <code>3</code>, <code>fin</code> sale lo de arriba.</p>${NOTA_PROG}`,
      inicio: programa("pide productos hasta 'fin' y muestra el resumen"),
      tests: ['assert __programa(main, ["ratón", "5", "teclado", "3", "fin"]) == ["Productos: 2", "Total unidades: 8", "Más unidades: ratón"]', 'assert __programa(main, ["fin"]) == ["Inventario vacío"]', 'assert __programa(main, ["monitor", "-2", "cable", "10", "fin"]) == ["Unidades no válidas", "Productos: 1", "Total unidades: 10", "Más unidades: cable"]', 'assert __programa(main, ["a", "4", "b", "4", "fin"]) == ["Productos: 2", "Total unidades: 8", "Más unidades: a"]', 'assert __programa(main, ["disco", "-1", "fin"]) == ["Unidades no válidas", "Inventario vacío"]'],
      ...PROG,
      sol: 'def main():\n    productos = 0\n    total = 0\n    mejor = ""\n    max_unidades = -1\n    nombre = input("Producto: ")\n    while nombre != "fin":\n        unidades = int(input("Unidades: "))\n        if unidades < 0:\n            print("Unidades no válidas")\n        else:\n            productos += 1\n            total += unidades\n            if unidades > max_unidades:\n                max_unidades = unidades\n                mejor = nombre\n        nombre = input("Producto: ")\n    if productos == 0:\n        print("Inventario vacío")\n    else:\n        print(f"Productos: {productos}")\n        print(f"Total unidades: {total}")\n        print(f"Más unidades: {mejor}")',
      exp: "Patrón «leer hasta un valor centinela»: un <code>input()</code> antes del bucle y otro al final de cada vuelta. <code>input()</code> siempre devuelve texto: para operar, <code>int(...)</code>. Con <code>&gt;</code> (no <code>&gt;=</code>) el empate se lo queda el primero.", pista: "nombre = input(); while nombre != \"fin\": ... ; nombre = input()" }),
  ];

  /* ======================= EXAMEN 2 ======================= */
  const E2 = "Examen 2 · Notas del grupo";
  const D2 = "60 minutos. Pesos y límites, tuplas que devuelven varios datos, rachas en una lista y un programa con un número fijo de lecturas.";
  const examen2 = [
    L(E2, D2, { titulo: "Ej. 1 · Nota final ponderada", nivel: "2 puntos",
      enunciado: `<p>Escribe <code>nota_final(teoria, practica, actitud)</code>:</p><ul><li>Si alguna nota es menor que 0 o mayor que 10, devuelve <code>-1</code>.</li><li>Nota = 50 % teoría + 40 % práctica + 10 % actitud.</li><li>Si la teoría es menor que 4, la nota final es <b>como máximo 4</b>.</li><li>Devuelve la nota redondeada a 2 decimales.</li></ul><p><code>nota_final(8, 6, 10)</code> → <code>7.4</code> · <code>nota_final(3, 10, 10)</code> → <code>4</code></p>`,
      inicio: funcion("def nota_final(teoria, practica, actitud):", "aplica los pesos y las reglas"),
      tests: ["assert nota_final(8, 6, 10) == 7.4", "assert nota_final(3, 10, 10) == 4", "assert nota_final(5, 5, 5) == 5.0", "assert nota_final(2, 2, 0) == 1.8", "assert nota_final(11, 5, 5) == -1", "assert nota_final(5, -1, 5) == -1", "assert nota_final(4, 4, 4) == 4.0"],
      prohibido: FUNC,
      sol: "def nota_final(teoria, practica, actitud):\n    for n in (teoria, practica, actitud):\n        if n < 0 or n > 10:\n            return -1\n    nota = teoria * 0.5 + practica * 0.4 + actitud * 0.1\n    if teoria < 4 and nota > 4:\n        nota = 4\n    return round(nota, 2)",
      exp: "Recorrer una tupla con las tres notas evita repetir tres veces la misma condición. El tope de 4 solo se aplica si la nota lo supera (con 2, 2, 0 sigue siendo 1.8)." }),
    L(E2, D2, { titulo: "Ej. 2 · Resumen del grupo", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>resumen_grupo(alumnos)</code>. Recibe una lista de tuplas <code>(nombre, nota)</code> y devuelve la tupla <code>(media, aprobados, mejor)</code>:</p><ul><li><code>media</code>: media de las notas redondeada a 2 decimales.</li><li><code>aprobados</code>: lista con los nombres con nota ≥ 5, en orden.</li><li><code>mejor</code>: nombre de la nota más alta (si hay empate, el primero).</li><li>Lista vacía → <code>(None, [], None)</code>. Sin <code>max()</code> ni <code>sum()</code>.</li></ul><p><code>resumen_grupo([("Ane", 7), ("Jon", 4.5), ("Leire", 9), ("Iker", 5.5)])</code> → <code>(6.5, ["Ane", "Leire", "Iker"], "Leire")</code></p>`,
      inicio: funcion("def resumen_grupo(alumnos):", "devuelve (media, aprobados, mejor)"),
      tests: ['assert resumen_grupo([("Ane", 7), ("Jon", 4.5), ("Leire", 9), ("Iker", 5.5)]) == (6.5, ["Ane", "Leire", "Iker"], "Leire")', "assert resumen_grupo([]) == (None, [], None)", 'assert resumen_grupo([("Unai", 3)]) == (3.0, [], "Unai")', 'assert resumen_grupo([("A", 8), ("B", 8)]) == (8.0, ["A", "B"], "A")'],
      prohibido: FUNC.concat([["\\bmax\\s*\\(", "Sin <code>max()</code>."], ["\\bsum\\s*\\(", "Sin <code>sum()</code>."]]),
      sol: "def resumen_grupo(alumnos):\n    if len(alumnos) == 0:\n        return (None, [], None)\n    total = 0\n    aprobados = []\n    mejor = alumnos[0][0]\n    nota_mejor = alumnos[0][1]\n    for nombre, nota in alumnos:\n        total += nota\n        if nota >= 5:\n            aprobados.append(nombre)\n        if nota > nota_mejor:\n            nota_mejor = nota\n            mejor = nombre\n    return (round(total / len(alumnos), 2), aprobados, mejor)",
      exp: "Un solo recorrido calcula las tres cosas. El mejor se inicializa con el primer alumno (no con nota 0) y se cambia solo con <code>&gt;</code>, así el empate es para el primero." }),
    L(E2, D2, { titulo: "Ej. 3 · Racha más larga de aprobados", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>racha_aprobados(notas)</code>: devuelve la longitud de la secuencia <b>seguida</b> más larga de notas ≥ 5.</p><p><code>racha_aprobados([6, 7, 3, 5, 5, 8, 2])</code> → <code>3</code> (5, 5, 8) · <code>racha_aprobados([])</code> → <code>0</code></p>`,
      inicio: funcion("def racha_aprobados(notas):", "cuenta la racha actual y guarda la mejor"),
      tests: ["assert racha_aprobados([6, 7, 3, 5, 5, 8, 2]) == 3", "assert racha_aprobados([]) == 0", "assert racha_aprobados([1, 2]) == 0", "assert racha_aprobados([5, 5, 5]) == 3", "assert racha_aprobados([9, 1, 9]) == 1"],
      prohibido: FUNC,
      sol: "def racha_aprobados(notas):\n    actual = 0\n    mejor = 0\n    for n in notas:\n        if n >= 5:\n            actual += 1\n            if actual > mejor:\n                mejor = actual\n        else:\n            actual = 0\n    return mejor",
      exp: "Dos contadores: la racha <b>actual</b> (se reinicia a 0 con un suspenso) y la <b>mejor</b> vista hasta ahora. Actualizar la mejor dentro del if evita olvidarse de la racha que acaba justo al final de la lista.", pista: "actual se pone a 0 con cada suspenso" }),
    L(E2, D2, { titulo: "Ej. 4 · Programa: notas de la clase", nivel: "3 puntos · programa completo",
      enunciado: `<p>Escribe un programa (en <code>def main():</code>) que:</p><ol><li>Pida el número de alumnos. Si es 0 o negativo, imprime <code>Nada que calcular</code> y termina.</li><li>Para cada alumno pida su nombre y su nota (puede tener decimales: <code>float</code>) e imprima <code>Nombre: APROBADO</code> o <code>Nombre: SUSPENSO</code> (aprobado con ≥ 5).</li><li>Al final imprima la media con dos decimales y cuántos han aprobado:<pre class="codigo" data-lang="conf">Ane: APROBADO
Jon: SUSPENSO
Leire: APROBADO
Media: 6.50
Aprobados: 2 de 3</pre></li></ol><p>Ese es el resultado de teclear <code>3</code>, <code>Ane</code>, <code>7</code>, <code>Jon</code>, <code>4</code>, <code>Leire</code>, <code>8.5</code>.</p>${NOTA_PROG}`,
      inicio: programa("pide los alumnos y muestra el resultado"),
      tests: ['assert __programa(main, ["3", "Ane", "7", "Jon", "4", "Leire", "8.5"]) == ["Ane: APROBADO", "Jon: SUSPENSO", "Leire: APROBADO", "Media: 6.50", "Aprobados: 2 de 3"]', 'assert __programa(main, ["0"]) == ["Nada que calcular"]', 'assert __programa(main, ["1", "Iker", "5"]) == ["Iker: APROBADO", "Media: 5.00", "Aprobados: 1 de 1"]', 'assert __programa(main, ["2", "A", "4.99", "B", "0"]) == ["A: SUSPENSO", "B: SUSPENSO", "Media: 2.50", "Aprobados: 0 de 2"]'],
      ...PROG,
      sol: 'def main():\n    n = int(input("Número de alumnos: "))\n    if n <= 0:\n        print("Nada que calcular")\n        return\n    total = 0\n    aprobados = 0\n    for i in range(n):\n        nombre = input("Nombre: ")\n        nota = float(input("Nota: "))\n        total += nota\n        if nota >= 5:\n            print(f"{nombre}: APROBADO")\n            aprobados += 1\n        else:\n            print(f"{nombre}: SUSPENSO")\n    media = total / n\n    print(f"Media: {media:.2f}")\n    print(f"Aprobados: {aprobados} de {n}")',
      exp: "Si sabes cuántos datos vas a leer, <code>for i in range(n)</code>. <code>f\"{media:.2f}\"</code> muestra siempre dos decimales (6.5 → 6.50). <code>return</code> dentro de <code>main()</code> termina el programa.", pista: "for i in range(n): y al final f\"{media:.2f}\"" }),
  ];

  /* ======================= EXAMEN 3 ======================= */
  const E3 = "Examen 3 · Tienda online";
  const D3 = "60 minutos. Parámetros por defecto, diccionarios como catálogo, cupones con while y una caja registradora.";
  const examen3 = [
    L(E3, D3, { titulo: "Ej. 1 · Precio con IVA", nivel: "2 puntos",
      enunciado: `<p>Escribe <code>precio_con_iva(precio, tipo="general")</code>. Tipos: <code>"general"</code> 21 %, <code>"reducido"</code> 10 %, <code>"superreducido"</code> 4 %. Devuelve el precio con IVA redondeado a 2 decimales. Si el tipo no existe o el precio es negativo, devuelve <code>None</code>.</p><p><code>precio_con_iva(100)</code> → <code>121.0</code> · <code>precio_con_iva(50, "reducido")</code> → <code>55.0</code></p>`,
      inicio: funcion('def precio_con_iva(precio, tipo="general"):', "elige el porcentaje según el tipo"),
      tests: ["assert precio_con_iva(100) == 121.0", 'assert precio_con_iva(50, "reducido") == 55.0', 'assert precio_con_iva(10, "superreducido") == 10.4', 'assert precio_con_iva(10, "lujo") is None', "assert precio_con_iva(-5) is None", "assert precio_con_iva(19.99) == 24.19", 'assert precio_con_iva(0, tipo="reducido") == 0'],
      prohibido: FUNC,
      sol: 'def precio_con_iva(precio, tipo="general"):\n    if precio < 0:\n        return None\n    if tipo == "general":\n        iva = 21\n    elif tipo == "reducido":\n        iva = 10\n    elif tipo == "superreducido":\n        iva = 4\n    else:\n        return None\n    return round(precio * (1 + iva / 100), 2)',
      exp: "if/elif para elegir el porcentaje y un <code>else</code> que devuelve None para lo desconocido. También vale un diccionario <code>{\"general\": 21, ...}</code> y <code>if tipo not in ivas</code>." }),
    L(E3, D3, { titulo: "Ej. 2 · Total del carrito", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>total_carrito(carrito, catalogo)</code>. <code>carrito</code> es una lista de tuplas <code>(producto, cantidad)</code> y <code>catalogo</code> un diccionario <code>producto → precio</code>.</p><ul><li>Las líneas con cantidad ≤ 0 se ignoran.</li><li>Los productos que no están en el catálogo se apuntan en una lista de <b>no encontrados</b> (sin repetir, en orden).</li><li>Devuelve <code>(total, no_encontrados)</code> con el total redondeado a 2 decimales. No modifiques el catálogo.</li></ul><p><code>total_carrito([("ratón", 2), ("teclado", 1), ("webcam", 1)], {"ratón": 12.5, "teclado": 30})</code> → <code>(55.0, ["webcam"])</code></p>`,
      inicio: funcion("def total_carrito(carrito, catalogo):", "suma precio * cantidad de lo que exista"),
      tests: ['assert total_carrito([("ratón", 2), ("teclado", 1), ("webcam", 1)], {"ratón": 12.5, "teclado": 30}) == (55.0, ["webcam"])', 'assert total_carrito([], {"ratón": 12.5}) == (0, [])', 'assert total_carrito([("ratón", 0), ("ratón", 1)], {"ratón": 12.5}) == (12.5, [])', 'assert total_carrito([("x", 1), ("x", 2)], {}) == (0, ["x"])', 'cat = {"a": 1}\ntotal_carrito([("a", 3)], cat)\nassert cat == {"a": 1}'],
      prohibido: FUNC,
      sol: "def total_carrito(carrito, catalogo):\n    total = 0\n    no_encontrados = []\n    for producto, cantidad in carrito:\n        if cantidad <= 0:\n            continue\n        if producto in catalogo:\n            total += catalogo[producto] * cantidad\n        elif producto not in no_encontrados:\n            no_encontrados.append(producto)\n    return (round(total, 2), no_encontrados)",
      exp: "<code>producto in catalogo</code> antes de <code>catalogo[producto]</code> evita el <code>KeyError</code>. <code>continue</code> salta a la siguiente vuelta sin hacer nada más." }),
    L(E3, D3, { titulo: "Ej. 3 · Aplicar cupones (while)", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>aplicar_cupones(total, cupones)</code> <b>con un while</b>. Recorre los cupones en orden:</p><ul><li><code>"DESC10"</code>: descuenta un 10 % del total actual.</li><li><code>"MENOS5"</code>: resta 5 € (el total nunca baja de 0).</li><li>Cualquier otro código no es válido: se ignora y no cuenta.</li><li>Como mucho se aplican <b>3</b> cupones, y se para si el total llega a 0.</li></ul><p>Devuelve <code>(total, aplicados)</code> con el total redondeado a 2 decimales.</p><p><code>aplicar_cupones(100, ["DESC10", "MENOS5"])</code> → <code>(85.0, 2)</code></p>`,
      inicio: funcion("def aplicar_cupones(total, cupones):", "usa un while con todas las condiciones de parada"),
      tests: ['assert aplicar_cupones(100, ["DESC10", "MENOS5"]) == (85.0, 2)', 'assert aplicar_cupones(100, ["HOLA", "DESC10"]) == (90.0, 1)', 'assert aplicar_cupones(8, ["MENOS5", "MENOS5", "DESC10"]) == (0, 2)', 'assert aplicar_cupones(100, ["MENOS5", "MENOS5", "MENOS5", "MENOS5", "MENOS5"]) == (85.0, 3)', "assert aplicar_cupones(50, []) == (50, 0)"],
      prohibido: FUNC, requiere: [CON_WHILE],
      sol: 'def aplicar_cupones(total, cupones):\n    i = 0\n    aplicados = 0\n    while i < len(cupones) and aplicados < 3 and total > 0:\n        codigo = cupones[i]\n        if codigo == "DESC10":\n            total = total * 0.9\n            aplicados += 1\n        elif codigo == "MENOS5":\n            total = total - 5\n            if total < 0:\n                total = 0\n            aplicados += 1\n        i += 1\n    return (round(total, 2), aplicados)',
      exp: "Tres condiciones de parada en el while: quedan cupones, no llevo 3 y el total es mayor que 0. Ojo: <code>i</code> avanza siempre, pero <code>aplicados</code> solo con códigos válidos.", pista: "while i < len(cupones) and aplicados < 3 and total > 0:" }),
    L(E3, D3, { titulo: "Ej. 4 · Programa: caja registradora", nivel: "3 puntos · programa completo",
      enunciado: `<p>Escribe un programa (en <code>def main():</code>) que pida precios (con decimales) hasta que se escriba <code>0</code>:</p><ul><li>Si un precio es negativo, imprime <code>Precio no válido</code> y no lo cuenta.</li><li>Al terminar imprime el número de artículos y el total con dos decimales y el símbolo €.</li><li>Si el total es mayor que 50, imprime <code>Envío gratis</code>; si no, <code>Envío: 4.95 €</code>.</li></ul><pre class="codigo" data-lang="conf">Precio no válido
Artículos: 2
Total: 55.00 €
Envío gratis</pre><p>Eso sale tecleando <code>30</code>, <code>-4</code>, <code>25</code>, <code>0</code>.</p>${NOTA_PROG}`,
      inicio: programa("pide precios hasta 0 y muestra el ticket"),
      tests: ['assert __programa(main, ["10", "20.5", "0"]) == ["Artículos: 2", "Total: 30.50 €", "Envío: 4.95 €"]', 'assert __programa(main, ["30", "-4", "25", "0"]) == ["Precio no válido", "Artículos: 2", "Total: 55.00 €", "Envío gratis"]', 'assert __programa(main, ["0"]) == ["Artículos: 0", "Total: 0.00 €", "Envío: 4.95 €"]', 'assert __programa(main, ["50", "0"]) == ["Artículos: 1", "Total: 50.00 €", "Envío: 4.95 €"]'],
      ...PROG, requiere: [CON_MAIN, CON_INPUT, CON_WHILE],
      sol: 'def main():\n    articulos = 0\n    total = 0\n    precio = float(input("Precio: "))\n    while precio != 0:\n        if precio < 0:\n            print("Precio no válido")\n        else:\n            articulos += 1\n            total += precio\n        precio = float(input("Precio: "))\n    print(f"Artículos: {articulos}")\n    print(f"Total: {total:.2f} €")\n    if total > 50:\n        print("Envío gratis")\n    else:\n        print("Envío: 4.95 €")',
      exp: "Otra vez el patrón centinela, ahora con números: se convierte con <code>float()</code> y se compara con 0. «Mayor que 50» → con 50 justos se paga envío." }),
  ];

  /* ======================= EXAMEN 4 ======================= */
  const E4 = "Examen 4 · Mini DHCP (mezcla con Redes)";
  const D4 = "75 minutos. Cadenas y split, diccionarios, simular un servidor DHCP y un menú completo. El más difícil.";
  const examen4 = [
    L(E4, D4, { titulo: "Ej. 1 · ¿Es una IP válida?", nivel: "2 puntos",
      enunciado: `<p>Escribe <code>es_ip_valida(ip)</code>, que recibe un texto y devuelve <code>True</code> si es una IPv4 válida: exactamente 4 partes separadas por puntos, cada una formada solo por dígitos y con valor entre 0 y 255.</p><p><code>es_ip_valida("172.16.9.255")</code> → <code>True</code> · <code>es_ip_valida("192.168.1.256")</code> → <code>False</code></p>`,
      inicio: funcion("def es_ip_valida(ip):", "usa split('.') y comprueba cada parte"),
      tests: ['assert es_ip_valida("192.168.1.10") is True', 'assert es_ip_valida("172.16.9.255") is True', 'assert es_ip_valida("192.168.1.256") is False', 'assert es_ip_valida("10.0.0") is False', 'assert es_ip_valida("a.b.c.d") is False', 'assert es_ip_valida("") is False', 'assert es_ip_valida("1.2.3.-4") is False', 'assert es_ip_valida("1.2.3.4.5") is False'],
      prohibido: FUNC,
      sol: 'def es_ip_valida(ip):\n    partes = ip.split(".")\n    if len(partes) != 4:\n        return False\n    for p in partes:\n        if not p.isdigit():\n            return False\n        if int(p) > 255:\n            return False\n    return True',
      exp: "<code>\"192.168.1.10\".split(\".\")</code> → <code>['192', '168', '1', '10']</code>. <code>.isdigit()</code> es False para \"\", \"-4\" o \"a\", así que también evita el error al hacer <code>int()</code>.", pista: "partes = ip.split(\".\") y p.isdigit()" }),
    L(E4, D4, { titulo: "Ej. 2 · Simular un servidor DHCP", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>asignar_ips(macs, inicio, fin)</code>. Las IPs libres son los últimos octetos de <code>inicio</code> a <code>fin</code> (ambos incluidos). Recorre las MAC en orden: cada MAC nueva recibe el siguiente octeto libre; una MAC repetida conserva el suyo; si no quedan libres, recibe <code>None</code>.</p><p>Devuelve una lista de tuplas <code>(mac, octeto)</code>, una por MAC distinta, en el orden en que aparecieron.</p><p><code>asignar_ips(["AA", "BB", "AA", "CC"], 100, 101)</code> → <code>[("AA", 100), ("BB", 101), ("CC", None)]</code></p>`,
      inicio: funcion("def asignar_ips(macs, inicio, fin):", "reparte octetos en orden, sin repetir MAC"),
      tests: ['assert asignar_ips(["AA", "BB", "AA", "CC"], 100, 101) == [("AA", 100), ("BB", 101), ("CC", None)]', "assert asignar_ips([], 1, 5) == []", 'assert asignar_ips(["X"], 10, 9) == [("X", None)]', 'assert asignar_ips(["A", "B", "C"], 1, 254) == [("A", 1), ("B", 2), ("C", 3)]'],
      prohibido: FUNC,
      sol: "def asignar_ips(macs, inicio, fin):\n    asignadas = {}\n    orden = []\n    siguiente = inicio\n    for mac in macs:\n        if mac in asignadas:\n            continue\n        if siguiente <= fin:\n            asignadas[mac] = siguiente\n            siguiente += 1\n        else:\n            asignadas[mac] = None\n        orden.append(mac)\n    resultado = []\n    for mac in orden:\n        resultado.append((mac, asignadas[mac]))\n    return resultado",
      exp: "Un diccionario MAC → octeto recuerda quién tiene qué (como el fichero dhcpd.leases) y una lista guarda el orden. <code>siguiente</code> es el próximo octeto libre." }),
    L(E4, D4, { titulo: "Ej. 3 · Contar equipos por red /24", nivel: "2,5 puntos",
      enunciado: `<p>Escribe <code>contar_por_red(ips)</code>: devuelve un diccionario cuya clave son los tres primeros octetos (<code>"192.168.1"</code>) y cuyo valor es cuántas IPs válidas hay de esa red. Las IPs no válidas se ignoran. Ya tienes <code>es_ip_valida</code> hecha arriba: reutilízala.</p><p><code>contar_por_red(["192.168.1.10", "192.168.1.20", "10.0.0.1", "300.1.1.1"])</code> → <code>{"192.168.1": 2, "10.0.0": 1}</code></p>`,
      inicio: 'def es_ip_valida(ip):\n    partes = ip.split(".")\n    if len(partes) != 4:\n        return False\n    for p in partes:\n        if not p.isdigit() or int(p) > 255:\n            return False\n    return True\n\n\n' + funcion("def contar_por_red(ips):", "agrupa por los tres primeros octetos"),
      tests: ['assert contar_por_red(["192.168.1.10", "192.168.1.20", "10.0.0.1", "300.1.1.1"]) == {"192.168.1": 2, "10.0.0": 1}', "assert contar_por_red([]) == {}", 'assert contar_por_red(["hola", "1.2.3"]) == {}', 'assert contar_por_red(["172.16.9.255", "172.16.9.1", "172.16.9.1"]) == {"172.16.9": 3}'],
      prohibido: FUNC,
      sol: 'def contar_por_red(ips):\n    conteo = {}\n    for ip in ips:\n        if not es_ip_valida(ip):\n            continue\n        partes = ip.split(".")\n        red = partes[0] + "." + partes[1] + "." + partes[2]\n        if red in conteo:\n            conteo[red] += 1\n        else:\n            conteo[red] = 1\n    return conteo',
      exp: "Es el «contar apariciones» de siempre, pero la clave se construye uniendo tres partes. También vale <code>\".\".join(partes[:3])</code>." }),
    L(E4, D4, { titulo: "Ej. 4 · Programa: gestor de concesiones con menú", nivel: "3 puntos · programa completo",
      enunciado: `<p>Escribe un programa (en <code>def main():</code>) con un menú que se repite hasta salir. Hay 3 IPs para repartir: <code>192.168.1.100</code>, <code>.101</code> y <code>.102</code>, en ese orden. Se pide la opción con <code>input()</code>:</p><ul><li><b>1</b>: pide una MAC (pásala a mayúsculas con <code>.upper()</code>). Si ya tiene IP: <code>AA ya tiene 192.168.1.100</code>. Si no quedan: <code>Sin IPs libres</code>. Si no: <code>AA -> 192.168.1.100</code>.</li><li><b>2</b>: lista las concesiones en orden, una por línea: <code>AA: 192.168.1.100</code>. Si no hay ninguna: <code>Sin concesiones</code>.</li><li><b>3</b>: imprime <code>Adiós</code> y termina.</li><li>Cualquier otra cosa: <code>Opción no válida</code>.</li></ul><p>Tecleando <code>1</code>, <code>aa</code>, <code>2</code>, <code>3</code> sale <code>AA -> 192.168.1.100</code>, <code>AA: 192.168.1.100</code> y <code>Adiós</code>.</p>${NOTA_PROG}`,
      inicio: programa("menú con while hasta la opción 3"),
      tests: ['assert __programa(main, ["1", "aa", "1", "bb", "2", "3"]) == ["AA -> 192.168.1.100", "BB -> 192.168.1.101", "AA: 192.168.1.100", "BB: 192.168.1.101", "Adiós"]', 'assert __programa(main, ["2", "7", "3"]) == ["Sin concesiones", "Opción no válida", "Adiós"]', 'assert __programa(main, ["1", "A", "1", "A", "1", "B", "1", "C", "1", "D", "3"]) == ["A -> 192.168.1.100", "A ya tiene 192.168.1.100", "B -> 192.168.1.101", "C -> 192.168.1.102", "Sin IPs libres", "Adiós"]', 'assert __programa(main, ["3"]) == ["Adiós"]'],
      ...PROG, requiere: [CON_MAIN, CON_INPUT, CON_WHILE],
      sol: 'def main():\n    libres = ["192.168.1.100", "192.168.1.101", "192.168.1.102"]\n    concesiones = {}\n    orden = []\n    salir = False\n    while not salir:\n        opcion = input("Opción: ")\n        if opcion == "1":\n            mac = input("MAC: ").upper()\n            if mac in concesiones:\n                print(f"{mac} ya tiene {concesiones[mac]}")\n            elif len(libres) == 0:\n                print("Sin IPs libres")\n            else:\n                ip = libres.pop(0)\n                concesiones[mac] = ip\n                orden.append(mac)\n                print(f"{mac} -> {ip}")\n        elif opcion == "2":\n            if len(orden) == 0:\n                print("Sin concesiones")\n            for mac in orden:\n                print(f"{mac}: {concesiones[mac]}")\n        elif opcion == "3":\n            print("Adiós")\n            salir = True\n        else:\n            print("Opción no válida")',
      exp: "Esquema de menú de examen: <code>while</code> con una variable <code>salir</code> (o <code>while True</code> + <code>break</code>), un <code>input</code> de la opción al principio de cada vuelta y un if/elif por opción con un <code>else</code> para lo no válido. La opción se compara como texto (<code>\"1\"</code>), sin convertir.", pista: "while not salir: opcion = input(); if opcion == \"1\": ..." }),
  ];

  /* ---------- el tema ---------- */
  const prog = TEMARIO.materias.prog;
  prog.temas.push({
    id: "examenes", nombre: "Exámenes de práctica", desc: "4 exámenes completos: de funciones a programas enteros con input y print",
    labsTitulo: "Exámenes",
    labsTexto: "ponte un temporizador y no mires la solución hasta acabar",
    chuleta: `
<h3>Cómo atacar un examen de programación</h3>
<ol>
<li><b>Lee todo el examen primero</b> (2 min) y empieza por lo que mejor sepas.</li>
<li>Por cada ejercicio, antes de escribir: ¿qué recibe?, ¿qué devuelve o imprime?, ¿cuáles son los casos raros (lista vacía, negativos, empate)?</li>
<li>Escribe primero el caso raro, luego el caso normal.</li>
<li>Prueba a mano con el ejemplo del enunciado: sigue tu código línea a línea.</li>
<li>Texto exacto: mayúsculas, dos puntos, espacios y decimales tal y como los pide.</li>
</ol>
<h3>Función vs. programa</h3>
<table>
<tr><th>Función</th><th>Programa completo</th></tr>
<tr><td>Datos por <b>parámetros</b></td><td>Datos con <b>input()</b></td></tr>
<tr><td>Resultado con <b>return</b></td><td>Resultado con <b>print()</b></td></tr>
<tr><td>Nada de input ni print dentro</td><td>Todo dentro de <code>def main():</code></td></tr>
</table>
<h3>Plantilla: leer hasta «fin» (centinela)</h3>
<pre class="codigo" data-lang="py">def main():
    total = 0
    dato = input("Dato: ")            # 1ª lectura ANTES del bucle
    while dato != "fin":
        total += int(dato)            # input() siempre da texto → int() / float()
        dato = input("Dato: ")        # siguiente lectura AL FINAL de la vuelta
    print(f"Total: {total}")</pre>
<h3>Plantilla: menú</h3>
<pre class="codigo" data-lang="py">def main():
    salir = False
    while not salir:
        opcion = input("Opción: ")    # se compara como texto: "1", no 1
        if opcion == "1":
            ...
        elif opcion == "2":
            ...
        elif opcion == "3":
            print("Adiós")
            salir = True
        else:
            print("Opción no válida")</pre>
<h3>Plantilla: número fijo de lecturas</h3>
<pre class="codigo" data-lang="py">n = int(input("¿Cuántos? "))
for i in range(n):
    nombre = input("Nombre: ")
    nota = float(input("Nota: "))</pre>
<h3>Formatear la salida</h3>
<pre class="codigo" data-lang="py">media = 6.5
print(f"Media: {media:.2f}")         # Media: 6.50
print(f"{nombre}: APROBADO")         # variables dentro de {}
print("Total:", total)               # print con coma añade un espacio</pre>
<p class="ojo">Errores que más puntos quitan: olvidar el int()/float() del input, comparar la opción con un número, y no actualizar la variable del while.</p>`,
    items: [
      { tipo: "test", q: "<code>edad = input(\"Edad: \")</code> y el usuario teclea 17. ¿Qué pasa con <code>edad + 1</code>?", ops: [["<code>TypeError</code>: edad es el texto \"17\"", 1], ["Da 18", 0, "input() siempre devuelve texto, aunque teclees números."], ["Da \"171\"", 0, "Eso pasaría con edad + \"1\"."], ["Da 17", 0, "Ni siquiera llega a calcular."]], exp: "<code>input()</code> devuelve siempre una cadena. Para operar: <code>edad = int(input(\"Edad: \"))</code> (o <code>float</code> si hay decimales)." },
      { tipo: "test", q: "En un menú, <code>opcion = input(\"Opción: \")</code>. ¿Qué condición detecta la opción 1?", ops: [["<code>if opcion == \"1\":</code>", 1], ["<code>if opcion == 1:</code>", 0, "opcion es el texto \"1\"; nunca será igual al número 1."], ["<code>if opcion = \"1\":</code>", 0, "Un solo = asigna: error de sintaxis."], ["<code>if \"opcion\" == \"1\":</code>", 0, "Comparas la palabra «opcion», no la variable."]], exp: "O conviertes (<code>int(input())</code>) y comparas con números, o lo dejas como texto y comparas con <code>\"1\"</code>. Dejarlo como texto es más seguro: si el usuario escribe «a», <code>int()</code> rompería el programa." },
      { tipo: "test", q: "¿Qué imprime <code>print(f\"Media: {6.5:.2f}\")</code>?", ops: [["<code>Media: 6.50</code>", 1], ["<code>Media: 6.5</code>", 0, ":.2f fuerza dos decimales."], ["<code>Media: 6.5:.2f</code>", 0, "Lo de dentro de las llaves se interpreta."], ["<code>Media: 7</code>", 0, "No redondea a entero: deja 2 decimales."]], exp: "<code>:.2f</code> = número con 2 decimales. Muy típico en los programas que muestran medias o precios." },
      { tipo: "test", q: "¿Qué le pasa a este programa si el usuario teclea «fin» lo primero?", code: "total = 0\nwhile True:\n    dato = input(\"Dato: \")\n    total += int(dato)\n    if dato == \"fin\":\n        break\nprint(total)", ops: [["Se rompe: hace <code>int(\"fin\")</code> antes de comprobar si es «fin»", 1], ["Imprime 0", 0, "Antes de comprobar, ya intenta convertir «fin» a número."], ["Bucle infinito", 0, "El error ocurre en la primera vuelta."], ["Imprime «fin»", 0, "Nunca llega al print."]], exp: "Primero se comprueba si es el valor de salida y <b>después</b> se convierte: <code>if dato == \"fin\": break</code> antes del <code>int(dato)</code>." },
      { tipo: "test", q: "Lees precios hasta un 0. ¿Qué estructura es la correcta?", ops: [["Leer antes del while, comprobar en la condición y volver a leer al final de la vuelta", 1], ["Un <code>for i in range(100)</code>", 0, "No sabes cuántos precios habrá."], ["Leer solo dentro del while, sin leer antes", 0, "Entonces la condición usaría una variable que aún no existe (o tendrías que usar while True + break)."], ["Un if con muchos input seguidos", 0, "No sabes cuántos habrá."]], exp: "Patrón centinela: <code>p = float(input())</code> → <code>while p != 0:</code> → proceso → <code>p = float(input())</code>. La alternativa válida es <code>while True:</code> con <code>break</code>." },
    ],
    labs: [...examen1, ...examen2, ...examen3, ...examen4],
  });
})();
