# FICHA DE DIRECCIÓN DE ARTE — Profe Exprés

## Referencia del usuario (CONTRATO — ver 16, protocolo obligatorio)
- ¿Hay imagen(es) de referencia del usuario?: SÍ → 4 imágenes: (1) y (4) son capturas COMPLETAS de la app real "Aula Mágica" (pantalla de inicio y pantalla de planner semanal) · (2) mockup de la app "Kalm" (solo para tomar energía de color viva, NO layout ni marca) · (3) mascota ilustrada de un cerebro animado, a insertar en una lámina de nuestra app
- Extracción (mirada con herramienta de imágenes — muestreo de píxeles exacto, no de memoria):
  - Modo: claro · Fondo: #FEFCFB · Superficie: #FFFFFF · Texto 1º/2º: #2B2140 / #716C7E
  - Acento: #7B5DFB (botones primarios, anillo de progreso, chip activo de la barra inferior, íconos de acción)
  - Display: clase geométrica redondeada, muy bold — candidata elegida: **Baloo 2** (pesos 600-800) · Body: sans redondeada cálida — candidata elegida: **Nunito** (pesos 400-700)
  - Radio: 20-24px en cards grandes, 14px en botones, 999px (píldora) en chips y barra inferior activa
  - Espaciado: aireado, cards con padding generoso (~16-20px), separación clara entre módulos
  - Sombras: sutiles, casi ausentes en cards (se apoyan en fondo crema vs. blanco puro para dar profundidad, no en sombra dura)
  - Bordes: cards sin borde visible marcado, se distinguen por el salto de #FEFCFB (fondo) a #FFFFFF (card)
  - Layout: saludo arriba a la izquierda + logo/nombre debajo · anillo de progreso centrado como héroe · 2 stat-cards en fila · lista de acciones grandes tipo "card-botón" con chip de ícono a la izquierda · barra inferior de 4 destinos
  - Detalle firma a replicar: el ANILLO circular de progreso ("% semana lista") como pieza héroe de la pantalla de inicio
- Prohibiciones anti-IA que la referencia LEVANTA: ninguna — la referencia ya evita el look genérico (sin neón, sin glass, sin oscuro por defecto)
- ⚠️ Regla anti-clon respetada: se replica el SISTEMA visual (paleta, tipografía, layout, componentes) — NUNCA el nombre "Aula Mágica", su logo del libro con estrellas, ni su copy. Nuestra marca es "Profe Exprés".

## Identidad derivada — la "2ª nota" de color
- La referencia (1)/(4) fija el acento primario (#7B5DFB). El usuario pidió además "colores vivos" y usar la mascota del cerebro → se toma como 2ª nota de color el coral/rosa vivo de esa mascota y del mockup Kalm: **#FB4A6E**
- Uso de la 2ª nota: SOLO en la mascota, en celebraciones de hitos (ej. "10 semanas preparadas") y en el badge de "IA" — nunca reemplaza al acento primario en botones o navegación (regla 60-30-10)
- Mascota: el cerebro animado es "el asistente IA" de la app — el usuario pidió (2026-09-25) que viva chico y feliz específicamente en la pantalla de CREAR actividad (el momento de generación con IA), no en el estado vacío de Inicio. Color coral original (no se re-tiñe de morado, es la 2ª nota intencional). Tamaño chico (~40-48px), como compañero junto al botón de generar / en el estado de "generando".

## Personalidad compilada
- 3 adjetivos de personalidad: **cercana, eficiente, alentadora** (habla como una colega que te resuelve el problema, no como un software corporativo)
- Compilación: spring suave (sin rebote exagerado) · duración base 250ms · exclamaciones máx 1/pantalla (el saludo "¡Hola, Profe! 👋") · celebración nivel medio (al completar el 100% del anillo semanal) · radio tendencial 20px

## Brand kit final (los valores que viven en tokens.css / globals.css)
- Fondo: #FEFCFB · Superficie: #FFFFFF · Hundido: #F2EEFA (crema con tinte lavanda, para el nivel más profundo) · Texto 1º/2º: #2B2140 / #716C7E
- Acento: #7B5DFB (botones primarios, anillo, nav activa, chips de ícono) · 2ª nota: #FB4A6E (mascota IA, celebraciones, badge de IA)
- Semánticos: éxito #2F9E5B · error #E5484D · aviso #F5A623
- Display: Baloo 2 (pesos 600/700/800) · Body: Nunito (pesos 400/600/700) · Escala: display 28-32px / title 18-20px / body 15-16px / label 12-13px
- Radio: 20px cards · 14px botones · 999px chips/nav · Profundidad: 3 niveles por color de superficie (fondo/superficie/hundido), sombras muy sutiles tintadas de #7B5DFB · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: el ANILLO de progreso "% de tu semana lista" — mismo mecanismo que la referencia, pero es coherente con nuestro eje de diferenciación (generación en lote semanal), así que lo adoptamos como propio, no como copia decorativa
- Motion signature: easing ease-out suave · stagger 60-80ms en la entrada de cards · el anillo se DIBUJA (no aparece de golpe) al cargar

## Trazabilidad y vetos
- Ruta de diseño: RÉPLICA FIEL de la referencia visual del usuario (capturas completas de Aula Mágica) + inserción de la mascota
- Réplica fiel: `docs/revisiones/replica-fiel.html` · capturas de referencia archivadas en: `docs/revisiones/referencia-1-inicio.webp`, `docs/revisiones/referencia-4-planner.webp` · test de fidelidad: PASA (modo claro ✓ · hue lavanda/morado ✓ · clase tipográfica redondeada bold ✓ · radios ~20px ✓ · densidad comparable ✓ · sombras sutiles sin dureza ✓) — 0 desvíos
- Tour de la app: `docs/revisiones/vista-previa-app.html` · vistas incluidas: Principal/M0, Onboarding, Mecanismo (Crear actividad, con la mascota chica y feliz), Paywall · aprobado por el usuario: PENDIENTE (se presenta ahora)
- Paleta derivada de: referencia del usuario (acento primario) + mascota/Kalm (2ª nota) — tomada tal cual, sin perturbar el hue
- Registro anti-repetición: paleta #7B5DFB/#FB4A6E + par Baloo 2/Nunito anotados en ESTADO.md → vetados para el próximo proyecto del SO
- Modo (claro/oscuro) DERIVADO por: la propia referencia del usuario ya es modo claro — no se asumió, se copió

## Idioma UI: español latino neutro · Fecha de cierre de la ficha: 2026-09-25 · Aprobada por el usuario: SÍ (2026-09-25) — con un ajuste: la mascota se mueve de "Inicio" a la pantalla de "Crear actividad", chica y feliz
