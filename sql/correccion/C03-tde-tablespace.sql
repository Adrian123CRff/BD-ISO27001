-- C03 · Datos de negocio a un tablespace cifrado con TDE (AES256). PHVA: HACER. Controles: A8.24, A8.12, A8.13.
-- Crea DATOS_FIN_CIF cifrado, mueve tablas e índices de FINANZAS y FINANZAS_DEV y elimina el tablespace sin cifrar
-- junto con su archivo, para que no queden bloques en texto claro en disco.
-- Los nombres de objetos salen del diccionario (no de un usuario) y se validan con DBMS_ASSERT (regla 8).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure
set serveroutput on

create tablespace datos_fin_cif
    datafile '/opt/oracle/oradata/XE/XEPDB1/datos_fin_cif01.dbf' size 50m autoextend on next 10m maxsize 500m
    encryption using 'AES256' encrypt;

alter user finanzas default tablespace datos_fin_cif quota unlimited on datos_fin_cif;
alter user finanzas_dev default tablespace datos_fin_cif quota unlimited on datos_fin_cif;

declare
    v_movidos number := 0;
begin
    for t in (select owner, table_name from dba_tables where owner in ('FINANZAS', 'FINANZAS_DEV') and tablespace_name = 'DATOS_FIN') loop
        execute immediate 'alter table ' || dbms_assert.enquote_name(t.owner) || '.' || dbms_assert.enquote_name(t.table_name)
                       || ' move tablespace datos_fin_cif';
        v_movidos := v_movidos + 1;
    end loop;
    for i in (select owner, index_name from dba_indexes where table_owner in ('FINANZAS', 'FINANZAS_DEV') and tablespace_name = 'DATOS_FIN') loop
        execute immediate 'alter index ' || dbms_assert.enquote_name(i.owner) || '.' || dbms_assert.enquote_name(i.index_name)
                       || ' rebuild tablespace datos_fin_cif';
    end loop;
    dbms_output.put_line(v_movidos || ' tabla(s) movida(s) al tablespace cifrado');
end;
/

-- El tablespace sin cifrar ya no tiene segmentos de negocio: se elimina con su archivo de datos.
alter user finanzas quota 0 on datos_fin;
alter user finanzas_dev quota 0 on datos_fin;
drop tablespace datos_fin including contents and datafiles;

column tablespace_name format a16
column encrypted format a10
select tablespace_name, encrypted from dba_tablespaces where tablespace_name like 'DATOS_FIN%';
prompt === Datos de negocio cifrados en reposo ===
