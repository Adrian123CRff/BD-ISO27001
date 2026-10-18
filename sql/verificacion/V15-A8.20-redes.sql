-- V15 · A8.20 Seguridad de redes
-- Pregunta del auditor: ¿el tráfico entre clientes y base de datos viaja cifrado y con integridad, de modo que no
-- se puedan leer los datos capturando la red?
-- Ejecutar como ISO_AUDITOR (por TCP, como un cliente normal). La configuración del listener y de sqlnet.ora se
-- revisa en la prueba P10 (revisión de configuración).
set linesize 250 pagesize 200 feedback off
column network_service_banner format a90
column protocolo format a10
column linea format a240

prompt ### Evidencia: servicios de red de la sesión actual (V$SESSION_CONNECT_INFO)
select network_service_banner from v$session_connect_info
where sid = sys_context('USERENV', 'SID') fetch first 10 rows only;
select sys_context('USERENV', 'NETWORK_PROTOCOL') as protocolo from dual;

prompt ### Criterios
set heading off
select 'CRITERIO|A8.20|a|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|La sesión viaja cifrada con AES (cifrado nativo de Oracle Net)|'
       || case when n >= 1 then 'AES activo' else 'Sin cifrado de red' end as linea
from (select count(*) n from v$session_connect_info
      where sid = sys_context('USERENV', 'SID') and network_service_banner like 'AES%Encryption service adapter%')
union all
select 'CRITERIO|A8.20|b|' || case when n >= 1 then 'OK' else 'FALLA' end
       || '|La sesión tiene control de integridad criptográfico (SHA)|'
       || case when n >= 1 then 'SHA activo' else 'Sin control de integridad' end
from (select count(*) n from v$session_connect_info
      where sid = sys_context('USERENV', 'SID') and network_service_banner like 'SHA%Crypto-checksumming service adapter%');
