# Memo: qué modelo usar para planear la reubicación de bicicletas

**Para:** Equipo de reubicación matutina, sistema de bicicletas compartidas de Washington D.C.
**De:** Rodolfo Flores, Nohel Estrada y Humberto Najar
**Fecha:** 6 de noviembre de 2026
**Asunto:** Veredicto sobre el modelo de demanda por hora (datos de 2011)

## 1. Recomendación: el *random forest*, con su ficha de evidencia

Comparamos cinco modelos para predecir cuántas bicicletas se usan en cada hora: regresión lineal (OLS), ridge, vecinos más cercanos (*k*-NN), un árbol de decisión y un *random forest*. **Recomendamos el *random forest*.** Tiene el error más bajo: se equivoca en unas 27 bicicletas por hora en promedio, contra 53 de *k*-NN y 85 de los modelos lineales. El árbol simple queda cerca en ese promedio (27 bicis), pero su error cuadrático es 38 % mayor: se equivoca por más cuando se equivoca.

No lo recomendamos solo por el error. Cada predicción del bosque es un **promedio ponderado de horas históricas concretas**, así que podemos decir *por qué* predijo lo que predijo: "estas 11 de la mañana de viernes se parecen a las mañanas de 10 a 12 h de esa misma semana, que tuvieron entre 168 y 235 bicicletas". Esas horas son los **testigos** de la predicción y se pueden revisar una por una.

Los modelos lineales también son un promedio de horas históricas, pero de **todas** a la vez, y un tercio de ellas o más vota **en contra** (pesos negativos): tardes lluviosas de verano lejanísimas terminan pesando en un pronóstico de un viernes de octubre. Además, no captan los dos picos de la hora punta. El árbol tiene testigos fáciles de listar, pero a veces vienen de otra temporada (mañanas de mayo para predecir octubre).

## 2. Cuándo no confiar en una predicción

Junto a cada número se puede entregar su ficha: la predicción, sus 5 testigos y qué tan de acuerdo están entre sí. Recomendamos **desconfiar** (y revisar a mano o dejar margen de bicicletas) cuando:

- **Los testigos no coinciden entre sí.** Es la mejor alarma que encontramos: en el 20 % de horas donde los testigos más discrepan, el error es **tres veces** mayor que en el 20 % donde coinciden.
- **Una sola hora histórica decide casi todo** y esa hora no se parece a la que se predice (otra hora del día, otro tipo de día, otro clima). Si el testigo es "la hora anterior del mismo día", es creíble; si es un día de otra estación, no.
- **Madrugadas (1 a 5 h) y clima malo.** Con muy pocas bicicletas, un error de 3 bicis ya es grande en proporción. El impacto operativo es pequeño, pero las cifras de esas horas son poco fiables.
- **Días atípicos** (tormentas, feriados, eventos). La hora con mayor error del bosque fue un mediodía de enero con solo 3 bicicletas. En esos casos los distintos modelos también discrepan mucho entre sí (de 23 a 58 bicis), y esa discrepancia sirve como segunda alarma.

Ojo con una trampa: **"cuántas horas votan" no basta**. El número de testigos efectivos no predijo el error en nuestros datos. Lo que importa es si los testigos están de acuerdo.

## 3. Qué decisión de modelado cambiaría más la respuesta

- **La partición entre entrenamiento y prueba (la más importante).** Evaluamos separando horas al azar, así que el modelo pudo ver otras horas del mismo día. Ustedes planean en la mañana, sin esas horas. Si evaluamos dejando fuera **días completos**, el error del bosque sube cerca de 45 %. El bosque sigue siendo el mejor, pero la precisión que deben esperar en la operación real es la de días completos, no la del primer cálculo.
- **La escala de las variables.** Con *k*-NN, medir en unidades originales (días y horas) dio un error 28 % menor que estandarizar, porque así "parecido" quiere decir "misma hora en días vecinos". Al estandarizar, cambian los testigos y los grupos que forma el algoritmo de *clustering*. La escala define qué cuenta como parecido.
- **La flexibilidad.** Con pocos vecinos o árboles muy profundos el modelo memoriza; con demasiados, promedia horas que no se parecen. Los valores que usamos se eligieron con validación cruzada. Cambiarlos mueve el error hasta al doble.

**En resumen:** usen el *random forest*, entreguen siempre los testigos junto a la predicción, desconfíen cuando los testigos discrepen y esperen el error de "días completos" en la operación diaria.
