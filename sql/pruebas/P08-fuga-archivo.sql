-- PRUEBA: P08
-- TIPO: Fuga de datos
-- CONTROL: A8.12
-- RIESGO: R-CONF-04
-- COMO: usuario:JPEREZ
-- PROCEDIMIENTO: El analista intenta escribir un archivo con datos en el directorio EXPORTES del servidor usando UTL_FILE.
-- ESPERADO: Falla (PLS-00201 / ORA-29289): ni el paquete ni el directorio están disponibles para él.
-- PATRON: PLS-00201|ORA-29289|ORA-29280|ORA-00942
-- HERRAMIENTA: SQL*Plus (PL/SQL)
declare
    f utl_file.file_type;
begin
    f := utl_file.fopen('EXPORTES', 'fuga_clientes.csv', 'w');
    utl_file.put_line(f, 'cedula;salario;tarjeta');
    utl_file.fclose(f);
end;
/
