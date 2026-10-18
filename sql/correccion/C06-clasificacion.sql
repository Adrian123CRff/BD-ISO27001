-- C06 · Clasificación de la información. PHVA: HACER. Control: A5.12.
-- Inventario de clasificación (con la categoría de la Ley 8968, art. 9) y etiqueta en el diccionario de datos,
-- visible para cualquier herramienta (SQL Developer muestra los comentarios).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

create table seguridad.clasificacion_datos (
    esquema         varchar2(128) not null,
    tabla           varchar2(128) not null,
    columna         varchar2(128) not null,
    nivel           varchar2(12)  not null check (nivel in ('CONFIDENCIAL', 'RESTRINGIDO', 'INTERNO', 'PUBLICO')),
    categoria_8968  varchar2(40)  not null,
    control_aplicado varchar2(80),
    constraint pk_clasificacion primary key (esquema, tabla, columna)
);

insert into seguridad.clasificacion_datos values ('FINANZAS', 'CLIENTES', 'NUMERO_TARJETA', 'CONFIDENCIAL', 'Acceso restringido', 'TDE + Data Redaction parcial');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'CLIENTES', 'SALARIO', 'CONFIDENCIAL', 'Acceso restringido', 'TDE + Data Redaction total');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'CLIENTES', 'CEDULA', 'RESTRINGIDO', 'Acceso restringido', 'TDE + Data Redaction parcial');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'CLIENTES', 'CORREO', 'RESTRINGIDO', 'Acceso restringido', 'TDE + VPD por cartera');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'CLIENTES', 'TELEFONO', 'RESTRINGIDO', 'Acceso restringido', 'TDE + VPD por cartera');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'CUENTAS', 'SALDO', 'CONFIDENCIAL', 'Acceso restringido', 'TDE + rol de negocio');
insert into seguridad.clasificacion_datos values ('FINANZAS', 'MOVIMIENTOS', 'MONTO', 'CONFIDENCIAL', 'Acceso restringido', 'TDE + rol de negocio');
commit;

comment on table finanzas.clientes is 'CONFIDENCIAL | Datos personales de clientes (Ley 8968)';
comment on table finanzas.cuentas is 'CONFIDENCIAL | Cuentas y saldos';
comment on table finanzas.movimientos is 'CONFIDENCIAL | Transacciones financieras';
comment on column finanzas.clientes.numero_tarjeta is 'CONFIDENCIAL | Ley 8968: acceso restringido | redacción parcial';
comment on column finanzas.clientes.salario is 'CONFIDENCIAL | Ley 8968: acceso restringido | redacción total';
comment on column finanzas.clientes.cedula is 'RESTRINGIDO | Ley 8968: acceso restringido | redacción parcial';
comment on column finanzas.clientes.correo is 'RESTRINGIDO | Ley 8968: acceso restringido';
comment on column finanzas.clientes.telefono is 'RESTRINGIDO | Ley 8968: acceso restringido';
comment on column finanzas.clientes.nombre is 'INTERNO | Identificación del cliente';

grant select on seguridad.clasificacion_datos to iso_auditor;
prompt === Inventario de clasificación creado y columnas etiquetadas ===
