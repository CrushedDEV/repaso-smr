/* Redes · direccionamiento IP, DHCP (isc-dhcp-server) y DNS (BIND9) */
window.TEMARIO = window.TEMARIO || { materias: {}, orden: [], labsExtra: {} };
(function () {
  const t = (q, ops, exp, o) => Object.assign({ tipo: "test", q, ops, exp }, o);
  const w = (q, sol, exp, o) => Object.assign({ tipo: "escribe", q, sol: [].concat(sol), exp }, o);
  const g = (gen) => ({ tipo: "gen", gen });
  const H = () => window.H;
  const rec = (dueno, tipo, dato, desc) => ({ d: desc || `<code>${dueno}</code> IN ${tipo} …`, f: (c) => H().faltaRec(c.z, dueno, tipo, dato) });
  const sinAvisos = { d: "Sin errores de escritura (puntos finales, IPs, SOA, CNAME)", f: (c) => { const graves = c.z.avisos.filter((a) => !a.includes("clase <code>IN</code>")); return !graves.length || "Mira el recuadro rojo de arriba: " + graves.length + (graves.length === 1 ? " problema." : " problemas."); } };

  /* ---------- ficheros de los casos (numerados como en los enunciados) ---------- */
  const CLINICA_DHCP = ["# Configuración DHCP - Clínica Veterinaria Arnedo", "authoritative;", "option domain-name \"vetarnedo.lan\";", "option domain-name-servers 8.8.8.8;", "default-lease-time 28800;", "max-lease-time 3600;", "", "subnet 192.168.50.0 netmask 255.255.0.0 {", "    range 192.168.50.100 192.168.50.299;", "    option routers 192.168.50.254;", "    option subnet-mask 255.255.255.0;", "    option broadcast-address 192.168.50.255;", "}", "", "host impresora-recepcion {", "    hardware ethernet 00:1B:A9:4C:12:7E;", "    fixed-address 192.168.50.150;", "}", "", "host pc-rayosx {", "    hardware ethernet 3C:52:82:AA:10;", "    fixed-address 192.168.50.21;", "}", "", "host portatil-direccion {", "    hardware ethernet 70:5A:0F:C3:22:91;", "    fixed-address 192.168.50.11", "}"];
  const CLINICA_DIRECTA = ["$TTL 86400", "@   IN  SOA  ns1.vetarnedo.lan. admin.vetarnedo.lan. (", "             2026102801  ; serial", "             3600        ; refresh", "             1800        ; retry", "             604800      ; expire", "             86400 )     ; TTL negativo", ";", "@                   IN  NS     ns1.vetarnedo.lan.", "@                   IN  MX 10  correo.vetarnedo.lan", ";", "ns1                 IN  A      192.168.50.5", "router              IN  A      192.168.50.1", "ficheros            IN  A      192.168.50.10", "historiales         IN  CNAME  ficheros.vetarnedo.lan.", "web                 IN  A      192.168.50.11", "www                 IN  CNAME  web.vetarnedo.lan.", "citas               IN  A      web.vetarnedo.lan.", "correo              IN  A      192.168.50.21", "impresora           IN  A      192.168.50.20", "rayosx              IN  A      192.168.50.21", "portatil-direccion  IN  A      192.168.50.22"];
  const CLINICA_INVERSA = ["$TTL 86400", "@   IN  SOA  ns1.vetarnedo.lan. admin.vetarnedo.lan. (", "             2026102801 3600 1800 604800 86400 )", "@              IN  NS   ns1.vetarnedo.lan.", "1              IN  PTR  router.vetarnedo.lan.", "5              IN  PTR  ns1.vetarnedo.lan.", "10             IN  PTR  ficheros.vetarnedo.lan.", "10             IN  PTR  historiales.vetarnedo.lan.", "11             IN  PTR  web.vetarnedo.lan.", "12             IN  PTR  correo.vetarnedo.lan.", "20             IN  PTR  impresora.vetarnedo.lan.", "21             IN  PTR  rayosx.vetarnedo.lan.", "192.168.50.22  IN  PTR  portatil-direccion.vetarnedo.lan."];
  const HOTEL_DHCP = ["# Configuración DHCP - Hotel Jaizkibel (red nueva /22)", "authoritative;", "option domain-name \"hoteljaizkibel.lan\";", "option domain-name-servers 172.16.8.2;", "default-lease-time 7200;", "max-lease-time 2160;", "", "subnet 172.16.8.0 netmask 255.255.255.0 {", "  range 172.16.8.100 172.16.8.199;", "  range 172.16.10.0 172.16.11.255;", "  option routers 172.16.11.254;", "  option subnet-mask 255.255.252.0;", "  option broadcast-address 172.16.8.255;", "}", "", "host tpv-restaurante {", "  hardware ethernet 00:0E:C6:5A:21:B4;", "  fixed-address 172.16.8.150;", "}", "", "host impresora-recepcion {", "  hardware ethernet 7C:4D:8F:03:AE:19", "  fixed-address 172.16.8.51;", "}", "", "host cerraduras {", "  hardware ethernet B8:27:EB:6F:9O:C2;", "  fixed-address 172.16.9.255;", "}"];
  const HOTEL_DIRECTA = ["$TTL 3600", "@   IN  SOA  dns.hoteljaizkibel.lan. admin.hoteljaizkibel.lan. (", "         2026111001 ; serial", "         3600       ; refresh", "         900        ; retry", "         1209600    ; expire", "         3600 )     ; TTL negativo", ";", "@           IN  NS     ns1.hoteljaizkibel.lan.", "@           IN  MX  10 smtp.hoteljaizkibel.lan.", ";", "dns         IN  A      172.16.8.2", "ns1         IN  CNAME  dns", "gw          IN  A      172.16.11.254", "reservas    IN  A      172.16.8.10", "pms         IN  CNAME  reservas", "web         IN  A      172.16.8.11", "www         IN  CNAME  web", "booking     IN  CNAME  web.hoteljaizkibel.lan", "correo      IN  A      172.16.8.12", "smtp        IN  CNAME  correo", "wifi        IN  A      172.16.9.1/22", "portal      IN  CNAME  wifi", "tpv         IN  A      172.16.8.150", "impresora   IN  A      172.16.8.51", "cerraduras  IN  A      172.16.9.255", "llaves      IN  CNAME  cerraduras"];
  const HOTEL_INVERSA = ["$TTL 3600", "@   IN  SOA  dns.hoteljaizkibel.lan. admin.hoteljaizkibel.lan. (", "         2026111001 3600 900 1209600 3600 )", "@          IN  NS     dns.hoteljaizkibel.lan.", "254.11     IN  PTR    gw.hoteljaizkibel.lan.", "2.8        IN  PTR    dns.hoteljaizkibel.lan.", "10.8       IN  PTR    reservas.hoteljaizkibel.lan.", "11.8       IN  PTR    web.hoteljaizkibel.lan.", "11.8       IN  PTR    booking.hoteljaizkibel.lan.", "8.12       IN  PTR    correo.hoteljaizkibel.lan.", "1.9        IN  PTR    wifi.hoteljaizkibel.lan.", "50.8       IN  PTR    tpv.hoteljaizkibel.lan.", "51.8       IN  PTR    impresora.hoteljaizkibel.lan.", "255.9      IN  CNAME  cerraduras.hoteljaizkibel.lan."];

  const INV_CLINICA = `<p class="chico suave">Inventario: router .1 · ns1 (srv01, DHCP+DNS) .5 · ficheros .10 (alias historiales) · web .11 (alias www, citas) · correo .12 · impresora .20 (reserva, MAC 00:1B:A9:4C:12:7E) · rayosx .21 (reserva, 3C:52:82:AA:10:F4) · portatil-direccion .22 (reserva, 70:5A:0F:C3:22:91) · dinámicas .100–.199. Red 192.168.50.0/24. Concesión 8 h, máxima 24 h.</p>`;
  const INV_HOTEL = `<p class="chico suave">Red 172.16.8.0/22, dominio hoteljaizkibel.lan. gw 172.16.11.254 · dns (alias ns1) 172.16.8.2 · reservas (pms) .8.10 · web (www, booking) .8.11 · correo (smtp) .8.12 · wifi (portal) .9.1 · tpv .8.50 (reserva 00:0E:C6:5A:21:B4) · impresora .8.51 (7C:4D:8F:03:AE:19) · cerraduras (llaves) .9.255 (B8:27:EB:6F:90:C2) · personal .8.100–.8.199 · huéspedes .10.0–.11.199. Concesión 2 h, máxima 6 h.</p>`;

  TEMARIO.orden.push("redes");
  TEMARIO.materias.redes = {
    nombre: "Redes",
    sub: "Subredes, DHCP con isc-dhcp-server y DNS con BIND9",
    intro: "Los dos servicios que caen siempre juntos: DHCP reparte la configuración de red y DNS traduce nombres. Aquí practicas con cálculos que no se acaban nunca, con los ficheros reales de la clínica de Arnedo y del hotel Jaizkibel para cazar sus errores, y escribiendo zonas y dhcpd.conf que se corrigen solos.",
    temas: [
      /* ------------------------------------------------------------ */
      {
        id: "ip", nombre: "Direcciones IP y máscaras", desc: "máscara, red, difusión, nº de equipos, IPs válidas en redes /22",
        chuleta: `
<h3>El método del salto (sin pasar a binario)</h3>
<ol>
<li>Prefijo → máscara: 8 bits = 255. Bits sueltos: 1→128, 2→192, 3→224, 4→240, 5→248, 6→252, 7→254.</li>
<li>Busca el octeto de la máscara que no es 255 ni 0. <b>Salto = 256 − ese valor</b>.</li>
<li>Las redes empiezan en múltiplos del salto. La tuya es el múltiplo justo por debajo de tu IP.</li>
<li>Difusión = siguiente red − 1. Útiles = todo lo de en medio.</li>
</ol>
<table>
<tr><th>Prefijo</th><th>Máscara</th><th>Equipos</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>254</td></tr>
<tr><td>/23</td><td>255.255.254.0</td><td>510</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>1022</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>62</td></tr>
</table>
<h3>Ejemplo del hotel: 172.16.8.0/22</h3>
<p>Máscara 255.255.<b>252</b>.0 → salto 256 − 252 = <b>4</b> en el 3er octeto: 172.16.<b>8</b>.0 … 172.16.<b>11</b>.255. Red 172.16.8.0 · Difusión 172.16.11.255 · Útiles 172.16.8.1 – 172.16.11.254 (2<sup>10</sup> − 2 = 1022).</p>
<p class="ojo">En una /22, 172.16.9.255 y 172.16.10.0 son IPs normales.</p>
<p>Equipos = 2<sup>(32 − prefijo)</sup> − 2 (red y difusión no se asignan).</p>
<p>Contar un rango: de .8.100 a .8.199 → 199 − 100 + 1 = <b>100</b>. De .10.0 a .11.199 → 256 (todo el .10) + 200 = <b>456</b>.</p>`,
        items: [
          g("mascara"), g("red"), g("difusion"), g("hosts"), g("ultima"), g("valida"), g("valida"),
          t("Máscara de <code>/22</code> en decimal:", [["<code>255.255.252.0</code>", 1], ["<code>255.255.255.252</code>", 0, "Eso es /30: 22 unos son 8+8+6, no 8+8+8+6."], ["<code>255.255.248.0</code>", 0, "248 son 5 bits: eso es /21."], ["<code>255.255.254.0</code>", 0, "254 son 7 bits: /23."]], "22 = 8 + 8 + 6 → 255.255.(6 bits = 252).0.", { truco: "/22 es la de «cuatro /24 seguidas»: el tercer octeto avanza de 4 en 4." }),
          t("Un compañero dice que la central de cerraduras no puede usar <code>172.16.9.255</code> porque «es una difusión». Red <code>172.16.8.0/22</code>. ¿Tiene razón?", [["No: en esta /22 la difusión es 172.16.11.255; la .9.255 es una IP normal", 1], ["Sí: cualquier IP acabada en 255 es difusión", 0, "Solo en las /24 (y más pequeñas que acaben ahí). Aquí la red abarca de .8.0 a .11.255."], ["Sí, pero solo si la asigna DHCP", 0, "Da igual quién la asigne: es válida o no lo es."], ["Depende del router", 0, "Depende solo de la máscara."]], "Con /22 el bloque es 172.16.8.0–172.16.11.255. Solo la primera (red) y la última (difusión) están prohibidas. Por eso tampoco hay problema con 172.16.10.0."),
          w("¿Cuántas IP hay en el rango <code>172.16.10.0</code> – <code>172.16.11.199</code>?", ["456"], "Todo el .10 (de .0 a .255) son 256; del .11.0 al .11.199 son 200 → <b>456</b>.", { modo: "num", fallos: [{ si: ["455"], why: "Al contar un rango hay que sumar 1: de 0 a 255 hay 256 números, no 255." }, { si: ["454"], why: "No restes red y difusión: dentro de la /22 todas estas IP son válidas." }] }),
          t("Hay 410 dispositivos de huéspedes con concesión y llega un autobús con 60 personas × 1,5 dispositivos. El rango de huéspedes tiene 456 IP. ¿Qué pasa?", [["Faltan IP: 410 + 90 = 500 > 456 (faltan 44)", 1], ["Sobran IP", 0, "60 × 1,5 = 90 dispositivos nuevos: 500 en total."], ["Justo caben", 0, "456 &lt; 500."], ["No se puede saber", 0, "Con los datos se puede calcular."]], "Soluciones sin cambiar de red: ampliar el rango de huéspedes (por ejemplo usar también parte del 172.16.9.x que no esté reservada, o .11.200–.11.253) y reducir la concesión de huéspedes para que las IP de quien se va se liberen antes."),
          t("¿Cuál de estas IP <b>no</b> es una IPv4 válida?", [["<code>192.168.50.299</code>", 1], ["<code>172.16.10.0</code>", 0, "Es válida (y en una /22 incluso asignable)."], ["<code>10.0.0.255</code>", 0, "Es una IPv4 bien escrita."], ["<code>192.168.50.1</code>", 0, "Válida."]], "Cada octeto va de 0 a 255. Un <code>range ... 192.168.50.299</code> hace que isc-dhcp-server ni arranque."),
          t("¿Cuál de estas redes es privada (no se enruta en Internet)?", [["<code>172.20.0.0/16</code>", 1], ["<code>172.32.0.0/16</code>", 0, "El bloque privado es 172.16.0.0 – 172.31.255.255."], ["<code>8.8.8.0/24</code>", 0, "Es pública (DNS de Google)."], ["<code>192.169.1.0/24</code>", 0, "El privado es 192.168, no 192.169."]], "Privadas: 10.0.0.0/8 · 172.16.0.0/12 (172.16 a 172.31) · 192.168.0.0/16."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "dhcp", nombre: "DHCP: cómo funciona", desc: "DORA, puertos, broadcast, concesiones T1/T2, NAK, DECLINE, RELEASE",
        chuleta: `
<h3>DORA</h3>
<pre class="codigo" data-lang="conf">CLIENTE (68)                                 SERVIDOR (67)       UDP
  │ 1. DISCOVER  0.0.0.0 → 255.255.255.255  ─────▶  «¿hay algún servidor?»
  │ 2. OFFER     servidor → cliente          ◀─────  «te ofrezco la .10.37»
  │ 3. REQUEST   0.0.0.0 → 255.255.255.255  ─────▶  «me quedo la .10.37 del servidor X»
  │ 4. ACK       servidor → cliente          ◀─────  «confirmada, 7200 s»</pre>
<ul>
<li>Va sobre <b>UDP</b>: servidor puerto <b>67</b>, cliente puerto <b>68</b>.</li>
<li>Al principio el cliente no tiene IP (usa <code>0.0.0.0</code>) ni sabe dónde está el servidor → envía a la difusión <code>255.255.255.255</code>.</li>
<li>El REQUEST también va por difusión: así los demás servidores que ofertaron se enteran de que no los ha elegido.</li>
</ul>
<h3>Otros mensajes</h3>
<table>
<tr><th>Mensaje</th><th>Cuándo</th></tr>
<tr><td>DHCPNAK</td><td>El servidor rechaza la IP pedida (no es de esta red). Solo lo hace si es <code>authoritative</code>.</td></tr>
<tr><td>DHCPDECLINE</td><td>El cliente comprueba con ARP y ve que la IP ofrecida ya la usa otro → la rechaza y vuelve a empezar.</td></tr>
<tr><td>DHCPRELEASE</td><td>El cliente se apaga bien y devuelve la IP. Va <b>directo</b> (unicast) al servidor.</td></tr>
<tr><td>DHCPINFORM</td><td>Tiene IP fija y solo pide otros datos.</td></tr>
</table>
<h3>Concesión (lease)</h3>
<ul>
<li><b>T1 = 50 %</b>: intenta renovar con <b>su</b> servidor (REQUEST unicast).</li>
<li><b>T2 = 87,5 %</b>: pide renovación a <b>cualquier</b> servidor (broadcast, «rebinding»).</li>
<li><b>100 %</b>: caduca, suelta la IP y vuelve al DISCOVER.</li>
<li>El cliente puede pedir una duración, pero el servidor nunca da más que <code>max-lease-time</code>.</li>
</ul>
<h3>INIT-REBOOT</h3>
<p>Si el equipo recuerda una concesión anterior que no ha caducado, al reconectar empieza directamente con un <b>REQUEST</b> de esa IP. Si está en otra red, un servidor <code>authoritative</code> responde <b>NAK</b> y el cliente empieza de cero con DISCOVER.</p>
<p class="ojo">T1 a la mitad · T2 a los 7/8.</p>`,
        items: [
          { tipo: "ordena", q: "Ordena los cuatro mensajes de una concesión DHCP nueva", items: ["DHCPDISCOVER", "DHCPOFFER", "DHCPREQUEST", "DHCPACK"], exp: "D-O-R-A: Descubrir, Ofrecer, Pedir (Request), Aceptar (Ack).", truco: "DORA la exploradora busca servidor." },
          t("¿Qué protocolo de transporte y puertos usa DHCP?", [["UDP · servidor 67 · cliente 68", 1], ["TCP · servidor 67 · cliente 68", 0, "TCP necesita una conexión entre dos IP, y el cliente aún no tiene IP."], ["UDP · 53", 0, "53 es DNS."], ["UDP · servidor 68 · cliente 67", 0, "Al revés."]], "UDP porque no hace falta conexión y se puede enviar por difusión.", { truco: "El servidor tiene el número «menor» (67): llegó antes." }),
          t("¿Por qué el DISCOVER se envía a <code>255.255.255.255</code>?", [["Porque el cliente no tiene IP ni sabe la IP del servidor", 1], ["Porque es la IP del router", 0, "Es la dirección de difusión, no la de un equipo."], ["Porque así va más rápido", 0, "No es por velocidad."], ["Porque lo pide el DNS", 0, "El DNS no interviene."]], "Difusión = le llega a todos los equipos de la red local, incluido el servidor DHCP. El origen del paquete es <code>0.0.0.0</code>."),
          t("¿Qué IP de origen lleva el DHCPDISCOVER?", [["<code>0.0.0.0</code>", 1], ["<code>255.255.255.255</code>", 0, "Esa es la de destino."], ["La última IP que tuvo", 0, "En el DISCOVER no: todavía no tiene ninguna válida."], ["La del servidor", 0, "Lo envía el cliente."]], "0.0.0.0 = «no tengo dirección». Destino 255.255.255.255, puertos 68 → 67."),
          g("concesion"), g("concesion"), g("segundos"),
          t("Un portátil pide una concesión de 12 horas, pero el servidor tiene <code>max-lease-time 21600;</code>. ¿Cuánto le da?", [["6 horas (21600 s)", 1], ["12 horas", 0, "Nunca se da más que max-lease-time."], ["2 horas", 0, "Eso sería default-lease-time, que se usa cuando el cliente no pide nada."], ["Le deniega la IP", 0, "No la deniega: le da el máximo permitido."]], "<code>default-lease-time</code>: si el cliente no pide duración. <code>max-lease-time</code>: tope aunque pida más."),
          t("El registro muestra que los dispositivos renuevan cada 18 minutos aunque se acordaron 2 h. ¿Qué error lo explica?", [["<code>max-lease-time 2160;</code> en vez de 21600: concesión de 36 min y T1 a los 18", 1], ["<code>default-lease-time 7200;</code>", 0, "7200 s = 2 h: es correcto."], ["La máscara de la subred", 0, "No afecta a los tiempos."], ["Falta authoritative", 0, "No influye en la duración."]], "2160 s = 36 min. Como el máximo es menor que el default, el servidor da 36 min y el cliente renueva a la mitad: 18 min. Un cero de menos."),
          t("El portátil llega de otro hotel con la IP 192.168.1.34 y, sin apagarse, se conecta aquí. ¿Qué envía primero?", [["Un DHCPREQUEST de 192.168.1.34 (INIT-REBOOT)", 1], ["Un DHCPDISCOVER", 0, "Solo si no recordara ninguna concesión válida."], ["Un DHCPRELEASE", 0, "No se ha despedido del otro hotel."], ["Un DHCPNAK", 0, "NAK lo envían los servidores."]], "Recuerda una concesión no caducada e intenta seguir usándola: pide confirmación con REQUEST."),
          t("Y srv-core (con <code>authoritative;</code>) ¿qué contesta a ese REQUEST de 192.168.1.34?", [["DHCPNAK: esa IP no vale en esta red", 1], ["Nada, lo ignora", 0, "Eso pasaría sin authoritative: el portátil esperaría hasta agotar el tiempo."], ["DHCPACK", 0, "No puede confirmar una IP de otra red."], ["DHCPOFFER de 192.168.1.34", 0, "No tiene esa IP para ofrecer."]], "<code>authoritative;</code> = «soy el servidor oficial de esta red, puedo decir que no». Sin esa línea, el servidor calla y el cliente tarda mucho más en reaccionar."),
          { tipo: "ordena", q: "Ordena la captura de Wireshark del huésped que viene de otro hotel", items: ["X · REQUEST de 192.168.1.34 (0.0.0.0 → 255.255.255.255)", "V · NAK de srv-core (IP no válida en esta red)", "W · DISCOVER (0.0.0.0 → 255.255.255.255, 68 → 67)", "U · OFFER de 172.16.10.37 (67 → 68)", "Z · REQUEST de 172.16.10.37 al servidor 172.16.8.2", "Y · ACK: 172.16.10.37, concesión 7200 s"],
            exp: "INIT-REBOOT fallido (REQUEST + NAK) y luego DORA completo. En el W la IP origen es 0.0.0.0 y los puertos 68 → 67 (sale del cliente). En el Z se pide la IP ofrecida indicando el servidor 172.16.8.2; en el Y la concesión es la por defecto: 7200 s." },
          t("Antes de usar la IP ofrecida, el portátil hace ARP y ve que otro equipo ya la tiene. ¿Qué envía?", [["DHCPDECLINE, y después empieza de nuevo con DISCOVER", 1], ["DHCPRELEASE", 0, "RELEASE es para devolver una IP que sí estaba usando."], ["DHCPNAK", 0, "NAK lo envía el servidor."], ["Nada, la usa igualmente", 0, "Provocaría un conflicto de IP."]], "DECLINE = «esa IP está ocupada, no la quiero». El servidor la marca como abandonada."),
          t("Al irse, el huésped apaga el portátil correctamente. ¿Qué puede enviar y cómo?", [["DHCPRELEASE, directo (unicast) al servidor", 1], ["DHCPRELEASE por difusión", 0, "Ya conoce la IP del servidor y tiene IP propia: va directo."], ["DHCPDECLINE", 0, "No rechaza nada: devuelve."], ["Nada, nunca se envía nada", 0, "Puede enviar RELEASE."]], "El hotel recupera la IP al momento en vez de esperar a que caduque la concesión. Muy útil con rangos justos."),
          t("El servidor registra: <code>Abandoning IP address 172.16.11.254: pinged before offer</code>. ¿Qué significa?", [["Antes de ofrecerla hizo ping y alguien contestó: esa IP del rango ya está en uso (es el router)", 1], ["Que el router está apagado", 0, "Al contrario: contestó al ping."], ["Que el DNS no funciona", 0, "No tiene relación."], ["Que la concesión ha caducado", 0, "No tiene relación con tiempos."]], "El rango dinámico (hasta .11.255) incluía la IP del router. Los rangos nunca deben solapar IPs fijas ni la difusión."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "dhcpconf", nombre: "Configurar isc-dhcp-server", desc: "dhcpd.conf: opciones, subnet, range, host, reservas y comandos",
        chuleta: `
<h3>/etc/dhcp/dhcpd.conf</h3>
<pre class="codigo" data-lang="conf"># Opciones globales
authoritative;
option domain-name "vetarnedo.lan";
option domain-name-servers 192.168.50.5;     # el DNS INTERNO
default-lease-time 28800;                    # 8 h si el cliente no pide nada
max-lease-time 86400;                        # tope: 24 h

subnet 192.168.50.0 netmask 255.255.255.0 {  # red y máscara deben casar
    range 192.168.50.100 192.168.50.199;     # rango dinámico
    option routers 192.168.50.1;             # puerta de enlace
    option subnet-mask 255.255.255.0;
    option broadcast-address 192.168.50.255;
}

host impresora-recepcion {                   # reserva por MAC
    hardware ethernet 00:1B:A9:4C:12:7E;     # 6 pares hexadecimales
    fixed-address 192.168.50.20;             # FUERA del rango dinámico
}</pre>
<ul>
<li>Cada línea de configuración termina en <code>;</code>. Las de llaves no. Si falta un <code>;</code>, el error se suele marcar en la línea <b>siguiente</b>.</li>
<li>Varios rangos en la misma subred: varias líneas <code>range</code>.</li>
<li>Una reserva puede tener su propia duración: <code>default-lease-time 86400;</code> (y <code>max-lease-time</code>, si el global es menor) dentro del <code>host</code>.</li>
</ul>
<h3>Comandos</h3>
<table>
<tr><td>Interfaz donde escucha</td><td><code>/etc/default/isc-dhcp-server</code> → <code>INTERFACESv4="enp0s3"</code></td></tr>
<tr><td>Comprobar sintaxis</td><td><code>dhcpd -t -cf /etc/dhcp/dhcpd.conf</code></td></tr>
<tr><td>Reiniciar / estado</td><td><code>systemctl restart isc-dhcp-server</code> · <code>systemctl status isc-dhcp-server</code></td></tr>
<tr><td>Concesiones dadas</td><td><code>/var/lib/dhcp/dhcpd.leases</code></td></tr>
<tr><td>Registro</td><td><code>journalctl -u isc-dhcp-server</code></td></tr>
<tr><td>Cliente Linux</td><td><code>dhclient -r</code> (soltar) · <code>dhclient</code> (pedir)</td></tr>
<tr><td>Cliente Windows</td><td><code>ipconfig /release</code> · <code>ipconfig /renew</code></td></tr>
</table>
<p class="ojo">Fijas y reservas, siempre fuera del range.</p>`,
        items: [
          t("¿Dónde está el fichero de configuración de isc-dhcp-server en Debian/Ubuntu?", [["<code>/etc/dhcp/dhcpd.conf</code>", 1], ["<code>/etc/dhcpd/dhcp.conf</code>", 0, "La carpeta es dhcp y el fichero dhcpd.conf."], ["<code>/etc/bind/dhcpd.conf</code>", 0, "/etc/bind es de DNS."], ["<code>/var/lib/dhcp/dhcpd.leases</code>", 0, "Ahí se guardan las concesiones dadas, no la configuración."]], "La «d» final de dhcp<b>d</b> es de daemon (servicio)."),
          t("Tras cambiar dhcpd.conf, ¿qué comando aplica los cambios?", [["<code>systemctl restart isc-dhcp-server</code>", 1], ["<code>systemctl restart dhcp</code>", 0, "El servicio se llama isc-dhcp-server."], ["<code>systemctl restart bind9</code>", 0, "bind9 es el DNS."], ["<code>dhclient -r</code>", 0, "Eso suelta la IP en un cliente."]], "Si queda en <code>failed</code>, mira <code>systemctl status isc-dhcp-server</code> o <code>journalctl -u isc-dhcp-server</code>: dice la línea del error."),
          t("¿En qué fichero se indica por qué tarjeta de red escucha el servidor DHCP?", [["<code>/etc/default/isc-dhcp-server</code> (INTERFACESv4)", 1], ["<code>/etc/dhcp/dhcpd.conf</code>", 0, "Ahí va la configuración de red a repartir, no la interfaz."], ["<code>/etc/network/interfaces</code>", 0, "Ahí se configura la IP del propio servidor."], ["<code>/etc/resolv.conf</code>", 0, "Es el DNS que usa el equipo."]], "<code>INTERFACESv4=\"enp0s3\"</code>. Si está vacío o mal, el servicio no arranca o no responde."),
          t("La clínica pone <code>option domain-name-servers 8.8.8.8;</code>. ¿Qué pasa?", [["Internet funciona, pero no se resuelven los nombres internos (historiales.vetarnedo.lan…)", 1], ["No funciona nada", 0, "8.8.8.8 sí resuelve nombres de Internet."], ["Todo funciona perfecto", 0, "Google no sabe nada de vetarnedo.lan."], ["El DHCP no arranca", 0, "Es una opción válida sintácticamente."]], "Los clientes deben usar el DNS interno (192.168.50.5), que conoce la zona local y además resuelve Internet."),
          t("<code>subnet 192.168.50.0 netmask 255.255.0.0 { ... }</code> en la clínica (red /24). ¿Qué ocurre?", [["El servicio no arranca: 192.168.50.0 no es una dirección de red válida para /16", 1], ["Funciona igual", 0, "dhcpd comprueba que red y máscara casen."], ["Reparte IPs de toda la 192.168", 0, "Ni llega a arrancar."], ["Solo afecta a la difusión", 0, "Afecta a la declaración entera."]], "Con 255.255.0.0 la red sería 192.168.0.0. La declaración de subnet debe usar la red y máscara reales: 255.255.255.0."),
          t("En el hotel (/22), el registro dice: <code>Address range 172.16.10.0 to 172.16.11.255 not on net 172.16.8.0/255.255.255.0!</code> ¿Qué hay que corregir?", [["La netmask del subnet: 255.255.252.0", 1], ["Quitar el segundo range", 0, "El segundo rango es necesario (huéspedes)."], ["La IP del router", 0, "No es lo que indica el mensaje."], ["El domain-name", 0, "No tiene relación."]], "Con /24 la subred acabaría en .8.255 y el rango de huéspedes quedaría fuera. Además ese rango debe terminar en .11.199 (no en la difusión)."),
          t("¿Qué está mal en <code>hardware ethernet B8:27:EB:6F:9O:C2;</code>?", [["Hay una letra O en vez de un cero: no es hexadecimal", 1], ["Le faltan los guiones", 0, "En dhcpd.conf se separa con dos puntos."], ["Debería ir en minúsculas", 0, "Mayúsculas o minúsculas valen."], ["Nada", 0, "Mira el quinto par."]], "Una MAC tiene 6 pares de dígitos hexadecimales (0-9, A-F). «9O» no lo es → error de sintaxis."),
          t("¿Qué pasa con <code>hardware ethernet 3C:52:82:AA:10;</code> (pc-rayosx)?", [["Faltan dos dígitos (un par): esa reserva no coincide con ningún equipo", 1], ["Funciona igual", 0, "La MAC no coincide con la del PC."], ["Le da la .21 a cualquiera", 0, "No: la reserva no se aplica a nadie."], ["Se completa sola", 0, "dhcpd no adivina pares."]], "El PC de rayos coge una IP dinámica distinta cada vez y el programa que lo busca en la .21 no lo encuentra."),
          t("La impresora tiene <code>fixed-address 192.168.50.150;</code> y el rango es .100–.199. ¿Qué problema da?", [["Conflicto: la .150 también se puede dar dinámicamente a otro equipo", 1], ["Ninguno", 0, "El rango dinámico incluye la .150."], ["Solo que no coincide con el inventario", 0, "Además provoca conflictos."], ["El servicio no arranca", 0, "Arranca, con un aviso."]], "Las reservas van fuera del rango dinámico. dhcpd avisa con «Dynamic and static leases present for …» y aparecen conflictos de IP."),
          w("Escribe la línea que da como puerta de enlace <code>192.168.50.1</code>.", ["option routers 192.168.50.1;"], "La puerta de enlace se llama <code>routers</code> (en plural, aunque sea uno).", { modo: "conf", fallos: [{ si: ["option routers 192.168.50.1", "optionrouters192.168.50.1"], why: "Casi: falta el punto y coma final." }, { si: ["option gateway 192.168.50.1;", "option router 192.168.50.1;"], why: "La opción se llama <code>routers</code>, en plural." }] }),
          w("Escribe la línea de la reserva con la MAC <code>A4:14:37:0B:5C:E2</code> (solo esa línea, la de la tarjeta).", ["hardware ethernet A4:14:37:0B:5C:E2;", "hardware ethernet a4:14:37:0b:5c:e2;"], "<code>hardware ethernet</code> + MAC + <code>;</code>. Va dentro del bloque <code>host nombre { … }</code>, junto a <code>fixed-address</code>.", { modo: "conf" }),
          t("¿Qué bloque reserva la 192.168.50.23 para la cámara (MAC A4:14:37:0B:5C:E2)?", [["<code>host camara-espera { hardware ethernet A4:14:37:0B:5C:E2; fixed-address 192.168.50.23; }</code>", 1], ["<code>host camara-espera { mac A4:14:37:0B:5C:E2; ip 192.168.50.23; }</code>", 0, "Las palabras clave son hardware ethernet y fixed-address."], ["<code>range 192.168.50.23 192.168.50.23;</code>", 0, "Eso sería un rango dinámico de una IP para cualquiera."], ["<code>host 192.168.50.23 { hardware ethernet A4:14:37:0B:5C:E2; }</code>", 0, "Detrás de host va un nombre, y falta fixed-address."]], "Después, en DNS: <code>camara-espera IN A 192.168.50.23</code>, <code>videovigilancia IN CNAME camara-espera</code> y en la inversa <code>23 IN PTR camara-espera.vetarnedo.lan.</code>, subiendo el serial."),
          t("¿Qué comando comprueba la sintaxis de dhcpd.conf sin reiniciar?", [["<code>dhcpd -t -cf /etc/dhcp/dhcpd.conf</code>", 1], ["<code>named-checkconf</code>", 0, "Es para BIND."], ["<code>dhclient -t</code>", 0, "dhclient es el cliente."], ["<code>cat /etc/dhcp/dhcpd.conf</code>", 0, "Solo muestra el fichero."]], "-t = test. Muy útil antes del restart."),
          { tipo: "bugs", q: "Clínica Arnedo · dhcpd.conf: caza los errores", archivo: "/etc/dhcp/dhcpd.conf", extra: INV_CLINICA, lineas: CLINICA_DHCP,
            errores: { 4: { tipo: "D", fix: "option domain-name-servers 192.168.50.5;", why: "Los clientes deben usar el DNS interno (srv01). Con 8.8.8.8 no resuelven los nombres .lan." }, 6: { tipo: "D", fix: "max-lease-time 86400;", why: "La máxima pedida es 24 h = 86400 s. Con 3600 las concesiones se cortan cada hora." }, 8: { tipo: "S", fix: "subnet 192.168.50.0 netmask 255.255.255.0 {", why: "Red /24 → 255.255.255.0. Con 255.255.0.0 no casa con 192.168.50.0." }, 9: { tipo: "S", fix: "    range 192.168.50.100 192.168.50.199;", why: "299 no es un octeto válido; el rango del inventario acaba en .199." }, 10: { tipo: "D", fix: "    option routers 192.168.50.1;", why: "El router es la .1. Con .254 los PC tienen red local pero no Internet." }, 17: { tipo: "D", fix: "    fixed-address 192.168.50.20;", why: "La impresora es la .20; la .150 está dentro del rango dinámico (conflictos)." }, 21: { tipo: "S", fix: "    hardware ethernet 3C:52:82:AA:10:F4;", why: "MAC incompleta: faltan un par (F4)." }, 27: { tipo: "S + D", fix: "    fixed-address 192.168.50.22;", why: "Dos errores: falta el <code>;</code> y la IP es la del servidor web (.11) en vez de la .22." } },
            trampas: { 5: "Correcta: 28800 s = 8 h, la concesión normal pedida.", 12: "Correcta: la difusión de 192.168.50.0/24 es .255." },
            exp: "Son 9 errores en 8 líneas (la 27 tiene dos). Compara siempre cada dato con el inventario y los requisitos: casi todos son «dato que no casa»." },
          { tipo: "bugs", q: "Hotel Jaizkibel · dhcpd.conf: caza los errores", archivo: "/etc/dhcp/dhcpd.conf", extra: INV_HOTEL, lineas: HOTEL_DHCP,
            errores: { 6: { tipo: "D", fix: "max-lease-time 21600;", why: "Máxima de 6 h = 21600 s. Con 2160 (36 min) todos renuevan cada 18 min." }, 8: { tipo: "D", fix: "subnet 172.16.8.0 netmask 255.255.252.0 {", why: "La red es /22. Con /24 el rango de huéspedes queda «not on net» y el servicio no arranca." }, 10: { tipo: "D", fix: "  range 172.16.10.0 172.16.11.199;", why: "Los huéspedes van hasta .11.199. Hasta .11.255 incluiría el router (.11.254) y la difusión." }, 13: { tipo: "D", fix: "  option broadcast-address 172.16.11.255;", why: "En la /22 la difusión es 172.16.11.255. Con .8.255 la búsqueda de impresoras por difusión no llega a nadie." }, 18: { tipo: "D", fix: "  fixed-address 172.16.8.50;", why: "El TPV es la .8.50; la .150 está en el rango del personal (conflicto)." }, 22: { tipo: "S", fix: "  hardware ethernet 7C:4D:8F:03:AE:19;", why: "Falta el punto y coma (el error se marca en la línea 23)." }, 27: { tipo: "S", fix: "  hardware ethernet B8:27:EB:6F:90:C2;", why: "«9O» lleva una letra O: debe ser el número 90." } },
            trampas: { 12: "Correcta: 255.255.252.0 es la máscara de la /22.", 28: "Correcta: en la /22, 172.16.9.255 es una IP de host normal.", 11: "Correcta: la última útil de la /22 es 172.16.11.254, el router." },
            exp: "7 errores en el DHCP del hotel. La gran trampa es pensar en /24: en una /22, .9.255 y .10.0 son IPs válidas." },
        ],
        labs: [
          { tipo: "dhcp", titulo: "Reescribe el dhcpd.conf de la clínica", nivel: "examen",
            enunciado: `<p>Este es el <code>/etc/dhcp/dhcpd.conf</code> que dejó el técnico nuevo. <b>Corrígelo entero</b> según el inventario y los requisitos (concesión normal 8 h, máxima 24 h; los clientes reciben máscara, puerta de enlace, DNS interno y dominio).</p>${INV_CLINICA}`,
            inicio: CLINICA_DHCP.join("\n") + "\n",
            checks: [
              { d: "Ninguna línea sin su <code>;</code>", f: (c) => !c.d.avisos.length || "Revisa los puntos y coma y las llaves (mira el recuadro de arriba)." },
              { d: "<code>authoritative;</code>", f: (c) => c.d.global.includes("authoritative"), why: "Este servidor es el oficial de la red." },
              { d: "Dominio <code>vetarnedo.lan</code>", f: (c) => c.d.valor("option domain-name") === "vetarnedo.lan" },
              { d: "DNS interno <code>192.168.50.5</code>", f: (c) => c.d.valor("option domain-name-servers") === "192.168.50.5" || "El DNS debe ser srv01 (192.168.50.5), que conoce la zona vetarnedo.lan." },
              { d: "Concesión normal 8 h y máxima 24 h (en segundos)", f: (c) => (c.d.valor("default-lease-time") === "28800" && c.d.valor("max-lease-time") === "86400") || "8 h = 28800 s · 24 h = 86400 s." },
              { d: "<code>subnet 192.168.50.0 netmask 255.255.255.0</code>", f: (c) => { const s = c.d.subnets[0]; return !!s && s.red === "192.168.50.0" && s.mascara === "255.255.255.0"; } },
              { d: "Rango dinámico .100 – .199", f: (c) => { const s = c.d.subnets[0]; return !!s && s.ranges.length === 1 && s.ranges[0][0] === "192.168.50.100" && s.ranges[0][1] === "192.168.50.199"; } },
              { d: "Puerta de enlace .1 y máscara 255.255.255.0", f: (c) => { const s = c.d.subnets[0]; return !!s && c.d.valor("option routers", s.st) === "192.168.50.1" && c.d.valor("option subnet-mask", s.st) === "255.255.255.0"; } },
              { d: "Tres reservas con MAC completas y válidas", f: (c) => c.d.hosts.length === 3 && c.d.hosts.every((h) => H().macValida(h.mac)) || "Cada host necesita una MAC de 6 pares hexadecimales." },
              { d: "Impresora → .20 · rayosx → .21 · portátil → .22", f: (c) => { const ip = (mac) => (c.d.hosts.find((h) => h.mac.toUpperCase() === mac) || {}).ip; const m = []; if (ip("00:1B:A9:4C:12:7E") !== "192.168.50.20") m.push("impresora .20"); if (ip("3C:52:82:AA:10:F4") !== "192.168.50.21") m.push("rayosx .21 (con su MAC completa)"); if (ip("70:5A:0F:C3:22:91") !== "192.168.50.22") m.push("portátil .22"); return !m.length || "Revisa: " + m.join(", ") + "."; } },
            ],
            sol: '# Configuración DHCP - Clínica Veterinaria Arnedo\nauthoritative;\noption domain-name "vetarnedo.lan";\noption domain-name-servers 192.168.50.5;\ndefault-lease-time 28800;\nmax-lease-time 86400;\n\nsubnet 192.168.50.0 netmask 255.255.255.0 {\n    range 192.168.50.100 192.168.50.199;\n    option routers 192.168.50.1;\n    option subnet-mask 255.255.255.0;\n    option broadcast-address 192.168.50.255;\n}\n\nhost impresora-recepcion {\n    hardware ethernet 00:1B:A9:4C:12:7E;\n    fixed-address 192.168.50.20;\n}\n\nhost pc-rayosx {\n    hardware ethernet 3C:52:82:AA:10:F4;\n    fixed-address 192.168.50.21;\n}\n\nhost portatil-direccion {\n    hardware ethernet 70:5A:0F:C3:22:91;\n    fixed-address 192.168.50.22;\n}',
            exp: "Tras guardarlo: <code>dhcpd -t -cf /etc/dhcp/dhcpd.conf</code> y <code>systemctl restart isc-dhcp-server</code>.", lang: "conf" },
          { tipo: "dhcp", titulo: "Reserva de la pantalla del hotel (concesión de 1 día)", nivel: "examen",
            enunciado: `<p>El hotel instala una pantalla de cartelería: MAC <code>2C:F0:5D:7A:11:E3</code>, siempre la <code>172.16.9.20</code>, y como se reinicia poco su concesión debe durar <b>1 día</b> aunque el resto siga con 2 h (global: <code>default-lease-time 7200; max-lease-time 21600;</code>).</p><p>Escribe el bloque completo que añadirías a <code>dhcpd.conf</code>.</p>`,
            inicio: "# Bloque para la pantalla del vestíbulo\n",
            checks: [
              { d: "Sintaxis correcta (; y llaves)", f: (c) => !c.d.avisos.length || "Revisa el recuadro rojo." },
              { d: "Un bloque <code>host nombre { … }</code>", f: (c) => c.d.hosts.length === 1 || "Debe haber exactamente un bloque host." },
              { d: "MAC <code>2C:F0:5D:7A:11:E3</code>", f: (c) => !!c.d.hosts[0] && c.d.hosts[0].mac.toUpperCase() === "2C:F0:5D:7A:11:E3", why: "<code>hardware ethernet 2C:F0:5D:7A:11:E3;</code>" },
              { d: "IP fija <code>172.16.9.20</code>", f: (c) => !!c.d.hosts[0] && c.d.hosts[0].ip === "172.16.9.20", why: "<code>fixed-address 172.16.9.20;</code>" },
              { d: "Concesión por defecto de 1 día dentro del host", f: (c) => !!c.d.hosts[0] && c.d.valor("default-lease-time", c.d.hosts[0].st) === "86400" || "<code>default-lease-time 86400;</code> dentro del bloque host (1 día = 86400 s)." },
              { d: "Máximo ampliado también (si no, el global de 6 h la recorta)", f: (c) => !!c.d.hosts[0] && +c.d.valor("max-lease-time", c.d.hosts[0].st) >= 86400 || "El max-lease-time global (21600) es menor que 86400 y manda: añade <code>max-lease-time 86400;</code> en el host." },
            ],
            sol: "host pantalla-vestibulo {\n  hardware ethernet 2C:F0:5D:7A:11:E3;\n  fixed-address 172.16.9.20;\n  default-lease-time 86400;\n  max-lease-time 86400;\n}",
            exp: "Las opciones de dentro de un host solo afectan a ese equipo. ¿Se podía haber usado la 172.16.8.150? No: está en el rango del personal. ¿Y la 172.16.10.0? Es una IP válida en la /22, pero está en el rango de huéspedes, así que tampoco.", lang: "conf" },
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "dns", nombre: "DNS: cómo se resuelve un nombre", desc: "recursiva/iterativa, raíz, caché y TTL, negativo, reenviadores, secundario",
        chuleta: `
<h3>Resolución sin reenviador (www.donostiakultura.eus, caché vacía)</h3>
<pre class="codigo" data-lang="conf">1. huésped   → srv-core               RECURSIVA  «dame la IP, apáñatelas»
2. srv-core  → servidor raíz (.)      iterativa  → «pregunta a los de .eus»
3. srv-core  → servidores de .eus     iterativa  → «pregunta a los de donostiakultura.eus»
4. srv-core  → autoritativo del dominio  iterativa → «la IP es X (TTL 1800 s)»
   srv-core  → huésped: la IP, y la guarda en caché</pre>
<ul>
<li><b>Recursiva</b>: el cliente quiere la respuesta final. <b>Iterativa</b>: cada servidor solo dice «pregunta a este otro».</li>
<li><code>root.hints</code>: lista con las IP de los servidores raíz. Sin ella el servidor no sabe por dónde empezar y no resuelve Internet.</li>
<li><b>Reenviador</b> (<code>forwarders</code>): en vez de ir a la raíz, pregunta a otro DNS (el del proveedor…).</li>
<li><b>Caché</b>: cada respuesta se guarda lo que diga su <b>TTL</b>. Los NS de .eus (TTL 1 día) evitan volver a la raíz.</li>
<li><b>TTL negativo</b> (último número del SOA): cuánto se recuerda un «ese nombre no existe» (NXDOMAIN).</li>
<li>Si el servidor es <b>autoritativo</b> para una zona (hoteljaizkibel.lan), contesta él mismo: no pregunta a nadie.</li>
</ul>
<h3>Recursión solo para los de casa</h3>
<pre class="codigo" data-lang="conf">// /etc/bind/named.conf.options
options {
    allow-recursion { 127.0.0.1; 172.16.8.0/22; };
};</pre>
<p>Un DNS abierto a Internet se usa para ataques de amplificación (DDoS) y envenenamiento de caché.</p>
<h3>Primario y secundario (valores del SOA)</h3>
<table>
<tr><th>Valor</th><th>Ejemplo</th><th>Significa</th></tr>
<tr><td>serial</td><td>2026111001</td><td>versión de la zona (AAAAMMDDnn). <b>Súbelo en cada cambio</b> o el secundario no se entera.</td></tr>
<tr><td>refresh</td><td>3600</td><td>cada cuánto el secundario mira si cambió el serial</td></tr>
<tr><td>retry</td><td>900</td><td>si falla, cada cuánto reintenta</td></tr>
<tr><td>expire</td><td>1209600 (14 días)</td><td>sin contactar con el primario tanto tiempo, el secundario deja de responder la zona</td></tr>
<tr><td>TTL negativo</td><td>3600</td><td>caché de respuestas «no existe»</td></tr>
</table>
<p>DNS usa el puerto <b>53</b> (UDP para consultas; TCP para transferencias de zona y respuestas grandes).</p>`,
        items: [
          { tipo: "ordena", q: "Un huésped pide www.donostiakultura.eus y la caché de srv-core está vacía. Ordena las consultas", items: ["Huésped → srv-core (recursiva)", "srv-core → servidor raíz (iterativa)", "srv-core → servidores de .eus (iterativa)", "srv-core → servidor autoritativo de donostiakultura.eus (iterativa)"], exp: "El cliente hace UNA consulta recursiva; srv-core hace las iterativas bajando por el árbol: raíz → dominio de primer nivel → dominio." },
          t("En ese caso, ¿quién hace la consulta recursiva?", [["El huésped (cliente) a srv-core", 1], ["srv-core a la raíz", 0, "La raíz solo da referencias: esa consulta es iterativa."], ["La raíz a .eus", 0, "Los servidores raíz no preguntan a nadie por ti."], ["Nadie", 0, "La del cliente es recursiva."]], "Recursiva = «dame la respuesta final». Es lo que piden los clientes a su DNS."),
          t("¿Para qué necesita srv-core el archivo <code>root.hints</code>?", [["Para conocer las IP de los servidores raíz y poder empezar a resolver", 1], ["Para guardar la zona hoteljaizkibel.lan", 0, "La zona va en db.hoteljaizkibel.lan."], ["Para saber qué clientes pueden preguntar", 0, "Eso es allow-recursion."], ["Para hacer de reenviador", 0, "Un reenviador se configura con forwarders."]], "Si root.hints estuviera vacío y no hay reenviadores, srv-core no podría resolver ningún nombre de Internet (solo los de sus propias zonas)."),
          t("La respuesta llegó a las 20:05 con TTL 1800 s. Otro huésped pide la misma web a las 20:20. ¿Qué consultas se hacen?", [["Solo la del huésped a srv-core: responde desde la caché", 1], ["Las cuatro otra vez", 0, "La respuesta sigue en caché hasta las 20:35."], ["Desde la raíz", 0, "No hace falta: la tiene guardada."], ["Ninguna", 0, "El huésped sí pregunta a srv-core."]], "20:05 + 1800 s (30 min) = válida hasta las 20:35."),
          t("Y otro huésped a las 20:50. ¿Qué consultas?", [["Huésped → srv-core y srv-core → autoritativo del dominio", 1], ["Las cuatro", 0, "Los NS de .eus y de donostiakultura.eus siguen en caché (TTL 1 día)."], ["Solo huésped → srv-core", 0, "La IP de la web caducó a las 20:35."], ["srv-core → raíz y .eus", 0, "Sabe ya quién es el autoritativo."]], "Caducó el registro A, pero no los NS: srv-core va directamente al servidor autoritativo."),
          t("A las 20:10 alguien escribe www.donostiakultra.eus (no existe). ¿A quién pregunta srv-core primero?", [["A los servidores de .eus, que ya tiene en caché", 1], ["A la raíz", 0, "Los NS de .eus están en caché (TTL 1 día) desde las 20:05."], ["A donostiakultura.eus", 0, "Es otro dominio distinto."], ["A nadie", 0, "No tiene nada guardado de ese nombre."]], ".eus responde NXDOMAIN (no existe), y srv-core guarda esa respuesta negativa durante el TTL negativo del SOA de .eus."),
          t("El TTL negativo del SOA de .eus es 3600 s. Si el dominio mal escrito se registra a las 20:15, ¿hasta qué hora como máximo srv-core seguirá diciendo que no existe?", [["21:10", 1], ["20:15", 0, "srv-core no se entera de que se ha registrado: tiene guardado el «no existe»."], ["21:15", 0, "La cuenta empieza cuando se guardó la respuesta (20:10), no cuando se registró."], ["Hasta mañana", 0, "La caché negativa dura el TTL negativo: 1 h."]], "La respuesta negativa se cacheó a las 20:10 → +3600 s → 21:10."),
          t("¿Pregunta srv-core a los servidores raíz por <code>reservas.hoteljaizkibel.lan</code>?", [["No: es autoritativo de esa zona y responde él mismo", 1], ["Sí, siempre empieza por la raíz", 0, "Solo para lo que no conoce."], ["Sí, si la caché está vacía", 0, "Los datos de sus zonas no dependen de la caché."], ["Pregunta a 8.8.8.8", 0, "No hay reenviador, y además es su propia zona."]], "Para las zonas que tiene en named.conf.local, el servidor tiene la respuesta oficial."),
          t("¿Qué línea limita la recursión a los equipos del hotel?", [["<code>allow-recursion { 127.0.0.1; 172.16.8.0/22; };</code>", 1], ["<code>forwarders { 172.16.8.0/22; };</code>", 0, "forwarders indica a qué DNS reenviar, no quién puede preguntar."], ["<code>allow-transfer { any; };</code>", 0, "Eso permite copiar la zona a cualquiera: ¡peligroso!"], ["<code>recursion no;</code>", 0, "Eso la desactiva para todos, incluidos los huéspedes."]], "Va en <code>named.conf.options</code>, dentro de <code>options { … };</code>."),
          t("¿Qué riesgo hay si cualquiera de Internet puede usar srv-core como DNS recursivo?", [["Que lo usen para ataques de amplificación DDoS y envenenamiento de caché", 1], ["Ninguno", 0, "Un «resolver abierto» es un problema de seguridad conocido."], ["Que se borre la zona", 0, "No pueden modificarla por consultar."], ["Que el DHCP deje de funcionar", 0, "No tiene relación."]], "Consultas pequeñas con IP falsificada provocan respuestas grandes hacia la víctima."),
          t("¿Por qué no dar a los huéspedes 1.1.1.1 por DHCP en vez de srv-core?", [["No resolverían los nombres internos (portal wifi, reservas…) y se pierde la caché común", 1], ["Porque 1.1.1.1 no funciona en España", 0, "Funciona en todo el mundo."], ["Porque es más lento siempre", 0, "No es el motivo principal."], ["Porque está prohibido", 0, "No está prohibido."]], "Un DNS público no sabe nada de hoteljaizkibel.lan."),
          t("En el SOA, ¿qué significa el 1209600 (expire)?", [["Si el secundario pasa 14 días sin hablar con el primario, deja de responder esa zona", 1], ["Cada 14 días se borra la caché", 0, "No es caché."], ["Los clientes guardan las respuestas 14 días", 0, "Eso sería un TTL."], ["La zona caduca a los 14 días aunque todo funcione", 0, "Si refresca bien, el contador se reinicia."]], "1209600 s / 86400 = 14 días. Si srv-core se apaga 3 semanas, a partir de los 14 días desde el último refresco correcto el secundario deja de responder la zona."),
          t("Cambias un registro de la zona y reinicias BIND, pero el secundario no se entera. ¿Qué has olvidado?", [["Incrementar el número de serie del SOA", 1], ["Reiniciar el DHCP", 0, "No tiene relación."], ["Cambiar el TTL", 0, "El TTL no avisa de cambios."], ["Borrar root.hints", 0, "Nada que ver."]], "El secundario compara el serial: si no sube, cree que no hay cambios. Formato AAAAMMDDnn: 2026111001 → 2026111002."),
          t("¿Qué puerto usa DNS?", [["53 (UDP para consultas, TCP para transferencias)", 1], ["67/68", 0, "Son de DHCP."], ["80", 0, "Es HTTP."], ["25", 0, "Es SMTP (correo)."]], "Puerto 53."),
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "zonas", nombre: "Zonas y registros en BIND9", desc: "SOA, NS, A, CNAME, MX, PTR, punto final, named.conf.local, comprobaciones",
        chuleta: `
<h3>Ficheros (Debian/Ubuntu)</h3>
<table>
<tr><td><code>/etc/bind/named.conf.local</code></td><td>declaración de las zonas</td></tr>
<tr><td><code>/etc/bind/db.empresa.lan</code></td><td>zona directa (nombre → IP)</td></tr>
<tr><td><code>/etc/bind/db.192.168.10</code></td><td>zona inversa (IP → nombre)</td></tr>
<tr><td><code>/etc/bind/named.conf.options</code></td><td>opciones (forwarders, allow-recursion)</td></tr>
<tr><td><code>/etc/resolv.conf</code> (cliente)</td><td><code>nameserver 192.168.10.1</code> · <code>search empresa.lan</code></td></tr>
</table>
<h3>named.conf.local</h3>
<pre class="codigo" data-lang="conf">zone "empresa.lan" {
    type master;
    file "/etc/bind/db.empresa.lan";
};
zone "10.168.192.in-addr.arpa" {
    type master;
    file "/etc/bind/db.192.168.10";
};</pre>
<h3>Zona directa</h3>
<pre class="codigo" data-lang="zona">$TTL 86400
@   IN  SOA  ns1.empresa.lan. admin.empresa.lan. (
        2026101901 ; serial (AAAAMMDDnn)
        3600       ; refresh
        1800       ; retry
        604800     ; expire
        86400 )    ; TTL negativo
@     IN  NS     ns1.empresa.lan.
@     IN  MX 10  mail.empresa.lan.
ns1   IN  A      192.168.10.1
www   IN  A      192.168.10.10
mail  IN  A      192.168.10.20
ftp   IN  CNAME  www</pre>
<h3>Zona inversa</h3>
<pre class="codigo" data-lang="zona">@     IN  NS   ns1.empresa.lan.
1     IN  PTR  ns1.empresa.lan.     ; 192.168.10.1
10    IN  PTR  www.empresa.lan.</pre>
<table>
<tr><th>Registro</th><th>Para qué</th><th>Ojo</th></tr>
<tr><td>SOA</td><td>datos de la zona</td><td>correo con punto: admin.empresa.lan.</td></tr>
<tr><td>NS</td><td>servidor DNS de la zona</td><td>no puede apuntar a un CNAME</td></tr>
<tr><td>A</td><td>nombre → IPv4</td><td>solo la IP, sin /22</td></tr>
<tr><td>CNAME</td><td>alias → nombre real</td><td>el alias no puede tener más registros</td></tr>
<tr><td>MX</td><td>servidor de correo + prioridad</td><td>no puede apuntar a un CNAME</td></tr>
<tr><td>PTR</td><td>IP → nombre (inversa)</td><td>uno por IP, al nombre canónico (nunca al alias), con punto final</td></tr>
</table>
<p class="ojo">Sin punto final, BIND pega el dominio detrás: «mail.empresa.lan» → mail.empresa.lan.empresa.lan.</p>
<p><code>@</code> = el propio dominio (el origen de la zona).</p>
<h3>Comprobar y reiniciar</h3>
<pre class="codigo" data-lang="conf">named-checkconf
named-checkzone empresa.lan /etc/bind/db.empresa.lan
named-checkzone 10.168.192.in-addr.arpa /etc/bind/db.192.168.10
systemctl restart bind9          # (o named)
nslookup www.empresa.lan         # dig www.empresa.lan
nslookup 192.168.10.10           # consulta inversa
nslookup -type=MX empresa.lan</pre>`,
        items: [
          t("¿Qué registro traduce un nombre a una dirección IPv4?", [["A", 1], ["PTR", 0, "PTR hace lo contrario: IP → nombre."], ["CNAME", 0, "CNAME es un alias hacia otro nombre."], ["NS", 0, "NS indica el servidor DNS de la zona."]], "A = Address. AAAA es lo mismo para IPv6."),
          t("¿Qué registro necesitas para que <code>ftp.empresa.lan</code> sea otro nombre de <code>www</code>?", [["CNAME", 1], ["A con la misma IP", 0, "Funcionaría, pero el enunciado pide un alias: si cambia la IP de www, habría que cambiar dos registros."], ["PTR", 0, "PTR es para la zona inversa."], ["MX", 0, "MX es para el correo."]], "<code>ftp IN CNAME www</code> (o <code>www.empresa.lan.</code>)."),
          t("¿Qué significa el punto final en <code>mail.empresa.lan.</code>?", [["Que el nombre es completo (absoluto) y BIND no le añade el dominio", 1], ["Que es el final de la línea", 0, "En los ficheros de zona el final de línea no lleva punto."], ["Nada, es opcional", 0, "No es opcional: sin él cambia el nombre."], ["Que es un alias", 0, "Los alias son los CNAME."]], "Sin punto, el nombre es relativo y se le añade el origen: <code>mail.empresa.lan</code> → <code>mail.empresa.lan.empresa.lan.</code>."),
          t("En la clínica: <code>@ IN MX 10 correo.vetarnedo.lan</code>. ¿Qué pasa?", [["Los correos externos no llegan: el MX apunta a correo.vetarnedo.lan.vetarnedo.lan", 1], ["Nada, funciona", 0, "Falta el punto final."], ["La zona no carga", 0, "Carga, pero con un dato erróneo."], ["El correo llega con prioridad 0", 0, "La prioridad sí es 10."]], "Corrección: <code>@ IN MX 10 correo.vetarnedo.lan.</code>"),
          t("¿Cómo se escribe en el SOA el correo <code>admin@empresa.lan</code>?", [["<code>admin.empresa.lan.</code>", 1], ["<code>admin@empresa.lan</code>", 0, "La @ en un fichero de zona significa «el origen»; el correo se escribe con punto."], ["<code>admin@empresa.lan.</code>", 0, "Tampoco con @."], ["<code>\"admin@empresa.lan\"</code>", 0, "No va entre comillas."]], "La primera @ del correo se cambia por un punto, y se acaba con punto."),
          t("¿Qué está mal en <code>citas IN A web.vetarnedo.lan.</code>?", [["Un registro A necesita una IP; para un alias es CNAME", 1], ["Falta el punto final", 0, "El punto está."], ["citas debería llevar punto", 0, "El nombre relativo está bien."], ["Nada", 0, "A + nombre es un error."]], "Corrección: <code>citas IN CNAME web.vetarnedo.lan.</code>"),
          t("named-checkzone dice: <code>NS 'ns1.hoteljaizkibel.lan' is a CNAME (illegal)</code>. ¿Qué corriges?", [["El NS debe apuntar al nombre real (dns.hoteljaizkibel.lan.), no al alias ns1", 1], ["Borrar el registro A de dns", 0, "Ese es el que hace falta."], ["Poner ns1 como A además de CNAME", 0, "Un nombre con CNAME no puede tener más registros."], ["Cambiar el serial", 0, "No soluciona nada."]], "NS y MX siempre apuntan a nombres con registro A, nunca a alias (CNAME)."),
          t("<code>wifi IN A 172.16.9.1/22</code> → named-checkzone dice <code>bad dotted quad</code>. ¿Por qué?", [["En un registro A va solo la IP, sin máscara", 1], ["Porque 172.16.9.1 no es válida", 0, "Es válida en la /22."], ["Porque wifi es palabra reservada", 0, "No lo es."], ["Porque falta el punto final", 0, "Las IP no llevan punto final."]], "«dotted quad» = cuatro números separados por puntos. La máscara no pinta nada en DNS."),
          w("Escribe el registro A para que <code>www</code> sea <code>192.168.10.10</code> (zona empresa.lan).", ["www IN A 192.168.10.10", "www.empresa.lan. IN A 192.168.10.10"], "Nombre · clase IN · tipo A · IP.", { modo: "conf", fallos: [{ si: ["www.empresa.lan IN A 192.168.10.10"], why: "Sin punto final, se convierte en www.empresa.lan.empresa.lan. O pones solo <code>www</code> o el nombre completo con punto." }, { si: ["www IN PTR 192.168.10.10"], why: "PTR es para la zona inversa. Nombre → IP es A." }] }),
          w("Escribe el registro MX: correo del dominio a <code>mail.empresa.lan</code> con prioridad 10.", ["@ IN MX 10 mail.empresa.lan.", "@ IN MX 10 mail", "empresa.lan. IN MX 10 mail.empresa.lan.", "IN MX 10 mail.empresa.lan."], "<code>@ IN MX 10 mail.empresa.lan.</code> — el número es la prioridad (menor = preferido).", { modo: "conf", fallos: [{ si: ["@ IN MX 10 mail.empresa.lan", "@ IN MX mail.empresa.lan. 10"], why: "Revisa: la prioridad va antes del nombre, y el nombre completo lleva punto final." }] }),
          g("inversa"), g("inversa22"),
          t("En la inversa de la clínica: <code>192.168.50.22 IN PTR portatil-direccion.vetarnedo.lan.</code> ¿Qué falla?", [["El nombre del registro debe ser solo 22; así queda 192.168.50.22.50.168.192.in-addr.arpa", 1], ["Debería ser un registro A", 0, "En la inversa se usan PTR."], ["Falta el punto final del nombre", 0, "El nombre de la derecha sí lo tiene."], ["Nada", 0, "nslookup 192.168.50.22 no devuelve nada."]], "Corrección: <code>22 IN PTR portatil-direccion.vetarnedo.lan.</code>"),
          t("¿Por qué sobra <code>10 IN PTR historiales.vetarnedo.lan.</code> si ya está <code>10 IN PTR ficheros.vetarnedo.lan.</code>?", [["Cada IP debe tener un solo PTR, hacia el nombre real (no al alias)", 1], ["No sobra, todos los nombres llevan PTR", 0, "Los alias no llevan PTR."], ["Porque historiales debería ser A", 0, "historiales es un CNAME en la directa."], ["Porque falta el serial", 0, "No tiene relación."]], "Con dos PTR, nslookup de la IP devuelve dos nombres distintos (incidencia típica de examen)."),
          t("¿Qué declaración de <code>named.conf.local</code> es correcta para la zona inversa de 192.168.10.0/24?", [["<code>zone \"10.168.192.in-addr.arpa\" { type master; file \"/etc/bind/db.192.168.10\"; };</code>", 1], ["<code>zone \"192.168.10.in-addr.arpa\" { type master; file \"/etc/bind/db.192.168.10\"; };</code>", 0, "Los octetos van al revés en el nombre de la zona."], ["<code>zone \"10.168.192.in-addr.arpa\" { type master; file \"/etc/bind/db.192.168.10\" }</code>", 0, "Faltan los ; tras file y tras la llave final."], ["<code>zone 10.168.192 { master; db.192.168.10; };</code>", 0, "Faltan comillas, in-addr.arpa, type y file."]], "Dos puntos y coma que se olvidan siempre: después de la ruta y después de la llave de cierre."),
          t("¿Qué comando comprueba un fichero de zona?", [["<code>named-checkzone empresa.lan /etc/bind/db.empresa.lan</code>", 1], ["<code>named-checkconf /etc/bind/db.empresa.lan</code>", 0, "named-checkconf revisa named.conf y sus includes, no el contenido de las zonas."], ["<code>dhcpd -t</code>", 0, "Es para el DHCP."], ["<code>nslookup -check</code>", 0, "No existe esa opción."]], "named-checkzone necesita el nombre de la zona y el fichero."),
          t("Desde un PC: <code>nslookup citas.vetarnedo.lan</code> (citas es alias de web, .11). ¿Qué responde?", [["Que el nombre canónico es web.vetarnedo.lan y su dirección 192.168.50.11", 1], ["Solo 192.168.50.11", 0, "nslookup muestra también que es un alias (canonical name)."], ["No existe", 0, "Con la zona corregida sí existe."], ["mail exchanger = correo", 0, "Eso sería con -type=MX."]], "Con un CNAME, nslookup enseña el «canonical name» y luego la IP."),
          t("¿Qué responde <code>nslookup -type=MX vetarnedo.lan</code> con la zona corregida?", [["<code>mail exchanger = 10 correo.vetarnedo.lan.</code>", 1], ["<code>192.168.50.12</code>", 0, "Pide el registro MX, que da el nombre del servidor y la prioridad."], ["<code>name = correo.vetarnedo.lan</code>", 0, "Eso es una respuesta PTR."], ["Nada", 0, "Sí hay un MX."]], "MX = prioridad + servidor de correo."),
          t("¿Qué escribes en <code>/etc/resolv.conf</code> del cliente pc1 para que use ns1?", [["<code>nameserver 192.168.10.1</code>", 1], ["<code>dns 192.168.10.1</code>", 0, "La palabra clave es nameserver."], ["<code>nameserver ns1.empresa.lan</code>", 0, "Debe ser una IP: todavía no puede resolver nombres."], ["<code>server = 192.168.10.1</code>", 0, "No es el formato."]], "Opcional: <code>search empresa.lan</code> para poder escribir solo «www»."),
          { tipo: "bugs", q: "Clínica Arnedo · zona directa", archivo: "/etc/bind/db.vetarnedo.lan", extra: INV_CLINICA, lineas: CLINICA_DIRECTA,
            errores: { 10: { fix: "@                   IN  MX 10  correo.vetarnedo.lan.", why: "Falta el punto final: el MX apuntaría a correo.vetarnedo.lan.vetarnedo.lan y no llega el correo de fuera." }, 18: { fix: "citas               IN  CNAME  web.vetarnedo.lan.", why: "citas es un alias de web: CNAME, no A (un A lleva IP)." }, 19: { fix: "correo              IN  A      192.168.50.12", why: "El servidor de correo es la .12; la .21 es el PC de radiología (ping a correo le responde rayos X)." } },
            trampas: { 21: "Correcta: rayosx sí es la .21.", 15: "Correcta: historiales es alias de ficheros.", 7: "Correcta: el paréntesis cierra el SOA y el ; abre el comentario." },
            exp: "3 errores en la directa: punto final, tipo de registro y dato." },
          { tipo: "bugs", q: "Clínica Arnedo · zona inversa", archivo: "/etc/bind/db.192.168.50", extra: INV_CLINICA, lineas: CLINICA_INVERSA,
            errores: { 8: { tipo: "R", fix: "(borrar la línea)", why: "historiales es un alias: no lleva PTR. Con dos PTR, nslookup 192.168.50.10 devuelve dos nombres." }, 13: { tipo: "S/D", fix: "22             IN  PTR  portatil-direccion.vetarnedo.lan.", why: "Dentro de la zona solo se escribe el último octeto. Con la IP entera y sin punto, el nombre queda absurdo." } },
            trampas: { 6: "Correcta: ns1 (srv01) es la .5." },
            exp: "En la inversa: un PTR por IP, solo lo que falta del nombre (el 4º octeto) y nombre completo con punto a la derecha." },
          { tipo: "bugs", q: "Hotel Jaizkibel · zona directa", archivo: "/etc/bind/db.hoteljaizkibel.lan", extra: INV_HOTEL, lineas: HOTEL_DIRECTA,
            errores: { 9: { tipo: "R", fix: "@           IN  NS     dns.hoteljaizkibel.lan.", why: "ns1 es un CNAME: un NS no puede apuntar a un alias." }, 10: { tipo: "R", fix: "@           IN  MX  10 correo.hoteljaizkibel.lan.", why: "smtp es un CNAME: un MX no puede apuntar a un alias." }, 19: { tipo: "D", fix: "booking     IN  CNAME  web.hoteljaizkibel.lan.", why: "Falta el punto final: apunta a web.hoteljaizkibel.lan.hoteljaizkibel.lan, que no existe." }, 22: { tipo: "S", fix: "wifi        IN  A      172.16.9.1", why: "En un A solo va la IP: con /22 da «bad dotted quad» y la zona no carga." }, 24: { tipo: "D", fix: "tpv         IN  A      172.16.8.50", why: "El TPV es la .8.50 (la .150 era el error del DHCP)." } },
            trampas: { 13: "Correcta: un CNAME puede apuntar a un nombre relativo (dns) sin punto.", 26: "Correcta: 172.16.9.255 es una IP de host en la /22.", 14: "Correcta: el router es la última útil, 172.16.11.254." },
            exp: "5 errores en la directa del hotel." },
          { tipo: "bugs", q: "Hotel Jaizkibel · zona inversa (16.172.in-addr.arpa)", archivo: "/etc/bind/db.172.16", extra: INV_HOTEL, lineas: HOTEL_INVERSA,
            errores: { 9: { tipo: "R", fix: "(borrar la línea)", why: "booking es un alias: sobra su PTR (nslookup 172.16.8.11 devuelve dos nombres)." }, 10: { tipo: "D", fix: "12.8       IN  PTR    correo.hoteljaizkibel.lan.", why: "Al revés: la IP 172.16.8.12 en esta zona se escribe 12.8." }, 14: { tipo: "R", fix: "255.9      IN  PTR    cerraduras.hoteljaizkibel.lan.", why: "En la inversa se usan PTR. Con CNAME nslookup devuelve un canonical name." } },
            trampas: { 5: "Correcta: 172.16.11.254 → 254.11 (al revés).", 12: "Correcta: el TPV es la .8.50 → 50.8." },
            exp: "Como la zona es 16.172.in-addr.arpa, cada PTR lleva dos octetos, en orden inverso." },
        ],
        labs: [
          { tipo: "zona", origen: "empresa.lan", titulo: "Zona directa de empresa.lan (ejercicio BIND9, tarea 1)", nivel: "examen", lang: "zona",
            enunciado: `<p>Escribe <code>/etc/bind/db.empresa.lan</code> completo:</p><ul><li>TTL por defecto de 1 día (86400 s).</li><li>SOA con ns1 como servidor, correo del responsable <code>admin@empresa.lan</code> y los cinco valores (serial con formato AAAAMMDDnn).</li><li>NS: ns1. MX: mail con prioridad 10.</li><li>A: ns1 192.168.10.1 · www 192.168.10.10 · mail 192.168.10.20 · pc1 192.168.10.101.</li><li>CNAME: ftp como alias de www.</li></ul>`,
            inicio: "; /etc/bind/db.empresa.lan\n",
            checks: [
              { d: "<code>$TTL 86400</code>", f: (c) => /^(86400|1d)$/i.test(c.z.ttl || "") || (c.z.ttl ? `Tienes $TTL ${H().esc(c.z.ttl)}; un día son 86400 s.` : "Falta la directiva <code>$TTL 86400</code> en la primera línea.") },
              { d: "SOA con servidor <code>ns1.empresa.lan.</code> y correo <code>admin.empresa.lan.</code>", f: (c) => { if (!c.z.soa) return "No encuentro el registro SOA (<code>@ IN SOA … ( … )</code>)."; if (c.z.soa.ns !== "ns1.empresa.lan.") return `El servidor del SOA queda como <code>${H().esc(c.z.soa.ns)}</code>.`; return c.z.soa.mail === "admin.empresa.lan." || `El correo queda como <code>${H().esc(c.z.soa.mail)}</code>: escríbelo <code>admin.empresa.lan.</code>`; } },
              { d: "Cinco valores numéricos y serial AAAAMMDDnn", f: (c) => { if (!c.z.soa) return false; const n = c.z.soa.nums; if (n.length !== 5) return `Hay ${n.length} valores; deben ser 5.`; return /^20\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{2}$/.test(n[0]) || "El serial debe tener 10 dígitos: año, mes, día y número de cambio (p. ej. 2026101901)."; } },
              rec("@", "NS", "ns1.empresa.lan.", "NS → <code>ns1.empresa.lan.</code>"),
              rec("@", "MX", ["10", "mail.empresa.lan."], "MX 10 → <code>mail.empresa.lan.</code>"),
              rec("ns1", "A", "192.168.10.1", "ns1 → 192.168.10.1"),
              rec("www", "A", "192.168.10.10", "www → 192.168.10.10"),
              rec("mail", "A", "192.168.10.20", "mail → 192.168.10.20"),
              rec("pc1", "A", "192.168.10.101", "pc1 → 192.168.10.101"),
              rec("ftp", "CNAME", "www.empresa.lan.", "ftp alias (CNAME) de www"),
              sinAvisos,
            ],
            sol: "$TTL 86400\n@   IN  SOA  ns1.empresa.lan. admin.empresa.lan. (\n        2026101901 ; serial\n        3600       ; refresh\n        1800       ; retry\n        604800     ; expire\n        86400 )    ; TTL negativo\n;\n@     IN  NS     ns1.empresa.lan.\n@     IN  MX 10  mail.empresa.lan.\n;\nns1   IN  A      192.168.10.1\nwww   IN  A      192.168.10.10\nmail  IN  A      192.168.10.20\npc1   IN  A      192.168.10.101\nftp   IN  CNAME  www.empresa.lan.",
            exp: "Nombres a la izquierda relativos (sin punto) o completos con punto; a la derecha, mejor siempre completos con punto final." },
          { tipo: "zona", origen: "10.168.192.in-addr.arpa", titulo: "Zona inversa db.192.168.10 (tarea 2)", nivel: "examen", lang: "zona",
            enunciado: `<p>Escribe <code>/etc/bind/db.192.168.10</code>: TTL, SOA (igual que la directa), NS y un PTR para cada uno de los cuatro equipos: ns1 (.1), www (.10), mail (.20) y pc1 (.101). El ftp es un alias: ¿lleva PTR?</p>`,
            inicio: "; /etc/bind/db.192.168.10  (zona 10.168.192.in-addr.arpa)\n",
            checks: [
              { d: "<code>$TTL</code> y SOA", f: (c) => (!!c.z.ttl && !!c.z.soa && c.z.soa.ns === "ns1.empresa.lan." && c.z.soa.nums.length === 5) || "Revisa el $TTL y el SOA: el servidor debe ser <code>ns1.empresa.lan.</code> (completo, con punto) y llevar 5 números." },
              rec("@", "NS", "ns1.empresa.lan.", "NS → <code>ns1.empresa.lan.</code> (con punto: aquí el origen es la zona inversa)"),
              rec("1", "PTR", "ns1.empresa.lan.", "1 → ns1.empresa.lan."),
              rec("10", "PTR", "www.empresa.lan.", "10 → www.empresa.lan."),
              rec("20", "PTR", "mail.empresa.lan.", "20 → mail.empresa.lan."),
              rec("101", "PTR", "pc1.empresa.lan.", "101 → pc1.empresa.lan."),
              { d: "Sin PTR para el alias ftp", f: (c) => !c.z.recs.some((r) => r.tipo === "PTR" && /^ftp\./.test(c.z.abs(r.datos[0] || ""))) || "ftp es un CNAME: los alias no tienen PTR (cada IP apunta a su nombre canónico)." },
              sinAvisos,
            ],
            sol: "$TTL 86400\n@   IN  SOA  ns1.empresa.lan. admin.empresa.lan. (\n        2026101901 3600 1800 604800 86400 )\n;\n@     IN  NS   ns1.empresa.lan.\n;\n1     IN  PTR  ns1.empresa.lan.\n10    IN  PTR  www.empresa.lan.\n20    IN  PTR  mail.empresa.lan.\n101   IN  PTR  pc1.empresa.lan.",
            exp: "En la inversa el origen es 10.168.192.in-addr.arpa, así que TODOS los nombres de empresa.lan deben ir completos y con punto. Un «ns1» suelto sería ns1.10.168.192.in-addr.arpa." },
          { tipo: "texto", titulo: "Declarar las zonas en named.conf.local", nivel: "intermedio", lang: "conf",
            enunciado: `<p>Escribe lo que añadirías a <code>/etc/bind/named.conf.local</code> para declarar como <b>maestro</b> la zona directa <code>empresa.lan</code> (fichero <code>/etc/bind/db.empresa.lan</code>) y la inversa de <code>192.168.10.0/24</code> (fichero <code>/etc/bind/db.192.168.10</code>).</p>`,
            inicio: "// /etc/bind/named.conf.local\n",
            checks: (function () {
              const bloque = (src, nombre) => src.replace(/\/\/.*$/gm, "").match(new RegExp('zone\\s+"' + nombre.replace(/\./g, "\\.") + '"\\s*(?:IN\\s*)?\\{([\\s\\S]*?)\\}(\\s*;)?', "i"));
              const comp = (nombre, fichero) => (c) => {
                const m = bloque(c.src, nombre);
                if (!m) return /zone\s+"?192\.168\.10/.test(c.src) && nombre.includes("arpa") ? "La zona inversa se llama <code>10.168.192.in-addr.arpa</code> (octetos al revés)." : `No encuentro <code>zone "${nombre}" { … };</code> (con comillas).`;
                const cuerpo = m[1];
                if (!/type\s+(master|primary)\s*;/i.test(cuerpo)) return "Dentro de las llaves falta <code>type master;</code> (con su punto y coma).";
                if (!new RegExp('file\\s+"' + fichero.replace(/\./g, "\\.") + '"\\s*;').test(cuerpo)) return `Falta <code>file "${fichero}";</code> (ruta completa, entre comillas y con <code>;</code>).`;
                if (!m[2]) return "Después de la llave de cierre va <code>;</code> → <code>};</code>";
                return true;
              };
              return [
                { d: "Zona directa <code>empresa.lan</code>", f: comp("empresa.lan", "/etc/bind/db.empresa.lan") },
                { d: "Zona inversa <code>10.168.192.in-addr.arpa</code>", f: comp("10.168.192.in-addr.arpa", "/etc/bind/db.192.168.10") },
              ];
            })(),
            sol: 'zone "empresa.lan" {\n    type master;\n    file "/etc/bind/db.empresa.lan";\n};\n\nzone "10.168.192.in-addr.arpa" {\n    type master;\n    file "/etc/bind/db.192.168.10";\n};',
            exp: "Después: <code>named-checkconf</code>, <code>named-checkzone</code> de las dos zonas y <code>systemctl restart bind9</code>." },
        ],
      },
      /* ------------------------------------------------------------ */
      {
        id: "casos", nombre: "Casos: de la incidencia al error", desc: "lo que cuenta el usuario → qué línea falla y por qué",
        chuleta: `
<h3>Cómo atacar un caso de examen</h3>
<ol>
<li><b>Primero la red</b>: máscara, difusión, primera y última útil. Así sabrás qué IPs «raras» son correctas.</li>
<li><b>DHCP línea a línea</b>: ¿cada <code>;</code>? ¿subnet casa con la máscara? ¿range dentro de la red y sin pisar fijas, router ni difusión? ¿routers, DNS interno, broadcast? ¿tiempos en segundos? ¿MAC de 6 pares hex? ¿reservas fuera del rango?</li>
<li><b>Zona directa</b>: punto final en nombres completos, A solo con IP, alias con CNAME, NS/MX al nombre real, IPs del inventario.</li>
<li><b>Zona inversa</b>: octetos al revés, un PTR por IP, al nombre real, nada de CNAME.</li>
<li><b>Después de cualquier cambio en zonas: subir el serial.</b></li>
</ol>
<h3>Síntoma → sospechoso habitual</h3>
<table>
<tr><th>Lo que cuenta el usuario</th><th>Mira…</th></tr>
<tr><td>El servicio DHCP no arranca</td><td><code>;</code>, MAC mal escrita, subnet/netmask, range fuera de red o con octeto &gt; 255</td></tr>
<tr><td>Hay red local pero no Internet</td><td><code>option routers</code></td></tr>
<tr><td>Internet sí, nombres internos no</td><td><code>domain-name-servers</code> apuntando fuera</td></tr>
<tr><td>«Conflicto de direcciones IP»</td><td>reserva dentro del rango dinámico o dos equipos con la misma IP</td></tr>
<tr><td>Un equipo con reserva recibe IP aleatoria</td><td>MAC de la reserva mal escrita</td></tr>
<tr><td>Se cae la conexión cada X minutos</td><td><code>max-lease-time</code> / <code>default-lease-time</code></td></tr>
<tr><td>La difusión no llega (impresoras…)</td><td><code>broadcast-address</code></td></tr>
<tr><td>El correo de fuera no llega</td><td>MX sin punto final o apuntando a un CNAME</td></tr>
<tr><td>Ping a un nombre responde otro equipo</td><td>IP equivocada en un registro A</td></tr>
<tr><td>nslookup IP → dos nombres / nada</td><td>PTR de más (alias) / PTR mal escrito</td></tr>
</table>`,
        items: [
          t("Clínica: «Tras el último cambio isc-dhcp-server no arranca». ¿Qué errores lo provocan?", [["netmask 255.255.0.0, rango hasta .299, MAC incompleta de rayosx y el ; que falta en el portátil", 1], ["El DNS 8.8.8.8", 0, "Es una opción válida: no impide arrancar."], ["El max-lease-time de 3600", 0, "Es un valor válido aunque sea incorrecto para la clínica."], ["El router .254", 0, "Dato erróneo, pero no impide arrancar."]], "Solo los errores de sintaxis o de declaración imposible (S) paran el servicio. Los de dato (D) dejan arrancar pero fallan después."),
          t("Clínica: «Los PC abren \\\\192.168.50.10 sin problema, pero no navegan por Internet».", [["<code>option routers 192.168.50.254</code>: la puerta de enlace no es el router (.1)", 1], ["El DNS interno", 0, "Con el DNS mal fallarían los nombres, no la salida a Internet."], ["La máscara", 0, "Ya la red local funciona."], ["El MX", 0, "Es de correo."]], "Red local OK + Internet KO = puerta de enlace."),
          t("Clínica: «Internet ya funciona, pero nadie abre historiales.vetarnedo.lan ni www.vetarnedo.lan (por IP sí)».", [["El DHCP reparte 8.8.8.8 como DNS: no conoce la zona interna", 1], ["Falta el punto en el MX", 0, "Eso afecta al correo."], ["El PTR de historiales", 0, "La inversa no interviene en resolver un nombre."], ["El router", 0, "Internet ya funciona."]], "Por IP funciona y por nombre no = problema de DNS."),
          t("Clínica: «La impresora unas veces imprime y otras no; un portátil de un cliente mostró conflicto de IP».", [["La reserva de la impresora es la .150, que está dentro del rango dinámico", 1], ["La MAC de rayosx", 0, "Es otro equipo."], ["La difusión .255", 0, "Es correcta."], ["El serial de la zona", 0, "No provoca conflictos de IP."]], "El servidor puede dar la .150 a un portátil mientras la impresora también la usa."),
          t("Clínica: «Cada vez que la directora enciende su portátil, la web de citas deja de funcionar para todos».", [["La reserva del portátil le da la .11, que es la IP del servidor web", 1], ["citas es un registro A mal hecho", 0, "Eso rompería citas siempre, no solo al encender el portátil."], ["La MAC del portátil", 0, "La MAC es correcta."], ["El DNS", 0, "El problema aparece al encender el portátil: conflicto de IP."]], "Dos equipos con la misma IP: el tráfico de la web acaba en el portátil."),
          t("Clínica: «Un técnico hace ping a correo.vetarnedo.lan y le responde el PC de radiología».", [["El registro A de correo tiene la .21 (la de rayosx) en vez de la .12", 1], ["El MX sin punto", 0, "Eso afecta al MX, no a un ping al nombre."], ["La reserva de rayosx", 0, "Rayos tiene bien la .21."], ["El PTR de correo", 0, "El ping usa la directa."]], "Nombre → IP equivocada en la zona directa."),
          t("Hotel: «Con todo arrancado, un portátil Linux tiene <code>172.16.10.8/22 brd 172.16.8.255</code> y no encuentra impresoras por difusión».", [["<code>option broadcast-address 172.16.8.255</code>: en la /22 la difusión es 172.16.11.255", 1], ["La máscara /22", 0, "/22 es correcta."], ["El rango de huéspedes", 0, "La IP es válida."], ["El DNS", 0, "La búsqueda por difusión no usa DNS."]], "La difusión mal configurada hace que los mensajes «a todos» no lleguen a todos."),
          t("Hotel: «El TPV ya tiene la 172.16.8.50, pero la aplicación de caja no encuentra tpv.hoteljaizkibel.lan».", [["En la zona directa tpv sigue apuntando a 172.16.8.150", 1], ["Falta un CNAME de tpv", 0, "No tiene alias."], ["La reserva del TPV", 0, "Ya está bien (.50)."], ["El NS", 0, "El resto de nombres funcionan."]], "Al cambiar una IP hay que actualizar DHCP, zona directa e inversa (y subir el serial)."),
          t("Hotel: <code>nslookup booking…</code> no encuentra el nombre, <code>nslookup 172.16.8.11</code> devuelve dos nombres, <code>nslookup 172.16.8.12</code> nada y <code>172.16.9.255</code> un canonical name. ¿Cuántos errores hay detrás?", [["Cuatro: booking sin punto, PTR de booking que sobra, 8.12 al revés y CNAME en vez de PTR", 1], ["Uno: el serial", 0, "Son síntomas distintos con causas distintas."], ["Dos: los dos de booking", 0, "Faltan los de correo y cerraduras."], ["Ninguno, es la caché", 0, "Son errores en los ficheros."]], "Una incidencia puede mezclar varios errores: piensa en cada consulta por separado."),
          t("Para la pantalla del hotel (172.16.9.20, alias cartel e info), ¿qué línea añades a la <b>zona inversa</b> (16.172.in-addr.arpa)?", [["<code>20.9 IN PTR pantalla.hoteljaizkibel.lan.</code>", 1], ["<code>9.20 IN PTR pantalla.hoteljaizkibel.lan.</code>", 0, "Los octetos van al revés: primero el 20, luego el 9."], ["<code>20 IN PTR pantalla.hoteljaizkibel.lan.</code>", 0, "En esta zona faltan dos octetos, no uno."], ["<code>20.9 IN PTR cartel.hoteljaizkibel.lan.</code>", 0, "El PTR va al nombre real, no a un alias."]], "Y en la directa: <code>pantalla IN A 172.16.9.20</code>, <code>cartel IN CNAME pantalla</code>, <code>info IN CNAME pantalla</code>. Después: subir el serial en las dos zonas, <code>named-checkzone</code> ×2, <code>dhcpd -t</code> y reiniciar bind9 e isc-dhcp-server."),
        ],
        labs: [
          { tipo: "zona", origen: "hoteljaizkibel.lan", titulo: "Registros DNS de la pantalla del hotel", nivel: "examen", lang: "zona",
            enunciado: `<p>Escribe las líneas que añadirías a la zona directa <code>db.hoteljaizkibel.lan</code> para la pantalla <code>pantalla.hoteljaizkibel.lan</code> (172.16.9.20) con los alias <code>cartel</code> e <code>info</code>. Solo las líneas nuevas.</p>`,
            inicio: "; líneas nuevas en /etc/bind/db.hoteljaizkibel.lan\n",
            checks: [
              rec("pantalla", "A", "172.16.9.20", "pantalla IN A 172.16.9.20"),
              rec("cartel", "CNAME", "pantalla.hoteljaizkibel.lan.", "cartel → alias de pantalla"),
              rec("info", "CNAME", "pantalla.hoteljaizkibel.lan.", "info → alias de pantalla"),
              { d: "Solo un registro A (los alias no llevan A)", f: (c) => c.z.recs.filter((r) => r.tipo === "A").length === 1 || "Los alias se hacen con CNAME, no repitiendo registros A." },
              sinAvisos,
            ],
            sol: "pantalla    IN  A      172.16.9.20\ncartel      IN  CNAME  pantalla\ninfo        IN  CNAME  pantalla",
            exp: "Y no olvides subir el serial (2026111001 → 2026111002) en las dos zonas, añadir <code>20.9 IN PTR pantalla.hoteljaizkibel.lan.</code> en la inversa y reiniciar bind9." },
        ],
      },
    ],
  };
})();
