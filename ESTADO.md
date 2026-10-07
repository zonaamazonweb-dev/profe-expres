# ESTADO — Profe Exprés
Última actualización: 2026-10-07 | Sesión actual: 6

⏸️ CHECKPOINT (2026-10-07) — CAMINO DE VENTA PÚBLICO CONSTRUIDO (sin Hotmart todavía). App privada movida a `/app` con acceso solo para cuentas activas. Panel de administración rehecho 2 rondas: sigue NO LISTA en revisión visual (24-33/40, 10-12/20). Siguiente acción exacta: (1) recibir del dueño precio, garantía, link de Hotmart, correo de soporte y video; (2) corregir lo que marque el revisor del camino de venta; (3) 3ª ronda del panel; (4) solo cuando el dueño lo pida: Hotmart + webhook + Resend.

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
- Réplica fiel construida en `docs/revisiones/replica-fiel.html` (2 pantallas: Inicio y Planner, cada una junto a su captura de referencia) — APROBADA por el usuario (2026-09-25), con ajuste: la mascota se movió de Inicio a la pantalla de Crear
- Tour completo en `docs/revisiones/vista-previa-app.html` (Principal/M0, Onboarding, Mecanismo/Crear con mascota, Paywall)
- REGISTRO ANTI-REPETICIÓN: paleta #7B5DFB/#FB4A6E y par Baloo 2/Nunito quedan vetados para el próximo proyecto del SO

## Avatar y venta (Sesión 1 — BORRADOR, pendiente de aprobación del usuario)
- FICHA-AVATAR.md: existe, en BORRADOR (no hay 10 frases VoC con fuente real — solo lo observado en el funnel del modelo + criterio razonado; se marcó explícitamente qué es observado y qué es derivado)
- Resumen: "Vero", profesora de primaria 28-45 años, hispanohablante, Android gama media · dolor #1: no le alcanza el tiempo para armar el material de toda la semana · deseo #1: tener la semana completa de fichas lista de una sola vez · nivel de consciencia 3/5 · sofisticación media
- Landing: sigue la ESTRUCTURA CANÓNICA de 10 secciones del 19 — pendiente de construir

## Estrategia de monetización (REEMPLAZADA por instrucción explícita del usuario, 2026-10-07)
- Modelo OBLIGATORIO: pago ANTES de usar. Sin preview, sin paywall, sin cuentas gratis. (Reemplaza el Modelo 2 "onboarding-first con preview → paywall" decidido en Sesión 1.)
- Embudo: quiz corto → páginas de ventas POR SECCIONES (una pantalla a la vez con botón "Continuar", NO landing larga): resultado personalizado → la solución → prueba social → VSL (espacio reservado hasta que exista) → oferta (comparación, qué recibe, precio, garantía) → botón final DIRECTO al link de pago de Hotmart.
- Tras el pago: webhook de Hotmart (firma verificada, idempotente) crea la cuenta → Resend manda el acceso. El login solo admite correos que ya pagaron.
- Orden de construcción: quiz → páginas de ventas → Hotmart + cuenta automática + acceso → app → admin.
- Siguiente paso pedido: PREPARAR LA INFRAESTRUCTURA DE USUARIOS (panel de administración).
- Pricing: $12-18/mes como rango de partida (informal) — a definir antes de la página de oferta

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

## Camino de venta público (construido 2026-10-07)
TERMINADO:
- Rutas públicas: `/` entrada → `/quiz` (5 preguntas + análisis) → `/resultado` (3 perfiles según respuestas: horas/semana y trabajo en casa; "≈ N h al año" = horas × 40 semanas, supuesto declarado) → `/solucion` (capturas REALES de la app en `app/public/funnel/`) → `/prueba-social` (solo cifras verificables; testimonios solo si existen en `TESTIMONIALS`) → `/video` (escenario reservado; botón con retardo si hay video) → `/oferta` (scroll: decisión, qué recibes, precio, garantía, FAQ, botón final + botón fijo).
- Respuestas del quiz solo en el navegador (`profe:quiz:v1`); volver atrás las conserva; entrar a una pantalla avanzada sin quiz vuelve a `/quiz`.
- Atribución: `utm_*`, `src`, `sck`, `fbclid`, `ttclid` se guardan al entrar y viajan al link de pago (`withAttribution`).
- Eventos (tabla `event_log`, vía `POST /api/evento`, lista cerrada, rate-limit por IP): funnel_view, quiz_start, quiz_answer, quiz_complete, result_view, solution_view, vsl_view, offer_view, checkout_click. Verificado en base con un recorrido real. Los pasos del panel (Uso) ya usan estos nombres.
- Configuración por variables públicas (`app/lib/funnel/config.ts`): `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`, `NEXT_PUBLIC_PRICE_LABEL`, `NEXT_PUBLIC_GUARANTEE_DAYS`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_VSL_URL`, `NEXT_PUBLIC_VSL_BUTTON_DELAY`. Link de pago cargado (https://pay.hotmart.com/V107932200S, valor por defecto en config; la variable lo puede reemplazar). Sin link el botón se vería apagado ("El pago se activa muy pronto"); sin precio dice "Precio por confirmar". Nada inventado.
- App privada: ahora `/app`, `/app/crear`, `/app/planner`, `/app/historial`; rutas viejas redirigen. Acceso solo con sesión + cuenta activa/past_due (o dueña) validado en servidor (`lib/access.ts`); `/api/generar` exige lo mismo + tope 60 fichas/hora por cuenta. Probado: sin sesión → /login y API responde 401.
- PDF: ahora incluye hoja de solucionario (solo docente) al final.
- Tipos/lint/18 tests/build ✓. Capturas 375px en `docs/revisiones/embudo/` (sin desborde horizontal en las 6 pantallas).
PENDIENTE:
- Revisor-visual 1ª pasada (todas NO LISTA): entrada 27/40·12/20·copy 11/20 · quiz 29/40·14/20·copy 13/20 · oferta 27/40·14/20·copy 10/20 (veredictos en `docs/revisiones/embudo/`). Ya corregido: copy neutro en P5, barra alineada a 5 pasos, línea de "para qué", foco visible, CTA "Quiero mi semana de fichas lista", barra oculta en entrada. FALTA: escena de dolor (domingo en la noche) en el copy, mascota/anillo firma, profundidad (mesh/hairline), conteo animado de horas, CTA "Avísame cuando abra" mientras no haya link de pago, prueba real, precio y garantía con nombre (dependen del dueño). Segunda revisión pendiente.
- Dueño: correo de soporte; video; testimonios reales (no hay usuarias aún). Páginas legales (términos/privacidad) sin crear.
- Hotmart + webhook + cuenta automática + Resend + login solo para pagos: NO se tocó (el login actual solo admite cuentas ya creadas).
- Variables de Supabase y de funnel aún no están en Vercel: producción no tiene el camino de venta funcionando con medición hasta subirlas y redeploy.
- Pantallas secundarias del funnel (resultado, solución, prueba social, video) sin revisor (secundarias).

## Webhook de Hotmart (construido 2026-10-07; PENDIENTE conectarlo en producción)
- Endpoint: `POST /api/webhooks/hotmart` (`app/app/api/webhooks/hotmart/route.ts`, lógica en `app/lib/hotmart/`). Orden: hottok en tiempo constante (header `x-hotmart-hottok` o campo `hottok`; fail-closed si falta `HOTMART_HOTTOK`) → solo el producto de `HOTMART_PRODUCT_ID` → frescura 7 días → dedupe por id de evento → libro de ventas (clave proveedor+transacción+tipo: APPROVED y COMPLETE de una compra cuentan UNA venta) → cuenta (se crea con el correo comprador, sin contraseña) y estado → marca "procesado" solo si todo salió bien.
- Estados: APPROVED/COMPLETE→active · DELAYED→past_due · SUBSCRIPTION_CANCELLATION→cancelled (acceso hasta `access_until`=próximo cobro) · EXPIRED→cancelled involuntaria · REFUNDED→refunded · CHARGEBACK→chargeback · SWITCH_PLAN→solo cambia el plan. Una cuenta reembolsada no se reactiva con el aviso reentregado de la misma transacción; una desactivada a mano no se reactiva por pago.
- Migración `20261007020000_access_until.sql` aplicada (access_until, hotmart_subscriber_code).
- Probado en local con avisos simulados: sin hottok 401 · hottok malo 401 · producto ajeno ignorado · compra crea cuenta + 1 venta (US$7) · reentrega = duplicado · COMPLETE no duplica venta · JSON roto 400 · reembolso corta acceso · reaprobación tras reembolso = ilegal. 26 tests ✓.
- FALTA: (1) variables en Vercel: HOTMART_HOTTOK, HOTMART_PRODUCT_ID + las de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, AI_PRICE_*); (2) push/deploy; (3) crear webhook en Hotmart con la URL de producción; (4) compra real de prueba (reembolsable) y revisar el JSON real: plan anual/mensual (`intervalFromPlan` es suposición por nombre del plan), campo de origen (`origin.src`), y si Hotmart manda trial; (5) Resend + SMTP propio de Supabase: hoy el acceso es entrar a /login y pedir código por correo (SMTP gratuito de Supabase tiene tope muy bajo); (6) reconciliación semanal contra Hotmart (no construida).

## Sesiones completadas ✅
(ninguna cerrada aún)

## Sesión en progreso 🔧
- Sesión 5 (adelantada a pedido del usuario) — App interna funcional: Inicio ✓ · Crear (generador IA) ✓ · Planner (lote semanal) ✓ · Historial ✓ · Publicada en Vercel ✓. Falta: pulido/testing formal (checklist de cierre completo, revisor-visual) antes de darla por "lista" según el estándar del SO.

## Publicación (Sesión 6, adelantada) — DEPLOY EN VIVO
- URL de producción: https://profe-expres.vercel.app
- GitHub: `zonaamazonweb-dev/profe-expres` (privado) — remote configurado por SSH con una llave dedicada (`~/.ssh/id_ed25519_profeexpres`, solo push, no es una credencial de la cuenta)
- Vercel: proyecto `yessenia3/profe-expres`, Root Directory `app`, Framework `Next.js` (se corrigió: había quedado en "Other" del primer import y causaba 404 — ver Problemas conocidos)
- Variables configuradas en Vercel (Production/Preview/Development): `ANTHROPIC_API_KEY`, `AI_MODEL` — verificado con una generación real en producción (200 OK)
- Deploy actual: manual vía `vercel deploy --prod` (CLI) porque se necesitaba corregir el framework antes del primer build correcto. CONFIRMADO: un push normal a `main` disparó un deploy automático sin intervención manual (2026-09-25)

## Próximas sesiones 📋
- Configurar ANTHROPIC_API_KEY localmente y verificar una generación real end-to-end
- Cuando el usuario quiera retomar la secuencia de venta: Sesión 3 (página de ventas) y Sesión 4 (onboarding + paywall + login) — pospuestas, no descartadas
- Checklist de cierre formal + revisor-visual de las pantallas construidas (pendiente — se priorizó velocidad de construcción por pedido del usuario)

## Problemas conocidos ⚠️
- RESUELTO 2026-10-07 (dueño): precio US$ 7 (mostrado "al mes" — confirmar periodicidad y moneda en Hotmart) y garantía 7 días (FICHA-MERCADO §1 y §4 actualizadas). Verificar que el producto en Hotmart tenga exactamente 7 días de garantía y USD 7.
- FICHA-MERCADO creada en BORRADOR (2026-10-07): precios de la competencia y reglas de Hotmart verificados con fuente; PRECIO y GARANTÍA siguen PENDIENTES de decisión del dueño (opciones de garantía en Hotmart: 7/15/21/30 días). Reconfirmar plazos y medios de pago en el panel/checkout REAL al crear el producto.
- Revenue del modelo NO verificado — decisión informada del usuario de avanzar sin esa validación
- FICHA-AVATAR en BORRADOR (no APROBADA) — evita derivar copy final de venta hasta tener el OK del usuario y, si se puede, algunas fuentes reales más
- secuencia-maestra: se construyó la app interna ANTES que landing/onboarding/paywall/login, saltándose el orden por defecto del SO — decisión EXPLÍCITA del usuario (2026-09-25: "quiero que sigamos completo con la app, sin quiz, sin pag de pago"), no un descuido. Cuando se retome la venta, construir esas piezas antes de declarar la app "lista para vender".
- Sin revisor-visual todavía en las 4 pantallas construidas — pendiente antes del checklist de cierre formal
- (resuelto) ANTHROPIC_API_KEY configurada por el usuario y generación real verificada (2026-09-25) — en local Y en producción
- (resuelto) Al importar el repo en Vercel, el Framework Preset quedó en "Other" (por el primer intento antes de fijar Root Directory) y causaba 404 en toda la app aunque el build decía "Ready" — corregido con `vercel project update --framework nextjs`
- (resuelto) Un `vercel link --yes` sin especificar proyecto creó un proyecto Vercel duplicado llamado "app" — se detectó y se eliminó antes de que causara confusión
- (resuelto) vista-previa-app.html construido en `docs/revisiones/vista-previa-app.html` con las 4 vistas clave (Principal/M0, Onboarding, Mecanismo/Crear con la mascota, Paywall) — pendiente solo la confirmación final del usuario tras verlo

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Ninguno por ahora — el siguiente paso lo ejecuta el agente

## Notas para la próxima sesión
- No usar el nombre "Aula Mágica" ni su marca/copy — es la referencia de PRODUCTO, prohibido clonar marca (regla anti-clon de `01`/`16`)
- Las fichas de ejemplo vistas del modelo confirman: mezcla real de tipos de pregunta (desarrollo, opción múltiple, vocabulario, reflexión) — el generador de IA debe producir esa variedad, no preguntas repetidas
- El selector de país/currículo va dentro del formulario del generador, no como versión de marca separada
