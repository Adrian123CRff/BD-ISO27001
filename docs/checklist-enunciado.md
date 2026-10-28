# Lista de cumplimiento del enunciado

Cada requisito copiado **al pie de la letra** de `docs/enunciado-literal.md`. Nada se considera terminado hasta que
su fila esté en "Cumplido" con la ubicación exacta de la evidencia. Las aclaraciones del profesor en clase
(`docs/contexto-de-clase.md`) **complementan** estos requisitos; nunca los reemplazan.

Estados: Pendiente · En curso · Cumplido.

## Objetivos específicos (sección 3)

| ID | Requisito literal | Dónde se cumple | Estado |
| --- | --- | --- | --- |
| OE-1 | Identificar y clasificar al menos 5 riesgos de confidencialidad (R-CONF) asociados a motores de BD (Oracle). | Artefacto, tabla de riesgos | Cumplido: 5 factores clasificados por categoría y nivel, con impacto, probabilidad, inherente y residual objetivo justificados (`app/src/datos/riesgos.ts`; app, vista Riesgos; `docs/artefacto.md` §1). Revisión del estudiante pendiente |
| OE-2 | Mapear al menos 12 tareas críticas del DBA (gestión de usuarios, privilegios, autenticación, cifrado TDE, masking, backup, auditoría, parcheo, listener, eliminación segura, logs, clones DEV/TEST). | Artefacto, tabla de tareas | Cumplido: las 12 tareas con sus riesgos y controles (`app/src/datos/tareas.ts`; app, vista Tareas; `docs/artefacto.md` §2) |
| OE-3 | Seleccionar y justificar controles del Anexo A 2022 pertinentes (A5.12, A5.15, A5.16, A5.17, A5.18, A5.33, A8.2, A8.3, A8.5, A8.10, A8.11, A8.12, A8.13, A8.15, A8.20). | Artefacto, mapeo de controles | Cumplido: los 15 controles con justificación, implementación sugerida y evidencia observable (`app/src/datos/controles.ts`; app, vista Mapeo; `docs/artefacto.md` §3), más A8.24 y A8.8 complementarios |
| OE-4 | Diseñar una Matriz de Evaluación con criterios de madurez 0-4, evidencia y estado (Cumple/No cumple/Parcial). | Artefacto, matriz | Cumplido: matriz con criterio 0-4, evidencia y estado antes/después (`scripts/evaluar.ps1`; app, vistas Resumen y Matriz; `docs/artefacto.md` §5) |
| OE-5 | Proponer y ejecutar pruebas técnicas (consultas SQL, revisión de configuraciones, auditorías) que demuestren la efectividad de los controles. | `sql/` y artefacto, batería de pruebas | Cumplido: 19 pruebas ejecutadas antes (0/19) y después (19/19) con su salida (`sql/pruebas/`, `evidencia/*/pruebas/`; app, vista Batería) |

Tareas nombradas en OE-2 (las 12 deben aparecer):

| # | Tarea | Estado |
| --- | --- | --- |
| 1 | Gestión de usuarios | Cumplido (V03, C05, P01, P02) |
| 2 | Privilegios | Cumplido (V02, V07, C04, P03, P04) |
| 3 | Autenticación | Cumplido (V04, V09, C05, P07, P17) |
| 4 | Cifrado TDE | Cumplido (V16, C01-C03, P09) |
| 5 | Masking | Cumplido (V11, C07, P05) |
| 6 | Backup | Cumplido (V13, C13, P10) |
| 7 | Auditoría | Cumplido (V14, C11, C14, P15) |
| 8 | Parcheo | Cumplido (V17, C14 (riesgo aceptado), P18) |
| 9 | Listener | Cumplido (V15, C12, P11) |
| 10 | Eliminación segura | Cumplido (V10, C09, P14) |
| 11 | Logs | Cumplido (V06, C11, C15, P13, P19) |
| 12 | Clones DEV/TEST | Cumplido (V11, C10, P12) |

Controles nombrados en OE-3 (los 15 deben seleccionarse y justificarse):

| # | Control | Estado |
| --- | --- | --- |
| 1 | A5.12 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 2 | A5.15 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 3 | A5.16 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 4 | A5.17 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 5 | A5.18 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 6 | A5.33 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 7 | A8.2 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 8 | A8.3 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 9 | A8.5 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 10 | A8.10 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 11 | A8.11 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 12 | A8.12 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 13 | A8.13 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 14 | A8.15 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |
| 15 | A8.20 | Cumplido (verificación, corrección, prueba y procedimiento; justificación y evidencia antes/después en la app y en `docs/artefacto.md`) |

## Marco teórico (sección 5): investigar y sintetizar brevemente (2-3 páginas)

| ID | Tema literal | Estado |
| --- | --- | --- |
| MT-1 | Cambios ISO 27001:2022 respecto a 2013: nuevo Anexo A con 93 controles en 4 temas. | Cumplido: redactado por el estudiante en el informe, sección 5.1, con citas APA 7 |
| MT-2 | Principio de mínimo privilegio y separación de funciones en el rol DBA. | Cumplido: redactado por el estudiante en el informe, sección 5.2, con citas APA 7 |
| MT-3 | Defensa en profundidad y Zero Trust aplicado a bases de datos. | Cumplido: redactado por el estudiante en el informe, sección 5.3, con citas APA 7 |
| MT-4 | Controles técnicos: Transparent Data Encryption (TDE), Dynamic Data Masking, Data Redaction, Row Level Security / VPD, TLS para conexiones. | Cumplido: redactado por el estudiante en el informe, sección 5.4, con citas APA 7 |
| MT-5 | Data Leakage Prevention (DLP) y gestión de backups cifrados. | Cumplido: redactado por el estudiante en el informe, sección 5.5, con citas APA 7 |
| MT-6 | Logging, monitoreo y correlación (SIEM). | Cumplido: redactado por el estudiante en el informe, sección 5.6, con citas APA 7 |
| MT-7 | Normativa costarricense: Ley 8968 Protección de la persona frente al tratamiento de sus datos personales y su reglamento. | Cumplido: redactado por el estudiante en el informe, sección 5.7, con citas APA 7 |
| MT-8 | Extensión: 2-3 páginas. | Cumplido: los 7 temas suman 1 359 palabras, unas 2,5-3 páginas en `docs/informe.pdf` |

## Artefacto (sección 6): interactivo HTML, PDF o sitio, que contenga

| ID | Contenido literal | Estado |
| --- | --- | --- |
| AR-1 | Tabla de riesgos R-CONF-01 a R-CONF-05 con impacto y probabilidad. | Cumplido: app, vista Riesgos, y `docs/artefacto.md` §1; capturas en `evidencia/app/` |
| AR-2 | Tabla de tareas del DBA. | Cumplido: app, vista Tareas, y `docs/artefacto.md` §2; capturas en `evidencia/app/` |
| AR-3 | Mapeo de controles ISO con implementación sugerida y evidencia observable (ej: SELECT * FROM DBA_SYS_PRIVS, pg_hba.conf, SELECT * FROM v$encryption_wallet). | Cumplido: app, vista Mapeo de controles, y `docs/artefacto.md` §3; capturas en `evidencia/app/` |
| AR-4 | Lista de 15 controles observables por auditor externo. | Cumplido: app, vista Controles observables, y `docs/artefacto.md` §4; capturas en `evidencia/app/` |
| AR-5 | Matriz de evaluación (Tarea \| Riesgo \| Control \| Criterio 0-4 \| Evidencia \| Estado). | Cumplido: app, vista Resumen y Matriz, y `docs/artefacto.md` §5; capturas en `evidencia/app/` |
| AR-6 | Batería de pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta). | Cumplido: app, vista Batería de pruebas, y `docs/artefacto.md` §6; capturas en `evidencia/app/` |
| AR-7 | Obligatorio incluir scripts de verificación. | Cumplido: 18 scripts en `sql/verificacion`; la app muestra el script y su salida real en cada fila de la matriz |

## Herramienta y metodología (sección 7)

| ID | Requisito literal | Estado |
| --- | --- | --- |
| HM-1 | Motor: Oracle 19c/21c XE | Cumplido: Oracle Database 21c XE 21.3.0.0.0 en el contenedor `iso-lab` (evidencia: `sql/00-entorno.sql`) |
| HM-2 | Metodología: PHVA (Planificar-Hacer-Verificar-Actuar). | Cumplido: explicada en el informe, sección 7.2 (Planificar: `sql/01-escenario.sql`; Hacer: `scripts/corregir.ps1`; Verificar: `scripts/evaluar.ps1` y `scripts/pruebas.ps1` antes/después; Actuar: revisión semanal de C14 y `sql/mantenimiento/M02-revision-semanal.sql`) |
| HM-3 | Herramientas: SQL Developer | Cumplido: V07, V16 y V15 ejecutados en SQL Developer 26.2 como ISO_AUDITOR el 27/10/2026, todos los criterios en OK; capturas en `evidencia/sql-developer/` e informe, sección 7.3 |
| HM-4 | Documentación: APA 7 | Cumplido: 14 referencias en APA 7 (informe, sección 12), todas citadas en el texto o en la tabla de uso de IA; títulos de ISO/IEC 27001 y 27002 y DOI de Saltzer y Schroeder confirmados por el estudiante el 27/10/2026 |
| HM-5 | Repositorio Git institucional | En curso: el repositorio existe y está publicado (https://github.com/Adrian123CRff/BD-ISO27001, desde el 22/10/2026), pero en una cuenta personal de GitHub (los commits van firmados con el correo institucional); falta confirmar con el profesor si lo acepta como "institucional" o si debe estar en un espacio de la UNA |
| HM-6 | Video explicativo 5 minutos | Cumplido: grabado por el estudiante con el guion de `docs/guion-video.md` (incluye P01 en vivo y la vista Evolución); publicado en Google Drive (https://drive.google.com/drive/folders/15f6wydlgg1q_uCNiyVX90Y0_xvRK88x0?usp=sharing) y enlazado en la portada, la sección 7.4 y el Anexo A del informe |

## Uso de IA (sección 8): obligatoria

| ID | Requisito literal | Estado |
| --- | --- | --- |
| IA-1 | Incluir en el informe una sección con la tabla: Herramienta IA \| Prompt Exacto Utilizado \| Aporte de la IA \| Validación / Corrección del Estudiante \| Fuente Verificada | Cumplido: informe, sección 11, con las cinco columnas literales, generada desde `docs/uso-ia.md`; la columna de validación la completa el estudiante |
| IA-2 | Declaración Jurada: "Yo, [Nombre del estudiante], declaro que todo contenido generado con IA ha sido declarado en la tabla anterior, validado contra fuentes oficiales (ISO, documentación del motor de BD) y que asumo responsabilidad por su veracidad. Entiendo que omitir esta declaración constituye falta grave." | En curso: texto literal en el informe, sección 11, con el nombre del estudiante y la fecha 27/10/2026; la firma la pone el estudiante en el PDF que entrega |

## Entregables (sección 10)

| ID | Entregable literal | Estado |
| --- | --- | --- |
| EN-1 | Informe PDF con artefacto (o link a artefacto interactivo) | Cumplido: `docs/informe.pdf` (41 páginas) con el artefacto completo en la sección 6 y el enlace al código; introducción, marco teórico, análisis y conclusiones redactados por el estudiante (27/10/2026) |
| EN-2 | Scripts .sql de verificación | Cumplido: `sql/verificacion` (18), `sql/correccion` (15) y `sql/pruebas` (19), ejecutados en una corrida limpia con su salida en `evidencia/` |
| EN-3 | Repositorio Git | Cumplido: https://github.com/Adrian123CRff/BD-ISO27001 |
| EN-4 | Video 5 minutos | Cumplido: https://drive.google.com/drive/folders/15f6wydlgg1q_uCNiyVX90Y0_xvRK88x0?usp=sharing |
| EN-5 | Tabla de uso de IA firmada | En curso: tabla completa (19 filas, todas validadas) y declaración fechada el 27/10/2026; falta la firma del estudiante en el PDF que entrega |

## Mejoras pedidas por el profesor (revisión del avance)

No son requisitos del enunciado, pero el profesor las pidió al revisar el artefacto.

| ID | Pedido | Dónde se cumple | Estado |
| --- | --- | --- | --- |
| PR-1 | Un gráfico en el tiempo, con fechas, en el que se elige qué ver (todos o uno por uno) y cambia según la elección (boceto en `materiales/revision-avance/boceto-mejora-evolucion.jpeg`) | App, vista Evolución: controles, riesgos y pruebas; casillas, filtros por estado y navegador de fechas; historial real de `scripts/medir.ps1` (`app/src/datos/historial.json`, evidencia en `evidencia/historial/`) | Cumplido: corrida limpia del 25/10/2026 con 17 mediciones (antes, C01-C15, después); vista revisada en claro, oscuro y 360 px, sin errores de axe; informe, sección 6.9 |

## Rúbrica (sección 9): autoevaluación antes de entregar

| Criterio | Peso | Descripción literal | Autoevaluación |
| --- | --- | --- | --- |
| Identificación de Riesgos y Tareas DBA | 20% | Claridad, completitud, pertinencia técnica | Pendiente |
| Mapeo y Justificación de Controles ISO | 20% | Selección correcta A5/A8, justificación y evidencia | Pendiente |
| Matriz de Evaluación y Controles Observables | 20% | Criterios 0-4 bien aplicados, evidencias auditables | Pendiente |
| Pruebas Técnicas y Scripts | 15% | Scripts funcionales, resultados esperados realistas | Pendiente |
| Documentación de Uso de IA y Referencias APA 7 | 15% | Tabla completa, honestidad, validación | Pendiente |
| Presentación, Video y Repositorio | 10% | Claridad, formato, entrega a tiempo | Pendiente |
