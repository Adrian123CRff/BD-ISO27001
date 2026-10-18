-- V03 · A5.16 Gestión de identidades
-- Pregunta del auditor: ¿cada cuenta de la base corresponde a una persona o servicio identificado y con responsable?
-- Ejecutar como ISO_AUDITOR. El registro de identidades puede no existir todavía: se consulta con SQL dinámico de
-- texto fijo (sin datos del usuario), justificado según la regla 8 de docs/reglas-de-codigo.md.
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off serveroutput on
column username format a16
column account_status format a20
column created format a20
column linea format a240

prompt ### Evidencia: cuentas no mantenidas por Oracle
select username, account_status, to_char(created, 'YYYY-MM-DD HH24:MI') as created
from dba_users where oracle_maintained = 'N'
order by username
fetch first 40 rows only;

variable sin_registro number
declare
    v_existe number;
begin
    select count(*) into v_existe from dba_tables where owner = 'SEGURIDAD' and table_name = 'REGISTRO_IDENTIDADES';
    if v_existe = 0 then
        :sin_registro := -1;
    else
        execute immediate 'select count(*) from dba_users u where u.oracle_maintained = ''N'' '
                       || 'and not exists (select 1 from seguridad.registro_identidades r where r.usuario = u.username)'
            into :sin_registro;
    end if;
end;
/

prompt ### Criterios
set heading off
select 'CRITERIO|A5.16|a|' || case when :sin_registro = 0 then 'OK' else 'FALLA' end
       || '|Toda cuenta está registrada con su responsable en SEGURIDAD.REGISTRO_IDENTIDADES|'
       || case when :sin_registro = -1 then 'No existe registro de identidades' else :sin_registro || ' cuenta(s) sin responsable' end as linea
from dual
union all
select 'CRITERIO|A5.16|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|No hay cuentas genéricas o compartidas abiertas (SOPORTE, ADMIN, TEST, GUEST, TEMP)|' || n || ' cuenta(s) genérica(s) abierta(s)'
from (select count(*) n from dba_users
      where username in ('SOPORTE', 'ADMIN', 'TEST', 'GUEST', 'TEMP', 'USUARIO') and account_status = 'OPEN');
