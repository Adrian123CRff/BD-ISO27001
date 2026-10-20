#!/bin/bash
# PRUEBA: P19
# TIPO: Revisión de configuración
# CONTROL: A5.33
# RIESGO: R-CONF-05
# COMO: sh
# PROCEDIMIENTO: Se revisan los permisos del sistema operativo sobre los registros y los archivos que revelan la estructura de la base: alert log, trazas y log del listener (diag), auditoría de SYS (adump), y respaldos, archive logs, monedero y archivos de datos (oradata).
# ESPERADO: Ningún archivo ni directorio es alcanzable por "otros": los directorios raíz están cerrados (sin permisos para otros), así que solo el dueño oracle y su grupo pueden abrir su contenido. Lo que Oracle cree después con permisos abiertos debajo de un directorio cerrado se informa aparte.
# PATRON: RESULTADO: REGISTROS PROTEGIDOS
# HERRAMIENTA: stat sobre los directorios de Oracle (sistema operativo del servidor)
# El último dígito del modo octal (stat %a) son los permisos de "otros": distinto de 0 significa expuesto.
# globstar no sigue enlaces simbólicos, así que el recorrido termina (lista finita de archivos); "$d"/** incluye el
# propio directorio. Los enlaces simbólicos se saltan: siempre muestran 777 y lo que protege es su destino, que se
# revisa por su propia ruta (si no se saltaran, la prueba fallaría siempre aunque C15 se hubiera aplicado).
# Se mide el acceso EFECTIVO: una entrada solo es alcanzable por "otros" si todos los directorios de su ruta les dan
# permiso de paso (x). Oracle crea después directorios de incidentes (incdir_*, cdmp_*) con 755, pero bajo diag/
# cerrado nadie ajeno llega a ellos; se informan aparte como defensa en profundidad. globstar lista cada directorio
# antes que su contenido, así que el padre ya está evaluado cuando se revisa el hijo.
shopt -s globstar nullglob dotglob
declare -A transitable
total=0
expuestos=0
cerrados=0
for d in /opt/oracle/diag /opt/oracle/admin /opt/oracle/oradata; do
  for f in "$d"/**; do
    [ -L "$f" ] && continue
    f=${f%/}
    total=$((total + 1))
    modo=$(stat -c '%a' "$f")
    otros=${modo: -1}
    if [ "$f" = "$d" ] || [ -n "${transitable[$(dirname "$f")]:-}" ]; then alcanzable=1; else alcanzable=0; fi
    if [ -d "$f" ] && [ "$alcanzable" -eq 1 ] && (( otros & 1 )); then transitable[$f]=1; fi
    [ "$otros" = "0" ] && continue
    if [ "$alcanzable" -eq 1 ]; then
      expuestos=$((expuestos + 1))
      [ "$expuestos" -le 5 ] && echo "expuesto: $(stat -c '%A' "$f") $f"
    else
      cerrados=$((cerrados + 1))
    fi
  done
done
echo "Revisados: $total | alcanzables por otros: $expuestos | con permisos abiertos bajo un directorio cerrado: $cerrados"
if [ "$expuestos" -eq 0 ]; then echo "RESULTADO: REGISTROS PROTEGIDOS"; else echo "RESULTADO: REGISTROS EXPUESTOS ($expuestos)"; fi
