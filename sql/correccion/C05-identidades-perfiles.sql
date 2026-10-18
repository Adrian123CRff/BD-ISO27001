-- C05 · Registro de identidades, bajas y política de contraseñas. PHVA: HACER.
-- Controles: A5.16 (cada cuenta tiene responsable), A5.18 (revisión de derechos y bajas), A5.17 y A8.5 (perfil
-- de contraseñas y bloqueo por intentos fallidos).
-- Las personas del registro son ficticias. Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

prompt === Esquema de control SEGURIDAD (sin inicio de sesión, datos en el tablespace cifrado) ===
create user seguridad identified by "&LAB_PWD" default tablespace datos_fin_cif quota 50m on datos_fin_cif account lock;
grant create job to seguridad;

create table seguridad.registro_identidades (
    usuario         varchar2(128) primary key,
    tipo            varchar2(10)  not null check (tipo in ('PERSONA', 'SERVICIO', 'ESQUEMA', 'AUDITORIA')),
    responsable     varchar2(80)  not null,
    area            varchar2(40)  not null,
    estado          varchar2(6)   not null check (estado in ('ACTIVA', 'BAJA')),
    fecha_alta      date          not null,
    fecha_revision  date          not null,
    observacion     varchar2(200)
);

insert into seguridad.registro_identidades values ('FINANZAS', 'ESQUEMA', 'Jefatura de TI', 'Tecnología', 'ACTIVA', date '2024-01-01', sysdate, 'Dueño de los datos de negocio; sin inicio de sesión');
insert into seguridad.registro_identidades values ('FINANZAS_DEV', 'ESQUEMA', 'Jefatura de TI', 'Tecnología', 'ACTIVA', date '2024-01-01', sysdate, 'Clon de pruebas enmascarado; sin inicio de sesión');
insert into seguridad.registro_identidades values ('SEGURIDAD', 'ESQUEMA', 'Oficial de Seguridad de la Información', 'Seguridad', 'ACTIVA', sysdate, sysdate, 'Esquema de control; sin inicio de sesión');
insert into seguridad.registro_identidades values ('APP_WEB', 'SERVICIO', 'Líder de Desarrollo', 'Tecnología', 'ACTIVA', date '2024-01-01', sysdate, 'Cuenta de la aplicación web; rol ROL_APP_WEB');
insert into seguridad.registro_identidades values ('JPEREZ', 'PERSONA', 'Juan Pérez (ficticio)', 'Crédito', 'ACTIVA', date '2024-03-01', sysdate, 'Analista de crédito; cartera 1-50');
insert into seguridad.registro_identidades values ('DEV_USER', 'PERSONA', 'Desarrollador asignado (ficticio)', 'Tecnología', 'ACTIVA', date '2025-02-01', sysdate, 'Solo clon de pruebas');
insert into seguridad.registro_identidades values ('ISO_AUDITOR', 'AUDITORIA', 'Auditoría Interna', 'Auditoría', 'ACTIVA', sysdate, sysdate, 'Solo lectura del diccionario');
insert into seguridad.registro_identidades values ('MROJAS', 'PERSONA', 'María Rojas (ficticia)', 'Crédito', 'BAJA', date '2023-05-01', sysdate, 'Exfuncionaria: cuenta bloqueada y sin privilegios');
insert into seguridad.registro_identidades values ('SOPORTE', 'SERVICIO', 'Sin responsable', 'Soporte', 'BAJA', date '2022-01-01', sysdate, 'Cuenta genérica compartida: retirada');
commit;

prompt === Bajas: cuentas bloqueadas ===
alter user mrojas account lock;
alter user soporte account lock;

prompt === Perfil de contraseñas para cuentas de personas, servicios y auditoría ===
create profile perfil_usuarios limit
    failed_login_attempts    5
    password_lock_time       1
    password_life_time       90
    password_grace_time      7
    password_reuse_max       5
    password_reuse_time      365
    password_verify_function ora12c_strong_verify_function;

alter user app_web profile perfil_usuarios;
alter user jperez profile perfil_usuarios;
alter user dev_user profile perfil_usuarios;
alter user iso_auditor profile perfil_usuarios;
alter user mrojas profile perfil_usuarios;
alter user soporte profile perfil_usuarios;

-- El perfil DEFAULT vuelve a los valores de fábrica de Oracle (había quedado sin límites).
alter profile default limit
    failed_login_attempts 10
    password_life_time    180
    password_reuse_max    unlimited
    password_reuse_time   unlimited;

grant select on seguridad.registro_identidades to iso_auditor;
prompt === Identidades registradas y perfiles aplicados ===
