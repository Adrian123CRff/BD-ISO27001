#!/bin/bash
# PRUEBA: P09
# TIPO: Robo de archivos de datos
# CONTROL: A8.24
# RIESGO: R-CONF-04
# COMO: sh
# PROCEDIMIENTO: Tras un checkpoint, se buscan los datos del cliente testigo dentro de los archivos .dbf del negocio, como haría quien copia el disco.
# ESPERADO: Ninguna coincidencia: el archivo está cifrado con TDE (AES256) y el tablespace sin cifrar ya no existe.
# PATRON: RESULTADO: SIN TEXTO CLARO
# HERRAMIENTA: grep sobre el archivo de datos (sistema operativo del servidor)
echo "alter system checkpoint;" | sqlplus -s / as sysdba > /dev/null
total=0
for f in /opt/oracle/oradata/XE/XEPDB1/datos_fin*.dbf; do
  n=$(grep -a -c "TESTIGO CONFIDENCIAL" "$f" || true)
  echo "$(basename "$f"): $n coincidencia(s)"
  total=$((total + n))
done
if [ "$total" -eq 0 ]; then echo "RESULTADO: SIN TEXTO CLARO"; else echo "RESULTADO: TEXTO CLARO ENCONTRADO ($total)"; fi
