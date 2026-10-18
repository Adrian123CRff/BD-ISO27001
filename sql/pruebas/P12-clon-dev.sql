-- PRUEBA: P12
-- TIPO: Exposición en entornos de prueba
-- CONTROL: A8.11
-- RIESGO: R-CONF-03
-- COMO: usuario:DEV_USER
-- PROCEDIMIENTO: El desarrollador consulta en el clon FINANZAS_DEV el registro del cliente testigo.
-- ESPERADO: Solo encuentra datos ficticios ("Cliente de prueba 200"), nunca el nombre o la cédula reales.
-- PATRON: Cliente de prueba 200
-- HERRAMIENTA: SQL*Plus
column nombre format a32
column cedula format a14
select nombre, cedula from finanzas_dev.clientes where id_cliente = 200;
