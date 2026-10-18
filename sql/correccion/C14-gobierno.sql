-- C14 · Gobierno: procedimientos aprobados y revisión semanal con evidencia. PHVA: HACER → ACTUAR.
-- Une el mundo administrativo con la base: cada control tiene su procedimiento (docs/procedimientos.md) registrado
-- en SEGURIDAD.PROCEDIMIENTOS, y una tarea semanal deja en SEGURIDAD.BITACORA_REVISION el reporte de AUDIT que
-- describió el profesor (intentos fallidos, accesos denegados, lecturas de datos personales, cambios de privilegios).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

create table seguridad.procedimientos (
    control           varchar2(8)   primary key,
    nombre            varchar2(80)  not null,
    documento         varchar2(80)  not null,
    responsable       varchar2(60)  not null,
    frecuencia        varchar2(20)  not null,
    estado            varchar2(16)  not null check (estado in ('APROBADO', 'BORRADOR', 'RIESGO ACEPTADO')),
    fecha_aprobacion  date
);

insert into seguridad.procedimientos values ('A5.12', 'Clasificación de datos personales', 'docs/procedimientos.md#a512', 'Oficial de Seguridad', 'Semestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A5.15', 'Acceso por roles de negocio', 'docs/procedimientos.md#a515', 'DBA', 'Trimestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A5.16', 'Alta y registro de identidades', 'docs/procedimientos.md#a516', 'DBA', 'Por evento', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A5.17', 'Política de contraseñas', 'docs/procedimientos.md#a517', 'DBA', 'Anual', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A5.18', 'Revisión de derechos y bajas', 'docs/procedimientos.md#a518', 'Jefatura de TI', 'Semestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A5.33', 'Protección de la pista de auditoría', 'docs/procedimientos.md#a533', 'Auditoría Interna', 'Semanal', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.2', 'Gestión de privilegios administrativos', 'docs/procedimientos.md#a82', 'Jefatura de TI', 'Trimestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.3', 'Restricción por fila (VPD)', 'docs/procedimientos.md#a83', 'DBA', 'Trimestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.5', 'Autenticación y bloqueo de cuentas', 'docs/procedimientos.md#a85', 'DBA', 'Anual', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.10', 'Eliminación definitiva de datos', 'docs/procedimientos.md#a810', 'DBA', 'Semanal', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.11', 'Enmascaramiento y clones de prueba', 'docs/procedimientos.md#a811', 'DBA', 'Por evento', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.12', 'Prevención de fuga de datos', 'docs/procedimientos.md#a812', 'Oficial de Seguridad', 'Trimestral', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.13', 'Respaldo cifrado y prueba de restauración', 'docs/procedimientos.md#a813', 'DBA', 'Semanal', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.15', 'Registro y reporte semanal de auditoría', 'docs/procedimientos.md#a815', 'Auditoría Interna', 'Semanal', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.20', 'Cifrado de Oracle Net y listener', 'docs/procedimientos.md#a820', 'DBA', 'Anual', 'APROBADO', sysdate);
insert into seguridad.procedimientos values ('A8.24', 'Gestión del monedero y claves de TDE', 'docs/procedimientos.md#a824', 'Oficial de Seguridad', 'Anual', 'APROBADO', sysdate);
-- XE no recibe parches trimestrales: el riesgo se acepta formalmente y se planifica la migración (ver procedimiento).
insert into seguridad.procedimientos values ('A8.8', 'Parcheo y migración a versión soportada', 'docs/procedimientos.md#a88', 'Jefatura de TI', 'Trimestral', 'RIESGO ACEPTADO', sysdate);
commit;

create table seguridad.bitacora_revision (
    id_revision          number generated always as identity primary key,
    fecha                date   default sysdate not null,
    intentos_fallidos    number not null,
    accesos_denegados    number not null,
    lecturas_clientes    number not null,
    cambios_privilegios  number not null
);

grant select on sys.dba_audit_trail to seguridad;

-- Reporte semanal de AUDIT (últimos 7 días). Consultas acotadas por fecha; sin SQL dinámico.
create or replace procedure seguridad.registrar_revision is
    v_fallidos   number;
    v_denegados  number;
    v_lecturas   number;
    v_cambios    number;
begin
    -- Refresca las huellas de producción que usa el control del clon DEV (A8.11).
    seguridad.actualizar_huellas;
    select count(*) into v_fallidos from sys.dba_audit_trail
    where timestamp >= sysdate - 7 and action_name = 'LOGON' and returncode in (1017, 28000);
    select count(*) into v_denegados from sys.dba_audit_trail
    where timestamp >= sysdate - 7 and returncode in (942, 1031);
    select count(*) into v_lecturas from sys.dba_audit_trail
    where timestamp >= sysdate - 7 and owner = 'FINANZAS' and obj_name = 'CLIENTES' and action_name = 'SELECT';
    select count(*) into v_cambios from sys.dba_audit_trail
    where timestamp >= sysdate - 7 and action_name in ('CREATE USER', 'ALTER USER', 'DROP USER', 'GRANT ROLE', 'SYSTEM GRANT', 'REVOKE ROLE');
    insert into seguridad.bitacora_revision (intentos_fallidos, accesos_denegados, lecturas_clientes, cambios_privilegios)
    values (v_fallidos, v_denegados, v_lecturas, v_cambios);
    commit;
end;
/

begin
    dbms_scheduler.create_job(
        job_name        => 'SEGURIDAD.REVISION_SEMANAL',
        job_type        => 'STORED_PROCEDURE',
        job_action      => 'SEGURIDAD.REGISTRAR_REVISION',
        repeat_interval => 'FREQ=WEEKLY;BYDAY=MON;BYHOUR=7;BYMINUTE=0',
        enabled         => true,
        comments        => 'A8.15 / A5.33: reporte semanal de auditoría');
    dbms_scheduler.run_job('SEGURIDAD.REVISION_SEMANAL', use_current_session => true);
end;
/

grant select on seguridad.procedimientos to iso_auditor;
grant select on seguridad.bitacora_revision to iso_auditor;

select * from seguridad.bitacora_revision;
prompt === Procedimientos registrados y primera revisión semanal ejecutada ===
