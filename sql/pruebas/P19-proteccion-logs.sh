#!/bin/bash
# PRUEBA: P19
# TIPO: Revisión de configuración
# CONTROL: A5.33
# RIESGO: R-CONF-05
# COMO: sh
# PROCEDIMIENTO: Se revisan los permisos del sistema operativo sobre los registros y los archivos que revelan la estructura de la base: alert log, trazas y log del listener (diag), auditoría de SYS (adump), y respaldos, archive logs, monedero y archivos de datos (oradata).
# ESPERADO: Ningún archivo ni directorio da permisos a "otros" (lectura, escritura o ejecución): solo el dueño oracle y su grupo pueden abrirlos.
# PATRON: RESULTADO: REGISTROS PROTEGIDOS
# HERRAMIENTA: stat sobre los directorios de Oracle (sistema operativo del servidor)
# El último dígito del modo octal (stat %a) son los permisos de "otros": distinto de 0 significa expuesto.
# globstar no sigue enlaces simbólicos, así que el recorrido termina (lista finita de archivos); "$d"/** incluye el
# propio directorio.
shopt -s globstar nullglob dotglob
total=0
expuestos=0
for d in /opt/oracle/diag /opt/oracle/admin /opt/oracle/oradata; do
  lista=$(stat -c '%a %A %n' "$d"/**)
  total=$((total + $(printf '%s\n' "$lista" | wc -l)))
  abiertos=$(printf '%s\n' "$lista" | awk 'substr($1, length($1), 1) != "0"')
  if [ -n "$abiertos" ]; then
    expuestos=$((expuestos + $(printf '%s\n' "$abiertos" | wc -l)))
    printf '%s\n' "$abiertos" | head -n 5 | cut -d' ' -f2-
  fi
done
echo "Revisados: $total | con permisos para otros: $expuestos"
if [ "$expuestos" -eq 0 ]; then echo "RESULTADO: REGISTROS PROTEGIDOS"; else echo "RESULTADO: REGISTROS EXPUESTOS ($expuestos)"; fi
