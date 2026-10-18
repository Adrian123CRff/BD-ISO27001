-- V17 · A8.8 Gestión de vulnerabilidades técnicas (control complementario: tarea "parcheo")
-- Pregunta del auditor: ¿el motor tiene aplicados los parches de seguridad y las cuentas por defecto están
-- cerradas?
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column banner_full format a80
column patch_id format 99999999
column action format a10
column status format a10
column description format a60
column username format a24
column account_status format a20
column linea format a240

prompt ### Evidencia: versión y parches aplicados (DBA_REGISTRY_SQLPATCH)
select banner_full from v$version;
select patch_id, action, status, description from dba_registry_sqlpatch fetch first 10 rows only;

prompt ### Evidencia: cuentas mantenidas por Oracle que siguen abiertas
select username, account_status, authentication_type from dba_users
where oracle_maintained = 'Y' and account_status = 'OPEN' order by username fetch first 20 rows only;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.8|a|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|El motor tiene aplicado al menos un parche de seguridad (Release Update)|' || n || ' parche(s) aplicado(s)' as linea
from (select count(*) n from dba_registry_sqlpatch where status = 'SUCCESS')
union all
select 'CRITERIO|A8.8|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Las cuentas internas de Oracle que admiten contraseña, salvo SYS y SYSTEM, están cerradas|' || n || ' cuenta(s) interna(s) abierta(s)'
from (select count(*) n from dba_users
      where oracle_maintained = 'Y' and account_status = 'OPEN' and authentication_type <> 'NONE'
        and username not in ('SYS', 'SYSTEM'))
union all
select 'CRITERIO|A8.8|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta abierta conserva contraseña por defecto|' || n || ' cuenta(s)'
from (select count(*) n from dba_users_with_defpwd d join dba_users u on u.username = d.username where u.account_status = 'OPEN');
