# VEREDICTO revisor-visual — admin-salud
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/salud-375-1.png
Usabilidad: 25/40
Craft: 8/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Errores recientes, pantalla 2] Tabla con min-w-[560px] recorta "Veces" y "Última" y "Dónde" a 375px (scroll horizontal oculto; justo el dato que prioriza). Fix: convertir cada fila en tarjeta apilada (mensaje, dónde, "N veces · hace X").
2. [Banner y alertas, pantalla 1] Triple redundancia: "Hay incidencias" + 3 alertas + tarjetas "Fallidos 24 h" + conteos + lista cruda; las alertas dicen "Abre «Salud»" estando ya en Salud (instrucción circular). Fix: quitar el banner genérico, reescribir el "Qué hacer" con acción concreta y colapsar los avisos de Hotmart a una tarjeta resumen.
3. [Avisos de Hotmart, pantallas 2-3] Jerga cruda: PURCHASE_APPROVED, "Ilegales", "No autorizados", "Aplicados" sin explicación; 5 conteos apilados con label en mayúsculas pegado al número. Fix: traducir ("Compra aprobada"), mostrar solo los conteos >0 con frase de decisión.
4. [Barra superior, pantalla 1] La pestaña activa no es Salud (aparece subrayado Resumen) y Salud queda fuera de vista; emoji ⚠️ como ícono en el banner (viola ficha/reglas). Fix: auto-scroll a la pestaña activa y chip SVG.
5. [Toda la pantalla] Sin movimiento (sin stagger ni transiciones) ni dispositivo ownable; superficies planas blanco sobre crema. Fix: stagger de entrada 60-80ms y un motivo propio (anillo de salud).
Verificado en código: sin undo/atajos (pantalla solo lectura); paleta y tipografía Baloo 2/Nunito coinciden con FICHA-ARTE; sin código de motion/reduced-motion. Overlay "N" es herramienta de desarrollo, ignorado.
