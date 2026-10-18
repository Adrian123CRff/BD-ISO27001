-- C11 · Auditoría tradicional (AUDIT / AUD$). PHVA: HACER. Controles: A8.15, A5.33.
-- Requiere audit_trail = DB, EXTENDED (C01 + reinicio). Sin triggers: el profesor advirtió que sobrecargan la base.
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

-- Inicios de sesión exitosos y fallidos (fuerza bruta, cuentas bloqueadas).
audit create session by access;
-- Altas, cambios y bajas de cuentas y roles, y concesión de privilegios de sistema.
audit user by access;
audit role by access;
audit system grant by access;
-- Intentos de acceder a objetos que no existen o no se ven (ORA-00942): sondeo de datos.
audit not exists by access;
-- Lectura de datos personales y financieros.
audit select on finanzas.clientes by access;
audit select on finanzas.cuentas by access;
-- Protección de la propia pista. En una PDB no se puede auditar SYS.AUD$ directamente (objeto común, ORA-65040):
-- se audita el uso de los privilegios con los que alguien ajeno al dueño podría borrarla o alterarla, y las
-- operaciones de SYS quedan en archivos del sistema operativo (audit_sys_operations = TRUE, C01).
audit delete any table, update any table by access;

column audit_option format a20
column success format a10
column failure format a10
select audit_option, success, failure from dba_stmt_audit_opts order by audit_option;
prompt === Auditoría configurada ===
