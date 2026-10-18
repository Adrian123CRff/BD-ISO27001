-- V11 · A8.11 Enmascaramiento de datos
-- Pregunta del auditor: ¿los datos personales se muestran enmascarados a quien no necesita verlos completos, y los
-- clones de desarrollo y pruebas no contienen datos reales?
-- Ejecutar como ISO_AUDITOR. La vista de control del clon puede no existir: SQL dinámico de texto fijo (regla 8).
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column object_owner format a12
column object_name format a14
column policy_name format a26
column column_name format a16
column function_type format a22
column enable format a6
column linea format a240

prompt ### Evidencia: políticas de Data Redaction (REDACTION_POLICIES y REDACTION_COLUMNS)
select object_owner, object_name, policy_name, enable from redaction_policies
fetch first 10 rows only;
select object_owner, object_name, column_name, function_type from redaction_columns
fetch first 20 rows only;

variable filas_reales number
declare
    v_existe number;
begin
    select count(*) into v_existe from dba_views where owner = 'SEGURIDAD' and view_name = 'V_CONTROL_CLON_DEV';
    if v_existe = 0 then
        :filas_reales := -1;
    else
        execute immediate 'select filas_reales from seguridad.v_control_clon_dev' into :filas_reales;
    end if;
end;
/

prompt ### Criterios
set heading off
select 'CRITERIO|A8.11|a|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|Hay una política de Data Redaction activa sobre FINANZAS.CLIENTES|' || n || ' política(s) activa(s)' as linea
from (select count(*) n from redaction_policies where object_owner = 'FINANZAS' and object_name = 'CLIENTES' and enable like 'YES%')
union all
select 'CRITERIO|A8.11|b|' || case when n = 3 then 'OK' else 'FALLA' end
       || '|La redacción cubre cédula, salario y número de tarjeta|' || n || ' de 3 columnas cubiertas'
from (select count(*) n from redaction_columns
      where object_owner = 'FINANZAS' and object_name = 'CLIENTES' and column_name in ('CEDULA', 'SALARIO', 'NUMERO_TARJETA'))
union all
select 'CRITERIO|A8.11|c|' || case when :filas_reales = 0 then 'OK' else 'FALLA' end
       || '|El clon de desarrollo (FINANZAS_DEV) no contiene cédulas ni tarjetas reales|'
       || case when :filas_reales = -1 then 'No existe control sobre el clon' else :filas_reales || ' fila(s) con datos reales' end
from dual;
