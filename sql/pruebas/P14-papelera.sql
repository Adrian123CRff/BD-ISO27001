-- PRUEBA: P14
-- TIPO: Recuperación de datos eliminados
-- CONTROL: A8.10
-- RIESGO: R-CONF-03
-- COMO: auditor
-- PROCEDIMIENTO: Se comprueba si la tabla borrada CLIENTES_RESPALDO_2025 (u otra del negocio) todavía se puede recuperar con FLASHBACK TABLE ... TO BEFORE DROP.
-- ESPERADO: Nada recuperable en la papelera de los esquemas de negocio.
-- PATRON: RESULTADO: NADA RECUPERABLE
-- HERRAMIENTA: SQL*Plus (DBA_RECYCLEBIN)
set heading off
select case when count(*) = 0 then 'RESULTADO: NADA RECUPERABLE'
            else 'RESULTADO: ' || count(*) || ' objeto(s) recuperable(s): '
                 || listagg(original_name, ', ') within group (order by original_name) end
from dba_recyclebin where owner in ('FINANZAS', 'FINANZAS_DEV') and can_undrop = 'YES';
