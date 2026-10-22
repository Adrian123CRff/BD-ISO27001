-- M02 · Ejecutar ahora la revisión semanal (PHVA: Actuar). Controles: A8.15, A5.33 y A8.11 (control del clon).
-- Cuándo: la tarea SEGURIDAD.REVISION_SEMANAL corre sola los lunes a las 7:00, pero solo si el contenedor está
-- encendido. La madurez 4 y el criterio c de A8.11 exigen un registro de los últimos 7 días: si la base estuvo apagada
-- el lunes, o antes de una demostración, se adelanta la misma tarea (no cambia ninguna configuración).
-- Ejecutar como SYSDBA en XEPDB1:  .\scripts\ejecutar-sql.ps1 sql\mantenimiento\M02-revision-semanal.sql -Como sys
whenever sqlerror exit failure
set linesize 200

exec dbms_scheduler.run_job('SEGURIDAD.REVISION_SEMANAL', use_current_session => true);

column fecha format a20
select id_revision, to_char(fecha, 'YYYY-MM-DD HH24:MI') fecha, intentos_fallidos, accesos_denegados,
       lecturas_clientes, cambios_privilegios
from seguridad.bitacora_revision order by id_revision;
select to_char(fecha, 'YYYY-MM-DD HH24:MI') fecha, filas_reales from seguridad.v_control_clon_dev order by fecha;
prompt === Revisión semanal ejecutada ===
