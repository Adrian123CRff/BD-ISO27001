-- C01 · Parámetros de instancia (raíz CDB$ROOT). PHVA: HACER.
-- Controles: A8.15 / A5.33 (auditoría tradicional con texto SQL), A8.24 (ubicación del monedero de TDE),
-- A8.13 (área de recuperación para respaldos y archive logs).
-- Los tres primeros parámetros son estáticos: requieren reiniciar la instancia (scripts/corregir.ps1 lo hace).
-- Ejecutar como SYSDBA en la raíz:  -Como sys-cdb
whenever sqlerror exit failure

-- Auditoría tradicional en la base, con el texto y las variables de cada sentencia (DB, EXTENDED).
alter system set audit_trail = db, extended scope = spfile;
-- Las operaciones de SYS también quedan registradas (en archivos del sistema operativo, fuera del alcance de SYS).
alter system set audit_sys_operations = true scope = spfile;
-- Raíz del monedero (keystore) de TDE. El monedero vive en el volumen de datos, nunca en el repositorio.
alter system set wallet_root = '/opt/oracle/oradata/wallet' scope = spfile;
-- Área de recuperación para RMAN y los archive logs.
alter system set db_recovery_file_dest_size = 20g scope = both;
alter system set db_recovery_file_dest = '/opt/oracle/oradata/fra' scope = both;

prompt === Parámetros registrados. Reiniciar la instancia para aplicarlos. ===
