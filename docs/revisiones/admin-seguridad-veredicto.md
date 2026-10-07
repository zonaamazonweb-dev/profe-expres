# VEREDICTO revisor-visual — admin-seguridad
Fecha: 2026-10-07 14:00
Screenshot: docs/revisiones/admin/seguridad-375-1.png
Usabilidad: 27/40
Craft: 10/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Barra de pestañas superior: la pestaña activa subrayada es "Resumen" estando en Seguridad; la pestaña Seguridad no se ve (queda cortada fuera de pantalla, sin indicio de scroll) -> marcar la activa por ruta y hacer scrollIntoView / mostrar fade lateral. 2) Registro de actividad: el correo se parte a media palabra ("qa-/manual@...") y la fecha compite en la misma fila -> apilar acción arriba y fecha/correo debajo (break-all en correo, fecha en línea propia). 3) Pantalla sin movimiento (cero entrada escalonada, ningún conteo ni transición; MfaPanel/page sin motion ni reduced-motion) y hueco muerto de ~40% de la pantalla -> stagger de entrada con Motion, y completar con contenido útil (p. ej. cómo desactivar/cambiar la verificación, ayuda si pierdes el celular). Otros: sin forma de desactivar/cambiar la doble verificación ni recuperación (h3/h7), micro-texto 12-12.5px, sin dispositivo ownable propio.
