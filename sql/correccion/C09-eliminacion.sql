-- C09 · Eliminación definitiva y purga periódica. PHVA: HACER. Control: A8.10.
-- Vacía la papelera de reciclaje (la copia "clientes_respaldo_2025" ya no se puede recuperar) y programa una purga
-- semanal ejecutada por el esquema de control.
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

purge dba_recyclebin;
grant purge dba_recyclebin to seguridad;

begin
    dbms_scheduler.create_job(
        job_name        => 'SEGURIDAD.PURGA_PAPELERA',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'begin execute immediate ''purge dba_recyclebin''; end;',
        repeat_interval => 'FREQ=WEEKLY;BYDAY=SUN;BYHOUR=2;BYMINUTE=0',
        enabled         => true,
        comments        => 'A8.10: purga semanal de objetos borrados');
end;
/

column owner format a12
column job_name format a18
column repeat_interval format a44
select owner, job_name, enabled, repeat_interval from dba_scheduler_jobs where job_name = 'PURGA_PAPELERA';
select count(*) as objetos_en_papelera from dba_recyclebin;
prompt === Papelera vacía y purga semanal programada ===
