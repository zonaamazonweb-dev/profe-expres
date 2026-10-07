# VEREDICTO revisor-visual — admin ganancia
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/ganancia-375-2.png
Usabilidad: 24/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Carga cognitiva: bloques USD y BRL repiten la misma estructura (3 stats + tabla de 9 filas + 4-5 viñetas de aviso) y "Te quedaron" aparece 3 veces por moneda (stat, fila final, y repetido entre monedas); simplificar a una moneda visible con la otra plegada y avisos en 2 viñetas. 2) Stat cards hero en 2 columnas a 375px: etiquetas se parten en 2-3 líneas ("Te quedaron limpios" + badge "Estimación" se pisan), alturas desiguales; poner el badge bajo el valor o cards a ancho completo. 3) Desvío de FICHA-ARTE: las stat cards tienen borde lila marcado, la ficha pide cards sin borde que se distinguen por el salto fondo/superficie; además el rojo se fija como #E5484D hardcodeado en el código (page.tsx línea 49) en vez de token. 4) Lenguaje/consistencia: "Aún no se concilia con la liquidación de Hotmart" es jerga; cifras mezclan "34.12 USD" (punto) con "34,12 USD" (coma) y "24 %" con espacio; datos de prueba visibles ("Servidores · QA"). 5) Movimiento: sin evidencia en el código de la página (sin stagger, conteo del héroe ni transiciones); sin prevención en el formulario de costo visible y sin atajos (solo 3 rangos), h7/h5 bajas.
