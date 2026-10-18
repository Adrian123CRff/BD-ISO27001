#!/bin/bash
# C15 · Protección de los registros en el sistema operativo. PHVA: HACER. Control: A5.33 (tarea "logs").
# La imagen deja /opt/oracle/oradata con permisos 777 y /opt/oracle/diag con 775: cualquier usuario del servidor
# podría leer el alert log, las trazas o el log del listener (revelan dónde están los componentes de la base) y
# tocar respaldos, archive logs, monedero y archivos de datos. Se quita todo permiso a "otros"; el dueño (oracle) y su
# grupo (oinstall) conservan el acceso, así que la base sigue funcionando (los archivos abiertos no se ven afectados).
# Se ejecuta dentro del contenedor como el usuario oracle (scripts/corregir.ps1), después del respaldo de C13.
# Es idempotente.
set -euo pipefail

for d in /opt/oracle/diag /opt/oracle/admin /opt/oracle/oradata; do
  chmod -R o-rwx "$d"
done

echo "=== Permisos resultantes ==="
ls -ld /opt/oracle/diag /opt/oracle/admin/XE/adump /opt/oracle/oradata /opt/oracle/oradata/fra /opt/oracle/oradata/wallet
echo "=== Registros protegidos ==="
