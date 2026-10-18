#!/bin/bash
# C13 · Respaldo cifrado con RMAN. PHVA: HACER. Control: A8.13.
# Activa ARCHIVELOG (respaldo en caliente), configura el cifrado transparente de RMAN con el monedero de TDE,
# el autorespaldo del controlfile y la retención, y toma un respaldo completo con sus archive logs.
# Después hace la prueba de restauración sin sobrescribir la base (RESTORE DATABASE VALIDATE): RMAN lee y descifra
# cada pieza. Un respaldo que no se puede leer es un fallo de control (docs/procedimientos.md#a813).
# Se ejecuta dentro del contenedor como el usuario oracle (scripts/corregir.ps1).
set -euo pipefail

modo=$(sqlplus -s / as sysdba <<'EOF'
set heading off feedback off pagesize 0
select log_mode from v$database;
EOF
)
if [[ "$modo" != *ARCHIVELOG* || "$modo" == *NOARCHIVELOG* ]]; then
  sqlplus -s / as sysdba <<'EOF'
whenever sqlerror exit failure
shutdown immediate
startup mount
alter database archivelog;
alter database open;
alter pluggable database all open;
alter pluggable database xepdb1 save state;
EOF
fi

rman target / <<'EOF'
configure encryption for database on;
configure encryption algorithm 'AES256';
configure controlfile autobackup on;
configure retention policy to redundancy 2;
backup database plus archivelog;
restore database validate;
list backup summary;
EOF
echo "=== Respaldo cifrado completado ==="
