-- V10 · A8.10 Eliminación de la información
-- Pregunta del auditor: ¿la información que ya no se necesita se elimina de forma definitiva, sin copias
-- recuperables?
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column owner format a12
column object_name format a32
column original_name format a26
column droptime format a20
column job_name format a20
column enabled format a8
column repeat_interval format a40
column linea format a240

prompt ### Evidencia: papelera de reciclaje (DBA_RECYCLEBIN) de los esquemas de negocio
select owner, object_name, original_name, droptime from dba_recyclebin
where owner in ('FINANZAS', 'FINANZAS_DEV')
fetch first 20 rows only;

prompt ### Evidencia: tarea programada de purga
select owner, job_name, enabled, repeat_interval from dba_scheduler_jobs where job_name = 'PURGA_PAPELERA';

prompt ### Criterios
set heading off
select 'CRITERIO|A8.10|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|La papelera de reciclaje no conserva objetos con datos de negocio|' || n || ' objeto(s) recuperable(s)' as linea
from (select count(*) n from dba_recyclebin where owner in ('FINANZAS', 'FINANZAS_DEV'))
union all
select 'CRITERIO|A8.10|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|No hay copias ad hoc de tablas de negocio (*RESPALDO*, *BAK*, *COPIA*)|' || n || ' copia(s)'
from (select count(*) n from dba_tables
      where owner in ('FINANZAS', 'FINANZAS_DEV') and regexp_like(table_name, 'RESPALDO|BAK|COPIA|OLD'))
union all
select 'CRITERIO|A8.10|c|' || case when n = 1 then 'OK' else 'FALLA' end
       || '|Hay una purga periódica programada y activa (PURGA_PAPELERA)|'
       || case when n = 1 then 'Tarea activa' else 'Sin tarea de purga' end
from (select count(*) n from dba_scheduler_jobs where job_name = 'PURGA_PAPELERA' and enabled = 'TRUE');
