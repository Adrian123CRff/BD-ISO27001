-- C08 · Cierre de vías de fuga de datos. PHVA: HACER. Control: A8.12.
-- Directorio de exportación cerrado a PUBLIC, sin Data Pump para el analista y sin paquetes de salida de archivos
-- o red para PUBLIC (recomendación de endurecimiento habitual en Oracle).
-- Ejecutar como SYSDBA en XEPDB1:  -Como sys
whenever sqlerror exit failure

column invalidos format 9999
select count(*) as invalidos from dba_objects where status = 'INVALID';

revoke read, write on directory exportes from public;
revoke datapump_exp_full_database from jperez;
revoke execute on sys.utl_file from public;
revoke execute on sys.utl_http from public;
revoke execute on sys.utl_tcp from public;
revoke execute on sys.utl_smtp from public;

-- Recompilar y comprobar que el retiro no dejó objetos inválidos.
exec utl_recomp.recomp_serial();
select count(*) as invalidos from dba_objects where status = 'INVALID';
prompt === Vías de fuga cerradas ===
