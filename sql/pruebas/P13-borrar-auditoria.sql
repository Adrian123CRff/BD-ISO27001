-- PRUEBA: P13
-- TIPO: Alteración de registros
-- CONTROL: A5.33
-- RIESGO: R-CONF-05
-- COMO: usuario:SOPORTE
-- PROCEDIMIENTO: Con la cuenta de soporte se intenta borrar la pista de auditoría (DELETE sobre SYS.AUD$; la condición 1 = 0 evita borrar de verdad).
-- ESPERADO: No es posible: la cuenta está bloqueada o no tiene privilegios (ORA-28000 / ORA-01031 / ORA-00942).
-- PATRON: ORA-28000|ORA-01031|ORA-00942
-- HERRAMIENTA: SQL*Plus
delete from sys.aud$ where 1 = 0;
rollback;
