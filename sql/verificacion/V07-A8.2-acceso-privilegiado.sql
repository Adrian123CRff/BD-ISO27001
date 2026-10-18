-- V07 · A8.2 Derechos de acceso privilegiado
-- Pregunta del auditor: ¿los privilegios administrativos (DBA, privilegios ANY, SYSDBA) están restringidos a las
-- cuentas administrativas autorizadas?
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column grantee format a20
column privilege format a30
column admin_option format a6
column username format a16
column account_status format a20
column linea format a240

prompt ### Evidencia: SELECT * FROM DBA_SYS_PRIVS (cuentas y roles no mantenidos por Oracle)
select grantee, privilege, admin_option from dba_sys_privs
where grantee in (select username from dba_users where oracle_maintained = 'N'
                  union all select role from dba_roles where oracle_maintained = 'N')
order by grantee, privilege
fetch first 40 rows only;

prompt ### Evidencia: quién tiene el rol DBA
select grantee, granted_role as privilege, admin_option from dba_role_privs where granted_role = 'DBA' order by grantee;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.2|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|El rol DBA solo lo tienen las cuentas administrativas (SYS, SYSTEM)|' || n || ' cuenta(s) adicional(es) con DBA' as linea
from (select count(*) n from dba_role_privs where granted_role = 'DBA' and grantee not in ('SYS', 'SYSTEM'))
union all
select 'CRITERIO|A8.2|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta o rol de negocio tiene privilegios ANY|' || n || ' privilegio(s) ANY fuera de Oracle'
from (select count(*) n from dba_sys_privs
      where privilege like '% ANY %'
        and grantee in (select username from dba_users where oracle_maintained = 'N'
                        union all select role from dba_roles where oracle_maintained = 'N'))
union all
select 'CRITERIO|A8.2|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Solo SYS figura con privilegios administrativos en el archivo de contraseñas (V$PWFILE_USERS)|' || n || ' cuenta(s) adicional(es)'
from (select count(*) n from v$pwfile_users where username <> 'SYS')
union all
select 'CRITERIO|A8.2|d|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Las cuentas dueñas de esquemas (FINANZAS, FINANZAS_DEV, SEGURIDAD) no permiten iniciar sesión|' || n || ' cuenta(s) dueña(s) abierta(s)'
from (select count(*) n from dba_users where username in ('FINANZAS', 'FINANZAS_DEV', 'SEGURIDAD') and account_status = 'OPEN');
