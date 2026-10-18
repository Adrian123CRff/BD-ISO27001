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
    }
    return $valores
}

if ($Crear) {
    $env_ = Leer-Env
    # Nombre de equipo fijo: el monedero LOCAL AUTO_LOGIN de TDE solo abre en el equipo donde se creó.
    docker run -d --name $Nombre --hostname $Nombre `
        -p 127.0.0.1:1526:1521 `
        -e "ORACLE_PASSWORD=$($env_.ORACLE_PASSWORD)" `
        -v iso-lab-datos:/opt/oracle/oradata `
        $Imagen | Out-Null
    Write-Host "Contenedor $Nombre creado. Esperar 'DATABASE IS READY TO USE!' con: .\scripts\iso-lab.ps1 -Estado"
}
elseif ($Iniciar) { docker start $Nombre | Out-Null; Write-Host "$Nombre iniciado." }
elseif ($Detener) { docker stop $Nombre | Out-Null; Write-Host "$Nombre detenido." }
elseif ($Estado) {
    docker ps -a --filter "name=^$Nombre$" --format '{{.Names}}  {{.Status}}  {{.Ports}}'
    $listo = docker logs $Nombre 2>&1 | Select-String 'DATABASE IS READY TO USE' -Quiet
    Write-Host ("Base lista: " + [bool]$listo)
}
else { Get-Help $PSCommandPath; Write-Host 'Indicar -Crear, -Iniciar, -Estado o -Detener.' }
