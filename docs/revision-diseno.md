# Revisión de diseño y accesibilidad (Fase 8)

Revisión de la app (`app/`) como la haría un revisor exigente: jerarquía visual, consistencia, legibilidad de la
matriz y del mapa, WCAG 2.2 AA y textos. Se corrigieron los hallazgos de prioridad **alta** y **media**; los de
prioridad **baja** quedan listados.

## Método

| Herramienta | Uso |
| --- | --- |
| UI UX Pro Max (lista previa a la entrega) | Crítica de diseño: íconos SVG, cursor en elementos clicables, transiciones de 150-300 ms, contraste, foco visible, movimiento reducido y anchuras de 375 a 1440 px. Se usó en lugar de `impeccable` por preferencia del estudiante. |
| fixing-accessibility | Revisión del código contra sus reglas: nombres accesibles, teclado, foco, semántica y anuncios |
| axe-core 4.10 (WCAG 2.0/2.1/2.2 A y AA, más buenas prácticas) | Auditoría automática de las 9 vistas en modo claro y oscuro (18 combinaciones) |
| break-ui | Datos extremos realistas, solo en desarrollo (`?datos=extremo`, `app/src/datos/extremo.ts`); la compilación de producción los elimina |
| playwright-cli | Capturas a 320, 360, 768, 1024 y 1440 px, pruebas de teclado y verificación de cada corrección |

Datos extremos usados (cada uno realista para este proyecto): tres factores con los mismos valores y los cinco con el
mismo residual objetivo (si el estudiante ajusta `riesgos.ts`); un control que vuelve a fallar en una corrida
posterior (A8.3 y la prueba P06); un script renombrado cuya salida ya no se encuentra (A8.20); un error largo de Oracle.

## Hallazgos corregidos

| # | Prioridad | Hallazgo | Causa | Corrección | Verificación |
| --- | --- | --- | --- | --- | --- |
| 1 | Alta | Con tres o más factores en la misma celda, los marcadores del mapa se salían a las celdas vecinas: el mapa mostraba **valores equivocados** (el 01 parecía tener probabilidad 1) | Los marcadores se alineaban en una sola fila con 38 px de separación | Rejilla dentro de la celda (1-2 en fila, 3-4 en 2×2, 5 en 3+2) con radio menor cuando hay más de dos | Capturas antes y después con datos extremos (`evidencia/revision/`) |
| 2 | Media | En el interruptor Antes/Después, las flechas cambiaban la fase pero el foco quedaba en la opción anterior, que ya no se puede alcanzar con Tab | Faltaba mover el foco | El foco pasa a la opción elegida (`InterruptorFase.tsx`) | Prueba de teclado: el foco queda en "Antes", marcada |
| 3 | Media | Al cerrar el cajón de una prueba, el foco se perdía | No se devolvía el foco a quien abrió el cajón | El foco vuelve al botón de la prueba (`Bateria.tsx`); además el cajón recibe el foco al abrirse y Escape lo cierra | Prueba de teclado: P09, Enter, Escape, foco en P09 |
| 4 | Media | El título de la pestaña no cambiaba entre secciones (WCAG 2.4.2) | Aplicación de una sola página sin actualizar `document.title` | Título "Sección · Evaluador de confidencialidad" (`App.tsx`) | Título leído en la prueba |
| 5 | Media | Texto "antes N" sobre la fila seleccionada con contraste 4.14:1 (WCAG 1.4.3) | Tinta auxiliar sobre el fondo de selección | Tinta secundaria (`app.css`) | axe: 0 problemas |
| 6 | Media | Los paneles de evidencia eran `<aside>` dentro del contenido principal | Landmark complementario anidado | Regiones `<section>` con nombre (`PanelEvidencia.tsx`, `Bateria.tsx`) | axe: 0 problemas |
| 7 | Media | En Controles observables se saltaba de `h1` a `h3` | Faltaba el título de la primera lista | Título "Los 15 controles del enunciado" (`Observables.tsx`) | axe: 0 problemas |
| 8 | Media | Al elegir un control, un lector de pantalla no se enteraba de que apareció su evidencia | Panel sin anuncio | Región `aria-live` que anuncia "Evidencia de A8.2 abierta junto a la matriz" (`CadenaMatriz.tsx`) | Texto del anuncio leído en la prueba |
| 9 | Media | Controles observables desbordaba 3 px a 320 px (WCAG 1.4.10, reflujo) | Insignias de estado sin ajuste de línea junto al número | Las insignias pasan de línea y la tarjeta se apila en pantallas angostas (`app.css`) | Ancho del documento a 320 px: 320 |

Durante la construcción (Fase 7) ya se habían corregido, también con capturas: aros del mapa invisibles sobre celdas
oscuras, columna "Estado" cortada, códigos de riesgo partidos en tres líneas, panel vacío ocupando espacio, columnas
de la batería cortadas por el panel (ahora cajón lateral) y un enlace "Saltar al contenido" que rompía la navegación.

## Resultado final

- **axe-core**: 0 problemas en las 9 vistas, en claro y en oscuro (`evidencia/revision/axe-antes.json` →
  `axe-despues.json`).
- **Reflujo**: ninguna de las 9 vistas desborda a 320, 360 ni 1440 px; a 768 y 1024 px se revisaron las cinco más
  densas (Resumen, Riesgos, Matriz, Batería y Mapeo), también sin desbordes.
- **Teclado**: todo se alcanza con Tab; foco visible de 3 px; el mapa se maneja con Enter y Espacio.
- **Contraste**: todos los pares de texto superan 4.5:1 (calculado en `docs/design-system.md`).
- **Estados**: distinguibles en escala de grises (ícono, texto y borde sólido, punteado o doble).
- **Movimiento reducido**: el mapa cambia sin animación.
- **TypeScript estricto, lint y compilación**: sin errores. Capturas finales de cada vista en `evidencia/app/`.

## Lo que resistió los datos extremos

- Un control que vuelve a fallar: el factor no baja en el mapa, la lista dice "Pendiente: A8.3, A8.8" y el nivel
  global dice "4 Alto, meta pendiente". La app no oculta que la meta no se cumple.
- Una salida que no se encuentra: el panel muestra "(No se encontró …)" sin romperse.
- Un error largo de Oracle: se ajusta dentro del panel.
- La validación de datos (regla 5) acepta los datos extremos porque siguen siendo coherentes.

## Prioridad baja (no corregidos)

| # | Hallazgo | Propuesta |
| --- | --- | --- |
| B1 | Solo con datos extremos: un factor que no bajó queda centrado en su celda y tapa en parte los aros de los que sí bajaron | Ubicar los factores que no se movieron con la misma rejilla que los aros de su celda |
| B2 | Los enlaces "Ver salida" y "Ver su evidencia en la matriz" se repiten 17 veces; se entienden por su contexto (WCAG 2.4.4, AA) | Agregar el código del control como texto oculto para lectores de pantalla (2.4.9, AAA) |
| B3 | Los bloques de código desplazables se pueden enfocar pero no tienen nombre propio; la ruta del archivo está justo encima | `aria-label` con la ruta del archivo |
| B4 | En móvil las tablas se muestran como tarjetas y los lectores de pantalla pierden la semántica de tabla (cada dato conserva su etiqueta visible) | Aceptable; alternativa: `role="table"` explícito en el modo tarjeta |
| B5 | El nivel de cada celda del mapa solo está en su `<title>` (no alcanzable con teclado) | La leyenda y la lista de factores ya dan la misma información; no es necesario |
| B6 | ~~La vista Uso de IA es muy larga (17 registros)~~ | Resuelto el 22/10/2026: la vista se quitó del artefacto; el uso de IA va solo en el informe (sección 8 del enunciado) |
| B7 | Las capturas de `evidencia/app/` pesan unos 10 MB | Comprimirlas a WebP si el tamaño del repositorio importa |

## Textos

Se revisaron en español todos los textos de la interfaz: términos consistentes con el enunciado (Cumple / Parcial /
No cumple, criterio 0-4, controles observables), cada vista con su texto literal del enunciado, sin anglicismos en
la interfaz (los nombres técnicos de Oracle y de las vistas del diccionario se mantienen tal cual).
