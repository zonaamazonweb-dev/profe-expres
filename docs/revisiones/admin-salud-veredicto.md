# VEREDICTO revisor-visual — admin salud
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/salud-375-2.png
Usabilidad: 27/40
Craft: 11/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Banner de alertas arriba: 3 tarjetas grandes con 3 bloques de texto cada una dominan el primer viewport y empujan el contenido propio de Salud; además dicen "Abre «Salud»" estando ya en Salud, sin acción útil (fix: compactar alertas a 1 línea con detalle plegable y quitar CTA que apunta a la misma pantalla). 2) Movimiento sin evidencia en el código de la página (sin stagger, sin conteo, sin transición; no hay prefers-reduced-motion verificable) (fix: entrada escalonada de secciones y conteo en Stat). 3) Colores hex directos #2F9E5B / #E5484D en el estado de avisos (viola regla de tokens; fix: usar tokens semánticos de color). 4) Profundidad plana e identidad débil: todo son cards blancas iguales sobre crema, sin dispositivo ownable ni hundido/elevado distinguible (fix: usar nivel hundido #F2EEFA en listas/SinDatos y un detalle firma). 5) Stats desbalanceadas: "Fallidos en 24 h" huérfano en fila propia y 2 stats de ancho desigual; nav superior cortada ("Negocio" recortado) (fix: grid de 3 columnas parejas o 2+1 centrado, y scroll-snap/fade en la nav).
