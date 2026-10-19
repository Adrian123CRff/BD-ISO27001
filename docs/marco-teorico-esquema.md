# Marco teórico: esquema de trabajo

Esquema para redactar el marco teórico que pide la sección 5 del enunciado: "investigar y sintetizar brevemente
(2-3 páginas)". **No es el texto final**: son viñetas y fuentes; la redacción la hace el estudiante (el trabajo pasa
por Turnitin y por detección de IA).

- Un apartado por tema, con el **título literal** del enunciado.
- Cada apartado tiene: ideas clave, cómo se aplica en el laboratorio (para conectar teoría y evidencia) y fuentes.
- **Fuente verificada** = se comprobó en la web oficial que existe, con ese título, autor y fecha. **Por verificar** =
  no se pudo confirmar; revisarla antes de citarla o reemplazarla.
- Extensión estimada al redactar: unas 0,35 páginas por tema (7 temas ≈ 2,5 páginas), más la lista de referencias.

---

## 1. Cambios ISO 27001:2022 respecto a 2013: nuevo Anexo A con 93 controles en 4 temas.

**Ideas clave**
- El Anexo A pasó de 114 controles en 14 dominios (2013) a **93 controles en 4 temas**: organizacionales (37),
  personas (8), físicos (14) y tecnológicos (34).
- La reducción viene de **fusionar** controles, no de eliminar requisitos; además hay **11 controles nuevos**. Tres de
  ellos son centrales en este proyecto: **8.10** eliminación de la información, **8.11** enmascaramiento de datos y
  **8.12** prevención de fuga de datos.
- ISO/IEC 27002:2022 agrega **atributos** a cada control (tipo de control, propiedades de seguridad, conceptos de
  ciberseguridad, capacidades operativas, dominios de seguridad) para filtrarlos y mapearlos.
- En el cuerpo de la norma aparece la cláusula **6.3, planificación de los cambios** del SGSI.
- Las certificaciones con la versión 2013 debían pasar a la 2022 a más tardar el **31 de octubre de 2025**.
- Los controles se seleccionan según el riesgo y se justifican en la Declaración de Aplicabilidad.

**En el laboratorio**
- Los 15 controles del enunciado pertenecen a los temas 5 (organizacionales) y 8 (tecnológicos); el artefacto los
  muestra separados por tema (`docs/artefacto.md` §3).
- A8.10, A8.11 y A8.12, controles nuevos de 2022, tienen script de verificación, corrección y prueba (V10-V12,
  C07-C10, P05, P08, P12, P14).

**Fuentes**
- ISO/IEC 27001:2022 y ISO/IEC 27002:2022 (las normas). *Por verificar*: confirmar las cifras de fusiones y los
  títulos exactos en el texto de la norma; las cifras de 93/4/11 se confirmaron en fuentes secundarias.

## 2. Principio de mínimo privilegio y separación de funciones en el rol DBA.

**Ideas clave**
- **Mínimo privilegio**: cada usuario o proceso recibe solo el acceso necesario para su tarea; es uno de los principios
  clásicos de diseño de Saltzer y Schroeder (1975) y el control AC-6 de NIST SP 800-53.
- **Separación de funciones**: dividir tareas para que una sola persona no pueda cometer y ocultar un abuso sin
  colusión (control AC-5).
- El DBA es el caso extremo: tiene acceso técnico a todo. Por eso conviene que **no** sea quien audita su propio
  trabajo, y que sus operaciones queden registradas fuera de su alcance.
- Oracle separa privilegios administrativos (SYSDBA, SYSBACKUP, SYSKM, SYSDG) para no usar SYSDBA en todo.
  *Por verificar*: lista completa en la Security Guide 21c.

**En el laboratorio**
- La aplicación perdió el rol DBA y el analista sus privilegios ANY; el acceso pasa por roles de negocio (C04, A8.2,
  A5.15).
- **ISO_AUDITOR** solo lee el diccionario: el auditor no puede modificar lo que audita (`sql/02-auditor.sql`).
- `audit_sys_operations = TRUE` deja las operaciones de SYS en archivos del sistema operativo (C01, A5.33).
- Las cuentas dueñas de esquemas y PDBADMIN están bloqueadas (C04, C05).

**Fuentes**
- Saltzer y Schroeder (1975). *Verificada* (revista, volumen y páginas); el DOI está *por verificar*.
- Joint Task Force (2020), NIST SP 800-53 Rev. 5, controles AC-5 y AC-6. *Verificada*.

## 3. Defensa en profundidad y Zero Trust aplicado a bases de datos.

**Ideas clave**
- **Defensa en profundidad**: varias capas de control independientes, para que la falla de una no exponga los datos.
- **Zero Trust** (NIST SP 800-207): ninguna confianza implícita por la ubicación en la red o por ser una cuenta
  "interna"; cada acceso a un recurso se autentica y autoriza, con el menor privilegio y con monitoreo continuo.
- En bases de datos: la red no basta (cifrar y autenticar fuerte), la cuenta no basta (autorizar por fila y por
  columna), el dato no basta (cifrar en reposo) y todo se registra.
- Ningún control es suficiente solo: por ejemplo, Data Redaction enmascara lo que se muestra, pero no las condiciones
  de una consulta, por eso se combina con roles y VPD.

**En el laboratorio**
- Capas aplicadas: red cifrada (A8.20) → autenticación y bloqueo (A5.17, A8.5) → roles (A5.15, A8.2) → VPD por fila
  (A8.3) → Data Redaction por columna (A8.11) → TDE en disco (A8.24) → respaldos cifrados (A8.13) → auditoría
  (A8.15).
- Zero Trust en la práctica: la cuenta de la aplicación, aunque sea "interna", ya no tiene privilegios
  administrativos (P04); VPD decide en cada consulta según el usuario de la sesión (P06).

**Fuentes**
- Rose, Borchert, Mitchell y Connelly (2020), NIST SP 800-207. *Verificada*.
- Definición formal de "defensa en profundidad": *por verificar* (sugerencia: glosario del NIST CSRC o SP 800-53).

## 4. Controles técnicos: Transparent Data Encryption (TDE), Dynamic Data Masking, Data Redaction, Row Level Security / VPD, TLS para conexiones.

**Ideas clave**
- **TDE**: cifra los datos en reposo (tablespace o columna) de forma transparente para la aplicación; las claves se
  guardan en un monedero (keystore) separado de los datos. Protege contra quien copia archivos de datos o respaldos,
  no contra un usuario autorizado.
- **Dynamic Data Masking** es el nombre de la función en SQL Server/Azure SQL: enmascara el resultado de las
  consultas sin cambiar el dato guardado. En Oracle el equivalente es **Data Redaction** (redacción total o parcial
  al consultar). Ambos son complementarios: no protegen contra consultas ad hoc exhaustivas de usuarios con
  privilegios.
- **Row Level Security / VPD**: agrega una condición a cada consulta según quién la hace; en Oracle es Virtual Private
  Database (DBMS_RLS).
- **TLS para conexiones**: cifra el tráfico entre cliente y servidor. Oracle ofrece además cifrado nativo de Oracle Net
  (sin certificados).

**En el laboratorio**
- TDE: tablespace `DATOS_FIN_CIF` con AES256, monedero de apertura automática local; P09 no encuentra el texto testigo
  en el archivo de datos y el cifrado sobrevive al reinicio (`evidencia/reinicio/`).
- Data Redaction sobre cédula, tarjeta y salario (P05); VPD por cartera (P06: 50 de 200 clientes).
- Hallazgo propio para la discusión: la redacción impidió copiar los datos para el control del clon (ORA-28081) y,
  a la vez, no altera el WHERE (por eso el control cuenta coincidencias sin mostrarlas, C10).
- **Red**: el laboratorio usa cifrado nativo de Oracle Net (AES256 + SHA256), no TLS. Explicar la diferencia en el
  informe. *Por verificar*: si Oracle declaró obsoleto el cifrado nativo en versiones posteriores a 21c en favor de
  TLS.

**Fuentes**
- Oracle (2024a), Advanced Security Guide 21c (TDE y Data Redaction). *Verificada*.
- Oracle (2024b), Security Guide 21c (VPD, cifrado de red y TLS). *Verificada*.
- Microsoft (s. f.), Dynamic data masking. *Verificada*.

## 5. Data Leakage Prevention (DLP) y gestión de backups cifrados.

**Ideas clave**
- **DLP** (control 8.12, nuevo en 2022): identificar y cerrar las vías por las que los datos pueden salir; en una base
  de datos: exportaciones (Data Pump), escritura de archivos (UTL_FILE, directorios), salida por red (UTL_HTTP,
  UTL_TCP, UTL_SMTP), copias de archivos de datos y respaldos.
- **Respaldos cifrados** (control 8.13): un respaldo es una copia completa de la base; si no está cifrado, robarlo
  equivale a robar la base. RMAN puede cifrarlos de forma transparente con el monedero de TDE.
- Un respaldo solo cuenta si se puede restaurar: hay que **probarlo** (validación) y proteger también el monedero y
  los logs del respaldo, que revelan dónde están los componentes de la base.

**En el laboratorio**
- C08 cerró directorios, Data Pump y paquetes UTL_* (P08: el analista ya no puede escribir archivos).
- C13: RMAN con cifrado AES256, ARCHIVELOG y `RESTORE DATABASE VALIDATE`; P10 no encuentra texto claro en las piezas.
- C15: los respaldos, archive logs y logs del servidor quedan sin permisos para otros usuarios (P19).

**Fuentes**
- ISO/IEC 27002:2022, controles 8.12 y 8.13.
- Oracle (2024c), Backup and Recovery User's Guide 21c (cifrado de respaldos y validación). *Verificada*.

## 6. Logging, monitoreo y correlación (SIEM).

**Ideas clave**
- **Logging** (8.15): registrar quién hizo qué, cuándo, desde dónde y con qué resultado; incluir accesos fallidos,
  cambios de privilegios y lectura de datos sensibles.
- **Protección de registros** (5.33): un registro que se puede borrar o alterar no sirve como prueba.
- **Monitoreo** (8.16): revisar los registros de forma periódica y con criterios definidos.
- **SIEM**: centraliza registros de varias fuentes (base, sistema operativo, red, aplicaciones) y los **correlaciona**
  para detectar patrones que una sola fuente no muestra. Gestión del ciclo de vida del log: generación, transmisión,
  almacenamiento, análisis y eliminación (NIST SP 800-92).

**En el laboratorio**
- Auditoría tradicional con texto SQL (`audit_trail = DB, EXTENDED`): sesiones, cuentas, privilegios y lecturas de
  clientes (C11, P15).
- Revisión semanal programada que deja una bitácora (C14): es una correlación mínima; un SIEM la haría entre fuentes.
- Pista protegida: nadie ajeno a Oracle puede borrar `AUD$`, y SYS queda registrado fuera de su alcance (A5.33).
- En clase: LogMiner sobre redo y archive logs como fuente adicional de trazabilidad; no usar triggers para auditar.

**Fuentes**
- Kent y Souppaya (2006), NIST SP 800-92. *Verificada*.
- Oracle (2024b), Security Guide 21c (auditoría). *Verificada*.

## 7. Normativa costarricense: Ley 8968 Protección de la persona frente al tratamiento de sus datos personales y su reglamento.

**Ideas clave**
- Ley N.° 8968 (2011): protege a la persona frente al tratamiento de sus datos personales; crea la **Agencia de
  Protección de Datos de los Habitantes (PRODHAB)**.
- Reglamento: **Decreto Ejecutivo N.° 37554-JP** (2012), reformado por los decretos 40008-JP (2016) y 41582 (2019).
- Ideas a desarrollar (confirmar el artículo exacto en el SCIJ antes de citar):
  - consentimiento informado y finalidad del tratamiento;
  - derechos de la persona sobre sus datos (acceso, rectificación, supresión);
  - **deber de seguridad** del responsable de la base de datos (medidas técnicas y organizativas);
  - categorías de datos (sensibles, de acceso restringido, de acceso irrestricto). *Por verificar*: artículo 9.
- Conexión con el proyecto: los controles de confidencialidad son la forma técnica de cumplir el deber de seguridad.

**En el laboratorio**
- La clasificación registra la categoría de la Ley 8968 de cada columna (`SEGURIDAD.CLASIFICACION_DATOS`, C06).
- Los datos del escenario son sintéticos: no se trató ningún dato personal real.

**Fuentes**
- Asamblea Legislativa (2011), Ley 8968. *Verificada* (SCIJ).
- Poder Ejecutivo (2012), Decreto 37554-JP. *Verificada* (SCIJ); las reformas, *por verificar* en la versión
  consolidada.

---

## Apoyo (opcional, al final): los tres mundos y la auditoría tradicional

- La matriz conecta los tres mundos de la clase: **administrativo** (ISO, riesgo inherente 4 → residual 2, madurez),
  **base de datos** (tareas del DBA) y **herramientas Oracle** (diccionario, AUDIT, RMAN). Cada fila: tarea · riesgo ·
  control · criterio 0-4 · evidencia · estado.
- Se usó la **auditoría tradicional** (AUDIT / AUD$) porque es la que se explicó en clase y la que está activa en el
  modo mixto de 21c XE. Oracle recomienda la auditoría unificada desde 12c. *Por verificar*: el estado de la auditoría
  tradicional (obsoleta o retirada) en 21c y en 23ai, para mencionarlo como trabajo futuro.

---

## Referencias (APA 7)

| Referencia | Estado |
| --- | --- |
| Asamblea Legislativa de la República de Costa Rica. (2011). *Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales* (Ley N.° 8968). Sistema Costarricense de Información Jurídica. https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?param1=NRTC&nValor1=1&nValor2=70975&nValor3=85989&strTipM=TC | Verificada |
| International Organization for Standardization & International Electrotechnical Commission. (2022a). *Information security, cybersecurity and privacy protection — Information security management systems — Requirements* (ISO/IEC 27001:2022). | Verificar título exacto y forma de cita con la norma |
| International Organization for Standardization & International Electrotechnical Commission. (2022b). *Information security, cybersecurity and privacy protection — Information security controls* (ISO/IEC 27002:2022). | Verificar título exacto y forma de cita con la norma |
| Joint Task Force. (2020). *Security and privacy controls for information systems and organizations* (NIST Special Publication 800-53, Rev. 5). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-53r5 | Verificada |
| Kent, K., & Souppaya, M. (2006). *Guide to computer security log management* (NIST Special Publication 800-92). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-92 | Verificada |
| Microsoft. (s. f.). *Dynamic data masking*. Microsoft Learn. https://learn.microsoft.com/en-us/sql/relational-databases/security/dynamic-data-masking | Verificada |
| Oracle. (2024a). *Oracle Database advanced security guide, 21c* (F31829-15). https://docs.oracle.com/en/database/oracle/oracle-database/21/asoag/ | Verificada |
| Oracle. (2024b). *Oracle Database security guide, 21c* (F31285-18). https://docs.oracle.com/en/database/oracle/oracle-database/21/dbseg/ | Verificada |
| Oracle. (2024c). *Oracle Database backup and recovery user's guide, 21c* (F31836-11). https://docs.oracle.com/en/database/oracle/oracle-database/21/bradv/ | Verificada |
| Poder Ejecutivo de la República de Costa Rica. (2012). *Reglamento a la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales* (Decreto Ejecutivo N.° 37554-JP). Sistema Costarricense de Información Jurídica. https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=74352 | Verificada (reformas por verificar) |
| Rose, S., Borchert, O., Mitchell, S., & Connelly, S. (2020). *Zero trust architecture* (NIST Special Publication 800-207). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-207 | Verificada |
| Saltzer, J. H., & Schroeder, M. D. (1975). The protection of information in computer systems. *Proceedings of the IEEE, 63*(9), 1278-1308. | Verificada (DOI por verificar) |

Fuentes consultadas para confirmar datos (no citar como bibliografía principal): resúmenes del cambio 2013 → 2022 en
[tcsa.in](https://www.tcsa.in/frameworks/iso-27001/annex-a-controls),
[theartofservice.com](https://theartofservice.com/blog/iso-27001-2022-changes) y
[brightdefense.com](https://www.brightdefense.com/news/iso-27001-what-changed-in-2026/);
[PRODHAB, normativa](https://www.prodhab.go.cr/acercade/normativa/).
