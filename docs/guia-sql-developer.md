# Guía: ejecutar las verificaciones en SQL Developer

El enunciado (sección 7) pide "Herramientas: SQL Developer". Los scripts de `sql/verificacion` se ejecutan
automáticamente con SQL*Plus (`scripts/evaluar.ps1`), pero son compatibles con SQL Developer. Esta guía deja evidencia
de que la verificación también se hace desde la herramienta del curso.

Requisito previo: el laboratorio está arriba (`.\scripts\iso-lab.ps1 -Estado` debe mostrar `Base lista: True`).

## 1. Crear la conexión como auditor

1. Abrir SQL Developer → panel **Conexiones** → botón **+** (Nueva conexión).
2. Completar:
   - **Name**: `iso-lab (auditor)`
   - **Usuario**: `ISO_AUDITOR`
   - **Contraseña**: el valor de `AUDITOR_PASSWORD` en el archivo `.env`. **No** marcar "Guardar contraseña"
     (A5.17: la contraseña no se guarda en herramientas).
   - **Tipo de conexión**: Básico
   - **Nombre del host**: `localhost`
   - **Puerto**: `1526`
   - **Nombre del servicio**: `XEPDB1` (seleccionar "Nombre del servicio", no "SID")
3. **Probar** → debe decir "Correcto" → **Guardar** → **Conectar**.

Se usa ISO_AUDITOR y no SYSTEM por mínimo privilegio: solo puede leer el diccionario de datos, igual que un auditor
externo. El servidor exige cifrado de red AES256 (A8.20); SQL Developer lo negocia solo, sin configuración extra.

## 2. Ejecutar tres verificaciones

Para cada script: **Archivo → Abrir** → elegir el archivo → **Ejecutar script (F5)**. Usar F5 y no "Ejecutar sentencia"
(Ctrl+Enter), porque los scripts usan comandos de SQL*Plus (`prompt`, `column`, `set`) que solo funcionan en modo
script.

| Script | Por qué este | Qué debe verse en "Salida de script" |
| --- | --- | --- |
| `sql/verificacion/V07-A8.2-acceso-privilegiado.sql` | Es el ejemplo literal del enunciado (`SELECT * FROM DBA_SYS_PRIVS`) | El listado de `DBA_SYS_PRIVS` y las líneas `CRITERIO\|A8.2\|...\|OK` |
| `sql/verificacion/V16-A8.24-criptografia-tde.sql` | El profesor pidió prestar atención a `v$encryption_wallet` | El monedero `OPEN` y el tablespace `DATOS_FIN_CIF` con `ENCRYPTED = YES` |
| `sql/verificacion/V15-A8.20-redes.sql` | Demuestra que la sesión de SQL Developer viaja cifrada | `AES256 Encryption service adapter` y `SHA256 Crypto-checksumming service adapter` |

## 3. Guardar la evidencia

1. Con la salida visible, tomar una captura que muestre: el nombre de la conexión, el nombre del script abierto y las
   líneas `CRITERIO`. Revisar que **no aparezca ninguna contraseña** en la captura.
2. Guardarlas en `evidencia/sql-developer/` con estos nombres:
   - `V07-A8.2-sql-developer.png`
   - `V16-A8.24-sql-developer.png`
   - `V15-A8.20-sql-developer.png`
3. Opcional: en la salida de script, botón **Guardar** → `evidencia/sql-developer/V07-A8.2-sql-developer.txt` (mismo
   nombre que la captura, en texto).

## Si algo falla

- **ORA-12514 (servicio desconocido)**: se escribió `XEPDB1` como SID. Cambiarlo a "Nombre del servicio".
- **ORA-28000 (cuenta bloqueada)**: hubo 5 intentos fallidos (A8.5 funcionando). Desbloquear como SYSDBA:
  `alter user iso_auditor account unlock;` dentro de XEPDB1.
- **ORA-28001 (contraseña vencida)**: el perfil vence las contraseñas a los 90 días (A5.17). Cambiarla y actualizar
  `AUDITOR_PASSWORD` en `.env`.
