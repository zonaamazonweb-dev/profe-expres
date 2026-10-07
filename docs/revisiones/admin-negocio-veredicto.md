# VEREDICTO revisor-visual — admin-negocio
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/negocio-375-1.png (+ negocio-375-2.png)
Usabilidad: 24/40
Craft: 8/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Tarjetas "Por canal", 7 datos x canal] Sobrecarga: 7 métricas de igual peso (13px, labels 10.5px) en 4 filas por tarjeta, sin dato héroe ni veredicto; la lectura accionable ("pierdes dinero, pausa X", "podrías invertir más") queda en 12.5px gris/ámbar bajo el título. Fix: poner el veredicto como primera línea grande con color semántico, mostrar 3 datos (gastaste, costo por clienta, recuperas por cada 1) y mover el resto a "Ver detalle".
2. [Tabla de gastos, parte baja] A 375px la columna Monto y el botón "Quitar" quedan fuera de vista (min-w 560 con scroll horizontal oculto); la cifra clave no se ve. Además "Quitar" borra sin confirmación ni deshacer (h3). Fix: lista de tarjetas en móvil (canal + periodo + monto) y confirmar/deshacer al quitar.
3. [Títulos de tarjeta y estados vacíos] Nombres crudos "ads_meta", "afiliado" y "(USD)"; "Sin datos" repetido 3-4 veces por tarjeta, más una fila huérfana "Meses para recuperar". Fix: etiquetas legibles ("Anuncios en Meta"), ocultar métricas sin datos y dejar una sola frase explicando qué falta.
4. [Toda la pantalla] Craft plano: sin jerarquía de 4 niveles, sin motion de entrada ni conteo, sin dispositivo ownable más allá de Baloo/Nunito de la ficha (la paleta sí coincide con la ficha). Fix: dato héroe por tarjeta con conteo y stagger.
Verificación en código: no hay motion ni reduced-motion en la pantalla; sin atajos más allá del rango por defecto (h7).
