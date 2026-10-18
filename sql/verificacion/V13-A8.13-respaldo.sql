-- V13 · A8.13 Respaldo de la información
-- Pregunta del auditor: ¿existen respaldos recientes y están cifrados, de modo que una copia robada no exponga los
-- datos? (en clase: "con el log y el BKP se podría intentar abrir los tablespaces si no están cifrados").
-- Ejecutar como ISO_AUDITOR.
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column name format a34
column value format a40
column status format a12
column inicio format a20
column input_type format a14
column encrypted format a10
column piezas format 9999
column linea format a240

prompt ### Evidencia: configuración de RMAN (V$RMAN_CONFIGURATION, vacía = valores por defecto)
select name, value from v$rman_configuration fetch first 20 rows only;

-- V$RMAN_BACKUP_JOB_DETAILS registra los trabajos de RMAN en CDB$ROOT y desde XEPDB1 aparece vacía; por eso la
-- antigüedad del respaldo se mide con las piezas disponibles (V$BACKUP_PIECE), que sí son visibles en la PDB.
prompt ### Evidencia: piezas de respaldo disponibles, cifradas y fecha de la más reciente
select encrypted, count(*) as piezas, to_char(max(completion_time), 'YYYY-MM-DD HH24:MI') as inicio
from v$backup_piece where status = 'A' group by encrypted;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.13|a|' || case when n = 1 then 'OK' else 'FALLA' end
       || '|RMAN está configurado para cifrar los respaldos (ENCRYPTION FOR DATABASE ON)|'
       || case when n = 1 then 'Cifrado activo' else 'Cifrado no configurado' end as linea
from (select count(*) n from v$rman_configuration where name = 'ENCRYPTION FOR DATABASE' and value like 'ON%')
union all
select 'CRITERIO|A8.13|b|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|Hay al menos un respaldo completado en los últimos 7 días|' || n || ' pieza(s) de respaldo reciente(s)'
from (select count(*) n from v$backup_piece where status = 'A' and completion_time >= sysdate - 7)
union all
select 'CRITERIO|A8.13|c|' || case when total > 0 and sin_cifrar = 0 then 'OK' else 'FALLA' end
       || '|Todas las piezas de respaldo disponibles están cifradas|'
       || case when total = 0 then 'No hay piezas de respaldo' else sin_cifrar || ' de ' || total || ' pieza(s) sin cifrar' end
from (select count(*) total, count(case when encrypted = 'NO' then 1 end) sin_cifrar from v$backup_piece where status = 'A');
