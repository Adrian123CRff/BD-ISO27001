waw # Procedimientos de control de confidencialidad

**Estado: APROBADO por Adrián Fernández Fernández, 18/10/2026.** `sql/correccion/C14-gobierno.sql` registra estos
procedimientos como `APROBADO` en `SEGURIDAD.PROCEDIMIENTOS` (A8.8 como `RIESGO ACEPTADO`).

Organización: Cooperativa Financiera del Valle (ficticia, escenario de `sql/01-escenario.sql`). Base: Oracle Database
21c XE, PDB `XEPDB1`. Cada procedimiento indica su responsable y su frecuencia (los mismos que registra C14), los pasos,
el script que lo verifica y la evidencia que debe quedar. Según la escala del curso (`docs/contexto-de-clase.md`), un
procedimiento documentado sin evidencia de ejecución es un **fallo de control**: por eso cada uno nombra su evidencia.

Convenciones:
- **Verificación**: scripts de `sql/verificacion` (los ejecuta ISO_AUDITOR, solo lectura) y pruebas de `sql/pruebas`.
- **Corrección**: script de `sql/correccion` que deja el control aplicado.
- **Evidencia**: salida guardada en `evidencia/` por `scripts/evaluar.ps1`, `scripts/pruebas.ps1` o `scripts/corregir.ps1`.
- La **revisión semanal** (`SEGURIDAD.REVISION_SEMANAL`, lunes 7:00) deja un registro en `SEGURIDAD.BITACORA_REVISION`.

---

<a id="a512"></a>
## A5.12 · Clasificación de datos personales

- **Objetivo**: que cada dato personal esté identificado con su nivel de confidencialidad antes de usarse.
- **Responsable**: Oficial de Seguridad · **Frecuencia**: semestral y cada vez que se crea una tabla o columna nueva.
- **Pasos**:
  1. Revisar las tablas de `FINANZAS` y registrar cada columna personal en `SEGURIDAD.CLASIFICACION_DATOS` con su nivel
     (`CONFIDENCIAL`, `RESTRINGIDO`, `INTERNO` o `PUBLICO`) y su categoría según la Ley 8968.
  2. Etiquetar la tabla y la columna en el diccionario (`COMMENT ON`), empezando por el nivel, para que cualquier
     herramienta (SQL Developer incluido) lo muestre.
  3. Confirmar que el nivel coincide con el control aplicado (TDE, Data Redaction, VPD o rol).
- **Verificación**: V01; prueba P16 (el analista ve la etiqueta desde su sesión).
- **Corrección**: C06.
- **Evidencia**: `evidencia/<fase>/V01-A5.12-clasificacion.txt` y `evidencia/<fase>/pruebas/P16-*.txt`.

<a id="a515"></a>
## A5.15 · Acceso por roles de negocio

- **Objetivo**: conceder el acceso a los datos solo por roles de negocio, según la necesidad de conocer.
- **Responsable**: DBA · **Frecuencia**: trimestral.
- **Pasos**:
  1. Listar los privilegios sobre `FINANZAS` y `FINANZAS_DEV` (`DBA_TAB_PRIVS`).
  2. Retirar todo privilegio concedido a `PUBLIC` o directamente a una persona.
  3. Conceder el acceso solo a roles `ROL_*` y asignar el rol a la cuenta según su puesto.
- **Verificación**: V02; pruebas P03 y P06.
- **Corrección**: C04.
- **Evidencia**: `V02-A5.15-control-acceso.txt`, `P03-*.txt`.

<a id="a516"></a>
## A5.16 · Alta y registro de identidades

- **Objetivo**: que cada cuenta de la base corresponda a una persona, servicio o componente identificado, con
  responsable.
- **Responsable**: DBA · **Frecuencia**: por evento (cada alta, cambio o baja) y en la revisión semestral de A5.18.
- **Pasos**:
  1. Toda alta requiere una solicitud con responsable y área; se registra en `SEGURIDAD.REGISTRO_IDENTIDADES`.
  2. No se crean cuentas genéricas o compartidas (`SOPORTE`, `ADMIN`, `TEST`); si existen, se bloquean.
  3. Las cuentas que crea la instalación (`PDBADMIN`, `OPS$ORACLE`) también se registran; las que no se usan se
     bloquean.
- **Verificación**: V03; prueba P02.
- **Corrección**: C05.
- **Evidencia**: `V03-A5.16-identidades.txt`, `P02-*.txt`.

<a id="a517"></a>
## A5.17 · Política de contraseñas

- **Objetivo**: que las contraseñas sean robustas, caduquen y no se reutilicen.
- **Responsable**: DBA · **Frecuencia**: anual (revisión del perfil) y en cada alta de cuenta.
- **Pasos**:
  1. Asignar a toda cuenta con contraseña el perfil `PERFIL_USUARIOS`: complejidad `ora12c_strong_verify_function`,
     vigencia de 90 días, 7 días de gracia, sin reutilizar las últimas 5 ni en 365 días.
  2. Comprobar que ninguna cuenta abierta conserva una contraseña por defecto (`DBA_USERS_WITH_DEFPWD`).
  3. Las contraseñas del laboratorio viven solo en `.env`, nunca en el repositorio.
- **Verificación**: V04; prueba P17 (una contraseña débil es rechazada).
- **Corrección**: C05.
- **Evidencia**: `V04-A5.17-informacion-autenticacion.txt`, `P17-*.txt`.

<a id="a518"></a>
## A5.18 · Revisión de derechos y bajas

- **Objetivo**: retirar los derechos a quien ya no los necesita y revisarlos periódicamente.
- **Responsable**: Jefatura de TI · **Frecuencia**: semestral, y el mismo día de cada baja.
- **Pasos**:
  1. Recursos Humanos comunica la baja; el DBA bloquea la cuenta (`ACCOUNT LOCK`), retira sus privilegios y marca
     `BAJA` en el registro de identidades.
  2. Cada semestre, la Jefatura de TI revisa con cada área el registro de identidades y actualiza `FECHA_REVISION`.
  3. Bloquear las cuentas abiertas sin uso en más de 90 días.
- **Verificación**: V05; prueba P01 (la exfuncionaria ya no entra).
- **Corrección**: C04 y C05.
- **Evidencia**: `V05-A5.18-derechos-acceso.txt`, `P01-*.txt`.

<a id="a533"></a>
## A5.33 · Protección de la pista de auditoría

- **Objetivo**: que los registros de auditoría y los logs del servidor no se puedan borrar, alterar ni leer sin
  autorización.
- **Responsable**: Auditoría Interna · **Frecuencia**: semanal.
- **Pasos**:
  1. Confirmar que nadie ajeno a Oracle tiene `DELETE`/`UPDATE` sobre `SYS.AUD$` ni privilegios `DELETE/UPDATE/DROP
     ANY TABLE`, y que se audita su uso.
  2. Confirmar `audit_sys_operations = TRUE`: lo que hace SYS queda en archivos del sistema operativo (`adump`).
  3. Revisar los permisos del sistema operativo sobre el alert log, las trazas, el log del listener, `adump`, los
     respaldos y el monedero: ningún archivo o directorio da permisos a "otros". Si alguno aparece, aplicar C15.
  4. En producción, los logs de RMAN se guardan en un directorio de acceso restringido, porque revelan dónde están los
     componentes de la base. En este laboratorio la salida se conserva como evidencia y solo contiene rutas ficticias.
- **Verificación**: V06; pruebas P13 (soporte no puede borrar la pista) y P19 (permisos de los registros).
- **Corrección**: C04, C11 y C15.
- **Evidencia**: `V06-A5.33-proteccion-registros.txt`, `P13-*.txt`, `P19-*.txt`, `evidencia/correccion/C15-*.txt`.

<a id="a82"></a>
## A8.2 · Gestión de privilegios administrativos

- **Objetivo**: limitar los privilegios administrativos (rol `DBA`, privilegios `ANY`, `SYSDBA`) a las cuentas
  administrativas autorizadas.
- **Responsable**: Jefatura de TI · **Frecuencia**: trimestral.
- **Pasos**:
  1. Revisar quién tiene el rol `DBA` (`DBA_ROLE_PRIVS`), privilegios `ANY` (`DBA_SYS_PRIVS`) y privilegios en el
     archivo de contraseñas (`V$PWFILE_USERS`).
  2. Retirar todo privilegio administrativo a cuentas de aplicación y de personas sin función de DBA.
  3. Bloquear las cuentas dueñas de esquemas (`FINANZAS`, `FINANZAS_DEV`, `SEGURIDAD`): nadie inicia sesión con ellas.
- **Verificación**: V07; prueba P04 (la aplicación ya no puede crear usuarios).
- **Corrección**: C04.
- **Evidencia**: `V07-A8.2-acceso-privilegiado.txt`, `P04-*.txt`.

<a id="a83"></a>
## A8.3 · Restricción por fila (VPD)

- **Objetivo**: que cada analista vea solo los clientes de su cartera.
- **Responsable**: DBA · **Frecuencia**: trimestral, y cada vez que cambia una cartera.
- **Pasos**:
  1. Mantener la asignación de carteras en `SEGURIDAD.CARTERA_ANALISTA`.
  2. Confirmar que la política `VPD_CARTERA_ANALISTA` está activa sobre `FINANZAS.CLIENTES` (`DBA_POLICIES`).
  3. Confirmar que ninguna cuenta de negocio tiene `EXEMPT ACCESS POLICY`, `EXEMPT REDACTION POLICY` ni `SELECT ANY
     TABLE`, que permitirían saltarse la política.
- **Verificación**: V08; prueba P06 (el analista ve 50 de 200 clientes).
- **Corrección**: C07.
- **Evidencia**: `V08-A8.3-restriccion-acceso.txt`, `P06-*.txt`.

<a id="a85"></a>
## A8.5 · Autenticación y bloqueo de cuentas

- **Objetivo**: resistir ataques de fuerza bruta.
- **Responsable**: DBA · **Frecuencia**: anual (revisión del perfil).
- **Pasos**:
  1. El perfil `PERFIL_USUARIOS` bloquea la cuenta tras 5 intentos fallidos, por 1 día.
  2. Solo se aceptan verificadores de contraseña modernos (`SQLNET.ALLOWED_LOGON_VERSION_SERVER = 12a`, C12).
  3. Los intentos fallidos se revisan cada semana en la bitácora (A8.15).
- **Verificación**: V09; prueba P07 (fuerza bruta).
- **Corrección**: C05 y C12.
- **Evidencia**: `V09-A8.5-autenticacion-segura.txt`, `P07-*.txt`.

<a id="a810"></a>
## A8.10 · Eliminación definitiva de datos

- **Objetivo**: que la información que ya no se necesita no quede recuperable.
- **Responsable**: DBA · **Frecuencia**: semanal (purga automática).
- **Pasos**:
  1. No hacer copias ad hoc de tablas de negocio (`*_RESPALDO`, `*_BAK`, `*_COPIA`).
  2. Eliminar con `DROP TABLE ... PURGE`; la tarea `SEGURIDAD.PURGA_PAPELERA` vacía la papelera cada domingo a las 2:00.
  3. Al retirar un tablespace con datos personales, eliminarlo con sus archivos (`INCLUDING CONTENTS AND DATAFILES`).
- **Verificación**: V10; prueba P14.
- **Corrección**: C09 (y C03 para el tablespace sin cifrar).
- **Evidencia**: `V10-A8.10-eliminacion.txt`, `P14-*.txt`.

<a id="a811"></a>
## A8.11 · Enmascaramiento y clones de prueba

- **Objetivo**: que quien no necesita ver un dato personal completo lo vea enmascarado, y que los clones de
  desarrollo no contengan datos reales.
- **Responsable**: DBA · **Frecuencia**: por evento (cada clon nuevo o columna sensible nueva).
- **Pasos**:
  1. Mantener la política de Data Redaction `RED_CLIENTES_DATOS_PERSONALES` sobre cédula, tarjeta y salario.
  2. Todo clon DEV/TEST se genera con datos ficticios del mismo formato, nunca con una copia de producción.
  3. Después de cada clon (y cada semana, en la revisión de C14), el procedimiento `SEGURIDAD.CONTROLAR_CLON_DEV`
     cuenta las filas del clon que coinciden con producción y guarda solo el número; `SEGURIDAD.V_CONTROL_CLON_DEV`
     debe mostrar 0 filas con datos reales. No se copia ni se muestra ningún dato personal.
- **Verificación**: V11; pruebas P05 y P12.
- **Corrección**: C07 y C10.
- **Evidencia**: `V11-A8.11-enmascaramiento.txt`, `P05-*.txt`, `P12-*.txt`.

<a id="a812"></a>
## A8.12 · Prevención de fuga de datos

- **Objetivo**: cerrar las vías para sacar datos masivamente de la base.
- **Responsable**: Oficial de Seguridad · **Frecuencia**: trimestral.
- **Pasos**:
  1. Ningún directorio del servidor es accesible para `PUBLIC`.
  2. Los roles de exportación masiva (`DATAPUMP_EXP_FULL_DATABASE`) solo se conceden temporalmente y con solicitud.
  3. `PUBLIC` no puede ejecutar `UTL_FILE`, `UTL_HTTP`, `UTL_TCP` ni `UTL_SMTP`; tras retirarlos, se recompila y se
     confirma que no quedan objetos inválidos.
- **Verificación**: V12; prueba P08.
- **Corrección**: C08.
- **Evidencia**: `V12-A8.12-fuga-datos.txt`, `P08-*.txt`.

<a id="a813"></a>
## A8.13 · Respaldo cifrado y prueba de restauración

- **Objetivo**: tener respaldos recientes, cifrados y legibles, de modo que una copia robada no exponga datos y una
  copia dañada se detecte antes de necesitarla.
- **Responsable**: DBA · **Frecuencia**: semanal.
- **Pasos**:
  1. Respaldo completo con archive logs (`BACKUP DATABASE PLUS ARCHIVELOG`), con cifrado AES256 de RMAN usando el
     monedero de TDE.
  2. Prueba de restauración sin sobrescribir la base (`RESTORE DATABASE VALIDATE`): RMAN lee y descifra cada pieza.
  3. Abrir una muestra de piezas y buscar el registro testigo: no debe aparecer en texto claro (en clase: "abrir 2, 3 o
     5 archivos de respaldo y sus logs, ver si dieron error").
- **Verificación**: V13; prueba P10.
- **Corrección**: C13.
- **Evidencia**: `V13-A8.13-respaldo.txt`, `P10-*.txt`, `evidencia/correccion/C13-respaldo.txt`.

<a id="a815"></a>
## A8.15 · Registro y reporte semanal de auditoría

- **Objetivo**: registrar los inicios de sesión, la lectura de datos personales y los cambios de privilegios, y
  revisarlos cada semana.
- **Responsable**: Auditoría Interna · **Frecuencia**: semanal.
- **Pasos**:
  1. Auditoría tradicional con texto SQL (`audit_trail = DB, EXTENDED`) de `CREATE SESSION`, `USER`, `ROLE`, `SYSTEM
     GRANT`, `NOT EXISTS` y `SELECT` sobre `CLIENTES` y `CUENTAS`. Sin triggers, porque sobrecargan la base.
  2. La tarea `SEGURIDAD.REVISION_SEMANAL` registra en la bitácora los intentos fallidos, los accesos denegados, las
     lecturas de clientes y los cambios de privilegios de los últimos 7 días.
  3. Auditoría Interna revisa la bitácora; los accesos no autorizados por privilegios heredados o cedidos se escalan.
- **Verificación**: V14 y V90; prueba P15.
- **Corrección**: C01, C11 y C14.
- **Evidencia**: `V14-A8.15-registro.txt`, `V90-gobierno.txt`, `P15-*.txt`.

<a id="a820"></a>
## A8.20 · Cifrado de Oracle Net y listener

- **Objetivo**: que el tráfico entre clientes y base viaje cifrado y con integridad.
- **Responsable**: DBA · **Frecuencia**: anual, y después de cada cambio de configuración de red.
- **Pasos**:
  1. `sqlnet.ora`: cifrado AES256 e integridad SHA256 en modo `REQUIRED`; verificadores mínimos `12a`.
  2. `listener.ora`: `ADMIN_RESTRICTIONS_LISTENER = ON` (no se cambia la configuración en caliente).
  3. Confirmar desde una sesión de cliente que `V$SESSION_CONNECT_INFO` muestra AES y SHA.
- **Verificación**: V15; prueba P11 (revisión de configuración, el equivalente de `pg_hba.conf`).
- **Corrección**: C12.
- **Evidencia**: `V15-A8.20-redes.txt`, `P11-*.txt`.

<a id="a824"></a>
## A8.24 · Gestión del monedero y claves de TDE

- **Objetivo**: mantener cifrados en reposo los datos de negocio y proteger las claves.
- **Responsable**: Oficial de Seguridad · **Frecuencia**: anual (rotación de la clave maestra) y por evento.
- **Pasos**:
  1. Los datos de negocio viven en el tablespace cifrado `DATOS_FIN_CIF` (AES256).
  2. El monedero vive en `WALLET_ROOT/tde`, con copia de respaldo al cambiar la clave (`WITH BACKUP`); su contraseña
     está solo en `.env` y nunca en el repositorio.
  3. El monedero de apertura automática es `LOCAL AUTO_LOGIN`: solo abre en este servidor. Si cambia el nombre del
     equipo, se regenera con `sql/mantenimiento/M01-regenerar-autologin.sql`.
  4. Rotar la clave maestra una vez al año (`ADMINISTER KEY MANAGEMENT SET KEY ... WITH BACKUP`).
- **Verificación**: V16; prueba P09 (el texto testigo no aparece en el archivo de datos).
- **Corrección**: C01, C02 y C03.
- **Evidencia**: `V16-A8.24-criptografia-tde.txt`, `P09-*.txt`.

<a id="a88"></a>
## A8.8 · Parcheo y migración a versión soportada (riesgo aceptado)

- **Objetivo**: conocer la exposición por vulnerabilidades del motor y decidir el tratamiento.
- **Responsable**: Jefatura de TI · **Frecuencia**: trimestral.
- **Situación**: Oracle Database 21c Express Edition no recibe Release Updates trimestrales. El motor no se puede
  parchear; la Jefatura de TI **acepta formalmente el riesgo** (estado `RIESGO ACEPTADO` en C14) con estas medidas
  compensatorias:
  1. Comprobar que las cuentas internas de Oracle que admiten contraseña, salvo SYS y SYSTEM, siguen cerradas y que
     ninguna cuenta abierta conserva una contraseña por defecto (V17-b y V17-c); si alguna aparece abierta, bloquearla.
  2. Exponer el puerto solo en `127.0.0.1` (`scripts/iso-lab.ps1`) y exigir cifrado de red (A8.20).
  3. Revisar cada trimestre los avisos de seguridad de Oracle y planificar la migración a una versión con soporte de
     parches.
- **Verificación**: V17; prueba P18 (motor parchado o riesgo formalmente aceptado).
- **Corrección**: C14 (registro de la aceptación).
- **Evidencia**: `V17-A8.8-vulnerabilidades.txt`, `P18-*.txt`.
