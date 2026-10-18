-- V05 · A5.18 Derechos de acceso
-- Pregunta del auditor: ¿los derechos se revisan periódicamente y se retiran a quien ya no los necesita
-- (bajas, cuentas inactivas)?
-- Ejecutar como ISO_AUDITOR. El registro de identidades puede no existir: SQL dinámico de texto fijo (regla 8).
set linesize 250 pagesize 200 feedback off
column username format a16
column account_status format a20
column ultimo_ingreso format a20
column linea format a240

prompt ### Evidencia: estado y último ingreso de las cuentas no mantenidas por Oracle
select username, account_status, nvl(to_char(last_login, 'YYYY-MM-DD HH24:MI'), '(nunca)') as ultimo_ingreso
from dba_users where oracle_maintained = 'N'
order by username
fetch first 40 rows only;

variable revision_vigente number
variable bajas_abiertas number
declare
    v_existe number;
begin
    select count(*) into v_existe from dba_tables where owner = 'SEGURIDAD' and table_name = 'REGISTRO_IDENTIDADES';
    if v_existe = 0 then
        :revision_vigente := -1;
        :bajas_abiertas := -1;
    else
        execute immediate 'select count(*) from seguridad.registro_identidades where fecha_revision >= sysdate - 180'
            into :revision_vigente;
        execute immediate 'select count(*) from seguridad.registro_identidades r join dba_users u on u.username = r.usuario '
                       || 'where r.estado = ''BAJA'' and u.account_status = ''OPEN'''
            into :bajas_abiertas;
    end if;
end;
/

prompt ### Criterios
set heading off
select 'CRITERIO|A5.18|a|' || case when :revision_vigente > 0 then 'OK' else 'FALLA' end
       || '|Hay una revisión de derechos de acceso registrada en los últimos 180 días|'
       || case when :revision_vigente = -1 then 'No existe registro de revisión' else :revision_vigente || ' cuenta(s) revisada(s)' end as linea
from dual
union all
select 'CRITERIO|A5.18|b|' || case when :bajas_abiertas = 0 then 'OK' else 'FALLA' end
       || '|Las cuentas dadas de baja (exfuncionarios) están bloqueadas|'
       || case when :bajas_abiertas = -1 then 'Sin registro: no se puede saber quién es baja' else :bajas_abiertas || ' baja(s) con cuenta abierta' end
from dual
union all
select 'CRITERIO|A5.18|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|No hay cuentas abiertas sin uso en más de 90 días|' || n || ' cuenta(s) inactiva(s) abierta(s)'
from (select count(*) n from dba_users
      where oracle_maintained = 'N' and account_status = 'OPEN' and last_login < systimestamp - interval '90' day);
