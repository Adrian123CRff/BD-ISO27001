-- PRUEBA: P15
-- TIPO: Trazabilidad
-- CONTROL: A8.15
-- RIESGO: R-CONF-05
-- COMO: auditor
-- PROCEDIMIENTO: Después de P01 a P14, el auditor revisa en DBA_AUDIT_TRAIL si quedaron registrados los intentos de la última hora.
-- ESPERADO: Aparecen los inicios de sesión fallidos o bloqueados, los accesos denegados y las lecturas de FINANZAS.CLIENTES.
-- PATRON: RESULTADO: EVENTOS REGISTRADOS
-- HERRAMIENTA: SQL*Plus (DBA_AUDIT_TRAIL)
column categoria format a44
column eventos format 99999
select 'Inicios de sesión fallidos o bloqueados' as categoria, count(*) as eventos from dba_audit_trail
where timestamp >= sysdate - 1 / 24 and action_name = 'LOGON' and returncode in (1017, 28000)
union all
select 'Accesos denegados (ORA-00942 / ORA-01031)', count(*) from dba_audit_trail
where timestamp >= sysdate - 1 / 24 and returncode in (942, 1031)
union all
select 'Lecturas de FINANZAS.CLIENTES', count(*) from dba_audit_trail
where timestamp >= sysdate - 1 / 24 and obj_name = 'CLIENTES' and action_name = 'SELECT';

set heading off
select case when min(n) > 0 then 'RESULTADO: EVENTOS REGISTRADOS' else 'RESULTADO: FALTAN EVENTOS EN LA PISTA' end
from (select count(*) n from dba_audit_trail
      where timestamp >= sysdate - 1 / 24 and action_name = 'LOGON' and returncode in (1017, 28000)
      union all
      select count(*) from dba_audit_trail where timestamp >= sysdate - 1 / 24 and returncode in (942, 1031)
      union all
      select count(*) from dba_audit_trail
      where timestamp >= sysdate - 1 / 24 and obj_name = 'CLIENTES' and action_name = 'SELECT');
