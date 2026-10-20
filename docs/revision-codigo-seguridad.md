# Revisión de código y seguridad (Fase 9)

Fecha: 20/10/2026. Alcance: todo el repositorio (`sql/`, `scripts/`, `app/`, historial de git y dependencias).
Herramientas: `/security-review`, `/code-review`, `npm audit`, búsquedas en `git log -p`, revisión manual contra
`docs/reglas-de-codigo.md` y pruebas en el laboratorio `iso-lab` y en el navegador.

Cada hallazgo se comprobó antes de corregirlo (que el fallo existía) y después (que la corrección lo resuelve sin
romper lo demás).

## 1. Secretos

| Comprobación | Resultado |
| --- | --- |
| Valores de `.env` en el historial (`git log -p --all`, buscando cada valor) | **No aparecen.** Ningún secreto publicado: no hay nada que rotar. |
| Contraseñas escritas en scripts o en `evidencia/` | Solo literales de prueba desechables: `Desechable#Prueba2026` (P17, se crea y se borra en la misma prueba) y `abc` (contraseña débil que P17 espera que Oracle rechace). |
| `.env`, `.secretos/`, monederos y respaldos en `.gitignore` | Sí. Se agregó `.secretos/` (ver S1). |
| `materiales/clase/` (no debe publicarse) | Fuera de `main` y del remoto. **Aviso:** está en el commit `0ddee12` de la rama local `respaldo-local`, que no se ha publicado. No se debe usar `git push --all` ni publicar esa rama; borrarla o no lo decide el estudiante (no se tocó el historial). |

## 2. Hallazgos de seguridad

| # | Hallazgo | Riesgo | Corrección | Verificación |
| --- | --- | --- | --- | --- |
| S1 | `scripts/iso-lab.ps1` creaba el contenedor con `-e ORACLE_PASSWORD=…`: la contraseña de SYS/SYSTEM quedaba en texto plano en `docker inspect iso-lab`. | Cualquiera con acceso a Docker en el equipo la lee sin entrar a la base (A5.17, A8.5). | Se entrega por archivo: `.secretos/oracle_password` (ignorado por git) montado de solo lectura y `ORACLE_PASSWORD_FILE`, que la imagen admite. | La corrida limpia comprueba que `docker inspect` ya no muestra `ORACLE_PASSWORD=` y se detiene si aparece. |
| S2 | Los valores de `.env` se insertan entre comillas en `DEFINE` y `CONNECT` de SQL*Plus sin validarlos. | Una comilla cerraría el texto, un `&` abriría otra sustitución y un espacio o `\` cambiaría el comando. No es explotable desde fuera (el `.env` es del propio operador), pero un valor así rompería la conexión de forma confusa. | `ejecutar-sql.ps1` e `iso-lab.ps1` rechazan esos caracteres con un mensaje claro antes de construir la entrada. | La expresión rechaza `'`, `"`, `&`, espacio y `\`, y acepta una contraseña válida como `Correcta#2026_x`; la validación ocurre antes de llamar a SQL*Plus. |
| S3 | El servidor de desarrollo de Vite permitía leer toda la carpeta del proyecto (`fs.allow: ['..']`). | Con `vite --host`, otro equipo de la red podría pedir `/@fs/…/.env` o `materiales/clase/`. | `fs.allow` limitado a `app`, `sql`, `evidencia` y `docs`. | `.env`, `materiales/clase` y `salidas` responden 403; `sql/` responde 200. |

`/security-review` no encontró ninguna otra vulnerabilidad con confianza mayor al 80 %. `npm audit`: 0
vulnerabilidades.

**Inyección SQL:** todo `EXECUTE IMMEDIATE` de `sql/` es de texto fijo o pasa los nombres por
`DBMS_ASSERT.ENQUOTE_NAME` (regla 8). La app no se conecta a Oracle: muestra texto ya generado por los scripts, y React
lo escapa al mostrarlo (no hay `dangerouslySetInnerHTML`).

## 3. Hallazgos de corrección (`/code-review`)

| # | Archivo | Hallazgo | Corrección |
| --- | --- | --- | --- |
| C1 | `app/src/datos/cargar.ts` | El riesgo "aceptado" de A8.8 salía de una lista fija: el mapa lo mostraba como aceptado aunque la evidencia dijera lo contrario. | La aceptación se demuestra: exige que P18 haya pasado y que el control no esté en "No cumple". |
| C2 | `sql/verificacion/V13-A8.13-respaldo.sql` | El criterio b contaba cualquier pieza de respaldo, incluso solo el archivo de control. | Cuenta conjuntos de datafiles (`v$backup_set`, tipo D o I, sin control file solo) de los últimos 7 días; `02-auditor.sql` concede `v_$backup_set`. |
| C3 | `sql/verificacion/V11-A8.11-enmascaramiento.sql` | El control del clon aceptaba un conteo de cualquier fecha y fallaba con NO_DATA_FOUND si aún no había registros. | `COUNT`/`MAX` sin NO_DATA_FOUND y solo vale un control de los últimos 7 días (códigos -1, -2 y -3 con su mensaje). |
| C4 | `app/src/datos/validar.ts` | El estado y la madurez del JSON no se contrastaban con los criterios que lo respaldan. | Se recalculan cumplidos y total desde los criterios y se exige coherencia (0 sin criterios cumplidos, 1 con algunos, 2-4 con todos). |
| C5 | `app/src/datos/validar.ts` | Impacto o probabilidad fuera de 1-5 producían un nivel de riesgo sin sentido en lugar de un error. | Se valida el rango antes de calcular el nivel. |
| C6 | `app/src/componentes/MapaCalor.tsx` | La ayuda del mapa se posicionaba respecto del contenedor equivocado y quedaba lejos del marcador. | El SVG y la ayuda comparten un contenedor `position: relative`. |
| C7 | `app/src/componentes/CadenaMatriz.tsx` | En la vista Matriz, `aria-labelledby` apuntaba a un título que no existe ahí. | Usa `aria-labelledby` solo si hay título y, si no, `aria-label`. |
| C8 | `sql/pruebas/P19-proteccion-logs.sh` | Los enlaces simbólicos (siempre 777) hacían fallar la prueba aunque C15 se hubiera aplicado. | Se saltan: lo que se protege es su destino, que se revisa por su propia ruta. |
| C9 | `app/vite.config.ts` | Ver S3. | Ver S3. |
| C10 | `app/src/vistas/Resumen.tsx` | Al filtrar por un riesgo quedaba abierto un control que no lo mitiga. | El filtro cierra el control si no mitiga el riesgo elegido. |

## 4. Hallazgo del laboratorio: deriva de permisos (A5.33)

Al repetir P19 sobre el laboratorio, dos días después de aplicar C15, aparecieron **12 directorios con permisos para
"otros"** (`incident/incdir_*` y `trace/cdmp_*`, modo 755). No es un error de la prueba: Oracle los crea al registrar
incidentes, con la máscara 022 de sus procesos, después de que C15 cerró los permisos.

Análisis: un usuario ajeno no puede llegar a ellos porque `diag/` y sus niveles superiores siguen cerrados (sin
permiso de paso para "otros"). El riesgo real es bajo, pero la deriva existe y debe vigilarse.

Corrección de la prueba: P19 medía el permiso de cada entrada por separado. Ahora mide el **acceso efectivo** (una
entrada es alcanzable solo si todos los directorios de su ruta dan paso a "otros") e informa aparte lo que tiene
permisos abiertos bajo un directorio cerrado:

| Caso | Revisados | Alcanzables por otros | Abiertos bajo un directorio cerrado | Resultado |
| --- | --- | --- | --- | --- |
| Laboratorio corregido, con la deriva | 935 | 0 | 12 | REGISTROS PROTEGIDOS |
| Imagen sin corregir (oradata 777, diag 775) | 64 | 26 | 0 | REGISTROS EXPUESTOS (26) |

Tratamiento: el procedimiento de A5.33 (`docs/procedimientos.md`) ya indica revisar los permisos cada semana y volver a
aplicar C15 si aparece alguno; la segunda columna de P19 es justamente lo que esa revisión debe mirar. Las ACL por
defecto (`setfacl`) cerrarían también lo que se cree después, pero la imagen no trae esa herramienta; queda como mejora
para un servidor real.

## 5. Reglas de código (`docs/reglas-de-codigo.md`)

| Regla | Resultado |
| --- | --- |
| Funciones de 60 líneas o menos | Cumple en los 32 archivos TypeScript y en los scripts de PowerShell. |
| Sin `any`, TypeScript estricto | Cumple (`strict`, `noUncheckedIndexedAccess`); `tsc` y `oxlint` sin errores. |
| Ciclos acotados | Cumple: los ciclos recorren listas finitas o tienen un máximo de intentos (espera de la base: 60 × 10 s). |
| `WHENEVER SQLERROR` | Cumple en los 18 scripts de verificación y en los de corrección. |
| SQL dinámico solo con texto fijo o `DBMS_ASSERT` | Cumple (ver la sección 2). |
| Validación de datos al cargar (regla 5) | Reforzada con C4 y C5; probada con datos rotos a propósito (criterio en falla, madurez incoherente, impacto 0). |

## 6. Repetición de la cadena

V11, V13, P19, `02-auditor.sql` e `iso-lab.ps1` cambiaron, así que la evidencia anterior ya no corresponde a sus
scripts. Se reconstruye el laboratorio desde cero y se repite la cadena PHVA completa (escenario, evaluación y
pruebas antes, correcciones C01-C15, pruebas y evaluación después, y reinicio para TDE), sin pasos manuales.
