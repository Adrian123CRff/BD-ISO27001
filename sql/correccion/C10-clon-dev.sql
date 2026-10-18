-- C10 · Clon de desarrollo sin datos reales. PHVA: HACER. Control: A8.11 (y A8.33 Información de prueba).
-- Regenera FINANZAS_DEV.CLIENTES con datos ficticios del mismo formato y crea una vista de control que cuenta
-- cuántas filas del clon coinciden con datos reales, sin mostrar ningún dato (el auditor solo ve el número).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

truncate table finanzas_dev.clientes;
insert into finanzas_dev.clientes (id_cliente, cedula, nombre, correo, telefono, salario, numero_tarjeta, fecha_registro)
select level,
       '0-' || lpad(level, 4, '0') || '-0000',
       'Cliente de prueba ' || lpad(level, 3, '0'),
       'prueba' || level || '@ejemplo.test',
       '00000000',
       round(dbms_random.value(300000, 3000000), -3),
       '0000-0000-0000-' || lpad(level, 4, '0'),
       date '2024-01-01'
from dual connect by level <= 200;
commit;

-- Huellas SHA-256 de los datos reales (cédula, tarjeta, nombre): permiten detectar datos reales en el clon sin
-- guardar ni mostrar ningún dato personal. Las refresca el procedimiento y, cada semana, la revisión de C14.
grant select on finanzas.clientes to seguridad;
grant select on finanzas_dev.clientes to seguridad with grant option;

create table seguridad.huellas_produccion (
    tipo    varchar2(8) not null,
    huella  raw(32)     not null,
    constraint pk_huellas primary key (tipo, huella)
);

create or replace procedure seguridad.actualizar_huellas is
begin
    delete from seguridad.huellas_produccion;
    insert into seguridad.huellas_produccion (tipo, huella)
    select 'CEDULA', standard_hash(cedula, 'SHA256') from finanzas.clientes
    union
    select 'TARJETA', standard_hash(numero_tarjeta, 'SHA256') from finanzas.clientes
    union
    select 'NOMBRE', standard_hash(nombre, 'SHA256') from finanzas.clientes;
    commit;
end;
/

exec seguridad.actualizar_huellas

create or replace view seguridad.v_control_clon_dev as
select count(*) as filas_reales
from finanzas_dev.clientes d
where exists (select 1 from seguridad.huellas_produccion h
              where (h.tipo = 'CEDULA' and h.huella = standard_hash(d.cedula, 'SHA256'))
                 or (h.tipo = 'TARJETA' and h.huella = standard_hash(d.numero_tarjeta, 'SHA256'))
                 or (h.tipo = 'NOMBRE' and h.huella = standard_hash(d.nombre, 'SHA256')));

grant select on seguridad.v_control_clon_dev to iso_auditor;
select count(*) as huellas from seguridad.huellas_produccion;
select filas_reales from seguridad.v_control_clon_dev;
prompt === Clon DEV regenerado con datos ficticios y control por huellas ===
