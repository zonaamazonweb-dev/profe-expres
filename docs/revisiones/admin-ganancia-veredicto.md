# VEREDICTO revisor-visual — admin-ganancia
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/ganancia-375-1.png
Usabilidad: 23/40
Craft: 9/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Tabla "Costos que solo tú conoces" con min-w 560px: a 375px la columna Monto y el botón Quitar quedan fuera de vista (scroll horizontal, ganancia-375-4). 2) "Quitar" borra un costo sin confirmación ni deshacer (ganancia/page.tsx L89-91); además el aviso dice "anótalos en «Ganancia real»" estando ya en esa pantalla. 3) Verdad engañosa: "Te quedaron limpios 5,52 USD" con insight verde "bueno" y margen 4% "Bajo"; en BRL margen 90% "Sano" aunque la IA no se pudo restar. 4) Tres cifras héroe del mismo peso (32px) repetidas luego en insight y total de la tabla: ruido, sin un solo dato dominante; tabla de 8 filas con varias en 0. 5) Fila final "5,52 / USD" se parte en dos líneas (falta whitespace-nowrap), etiquetas largas envuelven, pestaña "Ganancia real" recortada en la barra superior; página sin ningún movimiento (eje 0); jerga Resend/Vercel/Supabase; formato "34.12 USD" vs "34,12 USD".
