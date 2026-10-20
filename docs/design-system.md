# Sistema de diseño del evaluador

Fuente de verdad visual de la app (`app/`). Los tokens viven en `app/src/styles/tokens.css`; los componentes solo usan
estos nombres, nunca colores ni medidas sueltas.

## Origen de las decisiones

- **Estilo**: "Minimalismo y estilo suizo" recomendado por la skill UI UX Pro Max para tableros y herramientas
  profesionales (`--design-system` con densidad alta y movimiento sutil): grilla clara, alto contraste, sin ornamento.
- **Paleta**: perfil "Government / Public Service" de la misma skill (azul marino de alto contraste con un acento azul),
  elegida por el contexto institucional y porque la app se **proyecta con luz encendida**: el modo claro es el
  principal y el oscuro tiene pasos propios.
- **Tipografía**: par "Corporate Trust" de la skill (Lexend para títulos y cifras, Source Sans 3 para texto, ambas
  pensadas para la legibilidad) más Fira Code para códigos, SQL y salidas. Las fuentes se sirven desde la propia app
  (`@fontsource`), para que funcione sin internet en el aula.
- **Mapa de calor**: método de la skill `dataviz`; la rampa del nivel de riesgo se validó con su script
  (`validate_palette.js --ordinal`) en modo claro y oscuro: un solo tono, luminosidad monótona y extremo claro visible.

## Principios

1. **Ningún estado depende solo del color**: cada estado tiene ícono, texto y forma de borde.
2. **Toda cifra lleva a su evidencia**: los códigos (V07, C04, P10) son siempre los mismos en toda la app.
3. **Contraste de texto ≥ 4.5:1** en claro y en oscuro (WCAG 2.2 AA); objetivos táctiles de al menos 44 px.
4. **Movimiento con significado**: solo el cambio Antes/Después y los marcadores del mapa se animan; con movimiento
   reducido todo cambia sin animación.

## Color

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--fondo` | `#f8fafc` | `#0b1220` | Fondo de la página |
| `--superficie` | `#ffffff` | `#111827` | Tarjetas, tablas, paneles |
| `--superficie-2` | `#eef2f6` | `#1f2937` | Fondos secundarios: código, hover, interruptor |
| `--navegacion` | `#0f172a` | `#020617` | Barra lateral |
| `--navegacion-activa` | blanco 14 % | blanco 12 % | Sección actual y hover en la barra lateral |
| `--tinta` | `#0f172a` | `#f1f5f9` | Texto principal |
| `--tinta-2` | `#475569` | `#cbd5e1` | Texto secundario (7.6:1 / 12.0:1) |
| `--tinta-3` | `#64748b` | `#94a3b8` | Texto auxiliar (4.8:1 / 6.9:1) |
| `--borde` / `--borde-fuerte` | `#e2e8f0` / `#cbd5e1` | `#1f2937` / `#334155` | Separadores y contornos |
| `--acento` | `#0369a1` | `#38bdf8` | Enlaces, códigos de evidencia, selección (5.9:1 / 8.3:1) |
| `--acento-suave` | `#e0f2fe` | azul 14 % | Fondo de la fila o el factor seleccionado |
| `--foco` | `#0369a1` | `#38bdf8` | Anillo de foco del teclado (3 px) |
| `--cumple` | `#047857` | `#34d399` | Estado Cumple (5.5:1 / 9.2:1) |
| `--parcial` | `#b45309` | `#fbbf24` | Estado Parcial (5.0:1 / 10.6:1) |
| `--no-cumple` | `#b91c1c` | `#f87171` | Estado No cumple (6.5:1 / 6.4:1) |
| `--riesgo-1` … `--riesgo-5` | `#86b6ef` → `#104281` | `#184f95` → `#9ec5f4` | Nivel de riesgo 1-5 en el mapa (un solo tono) |
| `--marcador` / `--marcador-texto` | `#0f172a` / blanco | `#f1f5f9` / `#0f172a` | Marcadores de los factores R-CONF |

## Estados: distinguibles en escala de grises

| Estado | Ícono | Borde | Color |
| --- | --- | --- | --- |
| Cumple | círculo con ✓ | sólido | `--cumple` |
| Parcial | círculo a medias | punteado | `--parcial` |
| No cumple | círculo con ✗ | doble | `--no-cumple` |

**Madurez 0-4**: cuatro cuadros, tantos llenos como el nivel, más el número. **Nivel de riesgo 1-5**: rampa de un
solo tono (más oscuro = más riesgo en claro; más claro = más riesgo en oscuro) con leyenda nombrada (Muy bajo … Crítico).
**Factores R-CONF**: se identifican por su número (01-05) en el marcador, nunca por el color. Las celdas del mapa no llevan texto: el nivel se lee en la leyenda y en el tooltip.

Contrastes calculados con la fórmula de WCAG 2.2 sobre la superficie donde se muestra cada texto; todos los pares de texto de la app superan 4.5:1.

## Tipografía

| Token | Valor | Uso |
| --- | --- | --- |
| `--fuente-titulo` | Lexend | Títulos, cifras grandes |
| `--fuente-texto` | Source Sans 3 | Texto, tablas, controles |
| `--fuente-codigo` | Fira Code | Códigos de control y riesgo, SQL, salidas |
| `--texto-xs` … `--texto-2xl` | 13, 14, 16, 18, 22, 28 px | Escala de la interfaz (base 16 px) |
| `--texto-hero` | 64 px | Nivel de riesgo principal |

Las cifras usan números tabulares cuando se alinean en columnas.

## Espacio, forma y movimiento

| Token | Valor | Uso |
| --- | --- | --- |
| `--e-1` … `--e-7` | 4, 8, 12, 16, 24, 32, 48 px | Escala de espacio (densidad de tablero) |
| `--radio-s` / `--radio-m` | 6 / 10 px | Controles / tarjetas |
| `--sombra` | sombra de 1 px (ninguna en oscuro) | Separar tarjetas del fondo |
| `--mov-rapido` | 160 ms | Hover y cambios de estado |
| `--mov-medio` | 600 ms | Desplazamiento de los marcadores del mapa |
| `--curva` | `cubic-bezier(0.22, 1, 0.36, 1)` | Salida suave, sin rebote |

## Componentes base

| Componente | Archivo | Notas |
| --- | --- | --- |
| Navegación lateral | `componentes/Navegacion.tsx` | Las seis partes del artefacto, metodología y uso de IA; cambio de tema |
| Interruptor Antes/Después | `componentes/InterruptorFase.tsx` | Grupo de radio; flechas del teclado |
| Insignia de estado y madurez | `componentes/Estado.tsx` | Ícono + texto + borde |
| Mapa de calor | `componentes/MapaCalor.tsx` | Marcadores con teclado y tooltip; aro punteado = posición inherente |
| Lista de factores | `componentes/ListaRiesgos.tsx` | Vista en tabla del mapa y filtro de la matriz |
| Matriz | `componentes/Matriz.tsx` | Columnas literales del enunciado |
| Panel de evidencia | `componentes/PanelEvidencia.tsx` | Criterios, script SQL y salida real |

## Adaptación

Escritorio desde 1440 px (proyección); a 1240 px el panel de evidencia baja debajo de la matriz; a 1080 px el mapa baja
debajo de la cifra; a 860 px la barra lateral pasa arriba; se revisa a 390 y 360 px sin desbordamiento horizontal.
