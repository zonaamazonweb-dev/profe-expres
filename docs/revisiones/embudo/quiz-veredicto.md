# VEREDICTO revisor-visual — quiz (pregunta del quiz / onboarding)
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/embudo/quiz-p1-375.png
Usabilidad: 29/40
Craft: 14/20
Copy (si vende): 13/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: 1) Copy sin especificidad ni prueba: las 5 preguntas no tienen ningun numero ni dato del avatar, la P1 no usa escena del domingo en la noche, y nada dice por que se pregunta ni que recibira al final (eje oferta y especificidad en 2) -> agregar microcopy de "para que" (ej. "Con esto calculamos cuantas horas de tu ano puedes recuperar") y una escena real en P1/P3. 2) Profundidad plana: fondo crema liso, cards blancas con borde lavanda 2px y sin sombra tintada ni superficie hundida; la zona inferior (~300px a 375x812) queda como vacio muerto -> aplicar sombra tintada de Card, fondo con mesh/gradiente sutil y mover mascota/elemento de valor (ej. "tu ahorro estimado" o tip) al hueco inferior. 3) Identidad pobre en esta pantalla: la mascota es de 28px en el header y la pantalla no tiene ningun dispositivo ownable (anillo, ilustracion) mas alla del titulo en Baloo -> mascota grande reaccionando a la respuesta o mini-anillo de avance. 4) Auto-avance a 260ms sin confirmacion: un toque errado salta de pregunta; solo se deshace con la flecha; sin :focus-visible ni teclado en radios; sin stagger de entrada de opciones -> agregar stagger 60ms, focus-visible y tolerancia de deshacer. 5) Texto de interes y respuestas en femenino unico ("interesada", "segura") excluye al sub-avatar profesor; barra de progreso topada a 62% y desfasada del "Pregunta N de 5" -> usar neutro ("Que tanto te interesaria") y alinear progreso con 5 pasos.
