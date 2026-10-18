# Lista de cumplimiento del enunciado

Cada requisito copiado **al pie de la letra** de `docs/enunciado-literal.md`. Nada se considera terminado hasta que
su fila esté en "Cumplido" con la ubicación exacta de la evidencia. Las aclaraciones del profesor en clase
(`docs/contexto-de-clase.md`) **complementan** estos requisitos; nunca los reemplazan.

Estados: Pendiente · En curso · Cumplido.

## Objetivos específicos (sección 3)

| ID | Requisito literal | Dónde se cumple | Estado |
| --- | --- | --- | --- |
| OE-1 | Identificar y clasificar al menos 5 riesgos de confidencialidad (R-CONF) asociados a motores de BD (Oracle). | Artefacto, tabla de riesgos | Pendiente |
| OE-2 | Mapear al menos 12 tareas críticas del DBA (gestión de usuarios, privilegios, autenticación, cifrado TDE, masking, backup, auditoría, parcheo, listener, eliminación segura, logs, clones DEV/TEST). | Artefacto, tabla de tareas | En curso: las 12 tareas tienen script de verificación, corrección y prueba (ver tabla); falta la tabla del artefacto |
| OE-3 | Seleccionar y justificar controles del Anexo A 2022 pertinentes (A5.12, A5.15, A5.16, A5.17, A5.18, A5.33, A8.2, A8.3, A8.5, A8.10, A8.11, A8.12, A8.13, A8.15, A8.20). | Artefacto, mapeo de controles | En curso: los 15 tienen verificación (`sql/verificacion`), corrección (`sql/correccion`) y procedimiento (`docs/procedimientos.md`, borrador); falta la justificación en el artefacto |
| OE-4 | Diseñar una Matriz de Evaluación con criterios de madurez 0-4, evidencia y estado (Cumple/No cumple/Parcial). | Artefacto, matriz | En curso: evaluación antes/después con evidencia (`app/src/datos/evaluacion-*.json`, `evidencia/antes`, `evidencia/despues`); falta presentarla en el artefacto |
| OE-5 | Proponer y ejecutar pruebas técnicas (consultas SQL, revisión de configuraciones, auditorías) que demuestren la efectividad de los controles. | `sql/` y artefacto, batería de pruebas | En curso: 19 pruebas ejecutadas antes (0 de 19) y después (19 de 19), con evidencia en `evidencia/*/pruebas`; falta presentarlas en el artefacto |

Tareas nombradas en OE-2 (las 12 deben aparecer):

| # | Tarea | Estado |
| --- | --- | --- |
| 1 | Gestión de usuarios | En curso (V03, C05, P01, P02) |
| 2 | Privilegios | En curso (V02, V07, C04, P03, P04) |
| 3 | Autenticación | En curso (V04, V09, C05, P07, P17) |
| 4 | Cifrado TDE | En curso (V16, C01-C03, P09) |
| 5 | Masking | En curso (V11, C07, P05) |
| 6 | Backup | En curso (V13, C13, P10) |
| 7 | Auditoría | En curso (V14, C11, C14, P15) |
| 8 | Parcheo | En curso (V17, C14 (riesgo aceptado), P18) |
| 9 | Listener | En curso (V15, C12, P11) |
| 10 | Eliminación segura | En curso (V10, C09, P14) |
| 11 | Logs | En curso (V06, C11, C15, P13, P19) |
| 12 | Clones DEV/TEST | En curso (V11, C10, P12) |

Controles nombrados en OE-3 (los 15 deben seleccionarse y justificarse):

| # | Control | Estado |
| --- | --- | --- |
| 1 | A5.12 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 2 | A5.15 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 3 | A5.16 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 4 | A5.17 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 5 | A5.18 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 6 | A5.33 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 7 | A8.2 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 8 | A8.3 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 9 | A8.5 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 10 | A8.10 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 11 | A8.11 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 12 | A8.12 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 13 | A8.13 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 14 | A8.15 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |
| 15 | A8.20 | En curso (verificación, corrección, prueba y procedimiento; evidencia antes/después lista; falta la justificación en el artefacto) |

## Marco teórico (sección 5): investigar y sintetizar brevemente (2-3 páginas)

| ID | Tema literal | Estado |
| --- | --- | --- |
| MT-1 | Cambios ISO 27001:2022 respecto a 2013: nuevo Anexo A con 93 controles en 4 temas. | Pendiente |
| MT-2 | Principio de mínimo privilegio y separación de funciones en el rol DBA. | Pendiente |
| MT-3 | Defensa en profundidad y Zero Trust aplicado a bases de datos. | Pendiente |
| MT-4 | Controles técnicos: Transparent Data Encryption (TDE), Dynamic Data Masking, Data Redaction, Row Level Security / VPD, TLS para conexiones. | Pendiente |
| MT-5 | Data Leakage Prevention (DLP) y gestión de backups cifrados. | Pendiente |
| MT-6 | Logging, monitoreo y correlación (SIEM). | Pendiente |
| MT-7 | Normativa costarricense: Ley 8968 Protección de la persona frente al tratamiento de sus datos personales y su reglamento. | Pendiente |
| MT-8 | Extensión: 2-3 páginas. | Pendiente |

## Artefacto (sección 6): interactivo HTML, PDF o sitio, que contenga

| ID | Contenido literal | Estado |
| --- | --- | --- |
| AR-1 | Tabla de riesgos R-CONF-01 a R-CONF-05 con impacto y probabilidad. | Pendiente |
| AR-2 | Tabla de tareas del DBA. | Pendiente |
| AR-3 | Mapeo de controles ISO con implementación sugerida y evidencia observable (ej: SELECT * FROM DBA_SYS_PRIVS, pg_hba.conf, SELECT * FROM v$encryption_wallet). | Pendiente |
| AR-4 | Lista de 15 controles observables por auditor externo. | Pendiente |
| AR-5 | Matriz de evaluación (Tarea \| Riesgo \| Control \| Criterio 0-4 \| Evidencia \| Estado). | Pendiente |
| AR-6 | Batería de pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta). | Pendiente |
| AR-7 | Obligatorio incluir scripts de verificación. | En curso (18 scripts en `sql/verificacion`) |

## Herramienta y metodología (sección 7)

| ID | Requisito literal | Estado |
| --- | --- | --- |
| HM-1 | Motor: Oracle 19c/21c XE | Cumplido: Oracle Database 21c XE 21.3.0.0.0 en el contenedor `iso-lab` (evidencia: `sql/00-entorno.sql`) |
| HM-2 | Metodología: PHVA (Planificar-Hacer-Verificar-Actuar). | En curso (Planificar: `sql/01-escenario.sql`; Hacer: `scripts/corregir.ps1`; Verificar: `scripts/evaluar.ps1` y `scripts/pruebas.ps1` antes/después; Actuar: revisión semanal de C14; falta explicarlo en el informe) |
| HM-3 | Herramientas: SQL Developer | En curso (guía `docs/guia-sql-developer.md`; faltan las capturas en `evidencia/sql-developer/`) |
| HM-4 | Documentación: APA 7 | Pendiente |
| HM-5 | Repositorio Git institucional | En curso (https://github.com/Adrian123CRff/BD-ISO27001) |
| HM-6 | Video explicativo 5 minutos | Pendiente |

## Uso de IA (sección 8): obligatoria

| ID | Requisito literal | Estado |
| --- | --- | --- |
| IA-1 | Incluir en el informe una sección con la tabla: Herramienta IA \| Prompt Exacto Utilizado \| Aporte de la IA \| Validación / Corrección del Estudiante \| Fuente Verificada | En curso (`docs/uso-ia.md`) |
| IA-2 | Declaración Jurada: "Yo, [Nombre del estudiante], declaro que todo contenido generado con IA ha sido declarado en la tabla anterior, validado contra fuentes oficiales (ISO, documentación del motor de BD) y que asumo responsabilidad por su veracidad. Entiendo que omitir esta declaración constituye falta grave." | En curso (falta firma) |

## Entregables (sección 10)

| ID | Entregable literal | Estado |
| --- | --- | --- |
| EN-1 | Informe PDF con artefacto (o link a artefacto interactivo) | Pendiente |
| EN-2 | Scripts .sql de verificación | Cumplido: `sql/verificacion` (18), `sql/correccion` (15) y `sql/pruebas` (19), ejecutados en una corrida limpia con su salida en `evidencia/` |
| EN-3 | Repositorio Git | En curso (https://github.com/Adrian123CRff/BD-ISO27001) |
| EN-4 | Video 5 minutos | Pendiente |
| EN-5 | Tabla de uso de IA firmada | Pendiente |

## Rúbrica (sección 9): autoevaluación antes de entregar

| Criterio | Peso | Descripción literal | Autoevaluación |
| --- | --- | --- | --- |
| Identificación de Riesgos y Tareas DBA | 20% | Claridad, completitud, pertinencia técnica | Pendiente |
| Mapeo y Justificación de Controles ISO | 20% | Selección correcta A5/A8, justificación y evidencia | Pendiente |
| Matriz de Evaluación y Controles Observables | 20% | Criterios 0-4 bien aplicados, evidencias auditables | Pendiente |
| Pruebas Técnicas y Scripts | 15% | Scripts funcionales, resultados esperados realistas | Pendiente |
| Documentación de Uso de IA y Referencias APA 7 | 15% | Tabla completa, honestidad, validación | Pendiente |
| Presentación, Video y Repositorio | 10% | Claridad, formato, entrega a tiempo | Pendiente |
