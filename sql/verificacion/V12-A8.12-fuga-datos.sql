-- V12 · A8.12 Prevención de fuga de datos
-- Pregunta del auditor: ¿están cerradas las vías para sacar datos masivamente de la base (directorios, Data Pump,
-- paquetes de archivos y red)?
-- Ejecutar como ISO_AUDITOR.
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column grantee format a28
column table_name format a16
column privilege format a28
column type format a10
column linea format a240

prompt ### Evidencia: privilegios sobre directorios y paquetes de salida
select grantee, table_name, privilege, type from dba_tab_privs
where (type = 'DIRECTORY') or (owner = 'SYS' and table_name in ('UTL_FILE', 'UTL_HTTP', 'UTL_TCP', 'UTL_SMTP') and grantee = 'PUBLIC')
order by table_name, grantee
fetch first 30 rows only;

prompt ### Evidencia: roles de exportación masiva
select grantee, granted_role as privilege from dba_role_privs
where granted_role in ('DATAPUMP_EXP_FULL_DATABASE', 'EXP_FULL_DATABASE')
order by grantee;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.12|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ningún directorio del servidor es accesible para PUBLIC|' || n || ' privilegio(s) de directorio a PUBLIC' as linea
from (select count(*) n from dba_tab_privs where type = 'DIRECTORY' and grantee = 'PUBLIC')
union all
select 'CRITERIO|A8.12|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Los roles de exportación masiva no están concedidos a cuentas o roles de negocio|' || n || ' concesión(es)'
from (select count(*) n from dba_role_privs
      where granted_role in ('DATAPUMP_EXP_FULL_DATABASE', 'EXP_FULL_DATABASE')
        and grantee in (select username from dba_users where oracle_maintained = 'N'
                        union all select role from dba_roles where oracle_maintained = 'N'))
union all
select 'CRITERIO|A8.12|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|PUBLIC no puede ejecutar paquetes de salida de datos (UTL_FILE, UTL_HTTP, UTL_TCP, UTL_SMTP)|' || n || ' paquete(s) abierto(s) a PUBLIC'
from (select count(*) n from dba_tab_privs
      where owner = 'SYS' and table_name in ('UTL_FILE', 'UTL_HTTP', 'UTL_TCP', 'UTL_SMTP')
        and grantee = 'PUBLIC' and privilege = 'EXECUTE');
