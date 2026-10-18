-- PRUEBA: P07
-- TIPO: Fuerza bruta
-- CONTROL: A8.5
-- RIESGO: R-CONF-01
-- COMO: ninguno
-- PROCEDIMIENTO: Se prueban 6 contraseñas incorrectas contra DEV_USER y después la correcta.
-- ESPERADO: Tras 5 intentos fallidos la cuenta queda bloqueada (ORA-28000), aunque luego se use la contraseña correcta.
-- PATRON: ORA-28000
-- HERRAMIENTA: SQL*Plus
-- LIMPIEZA_SYS: alter user dev_user account unlock
connect dev_user/"Incorrecta#1"@localhost:1521/XEPDB1
connect dev_user/"Incorrecta#2"@localhost:1521/XEPDB1
connect dev_user/"Incorrecta#3"@localhost:1521/XEPDB1
connect dev_user/"Incorrecta#4"@localhost:1521/XEPDB1
connect dev_user/"Incorrecta#5"@localhost:1521/XEPDB1
connect dev_user/"Incorrecta#6"@localhost:1521/XEPDB1
connect dev_user/"&LAB_PWD"@localhost:1521/XEPDB1
select 'SESION ABIERTA' as resultado from dual;
