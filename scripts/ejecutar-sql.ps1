# Ejecuta un script de sql/ dentro del contenedor iso-lab y guarda la salida como evidencia.
# Las contraseñas se leen de .env y viajan por la entrada estándar de SQL*Plus: nunca por la línea de comandos
# ni en la salida (SET VERIFY OFF y conexión sin eco).
#
# Uso:
#   .\scripts\ejecutar-sql.ps1 sql\00-entorno.sql                         (como auditor, salida en salidas/)
#   .\scripts\ejecutar-sql.ps1 sql\01-escenario.sql -Como sys
#   .\scripts\ejecutar-sql.ps1 sql\verificacion\V08-A8.2.sql -Salida evidencia\antes
#   .\scripts\ejecutar-sql.ps1 sql\pruebas\P01.sql -Como usuario:JPEREZ
#
# -Como: sys (SYSDBA en XEPDB1), sys-cdb (SYSDBA en la raíz CDB$ROOT), ninguno (sin conexión previa), system, auditor (ISO_AUDITOR, solo lectura; por defecto) o usuario:<NOMBRE>
#        (usuario de laboratorio con LAB_USER_PASSWORD).
param(
    [Parameter(Mandatory)][string]$Script,
    [string]$Como = 'auditor',
    [string]$Salida = 'salidas'
)

$ErrorActionPreference = 'Stop'
$Raiz = Split-Path -Parent $PSScriptRoot
$Ruta = (Resolve-Path $Script).Path

$valores = @{}
foreach ($linea in Get-Content (Join-Path $Raiz '.env')) {
    if ($linea -match '^\s*([A-Z_]+)=(.+)$') { $valores[$Matches[1]] = $Matches[2].Trim() }
}
foreach ($clave in 'ORACLE_PASSWORD', 'AUDITOR_PASSWORD', 'LAB_USER_PASSWORD', 'TDE_PASSWORD') {
    if (-not $valores.ContainsKey($clave)) { throw "Falta $clave en .env" }
}

$servicio = 'localhost:1521/XEPDB1'
switch -Regex ($Como) {
    '^sys$'      { $conexion = "connect / as sysdba`nalter session set container = XEPDB1;" }
    '^sys-cdb$'  { $conexion = "connect / as sysdba" }
    '^ninguno$'  { $conexion = '' }
    '^system$'   { $conexion = "connect system/`"$($valores.ORACLE_PASSWORD)`"@$servicio" }
    '^auditor$'  { $conexion = "connect iso_auditor/`"$($valores.AUDITOR_PASSWORD)`"@$servicio" }
    '^usuario:([A-Za-z0-9_]+)$' { $conexion = "connect $($Matches[1])/`"$($valores.LAB_USER_PASSWORD)`"@$servicio" }
    default      { throw "Valor de -Como no válido: $Como" }
}

$cabecera = @"
set echo off
set verify off
set feedback off
define LAB_PWD = "$($valores.LAB_USER_PASSWORD)"
define AUDITOR_PWD = "$($valores.AUDITOR_PASSWORD)"
define TDE_PWD = "$($valores.TDE_PASSWORD)"
$conexion
set feedback on
"@

$carpeta = Join-Path $Raiz $Salida
New-Item -ItemType Directory -Force $carpeta | Out-Null
$destino = Join-Path $carpeta ([IO.Path]::GetFileNameWithoutExtension($Ruta) + '.txt')

$cuerpo = (Get-Content $Ruta -Raw -Encoding UTF8) -replace "`r", ''
$entrada = ($cabecera -replace "`r", '') + "`n" + $cuerpo + "`nexit`n"
$encabezado = "-- Evidencia: $([IO.Path]::GetFileName($Ruta)) | ejecutado como $Como | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

$resultado = $entrada | docker exec -i -e NLS_LANG=AMERICAN_AMERICA.AL32UTF8 iso-lab sqlplus -s -L /nolog
$codigo = $LASTEXITCODE
# Defensa en profundidad: si una sentencia falla, SQL*Plus repite su texto ya sustituido. Ningún valor de .env
# puede llegar a la evidencia ni a la consola.
$secretos = @($valores.Values | Where-Object { $_.Length -ge 6 })
$resultado = @($resultado | ForEach-Object {
    $linea = "$_"
    foreach ($secreto in $secretos) { $linea = $linea.Replace($secreto, '********') }
    $linea
})
@($encabezado) + $resultado | Set-Content -Path $destino -Encoding UTF8
$resultado
if ($codigo -ne 0) { Write-Warning "SQL*Plus terminó con código $codigo (ver $destino)" }
exit $codigo
