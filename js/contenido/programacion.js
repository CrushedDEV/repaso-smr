/* Programación · Python (funciones, condicionales, cadenas, listas, tuplas, while, diccionarios) */
window.TEMARIO = window.TEMARIO || { materias: {}, orden: [], labsExtra: {} };
(function () {
  const t = (q, ops, exp, o) => Object.assign({ tipo: "test", q, ops, exp }, o);
  const w = (q, sol, exp, o) => Object.assign({ tipo: "escribe", q, sol: [].concat(sol), exp }, o);

  TEMARIO.orden.push("prog");
  TEMARIO.materias.prog = {
    nombre: "Programación",
    sub: "Python: funciones, listas, tuplas, bucles y diccionarios",
    intro: "Lo que entra: definir funciones que reciben datos y devuelven resultados, recorrer listas y tuplas con for y while, decidir con if y no romper nada por el camino. Las preguntas cortas entrenan el «leer código»; los laboratorios son los ejercicios de tus notebooks, que se ejecutan aquí mismo.",
    temas: [
      /* ------------------------------------------------------------ */
      {
        id: "funciones", nombre: "Funciones y return", desc: "def, parámetros, valores por defecto, return frente a print",
        chuleta: `
<h3>La forma de una función</h3>
<pre class="codigo" data-lang="py">def precio_final(precio, descuento=0):   # parámetros (el 2º es opcional)
    resultado = precio - precio * descuento / 100
    return round(resultado, 2)           # entrega el valor a quien llama

total = precio_final(80, 25)   # 60.0  → se puede guardar, comparar, reutilizar</pre>
<ul>
<li><b>Parámetros</b>: los nombres entre paréntesis en el <code>def</code>. <b>Argumentos</b>: los valores que pasas al llamar.</li>
<li><b>Valor por defecto</b> <code>descuento=0</code>: si no lo pasas, vale 0. Los parámetros con valor por defecto van <b>al final</b>.</li>
<li>Puedes pasar argumentos por nombre: <code>precio_final(50, descuento=10)</code>.</li>
</ul>
<p class="ojo">return ≠ print</p>
<table><tr><th>print()</th><th>return</th></tr>
<tr><td>Muestra texto en pantalla. La función devuelve <code>None</code>.</td><td>Entrega el valor al programa. Se puede guardar y comprobar con <code>assert</code>.</td></tr>
<tr><td>La función sigue ejecutándose.</td><td>La función <b>termina</b> en ese momento.</td></tr></table>
<h3>Reutilizar funciones</h3>
<pre class="codigo" data-lang="py">def promedio(numeros):
    if len(numeros) == 0:      # caso especial primero
        return None
    return sumar_lista(numeros) / len(numeros)   # llama a otra función tuya</pre>
<p class="ojo">En el examen: sin input() ni print() dentro de las funciones, todo entra por parámetros y sale por return.</p>`,
        items: [
          t("¿Qué muestra este programa?", [["<code>12</code>", 1], ["<code>None</code>", 0, "Saldría None si la función hiciera print en vez de return."], ["Nada, da error", 0, "No hay ningún error: la función devuelve un número y se imprime fuera."], ["<code>doble(6)</code>", 0, "Python ejecuta la llamada; no imprime el texto de la llamada."]],
            "La función devuelve <code>numero * 2</code>; el <code>print</code> de fuera muestra ese valor.", { code: "def doble(numero):\n    resultado = numero * 2\n    return resultado\n\nprint(doble(6))" }),
          t("¿Qué guarda la variable <code>x</code>?", [["<code>None</code>", 1], ["<code>\"Hola, Ana\"</code>", 0, "La función lo muestra en pantalla, pero no lo devuelve: no hay return."], ["Da error", 0, "No da error; simplemente la función no devuelve nada."], ["<code>True</code>", 0, "Una función sin return devuelve None, no True."]],
            "Una función sin <code>return</code> devuelve <code>None</code>. El <code>print</code> solo pinta en pantalla, no entrega el valor. Por eso el <code>assert saludar(\"Ana\") == \"Hola, Ana\"</code> fallaría.", { code: "def saludar(nombre):\n    print(\"Hola, \" + nombre)\n\nx = saludar(\"Ana\")", truco: "Si en la corrección ves «devuelve None», busca un print donde debería haber un return." }),
          t("¿Qué devuelve <code>precio_final(80)</code>?", [["<code>80.0</code>", 1], ["Error: falta un argumento", 0, "No falta: <code>descuento</code> tiene valor por defecto (0)."], ["<code>0</code>", 0, "El 0 es el descuento, no el resultado."], ["<code>None</code>", 0, "Hay return, así que no devuelve None."]],
            "Como no se pasa <code>descuento</code>, vale 0: 80 − 0 = 80, y <code>round(80.0, 2)</code> es <code>80.0</code>.", { code: "def precio_final(precio, descuento=0):\n    return round(precio - precio * descuento / 100, 2)" }),
          t("¿Cuál de estas cabeceras es <b>incorrecta</b>?", [["<code>def f(descuento=0, precio):</code>", 1], ["<code>def f(precio, descuento=0):</code>", 0, "Esta es correcta: el parámetro con valor por defecto va al final."], ["<code>def f(a, b, c):</code>", 0, "Correcta: tres parámetros obligatorios."], ["<code>def f():</code>", 0, "Correcta: una función puede no tener parámetros."]],
            "Los parámetros con valor por defecto tienen que ir <b>después</b> de los obligatorios. Si no, Python da <code>SyntaxError: non-default argument follows default argument</code>."),
          t("¿Qué muestra?", [["<code>uno</code>", 1], ["<code>uno</code> y luego <code>dos</code>", 0, "Tras el primer return la función termina: el segundo nunca se ejecuta."], ["<code>dos</code>", 0, "El primer return que se alcanza es el que manda."], ["Error", 0, "No es un error tener código después de un return; simplemente no se ejecuta."]],
            "<code>return</code> termina la función en ese mismo instante. Todo lo que hay debajo no se ejecuta.", { code: "def prueba():\n    return \"uno\"\n    return \"dos\"\n\nprint(prueba())" }),
          w("Completa para que la función devuelva la suma: <code>def sumar(a, b):</code> → <code>____ a + b</code>", ["return"], "Para entregar un valor se usa <code>return</code>. Con <code>print</code> la prueba <code>assert sumar(4, 7) == 11</code> fallaría porque la función devolvería None.", { modo: "codigo", fallos: [{ si: ["print", "print("], why: "Con print solo lo enseñas en pantalla; la función devolvería None y el assert fallaría." }] }),
          t("¿Qué valor devuelve <code>es_par(7)</code>?", [["<code>False</code>", 1], ["<code>1</code>", 0, "7 % 2 vale 1, pero la función compara con == 0 y devuelve un booleano."], ["<code>True</code>", 0, "7 % 2 es 1, no 0, así que la comparación es falsa."], ["<code>None</code>", 0, "Hay return de la comparación, que siempre es True o False."]],
            "<code>%</code> es el resto de la división. <code>7 % 2</code> = 1 → <code>1 == 0</code> es <code>False</code>. Devolver directamente la comparación es más limpio que un if/else con True/False.", { code: "def es_par(numero):\n    return numero % 2 == 0" }),
          t("Quieres que <code>informe_notas</code> use la media que ya calcula tu función <code>promedio</code>. ¿Qué línea es la correcta?", [["<code>media = promedio(notas)</code>", 1], ["<code>media = promedio</code>", 0, "Sin paréntesis no llamas a la función: guardas la propia función, no su resultado."], ["<code>promedio(notas) = media</code>", 0, "Al revés: la variable va a la izquierda del =."], ["<code>def media = promedio(notas)</code>", 0, "<code>def</code> solo se usa para definir funciones."]],
            "Llamar a una función = su nombre + paréntesis con los argumentos. El resultado (lo que devuelve con return) se guarda en una variable."),
          w("¿Qué devuelve <code>round(19.99 - 19.99 * 10 / 100, 2)</code>?", ["17.99"], "19.99 × 10 / 100 = 1.999 → 19.99 − 1.999 = 17.991 → redondeado a 2 decimales: <b>17.99</b>.", { modo: "num" }),
          t("¿Qué pasa al ejecutar esto?", [["<code>TypeError</code>: falta un argumento", 1], ["Devuelve <code>4</code>", 0, "No hay valor por defecto para <code>b</code>: es obligatorio."], ["Devuelve <code>None</code>", 0, "Ni siquiera llega a ejecutarse: Python protesta al llamar."], ["Devuelve <code>4 + 0</code>", 0, "Python no pone 0 por su cuenta a los parámetros que faltan."]],
            "Si un parámetro no tiene valor por defecto, es obligatorio pasarlo: <code>TypeError: sumar() missing 1 required positional argument: 'b'</code>.", { code: "def sumar(a, b):\n    return a + b\n\nsumar(4)" }),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "condicionales", nombre: "Decisiones con if", desc: "if / elif / else, and, or, not, %, rangos y casos especiales",
        chuleta: `
<h3>if / elif / else</h3>
<pre class="codigo" data-lang="py">def clasificar_nota(nota):
    if nota &lt; 0 or nota &gt; 10:        # primero lo raro
        return "Nota no válida"
    elif nota &lt; 5:
        return "Insuficiente"
    elif nota &lt; 7:
        return "Aprobado"
    elif nota &lt; 9:
        return "Notable"
    else:
        return "Sobresaliente"</pre>
<ul>
<li>Se comprueban <b>de arriba abajo</b> y se ejecuta solo el primer bloque cuya condición es verdadera.</li>
<li>Gracias al orden, en el <code>elif nota &lt; 7</code> ya sabes que la nota es ≥ 5: no hace falta repetirlo.</li>
<li><code>and</code>: las dos ciertas · <code>or</code>: al menos una · <code>not</code>: le da la vuelta.</li>
<li>Intervalo incluido: <code>inferior &lt;= x &lt;= superior</code> (Python permite encadenar).</li>
</ul>
<h3>Operadores que caen siempre</h3>
<table><tr><th>Operador</th><th>Significa</th><th>Ejemplo</th></tr>
<tr><td><code>==</code></td><td>igual (comparar)</td><td><code>x == 0</code></td></tr>
<tr><td><code>=</code></td><td>asignar (guardar)</td><td><code>x = 0</code></td></tr>
<tr><td><code>!=</code></td><td>distinto</td><td><code>a != b</code></td></tr>
<tr><td><code>%</code></td><td>resto</td><td><code>2024 % 4 == 0</code> → divisible</td></tr>
<tr><td><code>//</code></td><td>división entera</td><td><code>7 // 2</code> → 3</td></tr>
<tr><td><code>is None</code></td><td>¿es el valor vacío None?</td><td><code>if v is None:</code></td></tr></table>
<h3>Año bisiesto (clásico de examen)</h3>
<pre class="codigo" data-lang="py">def es_bisiesto(anio):
    return (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0</pre>
<p class="ojo">Casos especiales primero: lista vacía, valores fuera de rango, None.</p>`,
        items: [
          t("¿Qué devuelve <code>clasificar(5)</code>?", [["<code>\"Aprobado\"</code>", 1], ["<code>\"Insuficiente\"</code>", 0, "5 no es menor que 5, así que no entra en el primer if."], ["<code>\"Aprobado\"</code> y <code>\"Notable\"</code>", 0, "Solo se ejecuta el primer bloque verdadero."], ["<code>None</code>", 0, "Entra en el elif y devuelve."]],
            "<code>5 &lt; 5</code> es falso → pasa al <code>elif 5 &lt; 7</code>, que es verdadero → «Aprobado». En los límites, fíjate si es <code>&lt;</code> o <code>&lt;=</code>.", { code: "def clasificar(nota):\n    if nota < 5:\n        return \"Insuficiente\"\n    elif nota < 7:\n        return \"Aprobado\"\n    else:\n        return \"Notable\"" }),
          t("¿Cuál es el error de este código?", [["Usa <code>=</code> en vez de <code>==</code> en la condición", 1], ["Le faltan paréntesis al if", 0, "En Python el if no necesita paréntesis."], ["<code>return True</code> debería ir entre comillas", 0, "True es un booleano; con comillas sería un texto."], ["No tiene else", 0, "El else es opcional, aunque aquí habría que devolver False en algún sitio."]],
            "<code>=</code> asigna y <code>==</code> compara. Dentro de un <code>if</code> siempre se compara: <code>if numero % 2 == 0:</code>. Python da <code>SyntaxError</code> con el <code>=</code> solo.", { code: "def es_par(numero):\n    if numero % 2 = 0:\n        return True\n    return False" }),
          t("¿Cuál de estos años es bisiesto?", [["2000", 1], ["1900", 0, "Divisible por 100 y no por 400: no es bisiesto."], ["2023", 0, "No es divisible por 4."], ["2100", 0, "Divisible por 100 y no por 400: no es bisiesto."]],
            "Regla: divisible por 4, <b>excepto</b> los divisibles por 100, <b>salvo</b> que lo sean por 400. 2000 es divisible por 400 → sí."),
          w("Escribe la condición para «x está entre 3 y 8, ambos incluidos» (empieza por <code>if</code> y termina en <code>:</code>)", ["if 3 <= x <= 8:", "if x >= 3 and x <= 8:", "if 3<=x<=8:", "if x>=3 and x<=8:", "if (x >= 3 and x <= 8):", "if x <= 8 and x >= 3:"], "Incluidos ambos → <code>&lt;=</code> en los dos lados. Python permite encadenar: <code>3 &lt;= x &lt;= 8</code>.", { modo: "codigo", fallos: [{ si: ["if 3 < x < 8:", "if x > 3 and x < 8:"], why: "Con &lt; dejas fuera el 3 y el 8, y el enunciado dice «incluidos»." }] }),
          t("¿Qué muestra?", [["<code>eje</code>", 1], ["<code>origen</code>", 0, "Para ser origen deben ser 0 las dos coordenadas."], ["<code>IV</code>", 0, "Con x = 0 el punto está sobre un eje, no dentro de un cuadrante."], ["<code>I</code>", 0, "Revisa el orden: primero se mira si está en un eje."]],
            "El orden de las condiciones es clave: primero el caso más concreto (origen), luego ejes, y al final cuadrantes. Si comprobaras primero los cuadrantes con <code>&gt;=</code>, el (0, −3) caería mal.", { code: "x, y = 0, -3\nif x == 0 and y == 0:\n    print(\"origen\")\nelif x == 0 or y == 0:\n    print(\"eje\")\nelif x > 0 and y > 0:\n    print(\"I\")\nelse:\n    print(\"IV\")" }),
          t("Para saber si un dato es el valor ausente <code>None</code> (y no un 0 real), ¿qué condición usas?", [["<code>if dato is None:</code>", 1], ["<code>if not dato:</code>", 0, "<code>not 0</code> también es True: confundirías el 0 real con un dato ausente."], ["<code>if dato == 0:</code>", 0, "Eso detecta el cero, no la ausencia."], ["<code>if dato = None:</code>", 0, "Un solo = es asignar: error de sintaxis."]],
            "<code>0</code>, <code>False</code>, <code>\"\"</code> y <code>[]</code> se comportan como falso en un if, igual que <code>None</code>. Para distinguir None de todo lo demás, usa <code>is None</code>. Es justo la trampa de <code>rellenar_ausencias([0, False])</code>."),
          w("¿Qué vale <code>17 % 5</code>?", ["2"], "<code>%</code> da el <b>resto</b>: 17 = 5·3 + 2 → 2.", { modo: "num", fallos: [{ si: ["3"], why: "3 es el cociente (17 // 5). El % da el resto." }, { si: ["3.4"], why: "Eso es 17 / 5. El % da el resto de la división entera." }] }),
          t("Sin usar <code>max()</code>, ¿qué falla en este «mayor de tres»?", [["Con <code>mayor_de_tres(9, 2, 5)</code> devuelve 5", 1], ["Nada, funciona siempre", 0, "Prueba con a = 9, b = 2, c = 5: no devuelve el mayor."], ["Da error de sintaxis", 0, "La sintaxis es correcta; el fallo es de lógica."], ["Solo falla con negativos", 0, "Falla también con positivos, como (9, 2, 5)."]],
            "Solo compara a con b; si a no es mayor que b salta a c sin comparar. Patrón seguro: <code>mayor = a</code>, luego <code>if b &gt; mayor: mayor = b</code>, <code>if c &gt; mayor: mayor = c</code>.", { code: "def mayor_de_tres(a, b, c):\n    if a > b:\n        return a\n    elif b > c:\n        return b\n    else:\n        return c" }),
          t("¿Qué devuelve <code>True and not False or False</code>?", [["<code>True</code>", 1], ["<code>False</code>", 0, "not False = True; True and True = True; True or False = True."], ["Error", 0, "Es una expresión lógica válida."]], "Orden: primero <code>not</code>, luego <code>and</code>, luego <code>or</code>. <code>not False</code> → True; <code>True and True</code> → True; <code>True or False</code> → True."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "cadenas", nombre: "Recorrer texto y acumular", desc: "for sobre cadenas, contadores, acumuladores, invertir, split",
        chuleta: `
<h3>El patrón acumulador (sale en todo)</h3>
<pre class="codigo" data-lang="py">def contar_vocales(texto):
    contador = 0                     # 1. inicializa FUERA del bucle
    for letra in texto:              # 2. recorre
        if letra.lower() in "aeiou": # 3. decide
            contador += 1            # 4. acumula
    return contador                  # 5. devuelve FUERA del bucle</pre>
<ul>
<li>Sumar: empieza en <code>0</code>. Construir texto: empieza en <code>""</code>. Construir lista: empieza en <code>[]</code>.</li>
<li><code>letra in "aeiou"</code> mira si la letra está en la cadena.</li>
<li><code>.lower()</code> / <code>.upper()</code>: minúsculas / mayúsculas.</li>
</ul>
<h3>Invertir sin [::-1]</h3>
<pre class="codigo" data-lang="py">def invertir_texto(texto):
    resultado = ""
    for letra in texto:
        resultado = letra + resultado   # la nueva va DELANTE
    return resultado</pre>
<h3>Palabras</h3>
<pre class="codigo" data-lang="py">"  hola   mundo  ".split()   # ['hola', 'mundo']  (sin argumento ignora espacios de más)
len("  hola   mundo  ".split()) # 2</pre>
<p class="ojo">Error clásico: return dentro del for → la función acaba en la primera vuelta.</p>`,
        items: [
          t("¿Qué devuelve <code>contar(\"Murcielago\")</code>?", [["<code>1</code>", 1], ["<code>5</code>", 0, "Ese sería el resultado correcto si el return estuviera fuera del for."], ["<code>0</code>", 0, "La primera letra «M» no es vocal… pero mira dónde está el return."], ["<code>None</code>", 0, "Sí devuelve algo: lo que valga contador en la primera vuelta."]],
            "El <code>return</code> está metido <b>dentro del if</b>: la «M» no es vocal y se sigue; en la «u» suma 1 y devuelve ya, sin mirar el resto. El <code>return contador</code> va al final, alineado con el <code>for</code> (fuera del bucle).", { code: "def contar(texto):\n    contador = 0\n    for letra in texto:\n        if letra.lower() in \"aeiou\":\n            contador += 1\n            return contador" }),
          t("¿Qué falla en este código?", [["<code>contador = 0</code> está dentro del for y se reinicia en cada vuelta", 1], ["Falta el <code>.lower()</code>", 0, "Ayudaría con mayúsculas, pero no es el fallo principal."], ["<code>in</code> no funciona con cadenas", 0, "Sí funciona: <code>\"a\" in \"aeiou\"</code> es True."], ["No hay ningún fallo", 0, "Prueba con «aaa»: devuelve 1, no 3."]],
            "El acumulador se inicializa <b>una vez, antes</b> del bucle. Si lo pones dentro, vuelve a 0 en cada vuelta y pierdes la cuenta.", { code: "def contar_vocales(texto):\n    for letra in texto:\n        contador = 0\n        if letra in \"aeiou\":\n            contador += 1\n    return contador" }),
          w("¿Qué devuelve <code>invertir(\"abc\")</code>?", ["cba"], "Vuelta a vuelta: <code>\"a\"</code> → <code>\"ba\"</code> → <code>\"cba\"</code>. Cada letra nueva se pone <b>delante</b> de lo que ya había.", { code: "def invertir(texto):\n    resultado = \"\"\n    for letra in texto:\n        resultado = letra + resultado\n    return resultado", fallos: [{ si: ["abc"], why: "Eso pasaría con <code>resultado = resultado + letra</code>. Aquí la letra nueva va delante." }] }),
          w("¿Qué devuelve <code>len(\"  hola   mundo  \".split())</code>?", ["2"], "<code>.split()</code> sin argumento corta por cualquier cantidad de espacios y descarta los vacíos: <code>['hola', 'mundo']</code> → 2.", { modo: "num" }),
          t("¿Qué devuelve <code>\"    \".split()</code>?", [["<code>[]</code>", 1], ["<code>['', '', '', '']</code>", 0, "Eso se parece a <code>.split(\" \")</code> con espacio explícito. Sin argumento no deja vacíos."], ["<code>['    ']</code>", 0, "Los espacios no se guardan como palabra."], ["Error", 0, "Es válido; devuelve una lista vacía."]], "Por eso <code>contar_palabras(\"    \")</code> debe dar 0 y basta con <code>len(frase.split())</code>."),
          t("¿Qué condición cuenta vocales en mayúscula y minúscula?", [["<code>if letra.lower() in \"aeiou\":</code>", 1], ["<code>if letra == \"aeiou\":</code>", 0, "Compara la letra con la cadena entera «aeiou»: nunca será igual."], ["<code>if letra in \"aeiou\":</code>", 0, "Así «A» o «E» no se cuentan."], ["<code>if \"aeiou\" in letra:</code>", 0, "Al revés: pregunta si «aeiou» está dentro de una sola letra."]],
            "Pasa la letra a minúscula y busca si está entre las vocales. Alternativa: <code>if letra in \"aeiouAEIOU\":</code>."),
          w("¿Qué devuelve <code>\"Hola, \" + \"Ana\"</code>?", ["Hola, Ana"], "El <code>+</code> entre cadenas las une (concatena) tal cual, incluido el espacio que hay después de la coma.", { modo: "codigo", fallos: [{ si: ["\"Hola,Ana\"", "Hola,Ana"], why: "El espacio está dentro de la primera cadena: «Hola, » termina con espacio." }] }),
          t("¿Qué muestra <code>for i in range(3): print(i)</code>?", [["0, 1 y 2", 1], ["1, 2 y 3", 0, "range empieza en 0 por defecto."], ["0, 1, 2 y 3", 0, "range(3) no incluye el 3."], ["3", 0, "Se ejecuta el print en cada vuelta."]], "<code>range(n)</code> genera de <code>0</code> a <code>n-1</code>: justo los índices válidos de una lista de longitud n.", { truco: "range(len(lista)) = todos los índices de la lista." }),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "listas", nombre: "Listas", desc: "append, len, índices, recorrer, filtrar, no modificar la original",
        chuleta: `
<h3>Lo básico</h3>
<pre class="codigo" data-lang="py">numeros = [3, 8, 1]
numeros[0]          # 3   (primer elemento, índice 0)
numeros[-1]         # 1   (último)
len(numeros)        # 3
numeros.append(5)   # [3, 8, 1, 5]   añade al final
5 in numeros        # True
copia = numeros[:]  # copia independiente</pre>
<h3>Construir una lista NUEVA (patrón de examen)</h3>
<pre class="codigo" data-lang="py">def filtrar_intervalo(valores, inferior, superior):
    resultado = []                         # lista nueva
    for v in valores:
        if inferior &lt;= v &lt;= superior:
            resultado.append(v)
    return resultado                       # 'valores' no se toca</pre>
<h3>Recorrer con índice (para comparar con el anterior)</h3>
<pre class="codigo" data-lang="py">for i in range(1, len(estados)):         # empieza en 1
    if estados[i] != estados[i - 1]:
        cambios.append((i, estados[i - 1], estados[i]))</pre>
<h3>Buscar sin .index()</h3>
<pre class="codigo" data-lang="py">def buscar_indice(elementos, objetivo):
    for i in range(len(elementos)):
        if elementos[i] == objetivo:
            return i          # primera aparición → salgo ya
    return -1                 # FUERA del for: no estaba</pre>
<h3>Máximo sin max()</h3>
<pre class="codigo" data-lang="py">if len(numeros) == 0:
    return None
mayor = numeros[0]          # ¡no empieces en 0! falla con negativos
for n in numeros:
    if n &gt; mayor:
        mayor = n</pre>
<p class="ojo">«No modifiques los argumentos»: nada de append/remove/pop sobre la lista que te pasan.</p>`,
        items: [
          t("¿Qué muestra?", [["<code>[1, 2, 3, 4]</code>", 1], ["<code>[1, 2, 3]</code>", 0, "b no es una copia: es otro nombre para la MISMA lista."], ["Error", 0, "Es válido."], ["<code>[4]</code>", 0, "append añade al final; no sustituye."]],
            "<code>b = a</code> no copia: las dos variables apuntan a la misma lista. Por eso al modificar «b» cambia «a». Para copiar: <code>b = a[:]</code>. Esta es la causa de que fallen los asserts de «no modifiques la original».", { code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)" }),
          w("<code>numeros = [5, 8, 2, 9]</code>. ¿Qué vale <code>numeros[-1]</code>?", ["9"], "Los índices negativos cuentan desde el final: −1 es el último.", { modo: "num" }),
          t("<code>lista = [10, 20, 30]</code>. ¿Qué pasa con <code>lista[3]</code>?", [["<code>IndexError</code>", 1], ["Devuelve 30", 0, "30 está en el índice 2."], ["Devuelve None", 0, "Python no devuelve None al salirse: lanza un error."], ["Devuelve 0", 0, "No hay valor por defecto al salirse de la lista."]], "Con 3 elementos los índices válidos son 0, 1 y 2. El último índice siempre es <code>len(lista) - 1</code>."),
          t("Esta función debe devolver los mayores que 0. ¿Qué devuelve con <code>[3, -1, 5]</code>?", [["<code>[3]</code>", 1], ["<code>[3, 5]</code>", 0, "Sería lo correcto, pero el return está dentro del bucle."], ["<code>[]</code>", 0, "El 3 sí se añade antes de devolver."], ["<code>3</code>", 0, "Devuelve la lista, no el número."]],
            "El <code>return</code> está dentro del <code>for</code>: tras la primera vuelta la función termina. El return de una lista resultado va <b>fuera</b> del bucle, al nivel del <code>for</code>.", { code: "def positivos(numeros):\n    resultado = []\n    for n in numeros:\n        if n > 0:\n            resultado.append(n)\n        return resultado" }),
          t("¿Por qué esta versión de <code>maximo_lista</code> falla con <code>[-8, -3, -10]</code>?", [["Empieza con <code>mayor = 0</code> y ningún negativo lo supera", 1], ["Porque <code>&gt;</code> no funciona con negativos", 0, "Sí funciona: −3 &gt; −8 es True."], ["Porque falta comprobar la lista vacía", 0, "Eso es otro fallo, pero no explica este caso."], ["No falla", 0, "Devuelve 0, que ni siquiera está en la lista."]],
            "Inicializa con el <b>primer elemento</b> (<code>mayor = numeros[0]</code>), después de comprobar que la lista no está vacía.", { code: "def maximo_lista(numeros):\n    mayor = 0\n    for n in numeros:\n        if n > mayor:\n            mayor = n\n    return mayor" }),
          w("Completa para añadir <code>valor</code> al final de la lista <code>resultado</code>:", ["resultado.append(valor)"], "<code>.append()</code> añade un elemento al final y modifica esa lista. No devuelve nada (devuelve None), así que nunca hagas <code>resultado = resultado.append(v)</code>.", { modo: "codigo", fallos: [{ si: ["resultado = resultado.append(valor)"], why: "append devuelve None: te cargarías la lista. Se escribe solo <code>resultado.append(valor)</code>." }, { si: ["resultado + valor", "resultado += valor"], why: "No puedes sumar una lista y un número. Para añadir un elemento: <code>resultado.append(valor)</code>." }] }),
          t("¿Qué devuelve <code>buscar([5, 8], 8)</code>?", [["<code>-1</code>", 1], ["<code>1</code>", 0, "Sería lo correcto, pero la función nunca llega a mirar el 8."], ["<code>None</code>", 0, "Sí se devuelve algo en la primera vuelta."], ["Error", 0, "No hay error de ejecución."]],
            "El <code>else: return -1</code> dentro del bucle hace que la función se rinda tras mirar solo el primer elemento (el 5). El «no lo he encontrado» va <b>después</b> del bucle, cuando ya has mirado todos.", { code: "def buscar(elementos, objetivo):\n    for i in range(len(elementos)):\n        if elementos[i] == objetivo:\n            return i\n        else:\n            return -1" }),
          t("Sin usar <code>set()</code>, ¿qué condición usas para no repetir elementos al construir <code>resultado</code>?", [["<code>if e not in resultado:</code>", 1], ["<code>if e not in elementos:</code>", 0, "e siempre está en elementos (sale de ahí): no añadirías nada."], ["<code>if e != resultado:</code>", 0, "Compara un elemento con una lista entera."], ["<code>if resultado.count(e) &gt; 1:</code>", 0, "Mirarías si ya está dos veces; añadirías duplicados."]],
            "Mira si ya está en la lista <b>nueva</b> que estás construyendo. Así conservas el orden de la primera aparición.", { code: "resultado = []\nfor e in elementos:\n    # ¿?\n        resultado.append(e)" }),
          w("<code>range(1, 4)</code> genera…", ["1, 2, 3", "1,2,3", "1 2 3", "[1, 2, 3]"], "<code>range(inicio, fin)</code> incluye el inicio y <b>excluye</b> el fin.", { modo: "codigo", fallos: [{ si: ["1, 2, 3, 4", "1,2,3,4"], why: "El fin (4) no se incluye nunca." }] }),
          t("¿Qué hace <code>lista.pop(0)</code>?", [["Quita y devuelve el primer elemento", 1], ["Quita el elemento cuyo valor es 0", 0, "Eso sería <code>.remove(0)</code>."], ["Devuelve el primero sin quitarlo", 0, "pop sí lo quita."], ["Vacía la lista", 0, "Solo quita uno."]],
            "<code>pop(i)</code> trabaja por <b>posición</b>; <code>remove(x)</code> por <b>valor</b> (primera aparición). Los dos modifican la lista: úsalos sobre una copia si no debes tocar la original (como en la cola de atención)."),
          t("¿Qué devuelve <code>len([[1, 2], [], [3]])</code>?", [["3", 1], ["4", 0, "len no cuenta los números de dentro: cuenta las sublistas."], ["2", 0, "La lista vacía también cuenta como elemento."], ["Error", 0, "len funciona con cualquier lista."]], "La lista exterior tiene 3 elementos, que resulta que son listas. Para sumar todo hacen falta dos bucles anidados."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "tuplas", nombre: "Tuplas y listas de tuplas", desc: "crear, desempaquetar, devolver varios valores, coordenadas y asientos",
        chuleta: `
<h3>Tupla = datos agrupados que no cambian</h3>
<pre class="codigo" data-lang="py">punto = (3, 7)
x, y = punto                   # desempaquetado: x = 3, y = 7
punto[0]                       # 3
punto[0] = 5                   # ✗ TypeError: las tuplas no se modifican

def separar_signos(numeros):
    positivos, ceros, negativos = [], [], []
    ...
    return (positivos, ceros, negativos)   # devolver varias cosas</pre>
<h3>Lista de tuplas: recorrer desempaquetando</h3>
<pre class="codigo" data-lang="py">for (x, y) in puntos:          # o simplemente: for x, y in puntos:
    ...
for producto, unidades in ventas:
    ...</pre>
<h3>Posiciones y movimientos</h3>
<pre class="codigo" data-lang="py">x, y = posicion
for dx, dy in movimientos:
    nx, ny = x + dx, y + dy            # candidata
    if 0 &lt;= nx &lt; ancho and 0 &lt;= ny &lt; alto:
        x, y = nx, ny                  # solo si es válida
    else:
        rechazados += 1
return ((x, y), rechazados)</pre>
<h3>Bucles anidados que generan tuplas</h3>
<pre class="codigo" data-lang="py">for fila in range(1, filas + 1):            # numeración desde 1
    for asiento in range(1, por_fila + 1):
        if (fila, asiento) not in ocupados:
            libres.append((fila, asiento))</pre>
<p class="ojo">«Actualizar» una tupla = crear una nueva: (nombre, stock − unidades).</p>`,
        items: [
          w("<code>punto = (4, -2)</code> y luego <code>x, y = punto</code>. ¿Cuánto vale <code>y</code>?", ["-2"], "Desempaquetar asigna por orden: el primero a x, el segundo a y.", { modo: "num" }),
          t("¿Qué pasa con <code>p = (1, 2)</code> y luego <code>p[0] = 5</code>?", [["<code>TypeError</code>: las tuplas no se pueden modificar", 1], ["p pasa a ser (5, 2)", 0, "Eso pasaría con una lista [1, 2]."], ["p pasa a ser (5,)", 0, "No se puede asignar a una posición de una tupla."], ["Nada", 0, "Python lanza un error."]],
            "Las tuplas son <b>inmutables</b>. Si necesitas «cambiar» una, crea otra: <code>p = (5, p[1])</code>. En el inventario: <code>(producto, existencias - unidades)</code>."),
          t("Quieres devolver dos listas a la vez. ¿Qué devuelve la función?", [["Una tupla con dos listas: <code>([5, 2], [-3])</code>", 1], ["Solo la primera lista", 0, "<code>return a, b</code> devuelve ambas, empaquetadas en una tupla."], ["Error: solo se puede devolver una cosa", 0, "Técnicamente se devuelve una cosa: una tupla que contiene las dos."], ["Una lista de listas", 0, "Con coma se crea una tupla, no una lista."]],
            "<code>return a, b</code> y <code>return (a, b)</code> son lo mismo: devuelven la tupla <code>(a, b)</code>. Quien llama puede desempaquetar: <code>pos, neg = funcion(...)</code>.", { code: "def separar(numeros):\n    pos, neg = [], []\n    for n in numeros:\n        if n >= 0:\n            pos.append(n)\n        else:\n            neg.append(n)\n    return pos, neg\n\nprint(separar([5, -3, 2]))" }),
          w("<code>(fila, asiento)</code> empieza en 1. Sala <code>(2, 3)</code>. ¿Cuántos asientos hay en total?", ["6"], "2 filas × 3 asientos = 6 tuplas: (1,1) (1,2) (1,3) (2,1) (2,2) (2,3). El bucle exterior es la fila y el interior el asiento, y como se numera desde 1 se usa <code>range(1, n + 1)</code>.", { modo: "num" }),
          t("La sala tiene 3 asientos por fila numerados desde 1. ¿Qué <code>range</code> recorre bien los asientos?", [["<code>range(1, 4)</code>", 1], ["<code>range(3)</code>", 0, "Daría 0, 1, 2: el asiento 0 no existe y te faltaría el 3."], ["<code>range(1, 3)</code>", 0, "Daría 1 y 2: falta el 3."], ["<code>range(0, 4)</code>", 0, "Incluiría el asiento 0."]], "Para numerar de 1 a n: <code>range(1, n + 1)</code>."),
          t("Tablero 3×3 (x e y de 0 a 2). Ficha en <code>(2, 2)</code>, movimiento <code>(1, 0)</code>. ¿Qué pasa?", [["Se rechaza: x pasaría a 3, fuera del tablero", 1], ["Se mueve a (3, 2)", 0, "x tiene que ser &lt; ancho (3)."], ["Se mueve a (0, 2) dando la vuelta", 0, "El enunciado no dice que el tablero «dé la vuelta»: se ignora el movimiento."], ["Se queda en (2, 2) y no cuenta nada", 0, "Se queda, pero sí cuenta como rechazado."]],
            "Calcula primero la posición candidata y solo actualiza la real si <code>0 &lt;= nx &lt; ancho</code> y <code>0 &lt;= ny &lt; alto</code>. Si no, <code>rechazados += 1</code>."),
          t("¿Qué condición detecta que dos intervalos <b>no</b> se solapan si ya has aceptado uno que acaba en <code>ultimo_fin</code> y el nuevo empieza en <code>inicio</code>?", [["<code>inicio &gt;= ultimo_fin</code>", 1], ["<code>inicio &gt; ultimo_fin</code>", 0, "Así no permitirías empezar justo cuando acaba el anterior, y el enunciado dice que sí se puede."], ["<code>inicio &lt; ultimo_fin</code>", 0, "Eso es justo cuando SÍ se solapan."], ["<code>fin &gt; inicio</code>", 0, "Eso comprueba que el intervalo tiene duración positiva, no el solape."]],
            "Como vienen ordenados por inicio, basta con que el nuevo empiece cuando (o después de que) acaba el último aceptado. Además hay que ignorar los de duración nula o negativa (<code>fin &lt;= inicio</code>)."),
          w("¿Qué imprime <code>print(((0, 1), 1)[0][1])</code>?", ["1"], "<code>((0, 1), 1)[0]</code> es <code>(0, 1)</code>, y su posición 1 es <code>1</code>. Así se leen resultados como <code>((x_final, y_final), rechazados)</code>.", { modo: "num" }),
          t("En <code>construir_rutas</code>, ¿cómo consultas el destino del último tramo de la ruta en construcción <code>ruta</code>?", [["<code>ruta[-1][1]</code>", 1], ["<code>ruta[1][-1]</code>", 0, "Eso es el último dato del SEGUNDO tramo."], ["<code>ruta[-1]</code>", 0, "Eso es la tupla completa (origen, destino), no solo el destino."], ["<code>ruta.destino</code>", 0, "Las tuplas no tienen campos con nombre."]],
            "<code>ruta[-1]</code> = último tramo, una tupla <code>(origen, destino)</code>; <code>[1]</code> = su destino. Si coincide con el origen del siguiente tramo, se añade a la misma ruta."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "while", nombre: "while y condiciones de parada", desc: "índices, parar a tiempo, saldo, intentos, aforo, colas",
        chuleta: `
<h3>Esqueleto de un while que recorre una lista</h3>
<pre class="codigo" data-lang="py">i = 0
while i &lt; len(lecturas) and lecturas[i] &lt; umbral:   # 1º no salirse, 2º seguir
    normales.append(lecturas[i])
    i += 1                                          # ¡avanzar!
if i &lt; len(lecturas):
    alarma = lecturas[i]        # paré por la alarma
else:
    alarma = None               # paré por fin de lista</pre>
<ul>
<li>El <code>i &lt; len(...)</code> va <b>primero</b>: si es falso, Python ni mira lo de la derecha y no se produce <code>IndexError</code>.</li>
<li>Sin <code>i += 1</code> → bucle infinito.</li>
<li>Usa <code>while</code> cuando no sabes cuántas vueltas darás (paras por una condición).</li>
</ul>
<h3>Varias condiciones de parada</h3>
<pre class="codigo" data-lang="py">usados = 0
acierto = False
while usados &lt; len(intentos) and usados &lt; max_intentos and not acierto:
    if intentos[usados] == clave:
        acierto = True
    usados += 1
return (acierto, usados)</pre>
<h3>Procesar sin saltarse nada</h3>
<pre class="codigo" data-lang="py">while i &lt; len(importes) and importes[i] &lt;= saldo:
    saldo -= importes[i]
    pagados.append(importes[i])
    i += 1</pre>
<h3>Simular una cola</h3>
<pre class="codigo" data-lang="py">cola = personas[:]          # copia: no tocar el original
cola.append(nombre)         # llega
atendidos.append(cola.pop(0))   # atiende al primero (si la cola no está vacía)
cola.remove(nombre)         # sale (si está: if nombre in cola)</pre>
<p class="ojo">Antes de entregar un while: ¿cuándo para? ¿avanzo en todos los caminos?</p>`,
        items: [
          t("¿Qué pasa al ejecutar esto?", [["Bucle infinito", 1], ["Imprime 0, 1 y 2", 0, "Lo haría si i aumentara en cada vuelta."], ["Imprime 0 una vez", 0, "La condición 0 &lt; 3 sigue siendo cierta siempre."], ["Error", 0, "No hay error, simplemente no para."]],
            "Falta <code>i += 1</code>: la condición nunca cambia. En los labs, si tu código no termina, el boli rojo te avisa justo de esto.", { code: "i = 0\nwhile i < 3:\n    print(i)" }),
          t("¿Por qué la condición se escribe en este orden?", [["Si i llega al final, Python no evalúa <code>lecturas[i]</code> y no da IndexError", 1], ["Es igual el orden", 0, "Con el orden al revés, cuando i == len(lecturas) se evalúa lecturas[i] y explota."], ["Para que vaya más rápido", 0, "La razón es evitar el error, no la velocidad."], ["Porque and siempre mira primero la izquierda y luego la derecha", 0, "Mira primero la izquierda, sí, pero solo mira la derecha si la izquierda es cierta. Esa es la clave."]],
            "<code>and</code> es «perezoso»: si lo de la izquierda es falso, no mira lo de la derecha (cortocircuito). Por eso el control de límites va primero.", { code: "while i < len(lecturas) and lecturas[i] < umbral:" }),
          w("<code>consumir_presupuesto([7, 4, 9, 1], 15)</code> procesa en orden y para con la primera que no puede pagar. ¿Qué saldo queda?", ["4"], "15 − 7 = 8 → 8 − 4 = 4 → el 9 no se puede pagar → <b>para</b> (aunque el 1 sí cabría: no se salta compras). Resultado <code>([7, 4], 4)</code>.", { modo: "num", fallos: [{ si: ["3"], why: "Has pagado también el 1. El enunciado dice que se para en la primera que no se puede pagar, sin saltarla." }] }),
          w("<code>comprobar_acceso([\"a\",\"b\",\"c\",\"d\"], \"d\")</code> con <code>max_intentos=3</code>. ¿Cuántos intentos se usan?", ["3"], "Se comprueban a, b y c; al llegar a 3 intentos se para sin mirar la d. Devuelve <code>(False, 3)</code>.", { modo: "num" }),
          t("Aforo 5, ocupación 3, llega <code>(\"entra\", 4)</code>. ¿Qué haces?", [["Rechazarlo: 3 + 4 = 7 supera la capacidad", 1], ["Dejar entrar a 2 y rechazar a 2", 0, "El evento se acepta o se rechaza entero: el enunciado no habla de entradas parciales."], ["Aceptarlo", 0, "La ocupación quedaría en 7 &gt; 5."], ["Vaciar la sala", 0, "Nada en el enunciado dice eso."]],
            "Entrada válida si <code>cantidad &gt; 0</code> y <code>ocupacion + cantidad &lt;= capacidad</code>. Salida válida si <code>cantidad &gt; 0</code> y <code>cantidad &lt;= ocupacion</code>. Cualquier otra cosa (acción desconocida, cantidad ≤ 0) → rechazado."),
          t("En <code>simular_cola</code> llega <code>(\"atiende\", \"\")</code> y la cola está vacía. ¿Qué haces?", [["Ignorarlo (operación imposible)", 1], ["<code>cola.pop(0)</code>", 0, "pop sobre una lista vacía lanza IndexError."], ["Añadir \"\" a atendidos", 0, "No se ha atendido a nadie."], ["Terminar el bucle", 0, "Hay que seguir con las siguientes operaciones."]],
            "Antes de <code>pop(0)</code> comprueba <code>if len(cola) &gt; 0:</code>. Y antes de <code>remove(nombre)</code>, <code>if nombre in cola:</code>."),
          t("¿Qué bucle es más natural para «leer sensores hasta la primera alarma»?", [["<code>while</code>, porque no sabes cuántas lecturas vas a procesar", 1], ["<code>for</code>, porque siempre se recorre la lista entera", 0, "No: hay que parar en la alarma."], ["Da igual, no hay diferencia", 0, "Con for tendrías que usar break; el enunciado pide while."], ["Ninguno, se hace con if", 0, "Un if solo mira un elemento."]],
            "<code>for</code>: recorrer todo. <code>while</code>: repetir mientras se cumpla una condición (y parar en cuanto deje de cumplirse)."),
          w("¿Cuántas veces se ejecuta el <code>print</code>?", ["3"], "n vale 10 → 5 → 2 → 1. Imprime con 10, 5 y 2; con 1 la condición <code>n &gt; 1</code> ya es falsa. <code>//</code> es división entera.", { modo: "num", code: "n = 10\nwhile n > 1:\n    print(n)\n    n = n // 2" }),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "diccionarios", nombre: "Diccionarios y matrices", desc: "contar apariciones, claves y valores, listas de listas",
        chuleta: `
<h3>Diccionario = clave → valor</h3>
<pre class="codigo" data-lang="py">d = {"a": 2, "b": 1}
d["a"]            # 2
d["c"] = 5        # crea o sustituye
"a" in d          # True   (busca en las CLAVES)
d["z"]            # ✗ KeyError</pre>
<h3>Contar apariciones (sin Counter)</h3>
<pre class="codigo" data-lang="py">def contar_apariciones(elementos):
    conteo = {}
    for e in elementos:
        if e in conteo:
            conteo[e] += 1
        else:
            conteo[e] = 1
    return conteo</pre>
<h3>Devolver un informe</h3>
<pre class="codigo" data-lang="py">return {"media": promedio(notas), "aprobados": aprobados,
        "suspensos": suspensos, "maxima": maximo_lista(notas)}</pre>
<h3>Matriz = lista de listas → dos bucles</h3>
<pre class="codigo" data-lang="py">total = 0
for fila in matriz:        # cada fila es una lista
    for valor in fila:     # cada número de esa fila
        total += valor</pre>`,
        items: [
          t("¿Qué devuelve <code>contar([\"a\", \"b\", \"a\"])</code>?", [["<code>{\"a\": 2, \"b\": 1}</code>", 1], ["<code>{\"a\": 1, \"b\": 1}</code>", 0, "Cuando la clave ya existe se suma 1, no se reinicia."], ["<code>[2, 1]</code>", 0, "Se devuelve un diccionario, no una lista."], ["<code>KeyError</code>", 0, "Antes de sumar se comprueba si la clave existe."]],
            "Primera vez que aparece → <code>conteo[e] = 1</code>. Siguientes → <code>conteo[e] += 1</code>.", { code: "def contar(elementos):\n    conteo = {}\n    for e in elementos:\n        if e in conteo:\n            conteo[e] += 1\n        else:\n            conteo[e] = 1\n    return conteo" }),
          t("¿Qué falla aquí?", [["<code>conteo[e] += 1</code> da KeyError la primera vez que aparece e", 1], ["Debería ser <code>conteo.append(e)</code>", 0, "Los diccionarios no tienen append."], ["No falla", 0, "Con cualquier lista no vacía da KeyError."], ["El for debería recorrer conteo", 0, "Se recorren los elementos de entrada."]],
            "No puedes sumar 1 a algo que aún no existe. Primero comprueba <code>if e in conteo</code> (o inicializa a 0).", { code: "conteo = {}\nfor e in elementos:\n    conteo[e] += 1" }),
          w("<code>sumar_matriz([[4], [], [6, -2]])</code> devuelve…", ["8"], "4 + 6 − 2 = 8. La fila vacía no da problemas: su bucle interior simplemente no da vueltas.", { modo: "num" }),
          t("<code>d = {\"pan\": 5}</code>. ¿Qué devuelve <code>5 in d</code>?", [["<code>False</code>", 1], ["<code>True</code>", 0, "in mira las claves, y 5 es un valor."], ["Error", 0, "Es válido; simplemente es falso."]], "<code>in</code> con diccionarios busca en las <b>claves</b>. Para los valores: <code>5 in d.values()</code>."),
          t("En el informe de notas, ¿qué condición cuenta un aprobado?", [["<code>nota &gt;= 5</code>", 1], ["<code>nota &gt; 5</code>", 0, "El 5 también aprueba."], ["<code>nota == 5</code>", 0, "Solo contaría los cincos."], ["<code>nota &lt; 5</code>", 0, "Eso cuenta suspensos."]], "Aprobado: ≥ 5. Suspenso: &lt; 5. Se cuenta con dos contadores dentro de un for."),
          t("¿Por qué <code>informe_notas([])</code> no debe llamar a <code>sum(notas) / len(notas)</code>?", [["Porque <code>len([])</code> es 0 y daría <code>ZeroDivisionError</code>", 1], ["Porque sum no funciona con listas", 0, "Sí funciona, el problema es dividir entre 0."], ["Porque devolvería 0", 0, "No devolvería nada: explotaría antes."], ["Da igual", 0, "Los tests piden explícitamente media None para la lista vacía."]],
            "Caso especial primero: si la lista está vacía, devuelve directamente el diccionario con <code>None</code>, 0, 0 y <code>None</code>. Reutilizar <code>promedio()</code> ya lo contempla."),
        ],
      },
    ],
  };
})();
