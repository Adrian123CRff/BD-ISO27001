-- PRUEBA: P03
-- TIPO: Escalamiento de privilegios
-- CONTROL: A5.15
-- RIESGO: R-CONF-02
-- COMO: usuario:JPEREZ
-- PROCEDIMIENTO: El analista de crédito intenta leer FINANZAS.MOVIMIENTOS, que su función no necesita.
-- ESPERADO: ORA-00942: la tabla no existe para él porque su rol no la incluye.
-- PATRON: ORA-00942
-- HERRAMIENTA: SQL*Plus
select count(*) as movimientos_leidos from finanzas.movimientos;
