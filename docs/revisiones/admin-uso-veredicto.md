# VEREDICTO revisor-visual — admin-uso
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/admin/uso-375-1.png (también uso-375-2.png, uso-375-3.png)
Usabilidad: 26/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. [Activación y retención, 6 stat-cards apiladas a ancho completo] 6 tarjetas grandes con poco contenido obligan a ~2 pantallas de scroll; sin semáforo ni veredicto ("D7 33% = bajo, haz X"); porcentajes sobre muestras de 1-3 personas (100%, 33%) sin aviso de muestra pequeña -> grid de 2 columnas compactas, color semántico por umbral y nota "muestra pequeña" cuando n<10.
2. [Barra de pestañas, arriba] La pestaña activa subrayada es "Resumen" estando en Uso; Uso ni se ve sin scroll horizontal -> marcar y centrar la pestaña activa.
3. [Acción principal: Hoy / 7 / 30 días + filtro 7/30/90] Los tres contadores ignoran el filtro de rango, que sí gobierna el gráfico y el camino de venta; el usuario no sabe qué cambia con el filtro -> aclarar en el subtítulo o unificar con el rango.
4. [Camino de venta, 4º paso] "Fueron al pago de Hotmart ... 100 % del paso anterior" se parte en 2 líneas y desalinea cifra/porcentaje; en "A quién escribirle" el email se corta y no hay acción (escribir/copiar) -> porcentaje en línea propia; botón "Escribir" por fila.
5. [Gráfico de fichas por día] Picos puntiagudos de 0-1 con curva suavizada sin animación; sin motion en la pantalla (sin stagger, conteo ni dibujado, reduced-motion no aplicable) -> barras o línea escalonada con dibujado de entrada.
Notas: heurísticas 3/7 verificadas en código (page.tsx): solo lectura, sin atajos ni acciones; sin hallazgo de undo necesario. Paleta/tipografía/radios coinciden con FICHA-ARTE (#7B5DFB, Baloo 2/Nunito, radio 20). Badge "N" visible en capturas es de desarrollo.
