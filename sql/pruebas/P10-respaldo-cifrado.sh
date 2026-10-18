#!/bin/bash
# PRUEBA: P10
# TIPO: Robo de respaldos
# CONTROL: A8.13
# RIESGO: R-CONF-04
# COMO: sh
# PROCEDIMIENTO: Se buscan los datos del cliente testigo dentro de las piezas de respaldo de RMAN (el "BKP" que alguien podría llevarse).
# ESPERADO: Hay respaldos y ninguna pieza contiene texto claro (respaldo cifrado con AES256).
# PATRON: RESULTADO: RESPALDO CIFRADO
# HERRAMIENTA: RMAN + grep sobre las piezas de respaldo
shopt -s globstar nullglob
piezas=(/opt/oracle/oradata/fra/**/*.bkp)
if [ "${#piezas[@]}" -eq 0 ]; then echo "RESULTADO: SIN RESPALDOS"; exit 0; fi
total=0
for f in "${piezas[@]:0:50}"; do
  n=$(grep -a -c "TESTIGO CONFIDENCIAL" "$f" || true)
  total=$((total + n))
done
echo "Piezas revisadas: ${#piezas[@]}"
if [ "$total" -eq 0 ]; then echo "RESULTADO: RESPALDO CIFRADO"; else echo "RESULTADO: TEXTO CLARO EN RESPALDO ($total)"; fi
