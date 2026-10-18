-- V16 · A8.24 Uso de criptografía (control complementario: tarea "cifrado TDE")
-- Pregunta del auditor: ¿los datos personales están cifrados en reposo con TDE y el monedero está abierto y
-- configurado? (en clase: "prestar atención a v$encryption_wallet").
-- Ejecutar como ISO_AUDITOR.
set linesize 250 pagesize 200 feedback off
column wrl_type format a8
column wrl_parameter format a40
column status format a20
column wallet_type format a14
column tablespace_name format a14
column encrypted format a10
column name format a20
column value format a40
column linea format a240

prompt ### Evidencia: SELECT * FROM V$ENCRYPTION_WALLET
select wrl_type, wrl_parameter, status, wallet_type from v$encryption_wallet;

prompt ### Evidencia: tablespaces que contienen datos de negocio
select distinct t.tablespace_name, t.encrypted
from dba_segments s join dba_tablespaces t on t.tablespace_name = s.tablespace_name
where s.owner in ('FINANZAS', 'FINANZAS_DEV');

prompt ### Criterios
set heading off
select 'CRITERIO|A8.24|a|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|El monedero (keystore) de TDE está abierto|' || nvl(estado, 'sin monedero') as linea
from (select count(case when status = 'OPEN' then 1 end) n, max(status) estado from v$encryption_wallet)
union all
select 'CRITERIO|A8.24|b|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|El monedero abre solo al reiniciar (AUTOLOGIN) o está gestionado por contraseña con procedimiento|'
       || nvl(tipo, 'sin monedero')
from (select count(case when wallet_type in ('AUTOLOGIN', 'LOCAL_AUTOLOGIN', 'PASSWORD') then 1 end) n, max(wallet_type) tipo
      from v$encryption_wallet)
union all
select 'CRITERIO|A8.24|c|' || case when total > 0 and sin_cifrar = 0 then 'OK' else 'FALLA' end
       || '|Todos los tablespaces con datos de negocio están cifrados con TDE|' || sin_cifrar || ' de ' || total || ' sin cifrar'
from (select count(*) total, count(case when encrypted = 'NO' then 1 end) sin_cifrar
      from (select distinct t.tablespace_name, t.encrypted
            from dba_segments s join dba_tablespaces t on t.tablespace_name = s.tablespace_name
            where s.owner in ('FINANZAS', 'FINANZAS_DEV')));
