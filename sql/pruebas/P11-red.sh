#!/bin/bash
# PRUEBA: P11
# TIPO: Revisión de configuración
# CONTROL: A8.20
# RIESGO: R-CONF-04
# COMO: sh
# PROCEDIMIENTO: Revisión de sqlnet.ora y listener.ora del servidor (el equivalente en Oracle del pg_hba.conf del enunciado).
# ESPERADO: Cifrado AES256 e integridad SHA256 en modo REQUIRED y listener con ADMIN_RESTRICTIONS.
# PATRON: RESULTADO: RED CIFRADA
# HERRAMIENTA: Revisión de archivos de configuración de Oracle Net
ADMIN="$ORACLE_BASE_HOME/network/admin"
grep -E "^(SQLNET|ADMIN_RESTRICTIONS)" "$ADMIN/sqlnet.ora" "$ADMIN/listener.ora" || true
ok=0
grep -q "^SQLNET.ENCRYPTION_SERVER = REQUIRED" "$ADMIN/sqlnet.ora" && ok=$((ok + 1))
grep -q "^SQLNET.CRYPTO_CHECKSUM_SERVER = REQUIRED" "$ADMIN/sqlnet.ora" && ok=$((ok + 1))
grep -q "^ADMIN_RESTRICTIONS_LISTENER = ON" "$ADMIN/listener.ora" && ok=$((ok + 1))
if [ "$ok" -eq 3 ]; then echo "RESULTADO: RED CIFRADA"; else echo "RESULTADO: $ok de 3 parámetros"; fi
