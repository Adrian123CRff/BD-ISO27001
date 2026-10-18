-- V06 · A5.33 Protección de registros
-- Pregunta del auditor: ¿la pista de auditoría existe y está protegida contra borrado o alteración?
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column grantee format a24
column privilege format a20
column objeto format a14
column name format a24
column value format a20
column success format a10
column failure format a10
column linea format a240

prompt ### Evidencia: parámetros de auditoría
select name, value from v$parameter where name in ('audit_trail', 'audit_sys_operations');

prompt ### Evidencia: privilegios cuyo uso se audita (DBA_PRIV_AUDIT_OPTS)
select privilege, success, failure from dba_priv_audit_opts order by privilege fetch first 20 rows only;

prompt ### Evidencia: quién puede borrar la pista (DELETE sobre SYS.AUD$ o DELETE ANY TABLE)
select grantee, privilege, 'SYS.AUD$' as objeto from dba_tab_privs where owner = 'SYS' and table_name = 'AUD$'
union all
select grantee, privilege, '(cualquiera)' from dba_sys_privs where privilege = 'DELETE ANY TABLE'
order by 1
fetch first 30 rows only;

prompt ### Criterios
set heading off
select 'CRITERIO|A5.33|a|' || case when value <> 'NONE' then 'OK' else 'FALLA' end
       || '|La pista de auditoría está habilitada (audit_trail distinto de NONE)|audit_trail = ' || value as linea
from v$parameter where name = 'audit_trail'
union all
select 'CRITERIO|A5.33|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta o rol ajeno a Oracle puede borrar la pista de auditoría|' || n || ' concesión(es) peligrosa(s)'
from (select count(*) n from (
          select grantee from dba_tab_privs where owner = 'SYS' and table_name = 'AUD$' and privilege in ('DELETE', 'UPDATE')
          union all
          select grantee from dba_sys_privs where privilege in ('DELETE ANY TABLE', 'UPDATE ANY TABLE', 'DROP ANY TABLE'))
      where grantee in (select username from dba_users where oracle_maintained = 'N'
                        union all select role from dba_roles where oracle_maintained = 'N'))
union all
select 'CRITERIO|A5.33|c|' || case when n = 2 and s = 'TRUE' then 'OK' else 'FALLA' end
       || '|Se audita el uso de DELETE/UPDATE ANY TABLE y las operaciones de SYS (audit_sys_operations)|'
       || n || ' de 2 privilegios auditados, audit_sys_operations = ' || s
from (select (select count(*) from dba_priv_audit_opts where privilege in ('DELETE ANY TABLE', 'UPDATE ANY TABLE')) n,
             (select upper(value) from v$parameter where name = 'audit_sys_operations') s
      from dual);
