-- PRUEBA: P06
-- TIPO: Restricción de acceso por fila
-- CONTROL: A8.3
-- RIESGO: R-CONF-02
-- COMO: usuario:JPEREZ
-- PROCEDIMIENTO: El analista cuenta cuántos clientes puede ver en FINANZAS.CLIENTES.
-- ESPERADO: Solo ve los 50 clientes de su cartera (VPD), no los 200 de la cooperativa.
-- PATRON: CLIENTES_VISIBLES=50\b
-- HERRAMIENTA: SQL*Plus
set heading off
select 'CLIENTES_VISIBLES=' || count(*) from finanzas.clientes;
