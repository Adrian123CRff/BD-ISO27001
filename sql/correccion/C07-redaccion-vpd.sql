-- C07 · Enmascaramiento (Data Redaction) y restricción por fila (VPD). PHVA: HACER. Controles: A8.11, A8.3.
-- Redacción: quien no tenga el rol de la aplicación ve la tarjeta y la cédula parcialmente y el salario en 0.
-- VPD: el analista de crédito solo ve los clientes de su cartera (SEGURIDAD.CARTERA_ANALISTA).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

prompt === Data Redaction sobre FINANZAS.CLIENTES ===
begin
    dbms_redact.add_policy(
        object_schema       => 'FINANZAS',
        object_name         => 'CLIENTES',
        policy_name         => 'RED_CLIENTES_DATOS_PERSONALES',
        column_name         => 'NUMERO_TARJETA',
        function_type       => dbms_redact.partial,
        function_parameters => 'VVVVFVVVVFVVVVFVVVV,VVVV-VVVV-VVVV-VVVV,*,1,12',
        expression          => q'[sys_context('SYS_SESSION_ROLES', 'ROL_APP_WEB') = 'FALSE' and sys_context('USERENV', 'SESSION_USER') <> 'SEGURIDAD']',
        policy_description  => 'A8.11: datos personales enmascarados fuera de la aplicación');
    dbms_redact.alter_policy(
        object_schema       => 'FINANZAS',
        object_name         => 'CLIENTES',
        policy_name         => 'RED_CLIENTES_DATOS_PERSONALES',
        action              => dbms_redact.add_column,
        column_name         => 'CEDULA',
        function_type       => dbms_redact.partial,
        function_parameters => 'VFVVVVFVVVV,V-VVVV-VVVV,*,1,5');
    dbms_redact.alter_policy(
        object_schema       => 'FINANZAS',
        object_name         => 'CLIENTES',
        policy_name         => 'RED_CLIENTES_DATOS_PERSONALES',
        action              => dbms_redact.add_column,
        column_name         => 'SALARIO',
        function_type       => dbms_redact.full);
end;
/

prompt === VPD: cartera por analista ===
create table seguridad.cartera_analista (
    usuario   varchar2(128) primary key,
    id_desde  number(6) not null,
    id_hasta  number(6) not null,
    check (id_desde <= id_hasta)
);
insert into seguridad.cartera_analista values ('JPEREZ', 1, 50);
commit;

-- Función de política (VPD). Se ejecuta con los derechos de su dueño, y en ese contexto Oracle deshabilita los roles
-- de la sesión: por eso no se pregunta por SYS_SESSION_ROLES, sino por el usuario de la sesión y por el diccionario.
-- Devuelve un predicado con literales numéricos leídos de la tabla de carteras (nunca texto del usuario).
grant select on sys.dba_role_privs to seguridad;

create or replace function seguridad.fn_vpd_cartera (p_esquema in varchar2, p_objeto in varchar2) return varchar2 is
    v_usuario constant varchar2(128) := sys_context('USERENV', 'SESSION_USER');
    v_app     number;
    v_desde   number;
    v_hasta   number;
begin
    -- El dueño de los datos y el esquema de control no tienen restricción.
    if v_usuario in ('FINANZAS', 'SEGURIDAD') then
        return null;
    end if;
    -- La aplicación opera sobre todos los clientes.
    select count(*) into v_app from sys.dba_role_privs where grantee = v_usuario and granted_role = 'ROL_APP_WEB';
    if v_app > 0 then
        return null;
    end if;
    -- Cualquier otra cuenta solo ve su cartera; sin cartera asignada, ninguna fila.
    select id_desde, id_hasta into v_desde, v_hasta from seguridad.cartera_analista where usuario = v_usuario;
    return 'id_cliente between ' || to_char(v_desde) || ' and ' || to_char(v_hasta);
exception
    when no_data_found then
        return '1 = 0';
end;
/

begin
    dbms_rls.add_policy(
        object_schema   => 'FINANZAS',
        object_name     => 'CLIENTES',
        policy_name     => 'VPD_CARTERA_ANALISTA',
        function_schema => 'SEGURIDAD',
        policy_function => 'FN_VPD_CARTERA',
        statement_types => 'SELECT');
end;
/

column policy_name format a30
column column_name format a16
column function_type format a20
select column_name, function_type from redaction_columns where object_name = 'CLIENTES';
select policy_name, enable from dba_policies where object_name = 'CLIENTES';
prompt === Redacción y VPD activas ===
