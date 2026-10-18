-- PRUEBA: P01
-- TIPO: Acceso no autorizado
-- CONTROL: A5.18
-- RIESGO: R-CONF-01
-- COMO: usuario:MROJAS
-- PROCEDIMIENTO: La exfuncionaria María Rojas inicia sesión con su cuenta y consulta FINANZAS.CLIENTES.
-- ESPERADO: La cuenta está bloqueada (ORA-28000) y no obtiene ningún dato.
-- PATRON: ORA-28000
-- HERRAMIENTA: SQL*Plus (equivalente en SQL Developer)
select count(*) as clientes_leidos from finanzas.clientes;
