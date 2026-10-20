# Laboratorio Oracle 21c XE del proyecto (contenedor iso-lab, puerto local 1526).
# Las contraseñas se leen de .env (no versionado). Uso:
#   .\scripts\iso-lab.ps1 -Crear     crea el contenedor (primera vez, tarda unos minutos)
#   .\scripts\iso-lab.ps1 -Iniciar   arranca un contenedor ya creado
#   .\scripts\iso-lab.ps1 -Estado    muestra si la base está lista
#   .\scripts\iso-lab.ps1 -Detener   detiene el contenedor sin borrar datos
param([switch]$Crear, [switch]$Iniciar, [switch]$Estado, [switch]$Detener)

$ErrorActionPreference = 'Stop'
$Nombre = 'iso-lab'
$Imagen = 'gvenzl/oracle-xe:21'   # imagen completa: incluye RMAN (la variante -slim no lo trae)
$Raiz = Split-Path -Parent $PSScriptRoot
$ArchivoEnv = Join-Path $Raiz '.env'

function Leer-Env {
    if (-not (Test-Path $ArchivoEnv)) { throw "Falta $ArchivoEnv con ORACLE_PASSWORD." }
    $valores = @{}
    foreach ($linea in Get-Content $ArchivoEnv) {
        if ($linea -match '^\s*([A-Z_]+)=(.+)$') { $valores[$Matches[1]] = $Matches[2].Trim() }
    }
    foreach ($clave in 'ORACLE_PASSWORD') {
        if (-not $valores.ContainsKey($clave)) { throw "Falta $clave en .env" }
        # Mismas restricciones que scripts/ejecutar-sql.ps1: SQL*Plus interpretaría comillas, & o espacios.
        if ($valores[$clave] -match '["''&\s\\]') { throw "$clave en .env tiene caracteres no admitidos (comillas, &, espacios o \)." }
    }
    return $valores
}

if ($Crear) {
    $env_ = Leer-Env
    # La contraseña de SYS/SYSTEM se entrega por archivo (ORACLE_PASSWORD_FILE, admitido por la imagen) y no como
    # variable de entorno: así no queda guardada en la configuración del contenedor (docker inspect). El archivo vive
    # en .secretos/ (ignorado por git, como .env) y se monta de solo lectura; debe existir mientras exista el contenedor.
    $Secretos = Join-Path $Raiz '.secretos'
    New-Item -ItemType Directory -Force $Secretos | Out-Null
    $ArchivoClave = Join-Path $Secretos 'oracle_password'
    [IO.File]::WriteAllText($ArchivoClave, $env_.ORACLE_PASSWORD, [Text.UTF8Encoding]::new($false))
    # Nombre de equipo fijo: el monedero LOCAL AUTO_LOGIN de TDE solo abre en el equipo donde se creó.
    docker run -d --name $Nombre --hostname $Nombre `
        -p 127.0.0.1:1526:1521 `
        -v "${ArchivoClave}:/run/secrets/oracle_password:ro" `
        -e ORACLE_PASSWORD_FILE=/run/secrets/oracle_password `
        -v iso-lab-datos:/opt/oracle/oradata `
        $Imagen | Out-Null
    Write-Host "Contenedor $Nombre creado. Esperar 'DATABASE IS READY TO USE!' con: .\scripts\iso-lab.ps1 -Estado"
}
elseif ($Iniciar) { docker start $Nombre | Out-Null; Write-Host "$Nombre iniciado." }
elseif ($Detener) { docker stop $Nombre | Out-Null; Write-Host "$Nombre detenido." }
elseif ($Estado) {
    $fila = docker ps -a --filter "name=^$Nombre$" --format '{{.Names}}  {{.Status}}  {{.Ports}}'
    if (-not $fila) { Write-Host "No existe el contenedor $Nombre. Crearlo con: .\scripts\iso-lab.ps1 -Crear"; exit 1 }
    Write-Host $fila
    # Estado en vivo, no el historial del log: el chequeo de salud de la imagen confirma que XEPDB1 está en
    # READ WRITE en este momento (un "DATABASE IS READY" de un arranque anterior no lo garantiza).
    $listo = $false
    if ((docker inspect -f '{{.State.Running}}' $Nombre) -eq 'true') {
        docker exec $Nombre /opt/oracle/healthcheck.sh XEPDB1 2>&1 | Out-Null
        $listo = $LASTEXITCODE -eq 0
    }
    Write-Host ("Base lista: " + $listo)
}
else { Get-Help $PSCommandPath; Write-Host 'Indicar -Crear, -Iniciar, -Estado o -Detener.' }
