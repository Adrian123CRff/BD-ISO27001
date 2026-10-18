-- PRUEBA: P02
-- TIPO: Acceso no autorizado
-- CONTROL: A5.16
-- RIESGO: R-CONF-01
-- COMO: usuario:SOPORTE
-- PROCEDIMIENTO: Alguien del equipo de soporte entra con la cuenta genérica compartida SOPORTE.
-- ESPERADO: La cuenta genérica está bloqueada (ORA-28000): no quedan accesos sin un responsable identificable.
-- PATRON: ORA-28000
-- HERRAMIENTA: SQL*Plus
select user as sesion_de from dual;
