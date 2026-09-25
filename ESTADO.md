# ESTADO — Profe Exprés
Última actualización: 2026-09-25 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: FICHA-AVATAR.md creada (BORRADOR, pendiente de mostrar y aprobar con el usuario) + arquitectura técnica decidida (auth, datos, IA, loop de retención) / Siguiente acción exacta: presentar el avatar en simple al usuario, cerrar Sesión 1 con su OK, y pasar a Sesión 2 (identidad visual).

## Qué es esta app (3 líneas máximo)
Generador de fichas de actividades escolares en PDF para docentes de primaria hispanohablantes (cualquier país): el profesor elige materia, tema, grado, país/currículo y tipo de preguntas, y la IA arma en un solo flujo la semana completa de fichas (no una por una), listas para imprimir. Suscripción mensual.

## Promesa central
"Esta app ayuda a profesores de primaria hispanohablantes a tener toda la semana de fichas de actividades lista para imprimir sin perder horas armándolas en Word, mediante un generador con IA que arma varias fichas de un solo flujo, alineadas al plan de estudios que el profesor elige."

## Reporte de validación (Sesión 1)
- Veredicto: NO EJECUTADO — el usuario pidió saltar la investigación de mercado y avanzar directo a construcción (decisión suya, documentada 2026-09-25).
- Apps de referencia: "Aula Mágica" (pt.mariagomez.site / quiz.gomezmaria.site — funnel de curso/creador, mecanismo verificado de primera mano, revenue NO verificado). Categoría con jugadores establecidos: MagicSchool AI, Twee, Eduaide.ai, "Criar Atividades Escolares" (Play/App Store).
- Brecha LATAM confirmada: NO INVESTIGADO — el modelo YA tiene una versión "ES" genérica; nuestra diferenciación es el ÁNGULO (lote semanal), no el idioma
- Precio de referencia del mercado: NO ENCONTRADO — pendiente de FICHA-MERCADO si se retoma la validación más adelante

## Dirección de Arte (Sesión 2 — réplica fiel construida, pendiente de aprobación final)
- FICHA-ARTE.md: existe, tokens extraídos y test de fidelidad PASA
- ¿Hubo referencia visual del usuario?: SÍ — 4 capturas (2 pantallas completas reales de "Aula Mágica" = CONTRATO de estilo, 1 mockup "Kalm" solo para energía de color, 1 mascota de cerebro animado a incorporar)
- Resumen: fondo #FEFCFB · superficie #FFFFFF · acento #7B5DFB · 2ª nota #FB4A6E (mascota/celebraciones) · Display "Baloo 2" · Body "Nunito" · radio 20px cards / 14px botones
- Réplica fiel construida en `docs/revisiones/replica-fiel.html` (2 pantallas: Inicio y Planner, cada una junto a su captura de referencia) — pendiente de aprobación del usuario
- REGISTRO ANTI-REPETICIÓN: paleta #7B5DFB/#FB4A6E y par Baloo 2/Nunito quedan vetados para el próximo proyecto del SO

## Avatar y venta (Sesión 1 — BORRADOR, pendiente de aprobación del usuario)
- FICHA-AVATAR.md: existe, en BORRADOR (no hay 10 frases VoC con fuente real — solo lo observado en el funnel del modelo + criterio razonado; se marcó explícitamente qué es observado y qué es derivado)
- Resumen: "Vero", profesora de primaria 28-45 años, hispanohablante, Android gama media · dolor #1: no le alcanza el tiempo para armar el material de toda la semana · deseo #1: tener la semana completa de fichas lista de una sola vez · nivel de consciencia 3/5 · sofisticación media
- Landing: sigue la ESTRUCTURA CANÓNICA de 10 secciones del 19 — pendiente de construir

## Estrategia de monetización (Sesión 1 — DECIDIDO, no re-discutir sin motivo)
- Modelo: Onboarding-first con preview anónimo → paywall → login (Modelo 2 de `02C`)
- Justificación: nicho mapea a "Productividad"/"IA creativa" en la MATRIZ ESTRATÉGICA de `02C` — primera victoria = ver su primera ficha generada; el paywall funciona mejor DESPUÉS de que el profesor ya vio el mecanismo funcionando con su propio tema (igual que hace el modelo)
- Diseño del paywall: aparece justo después de que el profesor genera/previsualiza su primera ficha real (con marca de agua o sin descarga habilitada) — bloquea la descarga limpia y el modo lote completo hasta suscribirse. Detalle fino en Sesión 4.
- Trial: genera 1 ficha gratis sin trial de tiempo (tiempo-a-valor casi inmediato, no necesita ventana de días) — se revisa si conviene sumar trial de 5-7 días una vez haya datos reales
- Pricing: $12-18/mes como rango de partida (benchmark informal de la categoría: MagicSchool AI, Twee) — se ajusta con FICHA-MERCADO si se retoma validación

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: Sesión 1 (Constitución/Avatar/Arquitectura) casi cerrada
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Landing: pendiente
- Onboarding: pendiente — baseline: quiz de calificación (estilo del modelo) + generación de la primera ficha real como "resultado personalizado"
- Paywall: pendiente — aparece tras la primera ficha generada
- Login/Auth: pendiente de construir (método ya decidido abajo)
- App interna: pendiente — secciones candidatas: Generador (protagonista) · Mis fichas/semanas (historial) · Ajustes/Cuenta
- Servicios externos: pendiente

## Gamificación y retención (DECIDIDO 2026-09-25 — se implementa en Sesión 5)
- Loop del hábito: Gatillo (recordatorio domingo/lunes "prepara tu semana") → Acción (generar la semana de fichas) → Recompensa (PDF completo listo + tiempo ahorrado mostrado) → Inversión (biblioteca de fichas/semanas guardadas — reusar la próxima semana es más rápido que empezar de cero)
- Mecánica elegida: hitos de volumen ("llevas N semanas preparadas") + biblioteca reusable (test del loop: si se borra el historial, la app de mañana YA NO es igual — pierde su biblioteca)
- Primera victoria del onboarding (<60s): ver su primera ficha real generada con su propio tema
- Notificaciones de re-enganche: domingo noche + lunes temprano (los 2 momentos de mayor dolor) — tope 1-2/semana

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Next.js (landing integrada + rutas de API del generador; regla del stack: "duda → Next.js")
- Tipo de app (Gate 4 de `01`): formulario → documento
- Auth: Supabase Auth, magic link por email como método primario (sin fricción para docentes no técnicos) + Google OAuth como alternativa — jerarquía de `26`
- Modelo de datos (borrador, se afina en la sesión de base de datos): `fichas` (materia, tema, grado, país, tipo, contenido_json, pdf_url, user_id, semana_id) · `semanas` (agrupador del modo lote, user_id) · `perfiles` (plan activo, país por defecto) — RLS por `user_id = auth.uid()` en todas
- Modelo de IA: texto → documento estructurado (JSON con encabezado + preguntas variadas) que se pinta en una plantilla PDF fija; generación en lote = varias fichas por sesión → arquitectura ASÍNCRONA con estado de progreso visible (no bloquear al usuario esperando 5-7 documentos). Proveedor concreto vía `AI_MODEL` (env var) — se fija en la sesión de Integración de IA (`30`)
- Eje único de diferenciación: ÁNGULO — generación en LOTE semanal, país/currículo como selector dentro del producto (no versión de marca separada) — decidido a pedido del usuario, app para todo profesor hispanohablante

## Sesiones completadas ✅
(ninguna cerrada aún)

## Sesión en progreso 🔧
- Sesión 1 — Constitución + FICHA-MODELO + nombre/eje + FICHA-AVATAR + arquitectura: todo hecho, falta el OK final del usuario sobre el avatar para cerrarla

## Próximas sesiones 📋
- Sesión 2: Identidad visual (FICHA-ARTE.md) — SIN clonar el diseño de "Aula Mágica" (solo se modela el mecanismo, no el estilo)
- Sesión 3: Página de ventas
- Sesión 4: Onboarding + paywall + login

## Problemas conocidos ⚠️
- Revenue del modelo NO verificado — decisión informada del usuario de avanzar sin esa validación
- FICHA-AVATAR en BORRADOR (no APROBADA) — evita derivar copy final de venta hasta tener el OK del usuario y, si se puede, algunas fuentes reales más

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguno por ahora — el siguiente paso lo ejecuta el agente

## Notas para la próxima sesión
- No usar el nombre "Aula Mágica" ni su marca/copy — es la referencia de PRODUCTO, prohibido clonar marca (regla anti-clon de `01`/`16`)
- Las fichas de ejemplo vistas del modelo confirman: mezcla real de tipos de pregunta (desarrollo, opción múltiple, vocabulario, reflexión) — el generador de IA debe producir esa variedad, no preguntas repetidas
- El selector de país/currículo va dentro del formulario del generador, no como versión de marca separada
