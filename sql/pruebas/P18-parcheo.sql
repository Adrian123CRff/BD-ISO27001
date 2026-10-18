-- PRUEBA: P18
-- TIPO: Revisión de vulnerabilidades
-- CONTROL: A8.8
-- RIESGO: R-CONF-02
-- COMO: auditor
-- PROCEDIMIENTO: El auditor compara la versión y los parches aplicados al motor con la decisión registrada por la cooperativa: un motor sin parches solo es aceptable si hay una aceptación formal del riesgo con medidas compensatorias.
-- ESPERADO: El motor tiene al menos un parche aplicado, o la falta de parches figura como RIESGO ACEPTADO en SEGURIDAD.PROCEDIMIENTOS (XE no recibe Release Updates).
-- PATRON: RESULTADO: (PARCHADO|RIESGO ACEPTADO)
-- HERRAMIENTA: SQL*Plus (DBA_REGISTRY_SQLPATCH y registro de procedimientos)
-- El registro de procedimientos puede no existir todavía: SQL dinámico de texto fijo, sin datos del usuario (regla 8).
set serveroutput on
declare
    v_parches   number;
    v_tabla     number;
    v_aceptado  number := 0;
begin
    for v in (select banner_full from v$version) loop
        dbms_output.put_line(v.banner_full);
    end loop;
    select count(*) into v_parches from dba_registry_sqlpatch where status = 'SUCCESS';
    select count(*) into v_tabla from dba_tables where owner = 'SEGURIDAD' and table_name = 'PROCEDIMIENTOS';
    if v_tabla = 1 then
        execute immediate 'select count(*) from seguridad.procedimientos where control = ''A8.8'' and estado = ''RIESGO ACEPTADO'''
            into v_aceptado;
    end if;
    dbms_output.put_line('Parches aplicados: ' || v_parches || ' | aceptación formal del riesgo: ' || v_aceptado);
    if v_parches > 0 then
        dbms_output.put_line('RESULTADO: PARCHADO');
    elsif v_aceptado > 0 then
        dbms_output.put_line('RESULTADO: RIESGO ACEPTADO');
    else
        dbms_output.put_line('RESULTADO: SIN PARCHES NI ACEPTACION DEL RIESGO');
    end if;
end;
/
