-- V02 · A5.15 Control de acceso
-- Pregunta del auditor: ¿el acceso a los datos de negocio se concede por roles según la necesidad de conocer,
-- y nunca a PUBLIC ni de forma directa a personas?
-- Ejecutar como ISO_AUDITOR.
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column grantee format a24
column owner format a14
column table_name format a24
column privilege format a12
column linea format a240

prompt ### Evidencia: SELECT * FROM DBA_TAB_PRIVS sobre los esquemas de negocio
select grantee, owner, table_name, privilege
from dba_tab_privs
where owner in ('FINANZAS', 'FINANZAS_DEV')
order by grantee, owner, table_name
fetch first 40 rows only;

prompt ### Criterios
set heading off
select 'CRITERIO|A5.15|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ningún privilegio sobre datos de negocio está concedido a PUBLIC|' || n || ' privilegio(s) a PUBLIC' as linea
from (select count(*) n from dba_tab_privs where grantee = 'PUBLIC' and owner in ('FINANZAS', 'FINANZAS_DEV'))
union all
select 'CRITERIO|A5.15|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Las personas no reciben privilegios directos sobre FINANZAS: el acceso pasa por roles|' || n || ' privilegio(s) directo(s) a usuarios'
from (select count(*) n from dba_tab_privs t
      where t.owner = 'FINANZAS'
        and t.grantee in (select username from dba_users where oracle_maintained = 'N')
        and t.grantee not in ('SEGURIDAD'))
union all
select 'CRITERIO|A5.15|c|' || case when n >= 2 then 'OK' else 'FALLA' end
       || '|Existen roles de negocio (ROL_*) con privilegios definidos sobre FINANZAS|' || n || ' rol(es) de negocio con privilegios'
from (select count(distinct r.role) n from dba_roles r join dba_tab_privs p on p.grantee = r.role
      where r.role like 'ROL\_%' escape '\' and p.owner = 'FINANZAS');
