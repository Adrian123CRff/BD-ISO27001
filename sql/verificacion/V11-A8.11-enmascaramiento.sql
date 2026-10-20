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

-- El control del clon es el último conteo guardado por SEGURIDAD.CONTROLAR_CLON_DEV (C10, repetido cada semana por
-- C14). Solo vale si es reciente: un conteo viejo no prueba nada sobre el clon de hoy. COUNT/MAX evitan el
-- NO_DATA_FOUND si aún no hay ningún registro. Códigos: -1 sin control, -2 sin registro, -3 registro de hace más de 7 días.
variable filas_reales number
declare
    v_existe   number;
    v_registros number;
    v_filas    number;
    v_reciente number;
begin
    select count(*) into v_existe from dba_views where owner = 'SEGURIDAD' and view_name = 'V_CONTROL_CLON_DEV';
    if v_existe = 0 then
        :filas_reales := -1;
    else
        execute immediate 'select count(*), max(filas_reales), count(case when fecha >= sysdate - 7 then 1 end) '
                       || 'from seguridad.v_control_clon_dev' into v_registros, v_filas, v_reciente;
        :filas_reales := case when v_registros = 0 then -2 when v_reciente = 0 then -3 else v_filas end;
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
       || '|El clon de desarrollo (FINANZAS_DEV) no contiene cédulas ni tarjetas reales (control de los últimos 7 días)|'
       || case :filas_reales when -1 then 'No existe control sobre el clon' when -2 then 'El control no tiene registros'
               when -3 then 'El último control tiene más de 7 días' else :filas_reales || ' fila(s) con datos reales' end
from dual;
