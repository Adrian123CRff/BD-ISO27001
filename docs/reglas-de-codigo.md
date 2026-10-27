# Reglas de código del proyecto

Base: las **"Power of 10"** de Gerard J. Holzmann (NASA/JPL, Laboratory for Reliable Software), pensadas para
software crítico en C. Aquí se adaptan a este proyecto (TypeScript/React para el artefacto y SQL/PL-SQL para los
scripts de verificación). Las reglas originales están parafraseadas; ver la referencia al final.

## Las 10 reglas, adaptadas

| # | Regla original (resumida) | Cómo se aplica aquí |
| --- | --- | --- |
| 1 | Flujo de control simple: sin `goto`, sin saltos no locales y sin recursión | Sin recursión ni saltos raros; preferir retornos tempranos simples. En PL/SQL, sin `GOTO`. Los componentes React no se llaman a sí mismos de forma recursiva salvo árboles de datos acotados y justificados |
| 2 | Todo ciclo tiene un límite superior fijo y demostrable | Recorrer arreglos finitos con `map`/`for...of`; nada de `while (true)`. Las consultas SQL de verificación siempre acotadas (`FETCH FIRST n ROWS ONLY` cuando listan) |
| 3 | No reservar memoria dinámica después de la inicialización | Los datos del artefacto (riesgos, controles, matriz) son **constantes tipadas** cargadas al inicio; la UI no crece estructuras sin límite. Sin cachés ni listas que crezcan indefinidamente |
| 4 | Funciones cortas: lo que cabe en una página (unas 60 líneas) | Funciones y componentes de 60 líneas o menos; si crecen, se dividen. Scripts SQL: un archivo por control o por prueba |
| 5 | Al menos dos aserciones por función, sin efectos secundarios, con acción explícita si fallan | Validar entradas y supuestos con comprobaciones explícitas (por ejemplo `assert(criterio >= 0 && criterio <= 4)`). Validación de los datos al cargar (todo control referencia un riesgo y una tarea existentes) en una prueba automática |
| 6 | Declarar cada dato en el alcance más pequeño posible | `const` por defecto, variables locales; nada global mutable. En PL/SQL, variables dentro del bloque que las usa |
| 7 | Revisar el valor de retorno de toda función y validar parámetros | Sin promesas sin manejar; todo `fetch`/lectura con manejo de error visible. En SQL, `WHENEVER SQLERROR EXIT FAILURE` en los scripts de verificación |
| 8 | Preprocesador limitado a lo mínimo | Sin metaprogramación ni generación de código en tiempo de ejecución (nada de `eval` ni SQL dinámico armado con texto del usuario); `EXECUTE IMMEDIATE` solo con valores controlados y justificado |
| 9 | Punteros restringidos: un solo nivel de indirección y sin punteros a función | Estructuras de datos planas y legibles; evitar cadenas largas de `a?.b?.c?.d` y callbacks anidados; sin `any` en TypeScript |
| 10 | Compilar con todas las advertencias activas desde el primer día, cero advertencias, análisis estático diario | TypeScript en modo `strict`, linter (oxlint) sin advertencias, compilación y pruebas antes de cada commit. **Adaptación:** el artículo pide análisis estático diario; aquí se ejecuta antes de cada commit, no por calendario. Los scripts SQL se ejecutan contra la base de laboratorio antes de entregarse |

## Reglas propias del proyecto (seguridad y confidencialidad)

- **Mínimo privilegio también en el código**: los scripts de verificación se ejecutan con un usuario auditor de solo
  lectura (consultas a vistas del diccionario), no con `SYS`, salvo los pasos de configuración que lo requieran y que
  estén marcados.
- **Sin secretos en el repositorio**: contraseñas, wallets de TDE y archivos de respaldo nunca se versionan
  (ver `.gitignore`).
- **Toda afirmación del artefacto tiene evidencia**: cada control marcado "Cumple" enlaza el script SQL y la salida
  que lo demuestra.
- **Trazabilidad del uso de IA**: cada prompt de fase (`prompts-claude-code.md`) se registra textualmente en
  `docs/uso-ia.md`; las conversaciones no se registran.

## Referencia

Holzmann, G. J. (2006). The power of 10: Rules for developing safety-critical code. *Computer, 39*(6), 95-97.
https://doi.org/10.1109/MC.2006.212
