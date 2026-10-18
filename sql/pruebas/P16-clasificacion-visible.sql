-- PRUEBA: P16
-- TIPO: Revisión de clasificación
-- CONTROL: A5.12
-- RIESGO: R-CONF-03
-- COMO: usuario:JPEREZ
-- PROCEDIMIENTO: Antes de usar los datos, el analista de crédito consulta desde su propia sesión el nivel de clasificación de las columnas personales de FINANZAS.CLIENTES (lo mismo que muestra SQL Developer en la descripción de la tabla).
-- ESPERADO: Las 5 columnas personales (cédula, correo, teléfono, salario y tarjeta) muestran su etiqueta CONFIDENCIAL o RESTRINGIDO.
-- PATRON: ETIQUETADAS=5\b
-- HERRAMIENTA: SQL*Plus (equivalente en SQL Developer: pestaña Columnas, campo Comentarios)
set heading off
select 'ETIQUETADAS=' || count(*) from all_col_comments
where owner = 'FINANZAS' and table_name = 'CLIENTES'
  and column_name in ('CEDULA', 'CORREO', 'TELEFONO', 'SALARIO', 'NUMERO_TARJETA')
  and regexp_like(comments, '^(CONFIDENCIAL|RESTRINGIDO)');
