# VEREDICTO revisor-visual — admin-resumen
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/resumen-375-1.png (+ -2.png, -3.png)
Usabilidad: 26/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Sobrecarga cognitiva: ~14 bloques (3 alertas largas + 2 heroes + 7 stats + gráfico + lista de 5 conexiones), gasto IA duplicado (alerta y tarjeta), 2 stats "Sin datos"/redundantes. 2) Gráfico "Ventas por día": curva suavizada (monotone) dibuja una campana falsa por 1 sola venta, y el tooltip queda fijo mostrando "Ventas BRL : 0 BRL" (texto crudo) sobre el eje. 3) Navegación superior cortada: solo se ven 3 pestañas, sin indicio de scroll, con subrayado gris desalineado bajo "Resumen". 4) Movimiento casi nulo (isAnimationActive=false, sin stagger, sin conteo de números, sin whileTap en el código admin). 5) Encaje: espaciado irregular entre tarjetas (hueco mayor entre MRR y "Fichas creadas"), padding de tarjetas hero (~34px) distinto del de stats normales (~32px), borde acento de las alertas con curvatura que se corta; MRR "Sin datos" contradice "3 pagando".
