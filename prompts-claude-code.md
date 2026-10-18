# Prompts para Claude Code: Asignación ISO 27001, Confidencialidad (DBA 2)

Cómo usarlos:
- Abre Claude Code en `C:\Users\Adrian Fernandez\Documents\ChatGPT\Confidencialidad` y pega un prompt por fase, en orden.
- No pases a la siguiente fase hasta revisar el resultado de la anterior.
- Cada prompt pide a Claude registrarse a sí mismo en `docs\uso-ia.md`, porque el enunciado exige el prompt exacto. Tú completas la columna "Validación / Corrección del Estudiante".
- Lo que va entre [corchetes] lo ajustas tú antes de pegarlo.
- Para el avance obligatorio del jueves, la meta mínima es terminar la Fase 3 (laboratorio reconstruido y matriz antes/después con evidencia).

Todos los prompts siguen la misma estructura: Rol, Contexto, Tarea, Restricciones, Criterios de aceptación y Entregable.

Estado al 18/10/2026 (madrugada):
- Una sesión de Claude Desktop siguió trabajando en segundo plano sin autorización: recreó `iso-lab`, copió el volumen de la base (`iso-lab-antes`) y descargó la imagen completa `gvenzl/oracle-xe:21`. El disco C: llegó a 0 GB libres y Docker se cayó.
- Ya hecho: se borró la caché de npm (1,4 GB) y la caché de compilación de Docker (19,3 GB, de otros proyectos), y se reinició Docker Desktop. El contenedor `iso-lab` ya no existe.
- **Fase 1A completada**: se borraron los volúmenes `iso-lab-datos` e `iso-lab-antes` y la imagen `gvenzl/oracle-xe:21-slim`, se ejecutó `fstrim` y se compactó `docker_data.vhdx` (de 80,4 a 54,3 GB). C: quedó con 30,7 GB libres y Docker responde. `rman-lab` y `recu-lab` no se tocaron.
- Varias reparaciones de la Fase 1 ya están en el commit `68e93c1`, publicado en GitHub (ver la Fase 1 actualizada). La evidencia que hay en `evidencia/` y `app/src/datos/` es de corridas intermedias y se regenera completa en la Fase 3.

---

## Fase 1A. Liberar espacio en disco (bloqueante)

```
Rol: Administrador de sistemas Windows con experiencia en Docker Desktop sobre WSL 2.

Contexto: El disco C: llegó a 0 GB libres. El disco virtual de Docker (%LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx) ocupa 80,4 GB y creció al descargar las imágenes gvenzl/oracle-xe:21-slim y gvenzl/oracle-xe:21 y al copiar el volumen de la base. Ya se borraron la caché de npm y la caché de compilación de Docker (19,3 GB), pero ese espacio no vuelve a C: hasta compactar el .vhdx. El contenedor iso-lab ya no existe; todo el laboratorio se reconstruye desde los scripts versionados (commit 68e93c1), así que sus volúmenes no tienen valor.

Tarea:
1. Mide, sin modificar nada, el espacio libre de C:, el tamaño del disco virtual de Docker y lo que ocupa cada imagen, contenedor y volumen (docker system df -v).
2. Propónme una lista de qué borrar, separada en: (a) lo que es de este proyecto (contenedor iso-lab, volúmenes iso-lab-datos e iso-lab-antes, imagen gvenzl/oracle-xe:21-slim, caché de compilación); (b) lo que es de otros proyectos (rman-lab, recu-lab, monitor-*, oradb, Oracle-AdrianFer y sus imágenes), indicando a qué proyecto pertenece cada uno.
3. Después de mi confirmación explícita, borra solo lo que yo apruebe.
4. Dame los pasos para compactar el disco virtual de Docker (por ejemplo desde Docker Desktop o con wsl --shutdown y la compactación del .vhdx), para que yo los ejecute.

Restricciones:
- No borres nada sin mi confirmación, y nunca rman-lab ni recu-lab (son de otros trabajos del curso).
- No vacíes la papelera ni toques archivos personales; eso lo hago yo.
- No cambies la configuración de Docker Desktop ni de Windows.

Criterios de aceptación: Al terminar hay al menos 20 GB libres en C: y docker info responde sin errores.

Entregable: La tabla de espacio antes/después y la lista de lo que se borró. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 0. Orientación (solo lectura) · hecha el 17/10/2026

```
Rol: Actúa como DBA Oracle senior y auditor de seguridad de la información con experiencia en ISO/IEC 27001:2022 e ISO/IEC 27002:2022.

Contexto: Este repositorio es mi asignación individual "ISO 27001 – Confidencialidad – DBA 2, ciclo 2026-1". El enunciado literal está en docs/enunciado-literal.md y cada requisito, con su estado, en docs/checklist-enunciado.md. Las reglas de código están en docs/reglas-de-codigo.md y las convenciones del proyecto en CLAUDE.md. El laboratorio es el contenedor Docker iso-lab (Oracle 21c XE, puerto 1526, servicio XEPDB1); las contraseñas están solo en .env.

Tarea: Lee esos archivos, revisa git status, el contenido de sql/, scripts/ y app/, y consulta el estado de iso-lab con .\scripts\iso-lab.ps1 -Estado. Después, entrégame un diagnóstico del avance.

Restricciones:
- No modifiques ningún archivo ni la base en esta fase.
- No resumas ni reinterpretes el enunciado. Cita cada requisito tal como aparece en docs/enunciado-literal.md.

Criterios de aceptación: Cada requisito del checklist queda clasificado como Cumplido, Parcial o Pendiente, con el archivo que lo respalda o lo que falta.

Entregable: Una tabla requisito → estado → evidencia/faltante, y una lista ordenada de próximos pasos. Al final, agrega este prompt textual como una fila nueva en docs/uso-ia.md.
```

## Fase 1. Reparar el laboratorio y los scripts · hecha el 18/10/2026

```
Rol: DBA Oracle senior especializado en hardening de confidencialidad.

Contexto: La primera corrida demostró el riesgo inherente con evidencia real: 11 de 17 controles en "No cumple", 6 en "Parcial" y 0 de 15 pruebas con el resultado esperado (MROJAS leyó 200 clientes en P01, APP_WEB creó un usuario en P04, JPEREZ escribió un archivo en el servidor en P08 y el texto testigo apareció 3 veces dentro de datos_fin01.dbf en P09). Tras las correcciones, 13 de 15 pruebas dieron el resultado esperado. Después Docker falló por falta de disco y el laboratorio quedó inutilizable (Fase 1A).

Ya resuelto en el commit 68e93c1 (revísalo y explícamelo, no lo rehagas):
- Monedero de TDE CLOSED tras recrear el contenedor: el monedero LOCAL AUTO_LOGIN está atado al nombre del equipo, y cada contenedor nuevo tenía otro. Corrección: --hostname fijo en scripts/iso-lab.ps1 y procedimiento sql/mantenimiento/M01-regenerar-autologin.sql.
- "rman: command not found" en C13: la imagen gvenzl/oracle-xe:21-slim no trae RMAN. Corrección: imagen completa gvenzl/oracle-xe:21 en scripts/iso-lab.ps1.
- C05 (ORA-28222, SYSRAC es un usuario reservado), C07 (ORA-00904 en la consulta final) y C11 (ORA-65040: no se puede auditar SYS.AUD$ desde una PDB; ahora se auditan DELETE/UPDATE ANY TABLE más audit_sys_operations, y V06-c cambió en consecuencia) quedaron corregidos en los propios scripts.
- "$'\r': command not found" en las pruebas .sh y la búsqueda de piezas en P10 (la imagen completa no trae find).
- P06 (VPD) fallaba porque una función de política se ejecuta con derechos de definidor y Oracle deshabilita los roles de la sesión. Ahora decide por el usuario de la sesión y por DBA_ROLE_PRIVS, y el control del clon DEV (C10) se rediseñó en la Fase 3 como conteo del esquema SEGURIDAD, porque las huellas chocaban con Data Redaction (ORA-28081).
- P04 dejó la contraseña de laboratorio en la evidencia, porque SQL*Plus repite la sentencia fallida. Ahora usa un valor desechable, y scripts/ejecutar-sql.ps1 enmascara cualquier valor de .env en toda salida.

Pendiente:
- Ningún script de sql/verificacion tiene WHENEVER SQLERROR EXIT FAILURE (regla 7 de docs/reglas-de-codigo.md).
- .\scripts\iso-lab.ps1 -Estado busca "DATABASE IS READY" en todo el log y puede dar un falso positivo.
- V17-b se cambió para excluir las cuentas internas sin contraseña (authentication_type NONE, como SYSRAC) después de generar la evidencia "antes".
La auditoría del proyecto es la tradicional (AUDIT / AUD$), según docs/contexto-de-clase.md; no Unified Auditing.

Tarea:
1. Revisa cada corrección ya hecha y explícame la causa y la solución de forma que yo la pueda defender ante el profesor. Si encuentras un error, corrígelo en el mismo script.
2. Resuelve los tres puntos pendientes.
3. Revisa que scripts/corregir.ps1 encadene C01 a C14 sin pasos manuales (nada de archivos *-resto.sql).

Restricciones:
- No ejecutes nada contra la base en esta fase: el laboratorio está dañado y se reconstruye en la Fase 3.
- Ninguna contraseña ni clave del monedero en archivos versionados; solo en .env.
- Corrige los scripts existentes; no crees versiones paralelas.
- Si algo no se puede aplicar en 21c XE, documenta el motivo y el control compensatorio en lugar de omitirlo.

Criterios de aceptación: Cada corrección tiene su causa explicada y cada pendiente está resuelto en el script versionado. La validación con salida real se hace en la Fase 3.

Entregable: Una tabla fallo → causa → corrección → script, los scripts corregidos y un commit de sql/ y scripts/. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 2. Completar la cobertura: procedimientos, logs y pruebas · hecha el 18/10/2026

```
Rol: Auditor ISO/IEC 27001:2022 y DBA Oracle.

Contexto: Para que la matriz sea defendible faltan tres piezas:
- C14 registra 17 procedimientos "APROBADO" que enlazan a docs/procedimientos.md, y ese documento no existe. Sin él, la madurez 3 ("documentado") no tiene respaldo; según el profesor, un control documentado sin evidencia es un fallo de control (docs/contexto-de-clase.md).
- La tarea "logs" solo se cubre con la pista AUDIT. No se verifica la protección de los archivos de log (alert, trazas y logs de respaldo), que el profesor señaló en clase.
- La batería de sql/pruebas no tiene ninguna prueba para A5.12, A5.17 ni A8.8.

Tarea:
1. Redacta docs/procedimientos.md con un procedimiento por cada control de C14 (17): objetivo, responsable, frecuencia, pasos, script de verificación y evidencia esperada, con las mismas anclas que usa C14. Ajusta C14 si algo no coincide. Marca el documento como borrador hasta que yo lo revise y lo apruebe.
2. Agrega la verificación (y la corrección, si aplica) de la protección de los archivos de log, como criterio de un control existente o como prueba de revisión de configuración (.sh). Justifica cuál de las dos opciones eliges.
3. Agrega pruebas para A5.12, A5.17 y A8.8 con la misma cabecera (PRUEBA, TIPO, CONTROL, RIESGO, COMO, PROCEDIMIENTO, ESPERADO, PATRON, HERRAMIENTA) y ajusta los conteos fijos de scripts/pruebas.ps1.

Restricciones:
- Sigue docs/reglas-de-codigo.md: ciclos acotados, cada resultado verificado, scripts cortos.
- Las pruebas que simulan un ataque deben limpiar lo que crean (LIMPIEZA_SYS).
- Los procedimientos deben ser realistas para la cooperativa del escenario (sql/01-escenario.sql); no cites normas ni cláusulas que no puedas confirmar.

Criterios de aceptación: Los 17 controles tienen un procedimiento con ancla válida. Cada uno de los 15 controles del enunciado tiene al menos una prueba. La tarea "logs" tiene evidencia propia.

Entregable: docs/procedimientos.md, los scripts nuevos o ajustados y un commit. Registra este prompt textual en docs/uso-ia.md y actualiza docs/checklist-enunciado.md.
```

## Fase 3. Reconstruir el laboratorio y correr el ciclo PHVA completo · hecha el 18/10/2026

```
Rol: DBA Oracle senior y auditor que necesita evidencia reproducible.

Contexto: La evidencia actual no corresponde a los scripts versionados: C05, C07, C10, V04, V06, V09 y V17 cambiaron después de generarla, y todos los scripts de sql/verificacion ganaron WHENEVER SQLERROR, y los volúmenes del laboratorio quedaron dañados por la falta de disco. Para poder defender la matriz, toda la evidencia debe salir de una corrida limpia de los scripts del repositorio. Ya hay al menos 20 GB libres en C: (Fase 1A) y ya revisé y aprobé docs/procedimientos.md.

Tarea:
1. Pídeme confirmación explícita y después borra el contenedor iso-lab y los volúmenes iso-lab-datos e iso-lab-antes. Vacía también evidencia/ y los JSON de app/src/datos/, para que no se mezclen salidas viejas con las nuevas.
2. Ejecuta en orden, deteniéndote si algo falla: .\scripts\iso-lab.ps1 -Crear (esperar a que la base esté lista), sql\01-escenario.sql y sql\02-auditor.sql como sys, sql\00-entorno.sql, .\scripts\evaluar.ps1 -Fase antes, .\scripts\pruebas.ps1 -Fase antes, .\scripts\corregir.ps1, .\scripts\pruebas.ps1 -Fase despues y .\scripts\evaluar.ps1 -Fase despues.
3. Reinicia el contenedor y repite la verificación de TDE (V16) y la prueba P09, guardando la salida en evidencia/reinicio/, para demostrar que el cifrado sobrevive al reinicio.
4. Prepárame instrucciones paso a paso para ejecutar 2 o 3 scripts de sql/verificacion en SQL Developer (conexión a localhost:1526/XEPDB1 como ISO_AUDITOR) y guardar capturas en evidencia/sql-developer/ (requisito "Herramientas: SQL Developer").

Restricciones:
- Ningún parche manual fuera de los scripts: si un paso falla, la corrección va al script versionado y la cadena se repite desde el inicio.
- Ninguna contraseña en la salida ni en los archivos versionados. Antes del commit, busca cada valor de .env en evidencia/ y app/src/datos/.
- No copies volúmenes de Docker como respaldo: eso fue lo que llenó el disco. Si hace falta repetir, se reconstruye desde los scripts.
- Antes de empezar y después de corregir.ps1, comprueba el espacio libre en C:; si baja de 10 GB, detente y avísame.

Criterios de aceptación: Los 17 controles tienen resultado "antes" y "después", y todas las pruebas tienen resultado "antes" y "después", respaldados por salida real en evidencia/. Ninguna salida contiene un error ORA- no esperado. Los JSON de app/src/datos/ quedan regenerados.

Entregable: Una tabla comparativa antes/después por control (estado, madurez y ruta de la evidencia) y otra por prueba, y un commit de sql/, scripts/, evidencia/ y app/src/datos/. Registra este prompt textual en docs/uso-ia.md y actualiza docs/checklist-enunciado.md.
```

## Fase 4. Tablas del artefacto (sección 6 del enunciado)

```
Rol: Auditor ISO/IEC 27001:2022 con experiencia en bases de datos Oracle.

Contexto: La sección 6 de docs/enunciado-literal.md define el contenido del artefacto (puntos 1 a 6). Según docs/contexto-de-clase.md, los "riesgos" son factores de riesgo, y el escenario lleva la confidencialidad de un riesgo inherente 4 a un residual aceptado 2. Los resultados de los controles y de las pruebas ya existen en app/src/datos/evaluacion-*.json y pruebas-*.json (generados por los scripts; no se editan a mano).

Tarea: Construye los datos de dominio como constantes tipadas de TypeScript en app/src/datos/ (riesgos, tareas, controles) y su versión legible en docs/artefacto.md:
1. "Tabla de riesgos R-CONF-01 a R-CONF-05 con impacto y probabilidad": cada factor de riesgo con descripción, impacto, probabilidad (con la escala definida y justificada), riesgo inherente y residual objetivo.
2. "Tabla de tareas del DBA": las 12 tareas que nombra el enunciado, cada una vinculada a uno o más R-CONF y a sus controles.
3. "Mapeo de controles ISO con implementación sugerida y evidencia observable": los 15 controles del enunciado (A5.12, A5.15, A5.16, A5.17, A5.18, A5.33, A8.2, A8.3, A8.5, A8.10, A8.11, A8.12, A8.13, A8.15, A8.20) con su título en ISO/IEC 27002:2022, su justificación, su implementación sugerida (script de sql/correccion) y su evidencia observable (script de sql/verificacion). A8.24 y A8.8 van aparte, como controles complementarios de las tareas "cifrado TDE" y "parcheo".
4. "Lista de 15 controles observables por auditor externo".
5. "Matriz de evaluación (Tarea | Riesgo | Control | Criterio 0-4 | Evidencia | Estado)", con los resultados antes y después de la Fase 3 y la escala 0-4 del profesor tal como la aplica scripts/evaluar.ps1.
6. "Batería de pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta)", tomada de pruebas-*.json.

Restricciones:
- Usa exactamente las cantidades, nombres y columnas que pide el enunciado; lo complementario va identificado como tal.
- Los números y títulos de los controles deben corresponder a ISO/IEC 27002:2022. Si dudas de alguno, márcalo como "verificar" en lugar de inventarlo.
- No inventes otra escala de madurez: usa la definida en clase.
- Cada valor de la matriz debe apuntar a un archivo .sql y a su salida en evidencia/.

Criterios de aceptación: Los conteos (5, 12, 15) y las columnas coinciden con el enunciado. No hay ningún control sin evidencia SQL. Cada tarea, riesgo y control de la matriz existe en los datos de dominio y en evaluacion-despues.json.

Entregable: Los archivos de datos, docs/artefacto.md y un commit. Registra este prompt textual en docs/uso-ia.md y actualiza docs/checklist-enunciado.md.
```

## Fase 5. Marco teórico (2-3 páginas)

```
Rol: Docente universitario de seguridad de la información y bases de datos.

Contexto: La sección 5 de docs/enunciado-literal.md pide "investigar y sintetizar brevemente (2-3 páginas)" siete temas. La entrega pasa por Turnitin y por detección de uso de IA, así que la redacción final debe ser mía.

Tarea: Prepara en docs/marco-teorico-esquema.md un esquema detallado con un apartado por cada tema del enunciado, con su texto literal como título:
- Cambios ISO 27001:2022 respecto a 2013: nuevo Anexo A con 93 controles en 4 temas.
- Principio de mínimo privilegio y separación de funciones en el rol DBA.
- Defensa en profundidad y Zero Trust aplicado a bases de datos.
- Controles técnicos: Transparent Data Encryption (TDE), Dynamic Data Masking, Data Redaction, Row Level Security / VPD, TLS para conexiones.
- Data Leakage Prevention (DLP) y gestión de backups cifrados.
- Logging, monitoreo y correlación (SIEM).
- Normativa costarricense: Ley 8968 Protección de la persona frente al tratamiento de sus datos personales y su reglamento.

Para cada apartado incluye las ideas clave, cómo se aplica en el laboratorio (qué script o control lo demuestra) y 1 o 2 fuentes verificables (norma, documentación oficial de Oracle 21c, legislación costarricense, artículo) con formato APA 7. Puedes añadir al final un apartado breve de apoyo que relacione los tres mundos (administrativo, base de datos y herramienta) y explique por qué se usa la auditoría tradicional (AUDIT / AUD$) frente a Unified Auditing.

Restricciones:
- No redactes el texto final en párrafos; entrega viñetas y fuentes.
- No inventes referencias. Si no puedes confirmar una fuente, márcala como "por verificar".
- No reemplaces ni fusiones los temas del enunciado.

Criterios de aceptación: Los 7 temas del enunciado aparecen con su título literal, cada uno con ideas clave y al menos una fuente oficial, y la extensión estimada al redactarlo es de 2 a 3 páginas.

Entregable: docs/marco-teorico-esquema.md. Registra este prompt textual en docs/uso-ia.md y actualiza docs/checklist-enunciado.md.
```

## Fase 6. Sistema de diseño de la app

```
Usa la skill impeccable y, para elegir paleta y tipografía, la skill ui-ux-pro-max.

Rol: Diseñador de producto senior especializado en herramientas de auditoría y cumplimiento.

Contexto: La app en app/ (React + Vite + TypeScript) presenta el evaluador de riesgos de confidencialidad al profesor. Hoy es la plantilla de Vite. Debe verse profesional y sobria, como una herramienta GRC real, no como una plantilla genérica.

Tarea: Define el sistema de diseño en app/src/styles/tokens.css y en docs/design-system.md:
- tipografía con jerarquía;
- paleta semántica para la madurez 0-4, el estado (Cumple / Parcial / No cumple) y el riesgo inherente frente al residual, accesible y sin depender solo del color;
- espaciado, componentes base (tabla de matriz, insignia de estado, tarjeta de control, comparativo antes/después, visor de script SQL y su evidencia) y modo claro/oscuro.
Elimina los restos de la plantilla (hero.png, logos de Vite y React, App.css de ejemplo).

Restricciones:
- Contraste WCAG 2.2 AA como mínimo.
- Sin librerías de UI pesadas; CSS propio con variables.

Criterios de aceptación: Cada token tiene un nombre y un uso documentado, y los 5 niveles de madurez y los 3 estados se distinguen también en escala de grises.

Entregable: Los tokens, el documento y un commit. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 7. Construcción de la app

```
Usa la skill frontend-design y, para los gráficos, la skill dataviz.

Rol: Ingeniero frontend senior (React + TypeScript).

Contexto: El sistema de diseño ya está definido (docs/design-system.md). Los datos de dominio y los resultados están en app/src/datos/ (Fase 4).

Tarea: Construye las vistas:
1. Resumen: riesgo de confidencialidad antes/después (inherente 4 → residual 2) y conteo de controles por estado.
2. Riesgos R-CONF-01..05: impacto × probabilidad (artefacto, punto 1).
3. Tareas del DBA (punto 2).
4. Controles ISO: mapeo con implementación sugerida y evidencia observable, y la lista de 15 controles observables (puntos 3 y 4).
5. Matriz de evaluación: filtrable, con el script SQL y su salida real de cada fila (punto 5).
6. Batería de pruebas: resultado antes y después (punto 6).
7. Metodología PHVA y uso de IA.

Restricciones:
- Activa "strict": true en app/tsconfig.app.json (regla 10).
- Sigue docs/reglas-de-codigo.md: funciones de 60 líneas o menos, sin any, y una validación de los datos al cargarlos que muestre el error en pantalla si un control referencia un riesgo o una tarea inexistente (regla 5).
- Los datos salen solo de app/src/datos/; nada hardcodeado en los componentes. Los scripts y las salidas se leen de sql/ y evidencia/, sin copiarlos a mano.
- Diseño responsivo, desde 360 px de ancho.

Criterios de aceptación: npm run build y npm run lint terminan sin errores ni advertencias, y cada cifra en pantalla coincide con docs/artefacto.md.

Entregable: La app funcionando, capturas de cada vista (360 px y escritorio) tomadas con la skill playwright-cli en evidencia/app/, y un commit. Registra este prompt textual en docs/uso-ia.md y actualiza docs/checklist-enunciado.md.
```

## Fase 8. Crítica de diseño y accesibilidad

```
Usa la skill impeccable para la crítica de diseño y de los textos, fixing-accessibility para WCAG, break-ui para los casos extremos y playwright-cli para comprobar cada corrección en el navegador.

Tarea: Evalúa la app como lo haría un revisor exigente: jerarquía visual, consistencia, legibilidad de la matriz y claridad de los gráficos, además de WCAG 2.2 AA (teclado, foco, contraste, lectores de pantalla) y los textos en español.

Restricciones: Prioriza los hallazgos (alto, medio, bajo) y corrige solo los de prioridad alta y media. Los de prioridad baja déjalos listados.

Entregable: docs/revision-diseno.md con los hallazgos, lo corregido y capturas antes/después, y un commit. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 9. Revisión de código y seguridad del repositorio

```
Usa /code-review y /security-review sobre todo el repositorio.

Tarea: Revisa los errores, el cumplimiento de docs/reglas-de-codigo.md y la seguridad: secretos en el historial de git (git log -p), contraseñas en scripts o en evidencia/, el paso de valores de .env a SQL*Plus en scripts/ejecutar-sql.ps1 (comillas y caracteres especiales), inyección SQL en los scripts y dependencias vulnerables (npm audit).

Restricciones: No reescribas el historial de git sin preguntarme primero. Si encuentras un secreto ya publicado, avísame de inmediato y dime qué rotar.

Entregable: La lista de hallazgos verificados, las correcciones aplicadas y un commit. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 10. Informe final

```
Usa la skill pdf para generar el PDF.

Rol: Asesor académico de redacción técnica.

Contexto: El informe debe cubrir todo lo que pide docs/enunciado-literal.md: el marco teórico (sección 5), el artefacto con sus 6 puntos o el enlace a él (sección 6), la herramienta y la metodología PHVA (sección 7), la tabla de uso de IA con la declaración jurada (sección 8), las referencias en APA 7 y los entregables de la sección 10.

Tarea: Arma docs/informe.md (y su PDF) con esa estructura. Integra las tablas del artefacto, la comparativa antes/después, las capturas de evidencia (incluidas las de SQL Developer), el enlace al repositorio, el enlace al video y la tabla de uso de IA. Los apartados de análisis, conclusiones y marco teórico quedan con encabezado y un recuadro "REDACTA EL ESTUDIANTE", más viñetas de apoyo.

Restricciones: No redactes las conclusiones ni el marco teórico. No omitas ninguna sección del enunciado.

Criterios de aceptación: Cada sección del enunciado tiene su lugar en el informe, y docs/checklist-enunciado.md queda en Cumplido, salvo lo que debo redactar o firmar yo.

Entregable: docs/informe.md, el PDF y un commit. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 11. Guion del video (5 minutos)

```
Tarea: Escribe en docs/guion-video.md un guion de 5 minutos, con tiempos por bloque:
- problema (30 s);
- los tres mundos y la matriz (1 min);
- la demostración del ataque "antes" (1 min), con la evidencia de evidencia/antes/ en la app, porque el laboratorio ya estará corregido;
- los controles aplicados (1 min);
- la evaluación "después" en la app, repitiendo en vivo una prueba como P01 (1 min);
- el cierre (30 s).

Indica qué mostrar en pantalla y qué comando correr en cada bloque.

Restricciones: Frases cortas, en primera persona, para que yo las adapte a mi forma de hablar. Duración total de 5 minutos o menos.

Entregable: docs/guion-video.md. Registra este prompt textual en docs/uso-ia.md.
```

## Fase 12. Verificación final contra el enunciado

```
Rol: Profesor que califica esta asignación con la rúbrica del enunciado.

Tarea: Recorre docs/enunciado-literal.md requisito por requisito. Para cada uno, verifica en el repositorio que exista y esté completo; no te fíes del checklist. Califícalo con la rúbrica de la sección 9 como lo haría el profesor e indica qué le faltaría para la nota máxima.

Restricciones: Solo lectura. No corrijas nada en esta fase.

Entregable: Una tabla requisito → evidencia → nota estimada → mejora sugerida, para llevarla a la revisión con el profesor antes de la entrega final. Registra este prompt textual en docs/uso-ia.md.
```
