-- V09 · A8.5 Autenticación segura
-- Pregunta del auditor: ¿el inicio de sesión resiste ataques de fuerza bruta y usa verificadores de contraseña
-- modernos?
-- Ejecutar como ISO_AUDITOR. Los límites "DEFAULT" se resuelven con el perfil DEFAULT.
-- Solo se evalúan las cuentas que se autentican con contraseña: el bloqueo por intentos fallidos y el verificador
-- de contraseña no se aplican a las cuentas externas (OPS$ORACLE), que se verifican en V03 (A5.16).
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column username format a14
column profile format a16
column intentos format a10
column bloqueo format a10
column password_versions format a18
column linea format a240

prompt ### Evidencia: intentos fallidos, tiempo de bloqueo y versión del verificador por cuenta abierta
with lim as (
    select p.profile, p.resource_name, case when p.limit = 'DEFAULT' then d.limit else p.limit end as valor
    from dba_profiles p join dba_profiles d on d.profile = 'DEFAULT' and d.resource_name = p.resource_name
)
select u.username, u.profile,
       max(case when l.resource_name = 'FAILED_LOGIN_ATTEMPTS' then l.valor end) as intentos,
       max(case when l.resource_name = 'PASSWORD_LOCK_TIME' then l.valor end) as bloqueo,
       u.password_versions
from dba_users u join lim l on l.profile = u.profile
where u.oracle_maintained = 'N' and u.account_status = 'OPEN' and u.authentication_type = 'PASSWORD'
group by u.username, u.profile, u.password_versions
order by u.username
fetch first 40 rows only;

prompt ### Criterios
set heading off
with lim as (
    select p.profile, p.resource_name, case when p.limit = 'DEFAULT' then d.limit else p.limit end as valor
    from dba_profiles p join dba_profiles d on d.profile = 'DEFAULT' and d.resource_name = p.resource_name
), efectiva as (
    select u.username, u.password_versions,
           max(case when l.resource_name = 'FAILED_LOGIN_ATTEMPTS' then l.valor end) as intentos,
           max(case when l.resource_name = 'PASSWORD_LOCK_TIME' then l.valor end) as bloqueo
    from dba_users u join lim l on l.profile = u.profile
    where u.oracle_maintained = 'N' and u.account_status = 'OPEN' and u.authentication_type = 'PASSWORD'
    group by u.username, u.password_versions
)
select 'CRITERIO|A8.5|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|La cuenta se bloquea tras 5 intentos fallidos o menos|' || n || ' cuenta(s) con intentos ilimitados o mayores' as linea
from (select count(*) n from efectiva
      where intentos = 'UNLIMITED' or to_number(intentos default 99999 on conversion error) > 5)
union all
select 'CRITERIO|A8.5|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|El bloqueo por intentos fallidos dura al menos 30 minutos|' || n || ' cuenta(s) con bloqueo menor'
from (select count(*) n from efectiva
      where to_number(bloqueo default 0 on conversion error) < 30 / 1440 and bloqueo <> 'UNLIMITED')
union all
select 'CRITERIO|A8.5|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta conserva el verificador antiguo 10G (solo 11G/12C)|' || n || ' cuenta(s) con verificador 10G'
from (select count(*) n from efectiva where password_versions like '%10G%');
