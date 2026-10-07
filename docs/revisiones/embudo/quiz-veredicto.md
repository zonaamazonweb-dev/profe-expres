# VEREDICTO revisor-visual — quiz (pregunta 1 de 5)
Fecha: 2026-10-07 12:00
Screenshot: docs/revisiones/embudo/quiz-p1-375.png
Usabilidad: 30/40
Craft: 15/20
Copy (si vende): 12/20
Fidelidad (si hubo referencia): FIEL
Veredicto: NO LISTA
Top defectos: 1) Copy sin especificidad ni prueba ni dolor: el hint de la P1 ("Elige la que más se parezca a ti") no dice que el quiz calcula las horas del año ni cuánto tarda; la frase de promesa solo vive como fallback en el código. 2) Hueco muerto de ~120px entre opciones y mascota, y mascota duplicada (header 28px + pie 56px, la ficha pide 40-48px). 3) Jerarquía con 5 tamaños (13/24/15/17/14); opciones a 17px/800 compiten con el título; "Pregunta 1 de 5" en gris vs Eyebrow acento del resultado. 4) Viuda "Docs" en la opción 1 (encaje óptico). 5) Auto-avance a 260ms sin aviso, sin stagger de opciones, radiogroup sin navegación por flechas (roving tabindex).
