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

-- Control del clon: el esquema SEGURIDAD cuenta cuántas filas del clon coinciden (cédula, tarjeta o nombre) con
-- producción y guarda solo ese número con su fecha. Es una consulta, no una copia: Data Redaction (C07) impide copiar
-- columnas redactadas a otra tabla (ORA-28081), pero no altera las condiciones del WHERE, que se evalúan con los
-- valores reales. El auditor no consulta producción directamente porque VPD (C07) le oculta todas las filas y el
-- conteo daría siempre 0 (falso negativo); lee el resultado guardado. La revisión semanal de C14 lo repite.
grant select on finanzas.clientes to seguridad;
grant select on finanzas_dev.clientes to seguridad;

create table seguridad.control_clon_dev (
    fecha             date   default sysdate not null,
    filas_produccion  number not null,
    filas_reales      number not null
);

create or replace procedure seguridad.controlar_clon_dev is
    v_produccion number;
    v_reales     number;
begin
    -- Aserción (regla 5): si el control no ve producción, un 0 en el clon no probaría nada.
    select count(*) into v_produccion from finanzas.clientes;
    if v_produccion = 0 then
        raise_application_error(-20010, 'El control del clon no ve los datos de producción (VPD o privilegios)');
    end if;
    select count(*) into v_reales
    from finanzas_dev.clientes d
    where exists (select 1 from finanzas.clientes p
                  where p.cedula = d.cedula or p.numero_tarjeta = d.numero_tarjeta or p.nombre = d.nombre);
    insert into seguridad.control_clon_dev (filas_produccion, filas_reales) values (v_produccion, v_reales);
    commit;
end;
/

exec seguridad.controlar_clon_dev

-- El auditor ve solo el resultado más reciente (números y fecha, ningún dato personal).
create or replace view seguridad.v_control_clon_dev as
select filas_reales, filas_produccion, fecha
from seguridad.control_clon_dev
order by fecha desc
fetch first 1 row only;

grant select on seguridad.v_control_clon_dev to iso_auditor;
select filas_reales, filas_produccion from seguridad.v_control_clon_dev;
prompt === Clon DEV regenerado con datos ficticios y control del clon registrado ===
