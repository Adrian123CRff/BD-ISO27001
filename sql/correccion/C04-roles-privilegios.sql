-- C04 · Roles de negocio y retiro de privilegios excesivos. PHVA: HACER.
-- Controles: A5.15 (acceso por roles), A8.2 (privilegios administrativos), A8.3 (sin PUBLIC ni excepciones),
-- A5.33 (nadie borra la pista de auditoría).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

prompt === Retiro de privilegios excesivos ===
revoke select on finanzas.clientes from public;
revoke select on finanzas.cuentas from public;
revoke dba from app_web;
revoke select any table from jperez;
revoke select on finanzas.clientes from mrojas;
revoke delete on sys.aud$ from soporte;
revoke delete any table from soporte;
revoke select on finanzas_dev.clientes from dev_user;

prompt === Roles de negocio (necesidad de conocer) ===
-- Aplicación: opera sobre los datos, sin privilegios administrativos.
create role rol_app_web;
grant select, insert, update on finanzas.clientes to rol_app_web;
grant select, insert, update on finanzas.cuentas to rol_app_web;
grant select, insert on finanzas.movimientos to rol_app_web;
-- Analista de crédito: solo lectura de clientes (enmascarados y por cartera) y de cuentas.
create role rol_analista_credito;
grant select on finanzas.clientes to rol_analista_credito;
grant select on finanzas.cuentas to rol_analista_credito;
-- Desarrollo: solo el clon de pruebas (enmascarado en C10).
create role rol_desarrollo;
grant select on finanzas_dev.clientes to rol_desarrollo;

grant rol_app_web to app_web;
grant rol_analista_credito to jperez;
grant rol_desarrollo to dev_user;

prompt === Cuentas dueñas de esquema sin inicio de sesión ===
alter user finanzas account lock;
alter user finanzas_dev account lock;

prompt === Privilegios resultantes ===
column grantee format a22
column privilege format a12
column table_name format a14
select grantee, table_name, privilege from dba_tab_privs where owner in ('FINANZAS', 'FINANZAS_DEV') order by grantee, table_name;
