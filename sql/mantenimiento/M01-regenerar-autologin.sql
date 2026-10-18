-- M01 · Regenerar el monedero de apertura automática LOCAL de TDE. Control: A8.24 (procedimiento de claves).
-- Cuándo: si cambia el nombre del servidor (aquí, al recrear el contenedor), el monedero LOCAL AUTO_LOGIN deja de
-- abrir porque está atado al equipo. Síntoma: V$ENCRYPTION_WALLET en CLOSED y ORA-28365 en RMAN o en consultas.
-- Antes de ejecutar: apartar el archivo cwallet.sso anterior (scripts/corregir.ps1 -Desde M01 lo hace).
-- Ejecutar como SYSDBA en la raíz:  -Como sys-cdb
whenever sqlerror exit failure

administer key management set keystore open identified by "&TDE_PWD" container = all;
administer key management create local auto_login keystore from keystore identified by "&TDE_PWD";

column wrl_parameter format a40
select con_id, status, wallet_type from v$encryption_wallet;
prompt === Monedero abierto y apertura automática regenerada para este servidor ===
