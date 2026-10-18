#!/bin/bash
# C12 · Seguridad de red de Oracle Net. PHVA: HACER. Control: A8.20.
# Cifrado nativo AES256 y control de integridad SHA256 obligatorios para todo cliente, verificadores de
# contraseña modernos (12a) y listener que no acepta cambios de configuración en caliente.
# Se ejecuta dentro del contenedor como el usuario oracle (scripts/corregir.ps1). Es idempotente.
set -euo pipefail
ADMIN="$ORACLE_BASE_HOME/network/admin"

if ! grep -q "A8.20" "$ADMIN/sqlnet.ora"; then
  cat >> "$ADMIN/sqlnet.ora" <<'EOF'

# A8.20 Seguridad de redes (proyecto ISO 27001)
SQLNET.ENCRYPTION_SERVER = REQUIRED
SQLNET.ENCRYPTION_TYPES_SERVER = (AES256)
SQLNET.CRYPTO_CHECKSUM_SERVER = REQUIRED
SQLNET.CRYPTO_CHECKSUM_TYPES_SERVER = (SHA256)
SQLNET.ALLOWED_LOGON_VERSION_SERVER = 12a
EOF
fi

if ! grep -q "ADMIN_RESTRICTIONS_LISTENER" "$ADMIN/listener.ora"; then
  printf '\n# A8.20: el listener no acepta cambios de configuración en caliente\nADMIN_RESTRICTIONS_LISTENER = ON\n' >> "$ADMIN/listener.ora"
fi

lsnrctl reload > /dev/null
echo "=== sqlnet.ora ==="
grep -E "^SQLNET" "$ADMIN/sqlnet.ora"
echo "=== listener.ora ==="
grep -E "^ADMIN_RESTRICTIONS" "$ADMIN/listener.ora"
echo "=== Red cifrada y listener restringido ==="
