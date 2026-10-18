# Ejecuta un script de sql/ dentro del contenedor iso-lab como SYSTEM en XEPDB1 y guarda la salida en salidas/.
# La contraseña no pasa por la línea de comandos: se toma de la variable ORACLE_PASSWORD del propio contenedor.
# Uso: .\scripts\ejecutar-sql.ps1 sql\00-entorno.sql
param([Parameter(Mandatory)][string]$Script)

$ErrorActionPreference = 'Stop'
$Raiz = Split-Path -Parent $PSScriptRoot
$Ruta = Resolve-Path $Script
$Salidas = Join-Path $Raiz 'salidas'
New-Item -ItemType Directory -Force $Salidas | Out-Null
$Destino = Join-Path $Salidas ([IO.Path]::GetFileNameWithoutExtension($Ruta) + '.txt')

$contenido = (Get-Content $Ruta -Raw) -replace "`r", ''
$contenido += "`nexit`n"
$contenido | docker exec -i iso-lab bash -c 'sqlplus -s -L "system/${ORACLE_PASSWORD}@localhost:1521/XEPDB1"' |
    Tee-Object -FilePath $Destino
Write-Host "Salida guardada en $Destino"
