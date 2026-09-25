# ESTADO — Profe Exprés
Última actualización: 2026-09-25 | Sesión actual: 1

⏸️ CHECKPOINT — Última acción completada: nombre aprobado ("Profe Exprés") y eje de diferenciación decidido (ÁNGULO: generación en LOTE de una semana completa, país/currículo como selector — no especialización geográfica, por pedido explícito del usuario) / Siguiente acción exacta: llenar FICHA-AVATAR.md y decidir arquitectura (auth/datos/IA) para cerrar Sesión 1, con el OK del usuario.

## Qué es esta app (3 líneas máximo)
Generador de fichas de actividades escolares en PDF para docentes de primaria hispanohablantes (cualquier país): el profesor elige materia, tema, grado, país/currículo y tipo de preguntas, y la IA arma en un solo flujo la semana completa de fichas (no una por una), listas para imprimir. Suscripción mensual.

## Promesa central
"Esta app ayuda a profesores de primaria hispanohablantes a tener toda la semana de fichas de actividades lista para imprimir sin perder horas armándolas en Word, mediante un generador con IA que arma varias fichas de un solo flujo, alineadas al plan de estudios que el profesor elige."

## Reporte de validación (Sesión 1)
- Veredicto: NO EJECUTADO — el usuario pidió saltar la investigación de mercado y avanzar directo a construcción (decisión suya, documentada 2026-09-25).
- Apps de referencia: "Aula Mágica" (pt.mariagomez.site / quiz.gomezmaria.site — funnel de curso/creador, mecanismo verificado de primera mano, revenue NO verificado). Categoría con jugadores establecidos: MagicSchool AI, Twee, Eduaide.ai, "Criar Atividades Escolares" (Play/App Store).
- Lo que los usuarios odian de la competencia: NO INVESTIGADO
- Brecha LATAM confirmada: NO INVESTIGADO — el modelo YA tiene una versión "ES" (quiz.gomezmaria.site), lo que reduce el arbitraje idiomático puro; nuestra diferenciación no puede ser solo "traducir"
- Precio de referencia del mercado: NO ENCONTRADO — pendiente de FICHA-MERCADO si se retoma la validación más adelante

## Dirección de Arte (Sesión 2 — pendiente)
- FICHA-ARTE.md: no existe aún
- ¿Hubo referencia visual del usuario?: NO — "Aula Mágica" es referencia de PRODUCTO/mecanismo, no de estilo visual (no clonar su marca ni su diseño)

## Avatar y venta (Sesión 1 — pendiente)
- FICHA-AVATAR.md: no existe aún — se completa después de cerrar la Constitución y la pregunta de país/currículo

## Estrategia de monetización (Sesión 1 — DECIDIDO, no re-discutir sin motivo)
- Modelo: Onboarding-first con preview anónimo → paywall → login (Modelo 2 de `02C`)
- Justificación: nicho mapea a "Productividad"/"IA creativa" en la MATRIZ ESTRATÉGICA de `02C` — primera victoria = ver su primera ficha generada; el paywall funciona mejor DESPUÉS de que el profesor ya vio el mecanismo funcionando con su propio tema (igual que hace el modelo: quiz → resultado personalizado → explicación del mecanismo → CTA). Además el propio modelo referenciado usa esta estructura (quiz de calificación antes de vender).
- Diseño del paywall: aparece justo después de que el profesor genera/previsualiza su primera ficha real (con marca de agua o sin descarga habilitada) — bloquea la descarga del PDF limpio hasta suscribirse. Detalle fino se define en Sesión 4.
- Trial: por definir en Sesión 1 con `02C` (tiempo-a-valor es casi inmediato — candidato a trial corto 5-7 días, o directamente "genera 1 ficha gratis" sin trial de tiempo)
- Pricing: por definir con FICHA-MERCADO si se retoma validación, o con benchmark de la categoría (MagicSchool AI, Twee) como referencia informal

## Secuencia maestra de construcción (NO saltar)
- Estado de la secuencia: Ideación/Constitución en curso
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app`
- Landing: pendiente
- Onboarding: pendiente — baseline: quiz de calificación (estilo del modelo) + generación de la primera ficha real como "resultado personalizado"
- Paywall: pendiente — aparece tras la primera ficha generada
- Login/Auth: pendiente — método concreto (jerarquía de `26`) se decide al construirlo
- App interna: pendiente — secciones candidatas: Generador (protagonista) · Mis fichas (historial) · Ajustes/Cuenta
- Servicios externos: pendiente

## Decisiones técnicas (NO re-discutir sin pedirlo el usuario)
- Framework: Next.js — decidido 2026-09-25 (landing integrada + futuras rutas de API para el generador; regla del stack: "duda → Next.js")
- Tipo de app (Gate 4 de `01`): formulario → documento — el tipo más seguro y barato de construir con IA
- Modelo de IA: texto → documento estructurado (JSON con encabezado + preguntas) que luego se pinta en una plantilla PDF fija — proveedor concreto y arquitectura sync/async se deciden en la sesión de Integración de IA (`30`)
- Eje único de diferenciación (regla del `01`): ÁNGULO — generación en LOTE (una semana completa de fichas en un solo flujo, no una por una) en vez de especializar por país. El país/currículo es un SELECTOR dentro del producto, no una exclusividad de marca — decidido 2026-09-25 a pedido del usuario (app para todo profesor hispanohablante, no de un país específico).

## Sesiones completadas ✅
(ninguna cerrada aún)

## Sesión en progreso 🔧
- Sesión 1 — Constitución del Producto + FICHA-MODELO (hecha) + nombre y eje de diferenciación (hecho) + FICHA-AVATAR + arquitectura (pendiente)

## Próximas sesiones 📋
- Sesión 1 (cierre): FICHA-AVATAR.md + monetización fina (trial/precio) + modelo de datos/RLS + método de auth
- Sesión 2: Identidad visual (FICHA-ARTE.md) — SIN clonar el diseño de "Aula Mágica" (solo se modela el mecanismo, no el estilo)
- Sesión 3: Página de ventas
- Sesión 4: Onboarding + paywall + login

## Problemas conocidos ⚠️
- Revenue del modelo NO verificado — decisión informada del usuario de avanzar sin esa validación
- El modelo ya tiene versión "ES" genérica — nuestro eje de diferenciación (país/currículo) es CRÍTICO para no competir como clon débil

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguno por ahora — el siguiente paso lo ejecuta el agente

## Notas para la próxima sesión
- No usar el nombre "Aula Mágica" ni su marca/copy — es la referencia de PRODUCTO, prohibido clonar marca (regla anti-clon de `01`/`16`)
- La ficha de ejemplo de Matemática y de Língua Portuguesa vistas del modelo confirman: mezcla real de tipos de pregunta (desarrollo, opción múltiple, vocabulario, reflexión), no una lista plana — el generador de IA debe producir esa variedad, no preguntas repetidas
- El selector de país/currículo (no la marca) es lo que hereda la promesa "según las reglas de tu país" del modelo — implementarlo como parte del formulario del generador, no como versión de marca separada
