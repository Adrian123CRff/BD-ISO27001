-- C02 · Monedero (keystore) de TDE y claves maestras. PHVA: HACER. Control: A8.24 (y base de A8.13).
-- Crea el monedero en WALLET_ROOT/tde, lo abre en todos los contenedores, genera la clave maestra (con copia de
-- respaldo del monedero) y crea el monedero de apertura automática LOCAL (solo abre en este servidor).
-- La contraseña del monedero llega como variable de sustitución desde .env; nunca se escribe en el repositorio.
-- Ejecutar como SYSDBA en la raíz, después del reinicio de C01:  -Como sys-cdb
whenever sqlerror exit failure

alter system set tde_configuration = 'KEYSTORE_CONFIGURATION=FILE' scope = both;
administer key management create keystore identified by "&TDE_PWD";
administer key management set keystore open identified by "&TDE_PWD" container = all;
administer key management set key identified by "&TDE_PWD" with backup container = all;
administer key management create local auto_login keystore from keystore identified by "&TDE_PWD";

column wrl_parameter format a40
column status format a10
column wallet_type format a16
select con_id, wrl_parameter, status, wallet_type from v$encryption_wallet;
prompt === Monedero de TDE abierto y con clave maestra en CDB$ROOT y XEPDB1 ===
