# VEREDICTO revisor-visual — oferta
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/embudo/oferta-375.png
Usabilidad: 27/40
Craft: 14/20
Copy (si vende): 10/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos:
1. Precio ausente ("Precio por confirmar") y sin garantía nombrada con plazo: la oferta no dice cuánto cuesta ni qué te protege (copy oferta 1/4). Fijar precio + stack con anclaje (horas ahorradas vs. costo por día) + garantía con nombre y plazo junto al CTA; sin esos datos la página no es publicable.
2. Los 4 CTAs (decisión, precio, final, sticky) están disabled al 50% de opacidad: texto blanco sobre #7B5DFB atenuado queda bajo 3:1, no hay tap, y el sticky aparece con un botón muerto. Falla el CTA héroe vivo. El estado es honesto (el aviso "El pago se activa muy pronto" lo explica) pero se ve como una página rota. Solución mínima: sustituir el botón apagado por un CTA habilitado de "Avísame cuando abra" (captura de correo/WhatsApp) con contraste pleno; al configurar el link de Hotmart, pasa al checkout.
3. Cero prueba y cero escena de dolor: sin testimonios (TESTIMONIALS vacío, la sección no se renderiza) y sin la escena de la ficha ("domingo en la noche armando fichas"). El dolor solo aparece como "80 horas al año". Agregar la escena del domingo en la tarjeta "Si sigues igual", y una prueba verificable (demo de ficha real o testimonio real), no inventada.
4. Movimiento incompleto (eje 2/4): hay stagger, whileTap 0.97 y sticky animado, pero no hay conteo animado de las horas ahorradas (héroe numérico), ni anillo de progreso (dispositivo firma de la ficha, ausente en esta pantalla), ni celebración, y no se verificó reduced-motion en el código. Animar el conteo de "≈ 80 horas" y respetar prefers-reduced-motion.
5. Carga y repetición: 6 beneficios seguidos (supera 4-5), 4 botones idénticos en una sola pantalla larga, y el texto del CTA "Quiero Profe Exprés" no es de beneficio en 1ª persona. Agrupar los beneficios en 3-4 (fusionar historial y tipos de pregunta), y cambiar el CTA a "Quiero mi semana de fichas lista".

Notas de verificación:
- Ficha-arte: los valores visibles coinciden (fondo crema #FEFCFB, acento #7B5DFB, Baloo 2 + Nunito, radios de 20px y 14px, mascota coral). Sin desvíos. La paleta no es de las vetadas del anti-clon.
- Titular con énfasis ("recuperar tu tiempo" en acento) OK. El borde degradé del recuadro de precio, los chips SVG Phosphor y los checks personalizados OK. Las secciones adyacentes se distinguen apenas: el fondo es casi todo uno, y las separa más el espaciado que un cambio de plano.
- Heurística 3 (código): hay flecha de volver (backHref="/video"); no hay acciones destructivas. Heurística 7: sin atajos, defaults correctos.
- Gate de carga cognitiva: 2 fallas (lista de 6 ítems; 4 elementos tapables que no hacen nada) por debajo del umbral crítico de 4.
- Copy por eje: idea 3, especificidad 2, emoción 2, oferta 1, acción 2. Un eje ≤2 se corrige aunque el total pase. Garantía nombrada: FALLA. Message-match: no hay dato del anuncio de origen, no verificable. Traza a FICHA-AVATAR: el avatar sigue en BORRADOR (sin VoC real), y el copy deriva de campos [DERIVADO].
- Gate doble: NO se cumple (27 de 36 requeridos en usabilidad, 14 de 16 en craft, 10 de 16 en copy).
