-- 01-escenario.sql
-- PHVA: PLANIFICAR. Situación inicial del cliente ficticio "Cooperativa Financiera del Valle" (riesgo inherente).
-- Crea el esquema de negocio con datos personales SINTÉTICOS (ninguno es real) y reproduce a propósito las
-- debilidades de confidencialidad que la matriz debe detectar. Cada debilidad indica el factor de riesgo (R-CONF)
-- y el control ISO/IEC 27001:2022 que la detecta.
-- Ejecutar UNA vez como SYSDBA en XEPDB1:  .\scripts\ejecutar-sql.ps1 sql\01-escenario.sql -Como sys
whenever sqlerror exit failure rollback
set serveroutput on

prompt === Tablespace de datos del negocio (sin cifrar) ===
create tablespace datos_fin datafile '/opt/oracle/oradata/XE/XEPDB1/datos_fin01.dbf' size 50m autoextend on next 10m maxsize 500m;

prompt === Esquema dueño de los datos ===
create user finanzas identified by "&LAB_PWD" default tablespace datos_fin quota unlimited on datos_fin;
grant create session, create table, create view, create procedure, create sequence to finanzas;

create table finanzas.clientes (
    id_cliente      number(6)     primary key,
    cedula          varchar2(15)  not null unique,
    nombre          varchar2(80)  not null,
    correo          varchar2(80),
    telefono        varchar2(15),
    salario         number(10, 2),
    numero_tarjeta  varchar2(19),
    fecha_registro  date default sysdate
) tablespace datos_fin;

create table finanzas.cuentas (
    id_cuenta   number(7)     primary key,
    id_cliente  number(6)     not null references finanzas.clientes,
    iban        varchar2(22)  not null unique,
    saldo       number(12, 2) not null
) tablespace datos_fin;

create table finanzas.movimientos (
    id_movimiento  number(9)     primary key,
    id_cuenta      number(7)     not null references finanzas.cuentas,
    fecha          date          not null,
    monto          number(12, 2) not null,
    descripcion    varchar2(60)
) tablespace datos_fin;

prompt === Datos sintéticos: 200 clientes, 300 cuentas, 3000 movimientos (ciclos acotados por LEVEL) ===
insert into finanzas.clientes (id_cliente, cedula, nombre, correo, telefono, salario, numero_tarjeta, fecha_registro)
select level,
       '1-' || lpad(mod(level * 37, 9999), 4, '0') || '-' || lpad(mod(level * 91, 9999), 4, '0'),
       'Cliente Sintetico ' || lpad(level, 3, '0'),
       'cliente' || level || '@correo-ficticio.test',
       '8' || lpad(mod(level * 7919, 9999999), 7, '0'),
       round(450000 + mod(level * 15485863, 2500000), 2),
       '4111-' || lpad(mod(level * 13, 9999), 4, '0') || '-' || lpad(mod(level * 17, 9999), 4, '0') || '-' || lpad(level, 4, '0'),
       date '2024-01-01' + mod(level * 3, 700)
from dual connect by level <= 199;

-- Registro testigo: sirve para la prueba de TDE (buscar este texto dentro del archivo de datos).
insert into finanzas.clientes values (200, '9-0999-0999', 'TESTIGO CONFIDENCIAL ISO27001', 'testigo@correo-ficticio.test',
                                      '80000000', 999999.99, '4111-9999-9999-9999', date '2024-06-30');

insert into finanzas.cuentas (id_cuenta, id_cliente, iban, saldo)
select level, mod(level - 1, 200) + 1, 'CR05' || lpad(level * 7, 18, '0'), round(mod(level * 104729, 5000000), 2)
from dual connect by level <= 300;

insert into finanzas.movimientos (id_movimiento, id_cuenta, fecha, monto, descripcion)
select level, mod(level - 1, 300) + 1, date '2026-01-01' + mod(level, 280),
       round(mod(level * 7907, 400000) - 150000, 2), 'Movimiento ' || level
from dual connect by level <= 3000;
commit;

prompt === Cuentas de usuario de la situación inicial ===
-- APP_WEB: cuenta de la aplicación (servicio).
create user app_web identified by "&LAB_PWD";
-- JPEREZ: analista de crédito.
create user jperez identified by "&LAB_PWD";
-- MROJAS: exfuncionaria que dejó la cooperativa; su cuenta sigue abierta.          R-CONF-01 / A5.18
create user mrojas identified by "&LAB_PWD";
-- SOPORTE: cuenta genérica compartida por el equipo de soporte, sin dueño.          R-CONF-01 / A5.16
create user soporte identified by "&LAB_PWD";
-- DEV_USER: desarrollador que trabaja sobre el clon de pruebas.
create user dev_user identified by "&LAB_PWD";
grant create session to app_web, jperez, mrojas, soporte, dev_user;

prompt === Debilidades de privilegios ===
-- La aplicación tiene el rol DBA.                                                   R-CONF-02 / A8.2
grant dba to app_web;
-- El analista recibe privilegios ANY directos en lugar de un rol de negocio.       R-CONF-02 / A5.15, A8.2
grant select any table to jperez;
-- La exfuncionaria conserva acceso directo a los datos personales.                 R-CONF-01 / A5.18
grant select on finanzas.clientes to mrojas;
-- Los datos personales quedan visibles para cualquier usuario (PUBLIC).            R-CONF-02 / A5.15, A8.3
grant select on finanzas.clientes to public;
grant select on finanzas.cuentas to public;

prompt === Debilidad de autenticación: perfil DEFAULT sin límites ===
-- Intentos fallidos y vigencia ilimitados, sin función de complejidad.              R-CONF-01 / A5.17, A8.5
alter profile default limit
    failed_login_attempts unlimited
    password_life_time    unlimited
    password_reuse_max    unlimited
    password_reuse_time   unlimited
    password_verify_function null;

prompt === Debilidad de fuga de datos: exportación sin control ===
-- Directorio de exportación de lectura y escritura para PUBLIC y rol de Data Pump al analista.
--                                                                                  R-CONF-04 / A8.12
create or replace directory exportes as '/opt/oracle/oradata/exportes';
grant read, write on directory exportes to public;
grant datapump_exp_full_database to jperez;

prompt === Debilidad de registros: soporte puede borrar la pista de auditoría ===
--                                                                                  R-CONF-05 / A5.33
grant delete on sys.aud$ to soporte;
grant delete any table to soporte;

prompt === Debilidad de clones DEV/TEST: copia completa con datos reales ===
--                                                                                  R-CONF-03 / A8.11
create user finanzas_dev identified by "&LAB_PWD" default tablespace datos_fin quota unlimited on datos_fin;
create table finanzas_dev.clientes as select * from finanzas.clientes;
grant select on finanzas_dev.clientes to dev_user;

prompt === Debilidad de eliminación: tabla con datos personales borrada pero recuperable ===
-- La tabla queda en la papelera de reciclaje (DROP sin PURGE).                     R-CONF-03 / A8.10
create table finanzas.clientes_respaldo_2025 tablespace datos_fin as select * from finanzas.clientes;
drop table finanzas.clientes_respaldo_2025;

prompt === Escenario creado. Riesgo inherente listo para evaluar. ===
