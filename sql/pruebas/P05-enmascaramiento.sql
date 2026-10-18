-- PRUEBA: P05
-- TIPO: Exposición de datos sensibles
-- CONTROL: A8.11
-- RIESGO: R-CONF-03
-- COMO: usuario:JPEREZ
-- PROCEDIMIENTO: El analista consulta la cédula, el salario y la tarjeta de un cliente de su cartera.
-- ESPERADO: Ve los datos enmascarados por Data Redaction: tarjeta ****-****-****-NNNN, cédula *-****-NNNN, salario 0.
-- PATRON: \*\*\*\*-\*\*\*\*-\*\*\*\*-\d{4}
-- HERRAMIENTA: SQL*Plus
column cedula format a14
column numero_tarjeta format a20
select cedula, salario, numero_tarjeta from finanzas.clientes where id_cliente = 1;
