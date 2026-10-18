-- V90 · Gobierno de los controles (entrada para el criterio de madurez 3 y 4)
-- Une el mundo administrativo con la base de datos: el procedimiento documentado y la verificación periódica
-- también se demuestran con SQL.
--   DOC: el control tiene un procedimiento aprobado en SEGURIDAD.PROCEDIMIENTOS (madurez 3).
--   VER: existe la verificación semanal programada (SEGURIDAD.REVISION_SEMANAL activa) y dejó un registro en
--        SEGURIDAD.BITACORA_REVISION en los últimos 7 días (madurez 4).
-- Ejecutar como ISO_AUDITOR. Las tablas pueden no existir: SQL dinámico de texto fijo (regla 8).
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off serveroutput on size unlimited
set heading off

declare
    type t_controles is varray(17) of varchar2(8);
    v_controles constant t_controles := t_controles(
        'A5.12', 'A5.15', 'A5.16', 'A5.17', 'A5.18', 'A5.33', 'A8.2', 'A8.3', 'A8.5',
        'A8.10', 'A8.11', 'A8.12', 'A8.13', 'A8.15', 'A8.20', 'A8.24', 'A8.8');
    v_tabla_doc  number;
    v_tabla_bit  number;
    v_job        number;
    v_bitacora   number := 0;
    v_doc        number;
begin
    select count(*) into v_tabla_doc from dba_tables where owner = 'SEGURIDAD' and table_name = 'PROCEDIMIENTOS';
    select count(*) into v_tabla_bit from dba_tables where owner = 'SEGURIDAD' and table_name = 'BITACORA_REVISION';
    select count(*) into v_job from dba_scheduler_jobs
    where owner = 'SEGURIDAD' and job_name = 'REVISION_SEMANAL' and enabled = 'TRUE';
    if v_tabla_bit = 1 then
        execute immediate 'select count(*) from seguridad.bitacora_revision where fecha >= sysdate - 7' into v_bitacora;
    end if;

    for i in 1 .. v_controles.count loop
        v_doc := 0;
        if v_tabla_doc = 1 then
            execute immediate 'select count(*) from seguridad.procedimientos where control = :c and estado = ''APROBADO'''
                into v_doc using v_controles(i);
        end if;
        dbms_output.put_line('GOBIERNO|' || v_controles(i) || '|DOC|' || case when v_doc > 0 then 'OK' else 'FALLA' end
                             || '|Procedimiento aprobado en SEGURIDAD.PROCEDIMIENTOS|' || v_doc || ' procedimiento(s)');
        dbms_output.put_line('GOBIERNO|' || v_controles(i) || '|VER|'
                             || case when v_job = 1 and v_bitacora > 0 then 'OK' else 'FALLA' end
                             || '|Revisión semanal programada con registro en los últimos 7 días|'
                             || 'tarea ' || case when v_job = 1 then 'activa' else 'inexistente' end
                             || ', ' || v_bitacora || ' registro(s) en bitácora');
    end loop;
end;
/
