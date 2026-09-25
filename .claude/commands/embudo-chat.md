---
description: Monta el EMBUDO DE CHAT (Meta Ads → página propia con formato de conversación → Hotmart) clonando y adaptando la plataforma del curso
---
EMBUDO DE CHAT — clonar y adaptar la plataforma del curso para vender TU app conversando

Regla canónica: aplica `docs/sistema/PROMPT-EMBUDO-CHAT.txt`; la doctrina completa vive en
`docs/sistema/63-EMBUDO-DE-CHAT.md`. La venta cierra SIEMPRE en el checkout de Hotmart (18);
la landing del 19 sigue siendo el default y la decisión landing vs chat se anota en ESTADO.md.
Si el usuario AÚN NO tiene app, este comando no aplica: la app se construye normal con el SO
(secuencia maestra intacta) y el embudo de chat es su superficie de venta — camino (b) del 63.

━━━ CONTEXTO (campaña, plan/pricing, subdominio deseado, estado del video si lo tengo) ━━━
$ARGUMENTS

Si el contexto viene vacío, dedúcelo de ESTADO.md (promesa, pricing, links de Hotmart,
dirección de arte) y pregúntame solo lo que falte antes de tocar nada.

LEE PRIMERO docs/sistema/63-EMBUDO-DE-CHAT.md COMPLETO (qué es, regla de marca §2, guion de
7 etapas §3, reglas de copy §4, medición §6). GATE DE FICHAS: sin FICHA-AVATAR.md completa y
aprobada (57) no se escribe una sola burbuja — todo el copy se deriva de sus
dolores/deseos/objeciones y del mecanismo nombrado de FICHA-MODELO.md / la Constitución.

PASO 1 — DUPLICAR SIN TOCAR EL ORIGINAL: localiza la carpeta wsp-funnel del curso (builder
visual + rutas públicas + analítica + Supabase) y duplícala a una carpeta HERMANA
(ej. chat-[miapp]) excluyendo node_modules, .git y todo .env; en la copia, git propio y .env
desde el .env.example. PROHIBIDO modificar el original del curso y PROHIBIDO tocar el proyecto
de la app: todo ocurre en la copia.

PASO 2 — REVISAR ANTES DE TOCAR: inventario completo de la copia (rutas, builder, esquema,
analítica) en ESTADO.md. Ningún cambio antes de terminarlo.

PASO 3 — QUITAR LO QUE NO VA: pagos internos (Stripe / MercadoPago / checkout embebido — la
venta cierra en Hotmart) y flujos/datos de demo, sin dejar rutas ni imports colgando.

PASO 4 — MARCA PROPIA: cero logo/nombre/trade dress de WhatsApp (§2 del 63 — suplantación =
rechazo de anuncios). Tematiza con FICHA-ARTE.md: es "el chat de [tu app]".

PASO 5 — SERVICIOS: Supabase PROPIO de esta copia (proyecto nuevo, no el de la app) y punto
de inyección del Píxel de Meta listo (el ID lo pone el usuario — ver reporte).

PASO 6 — CREAR EL FLUJO: el guion de 7 etapas del 63 en el builder (E1 apertura → E2
mini-diagnóstico → E3 resultado por ramas → E4 demo real o slot [VIDEO AQUÍ], jamás inventar →
E5 oferta anual/mensual/duda con precio visible → E6 cierre con links de Hotmart → E7 rescate
sin urgencia falsa), con las reglas de copy del §4 (burbujas ≤3 líneas, 1 idea, mecanismo en
E1/E3/E5, delays 1-2.5s, cero "visto" falso). Cada plan sale con sck=chat-[campaña]-[plan].

PASO 7 — VERIFICAR: recorre a 375px TODAS las ramas (cada combinación de E2, cada objeción de
E6, el rescate) hasta su checkout de Hotmart correcto con su sck correcto. tsc + build + dev
limpios. Sin este recorrido, no está listo.

REPORTE FINAL — EN SIMPLE, PASO A PASO, con ✅ en lo ya hecho y explicado como a alguien que
nunca lo hizo: 1) cuentas que faltan (Supabase, Vercel, Meta Business); 2) variables/claves POR
NOMBRE con el panel exacto donde se introducen (el usuario responde solo "configurada" — cero
secretos en el chat); 3) grabar el video de 30-60s de E4 con guion sugerido; 4) deploy en
Vercel + subdominio (ej. chat.suapp.com); 5) crear el Píxel en Meta y activar su ID; 6) compra
de prueba que verifica Píxel + sck de punta a punta; 7) recién entonces, encender ads (34 —
gate del píxel cumplido). Actualiza ESTADO.md con lo hecho, lo pendiente y la decisión
landing vs chat.
