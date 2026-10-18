-- V14 · A8.15 Registro (logging)
-- Pregunta del auditor: ¿se registran los inicios de sesión, el acceso a datos personales y los cambios de
-- privilegios, con el texto SQL, y hay registros recientes?
-- Ejecutar como ISO_AUDITOR. Auditoría tradicional (AUDIT / AUD$), la explicada en clase para 19c/21c.
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column name format a20
column value format a20
column audit_option format a28
column success format a10
column failure format a10
column username format a14
column action_name format a18
column obj_name format a14
column returncode format 99999
column momento format a20
column linea format a240

prompt ### Evidencia: opciones de auditoría de sentencias y de objetos
select audit_option, success, failure from dba_stmt_audit_opts order by audit_option fetch first 30 rows only;
select owner, object_name, sel, ins, upd, del from dba_obj_audit_opts where owner in ('FINANZAS', 'SYS') and object_name in ('CLIENTES', 'CUENTAS', 'AUD$');

prompt ### Evidencia: últimos registros en la pista (DBA_AUDIT_TRAIL)
select to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS') as momento, username, action_name, obj_name, returncode
from dba_audit_trail order by timestamp desc fetch first 10 rows only;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.15|a|' || case when value = 'DB, EXTENDED' then 'OK' else 'FALLA' end
       || '|La auditoría guarda el texto SQL (audit_trail = DB, EXTENDED)|audit_trail = ' || value as linea
from v$parameter where name = 'audit_trail'
union all
select 'CRITERIO|A8.15|b|' || case when n = 1 then 'OK' else 'FALLA' end
       || '|Se auditan los inicios de sesión, exitosos y fallidos (CREATE SESSION)|'
       || case when n = 1 then 'Auditado' else 'No auditado' end
from (select count(*) n from dba_stmt_audit_opts where audit_option = 'CREATE SESSION' and success <> 'NOT SET' and failure <> 'NOT SET')
union all
select 'CRITERIO|A8.15|c|' || case when n = 1 then 'OK' else 'FALLA' end
       || '|Se audita la lectura de datos personales (SELECT sobre FINANZAS.CLIENTES)|'
       || case when n = 1 then 'Auditado' else 'No auditado' end
from (select count(*) n from dba_obj_audit_opts where owner = 'FINANZAS' and object_name = 'CLIENTES' and sel <> '-/-')
union all
select 'CRITERIO|A8.15|d|' || case when n >= 3 then 'OK' else 'FALLA' end
       || '|Se auditan los cambios de cuentas y privilegios (USER, ROLE, SYSTEM GRANT)|' || n || ' de 3 opciones'
from (select count(*) n from dba_stmt_audit_opts where audit_option in ('USER', 'ROLE', 'SYSTEM GRANT'))
union all
select 'CRITERIO|A8.15|e|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|La pista contiene registros de las últimas 24 horas|' || n || ' registro(s)'
from (select count(*) n from dba_audit_trail where timestamp >= sysdate - 1);
