# VEREDICTO revisor-visual — admin ventas
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/ventas-375-2.png
Usabilidad: 26/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos: 1) Grilla de stats con tarjeta huérfana ("Compras", "Por mes", "Tasa de bajas") que deja un hueco a la derecha; desencaje a simple vista. 2) Página larguísima (2978px) con dos bloques de moneda de 4 stats + gráfico cada uno y el mismo texto aclaratorio de "Cobrado" repetido; sobrecarga y poco minimalismo. 3) Gráficos de barras casi vacíos (1-3 barras finas sobre eje de 120), sin etiqueta directa ni insight; el eje y etiquetas quedan tapados por el badge "N" (overlay de dev; verificar sin él). 4) Color #E5484D hardcodeado en page.tsx línea 71 (debe ser token), y "Últimas ventas" como 5 mini-tarjetas altas con label sobre valor en vez de filas compactas. 5) Craft sin motion verificable en la página (charts sin animación, sin stagger ni conteo de números héroe) y sin dispositivo ownable (el anillo de la ficha no aparece); profundidad plana (blanco sobre crema).
