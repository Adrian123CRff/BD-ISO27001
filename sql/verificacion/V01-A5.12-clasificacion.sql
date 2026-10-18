-- V01 · A5.12 Clasificación de la información
-- Pregunta del auditor: ¿están identificados y etiquetados los datos personales según su nivel de confidencialidad?
-- Ejecutar como ISO_AUDITOR (solo lectura). Salida: evidencia + líneas CRITERIO|control|id|OK/FALLA|criterio|observado
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column owner format a12
column table_name format a16
column column_name format a16
column comments format a70
column linea format a240

prompt ### Evidencia: comentarios de clasificación en las columnas de FINANZAS.CLIENTES
select owner, table_name, column_name, nvl(comments, '(sin clasificar)') as comments
from dba_col_comments
where owner = 'FINANZAS' and table_name = 'CLIENTES'
order by column_name
fetch first 20 rows only;

prompt ### Evidencia: inventario de clasificación (tabla SEGURIDAD.CLASIFICACION_DATOS)
select owner, table_name from dba_tables where owner = 'SEGURIDAD' and table_name = 'CLASIFICACION_DATOS';

prompt ### Criterios
set heading off
select 'CRITERIO|A5.12|a|' || case when n = 1 then 'OK' else 'FALLA' end
       || '|Existe un inventario de clasificación de datos (SEGURIDAD.CLASIFICACION_DATOS)|' || n || ' inventario(s)' as linea
from (select count(*) n from dba_tables where owner = 'SEGURIDAD' and table_name = 'CLASIFICACION_DATOS')
union all
select 'CRITERIO|A5.12|b|' || case when n = 5 then 'OK' else 'FALLA' end
       || '|Las 5 columnas personales de CLIENTES (cédula, correo, teléfono, salario, tarjeta) llevan etiqueta de clasificación|'
       || n || ' de 5 etiquetadas'
from (select count(*) n from dba_col_comments
      where owner = 'FINANZAS' and table_name = 'CLIENTES'
        and column_name in ('CEDULA', 'CORREO', 'TELEFONO', 'SALARIO', 'NUMERO_TARJETA')
        and regexp_like(comments, '^(CONFIDENCIAL|RESTRINGIDO|INTERNO|PUBLICO)'))
union all
select 'CRITERIO|A5.12|c|' || case when n = 3 then 'OK' else 'FALLA' end
       || '|Las 3 tablas de negocio (clientes, cuentas, movimientos) tienen nivel de clasificación|' || n || ' de 3 clasificadas'
from (select count(*) n from dba_tab_comments
      where owner = 'FINANZAS' and table_name in ('CLIENTES', 'CUENTAS', 'MOVIMIENTOS')
        and regexp_like(comments, '^(CONFIDENCIAL|RESTRINGIDO|INTERNO|PUBLICO)'));
