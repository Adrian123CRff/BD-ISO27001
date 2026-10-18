-- V04 · A5.17 Información de autenticación
-- Pregunta del auditor: ¿las contraseñas cumplen complejidad, vigencia y no reutilización, y no hay contraseñas
-- por defecto?
-- Ejecutar como ISO_AUDITOR. Los límites "DEFAULT" de un perfil se resuelven con el perfil DEFAULT.
-- Solo se evalúan las cuentas que se autentican con contraseña: los límites de contraseña del perfil no se aplican
-- a las cuentas externas (OPS$ORACLE), cuya identidad y responsable se verifican en V03 (A5.16).
whenever sqlerror exit failure
set linesize 250 pagesize 200 feedback off
column username format a14
column profile format a16
column verificacion format a24
column vigencia format a10
column reuso_max format a10
column reuso_dias format a10
column linea format a240

prompt ### Evidencia: política de contraseñas efectiva de cada cuenta abierta (DBA_PROFILES + DBA_USERS)
with lim as (
    select p.profile, p.resource_name, case when p.limit = 'DEFAULT' then d.limit else p.limit end as valor
    from dba_profiles p join dba_profiles d on d.profile = 'DEFAULT' and d.resource_name = p.resource_name
)
select u.username, u.profile,
       max(case when l.resource_name = 'PASSWORD_VERIFY_FUNCTION' then l.valor end) as verificacion,
       max(case when l.resource_name = 'PASSWORD_LIFE_TIME' then l.valor end) as vigencia,
       max(case when l.resource_name = 'PASSWORD_REUSE_MAX' then l.valor end) as reuso_max,
       max(case when l.resource_name = 'PASSWORD_REUSE_TIME' then l.valor end) as reuso_dias
from dba_users u join lim l on l.profile = u.profile
where u.oracle_maintained = 'N' and u.account_status = 'OPEN' and u.authentication_type = 'PASSWORD'
group by u.username, u.profile
order by u.username
fetch first 40 rows only;

prompt ### Criterios
set heading off
with lim as (
    select p.profile, p.resource_name, case when p.limit = 'DEFAULT' then d.limit else p.limit end as valor
    from dba_profiles p join dba_profiles d on d.profile = 'DEFAULT' and d.resource_name = p.resource_name
), efectiva as (
    select u.username,
           max(case when l.resource_name = 'PASSWORD_VERIFY_FUNCTION' then l.valor end) as verificacion,
           max(case when l.resource_name = 'PASSWORD_LIFE_TIME' then l.valor end) as vigencia,
           max(case when l.resource_name = 'PASSWORD_REUSE_MAX' then l.valor end) as reuso_max,
           max(case when l.resource_name = 'PASSWORD_REUSE_TIME' then l.valor end) as reuso_dias
    from dba_users u join lim l on l.profile = u.profile
    where u.oracle_maintained = 'N' and u.account_status = 'OPEN' and u.authentication_type = 'PASSWORD'
    group by u.username
)
select 'CRITERIO|A5.17|a|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Toda cuenta abierta tiene función de complejidad de contraseña|' || n || ' cuenta(s) sin verificación' as linea
from (select count(*) n from efectiva where verificacion is null or verificacion = 'NULL')
union all
select 'CRITERIO|A5.17|b|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|La vigencia de la contraseña es de 90 días o menos|' || n || ' cuenta(s) con vigencia mayor o ilimitada'
from (select count(*) n from efectiva
      where vigencia = 'UNLIMITED' or to_number(vigencia default 99999 on conversion error) > 90)
union all
select 'CRITERIO|A5.17|c|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Se impide reutilizar contraseñas (REUSE_MAX y REUSE_TIME limitados)|' || n || ' cuenta(s) que pueden reutilizar'
from (select count(*) n from efectiva where reuso_max = 'UNLIMITED' or reuso_dias = 'UNLIMITED')
union all
select 'CRITERIO|A5.17|d|' || case when n = 0 then 'OK' else 'FALLA' end
       || '|Ninguna cuenta abierta usa contraseña por defecto (DBA_USERS_WITH_DEFPWD)|' || n || ' cuenta(s) con contraseña por defecto'
from (select count(*) n from dba_users_with_defpwd d join dba_users u on u.username = d.username
      where u.account_status = 'OPEN');
