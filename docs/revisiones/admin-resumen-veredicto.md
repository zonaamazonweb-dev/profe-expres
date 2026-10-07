# VEREDICTO revisor-visual — admin resumen
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/resumen-375-2.png
Usabilidad: 27/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: (1) Sobrecarga: 3 alertas rojas/ámbar + 2 héroes + 4 stats + gráfico + acordeón; más de 4 bloques en la primera vista, sin una sola acción primaria clara -> colapsar alertas a 1 destacada + "ver N más" y bajar el nº de stats. (2) Movimiento 0: código admin sin motion, sin stagger, sin conteo de héroes, sin whileTap/active:scale, sin reduced-motion; sin skeleton/loading de la página -> añadir entrada escalonada, conteo y tap feedback. (3) Gráfico "Ventas por día": barras finísimas con un pico de 120 y dos de ~20, eje con huecos, sin etiquetas ni insight -> barras anchas, valor directo sobre el dato y frase interpretada. (4) Nav superior cortada ("Ganancia real" al borde, resto de pestañas oculto sin indicio de scroll) y tarjeta "Qué está conectado" con espacio vacío inferior -> fade/indicador de scroll en la nav y ajustar padding de la tarjeta. (5) Identidad plana: sin anillo ownable ni 2ª nota ni textura; fondo casi plano -> añadir el anillo/detalle firma de la ficha en el héroe. Nota: el badge "N" negro tapa texto de la 3ª alerta (indicador de dev de Next, no del producto; verificar en build). Verificaciones de h3/h7 en código: no hay undo/atajos en esta pantalla (solo lectura; filtro de rango por enlaces).
