-- 00-entorno.sql
-- Propósito: dejar constancia del entorno sobre el que se ejecutan las pruebas (requisito HM-1: Oracle 19c/21c XE).
-- Ejecutar como SYSTEM en XEPDB1 (SQL Developer o SQL*Plus). Solo consultas; no modifica nada.
set linesize 200
set pagesize 100
column banner_full format a80
column name format a30
column value format a40
column wrl_type format a10
column wrl_parameter format a40
column status format a20
column wallet_type format a15
column contenedor format a20

prompt === Versión del motor ===
select banner_full from v$version;

prompt === Contenedor actual (debe ser XEPDB1) ===
select sys_context('USERENV', 'CON_NAME') as contenedor from dual;

prompt === Parámetros de auditoría tradicional (AUDIT / AUD$) ===
select name, value from v$parameter where name in ('audit_trail', 'audit_sys_operations');

prompt === ¿Auditoría unificada pura? (FALSE = modo mixto, se usa AUD$) ===
select value as unified_auditing from v$option where parameter = 'Unified Auditing';

prompt === Monedero de TDE (v$encryption_wallet) ===
select wrl_type, wrl_parameter, status, wallet_type from v$encryption_wallet;
