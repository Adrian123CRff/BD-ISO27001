-- 02-auditor.sql
-- Crea ISO_AUDITOR, el usuario con el que se ejecutan TODAS las verificaciones (mínimo privilegio): solo puede
-- iniciar sesión y leer el diccionario de datos. No puede leer los datos de negocio ni modificar nada.
-- Ejecutar una vez como SYSDBA en XEPDB1:  .\scripts\ejecutar-sql.ps1 sql\02-auditor.sql -Como sys
whenever sqlerror exit failure

create user iso_auditor identified by "&AUDITOR_PWD";
grant create session to iso_auditor;
-- Lectura de vistas DBA_* y V$ (diccionario), sin acceso a tablas de usuario.
grant select_catalog_role to iso_auditor;
-- Las vistas V$ del contenedor raíz que algunas pruebas necesitan dentro de la PDB.
grant select on sys.v_$encryption_wallet to iso_auditor;
grant select on sys.v_$rman_configuration to iso_auditor;
grant select on sys.v_$session_connect_info to iso_auditor;
grant select on sys.v_$parameter to iso_auditor;
grant select on sys.v_$option to iso_auditor;
grant select on sys.v_$version to iso_auditor;
grant select on sys.v_$pwfile_users to iso_auditor;
grant select on sys.v_$rman_backup_job_details to iso_auditor;
grant select on sys.v_$backup_piece to iso_auditor;
-- Pista de auditoría tradicional (solo lectura).
grant select on sys.dba_audit_trail to iso_auditor;
grant select on sys.dba_users_with_defpwd to iso_auditor;

prompt === ISO_AUDITOR creado (solo lectura del diccionario) ===
