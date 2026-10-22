# Guion de exposición del avance

Apoyo para exponer el artefacto en clase si el profesor lo pide. No es un entregable: son ideas y frases de
referencia para decirlas **con tus propias palabras**. La app se abre en `http://localhost:4173` (o desde `app/dist`).

## 1. La idea en un minuto (para entenderla antes de exponerla)

1. **El problema.** Una cooperativa ficticia (Cooperativa Financiera del Valle) guarda en Oracle cédulas, salarios y
   tarjetas de 200 clientes. Su riesgo de confidencialidad es **4 (Alto)** y la administración quiere bajarlo a
   **2 (Bajo)**. Es el mismo caso que el profesor puso en la pizarra.
2. **Los tres mundos.** Para bajar ese riesgo hay que unir tres cosas que normalmente van por separado:
   - lo **administrativo**: la norma ISO 27001/27002 y el control interno;
   - lo que hace el **DBA**: usuarios, privilegios, perfiles, cifrado, respaldos, auditoría…;
   - las **herramientas de Oracle** que lo demuestran: consultas al diccionario, AUDIT, RMAN.
3. **La matriz los une.** Cada fila dice: esta **tarea** del DBA, contra este **factor de riesgo**, se controla con
   este **control ISO**; se mide de **0 a 4** con este **script SQL** y este es su **estado**.
4. **PHVA.** Planificar (escenario con las debilidades), Hacer (correcciones C01-C15), Verificar (18 scripts de
   verificación y 19 pruebas, antes y después) y Actuar (revisión semanal y riesgo aceptado).
5. **El resultado.** Antes: 11 controles en No cumple, 6 en Parcial y 0 de 19 pruebas superadas. Después: 16 controles
   en Cumple con madurez 4, A8.8 en Parcial (riesgo aceptado) y 19 de 19 pruebas superadas. **Riesgo 4 → 2.**

Si solo recuerdas una frase: *"La matriz convierte cada control ISO en una consulta que cualquiera puede ejecutar, y
el resultado de esa consulta es lo que decide si el control se cumple."*

## 2. Antes de exponer

- [ ] Abrir la app (`npx vite preview --port 4173` dentro de `app/`) y dejarla en **Resumen**, en modo claro, con la
      pantalla proyectada a buen tamaño.
- [ ] Tener a mano los enlaces directos de la sección 3 (se pueden pegar en la barra de direcciones).
- [ ] **Solo si vas a hacer la demostración en vivo:** iniciar Docker Desktop, luego `.\scripts\iso-lab.ps1 -Iniciar`
      y `-Estado` hasta ver `Base lista: True`, y tener SQL Developer conectado como `ISO_AUDITOR`
      (ver `docs/guia-sql-developer.md`). La madurez 4 y el control del clon exigen registros de los últimos 7 días:
      si la demostración es más de una semana después de la última corrida, adelanta la revisión semanal con
      `.\scripts\ejecutar-sql.ps1 sql\mantenimiento\M02-revision-semanal.sql -Como sys -Salida evidencia\mantenimiento`
      (la misma tarea programada de los lunes) o muestra solo un control de privilegios (V07), que no depende de la fecha.
- [ ] Ensayar una vez con cronómetro.

## 3. Guion (unos 8 minutos)

| Tiempo | Qué mostrar | Qué decir (ideas clave) |
| --- | --- | --- |
| 0:00-0:45 | **Resumen** `#/resumen?fase=antes` | Presentación del caso: la cooperativa, los datos que protege (Ley 8968) y la meta de la administración: riesgo de confidencialidad de 4 a 2. "El artefacto es un evaluador del riesgo de confidencialidad." |
| 0:45-1:45 | **Resumen**: mapa de calor e interruptor **Antes/Después** | Explicar el mapa: impacto por probabilidad, cinco factores de riesgo. Cambiar a **Después**: los puntos bajan porque los controles reducen la **probabilidad**; el **impacto** no cambia, porque el dato sigue siendo igual de sensible. |
| 1:45-2:45 | **1 · Riesgos** `#/riesgos?fase=antes` | Los cinco factores R-CONF-01 a 05 con su impacto y probabilidad. Destacar que la probabilidad 4 no es una opinión: **una prueba lo demostró** (por ejemplo, P04: la cuenta de la aplicación creó un usuario porque tenía el rol DBA). Fórmula: nivel = impacto × probabilidad / 5, redondeado hacia arriba. |
| 2:45-3:30 | **2 · Tareas** y **3 · Mapeo** | Las 12 tareas del DBA que pide el enunciado y el control ISO de cada una. En el mapeo, cada control trae su justificación, la implementación sugerida y la **evidencia observable** (la consulta, por ejemplo `SELECT * FROM DBA_SYS_PRIVS`). |
| 3:30-4:00 | **4 · Controles observables** | Los 15 controles del enunciado, más A8.24 (TDE) y A8.8 (parcheo) como complementarios, cada uno con la pregunta que haría un auditor externo. |
| 4:00-5:45 | **5 · Matriz** `#/matriz?fase=antes&control=A8.2` | **El corazón del trabajo.** Leer una fila completa: Tarea *Privilegios* · Riesgo *R-CONF-02* · Control *A8.2* · Criterio *1* · Evidencia (abrir el script V07 y su salida real: APP_WEB tenía el rol DBA y había 2 privilegios ANY; solo 1 de 4 criterios se cumplía) · Estado *Parcial*. Cambiar a **Después**: 4 de 4 criterios, madurez 4, Cumple, y la salida ya no muestra el rol. Explicar la escala 0-4 del profesor: 0 no existe, 1 existe pero no siempre, 2 se aplica, 3 documentado, 4 documentado y verificado con evidencia. |
| 5:45-6:45 | **6 · Pruebas** `#/pruebas?fase=antes&prueba=P09` | Las pruebas no consultan una configuración: **intentan el ataque**. P09 busca un texto testigo dentro del archivo de datos: antes aparece en claro; después de TDE, 0 coincidencias. Comparar: 0 de 19 pruebas antes, 19 de 19 después. |
| 6:45-7:30 | **Metodología** | PHVA con los scripts de cada paso. Actuar: revisión semanal programada en la base y el riesgo de A8.8 aceptado formalmente (Oracle XE no recibe parches). |
| 7:30-8:00 | Volver a **Resumen** en **Después** | Cierre: riesgo de 4 a 2, demostrado con scripts que cualquiera puede repetir; todo está en el repositorio. |

### Versión corta (3 minutos)

1. **Resumen en Antes** (40 s): el caso y la meta de 4 a 2.
2. **Matriz, fila A8.2** (80 s): leer la fila completa, abrir la evidencia y cambiar a Después.
3. **Prueba P09** (40 s): el dato en claro dentro del archivo, antes y después de TDE.
4. **Resumen en Después** (20 s): 16 de 17 controles en Cumple, 19 de 19 pruebas superadas y riesgo 2.

### Demostración en vivo (opcional, 1 minuto)

En SQL Developer, como `ISO_AUDITOR`, ejecutar `sql/verificacion/V07-A8.2-acceso-privilegiado.sql` y mostrar que la
línea `CRITERIO|A8.2|…` coincide con lo que muestra la app. Así se ve que la app no inventa nada: solo presenta
lo que devolvieron los scripts.

## 4. Preguntas probables

| Pregunta | Respuesta (ideas) |
| --- | --- |
| ¿La app consulta la base en vivo? | No. Es un sitio estático que muestra los resultados de una corrida real. Así el profesor la abre sin Docker y no se expone ninguna contraseña. Cada dato trae su script y su salida, y la corrida se puede repetir con `scripts/`. |
| ¿Por qué el riesgo baja de 4 a 2 y no a 1? | Los controles bajan la probabilidad a 2 (habría que eludir un control activo y verificado), pero el impacto sigue alto porque los datos siguen siendo sensibles. 2 es el residual que la administración acepta. |
| ¿Por qué A8.8 queda en Parcial? | Oracle 21c XE no recibe parches (Release Updates). No se puede cumplir del todo, así que el riesgo se **acepta formalmente** con medidas compensatorias: cuentas internas cerradas, puerto solo local, red cifrada y plan de migración. P18 verifica esa aceptación. |
| ¿Cómo se decide la madurez? | Con criterios técnicos que calcula cada script: 0 si no se cumple ninguno, 1 si se cumplen algunos, 2 si se cumplen todos, 3 si además hay un procedimiento aprobado y 4 si además la revisión semanal dejó registro en los últimos 7 días. |
| ¿Quién ejecuta las verificaciones? | `ISO_AUDITOR`, un usuario de solo lectura del diccionario. No puede leer datos de negocio ni cambiar nada (mínimo privilegio), igual que un auditor externo. |
| ¿Qué es "evidencia observable"? | Algo que un tercero puede comprobar sin confiar en mí: una consulta y su salida, por ejemplo `V$ENCRYPTION_WALLET` en estado OPEN. |
| ¿Los datos son reales? | No. Son 200 clientes sintéticos generados por `sql/01-escenario.sql`. |
| ¿Usaste IA? | Sí, y está documentado con los prompts exactos en la tabla de uso de IA del informe (sección 8), con la validación de cada aporte. |
