-- V08 · A8.3 Restricción del acceso a la información
-- Pregunta del auditor: ¿el acceso a la información está restringido de acuerdo con la política? Para "Cumple" se
-- debe demostrar cada parte: (a) restricción por fila con VPD, (b) nadie fuera de los roles de negocio lee los
-- clientes, (c) nadie puede saltarse las políticas con privilegios de excepción.
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column object_owner format a12
column object_name format a14
column policy_name format a24
column function format a28
column enable format a6
column grantee format a20
column privilege format a28
column linea format a240

prompt ### Evidencia: políticas VPD (DBA_POLICIES) sobre FINANZAS
select object_owner, object_name, policy_name, function, enable
from dba_policies where object_owner = 'FINANZAS'
fetch first 20 rows only;

prompt ### Evidencia: privilegios de excepción
select grantee, privilege from dba_sys_privs
where privilege in ('EXEMPT ACCESS POLICY', 'EXEMPT REDACTION POLICY', 'SELECT ANY TABLE')
order by grantee
fetch first 30 rows only;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.3|a|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|Hay una política VPD activa que restringe por fila los datos de FINANZAS|' || n || ' política(s) activa(s)' as linea
from (select count(*) n from dba_policies where object_owner = 'FINANZAS' and enable = 'YES')
union all
select 'CRITERIO|A8.3|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Solo los roles de negocio (ROL_*) y el esquema de control SEGURIDAD (bloqueado) leen FINANZAS.CLIENTES|'
       || n || ' destinatario(s) no autorizado(s)'
from (select count(*) n from dba_tab_privs
      where owner = 'FINANZAS' and table_name = 'CLIENTES'
        and grantee not like 'ROL\_%' escape '\' and grantee <> 'SEGURIDAD')
union all
select 'CRITERIO|A8.3|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta o rol de negocio puede saltarse las políticas (EXEMPT ACCESS/REDACTION POLICY, SELECT ANY TABLE)|'
       || n || ' concesión(es) de excepción'
from (select count(*) n from dba_sys_privs
      where privilege in ('EXEMPT ACCESS POLICY', 'EXEMPT REDACTION POLICY', 'SELECT ANY TABLE')
        and grantee in (select username from dba_users where oracle_maintained = 'N'
                        union all select role from dba_roles where oracle_maintained = 'N'));
