-- PRUEBA: P17
-- TIPO: Contraseña débil
-- CONTROL: A5.17
-- RIESGO: R-CONF-01
-- COMO: sys
-- PROCEDIMIENTO: Se da de alta una cuenta de prueba con el mismo perfil que el analista de crédito y con la contraseña "abc", como haría quien elige una clave fácil de adivinar.
-- ESPERADO: Oracle rechaza la contraseña (ORA-28003): el perfil exige la función de complejidad ora12c_strong_verify_function.
-- PATRON: RESULTADO: CLAVE RECHAZADA
-- HERRAMIENTA: SQL*Plus
-- LIMPIEZA_SYS: begin for u in (select username from dba_users where username = 'PRUEBA_A517') loop execute immediate 'drop user prueba_a517 cascade'; end loop; end;
-- "abc" es un valor de prueba deliberadamente débil, no un secreto. El nombre del perfil sale del diccionario y se
-- valida con DBMS_ASSERT antes de armar la sentencia (regla 8).
set serveroutput on
declare
    v_perfil dba_users.profile%type;
begin
    select profile into v_perfil from dba_users where username = 'JPEREZ';
    dbms_output.put_line('Perfil del analista: ' || v_perfil);
    execute immediate 'create user prueba_a517 identified by "abc" profile ' || dbms_assert.enquote_name(v_perfil);
    dbms_output.put_line('RESULTADO: CLAVE INSEGURA ACEPTADA');
exception
    when others then
        if sqlcode = -28003 then
            dbms_output.put_line('RESULTADO: CLAVE RECHAZADA (' || sqlerrm || ')');
        else
            raise;
        end if;
end;
/
