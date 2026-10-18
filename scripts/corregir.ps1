# PHVA: HACER. Aplica en orden los scripts de sql/correccion sobre iso-lab y guarda cada salida en
# evidencia/correccion/. Incluye el reinicio de la instancia que exigen los parámetros estáticos de C01.
# Ejecutar una sola vez, después de .\scripts\evaluar.ps1 -Fase antes y .\scripts\pruebas.ps1 -Fase antes.
# -Desde Cnn permite reanudar desde un paso si uno anterior falló y ya se corrigió.
param([string]$Desde = 'C01')
$ErrorActionPreference = 'Stop'
$Raiz = Split-Path -Parent $PSScriptRoot
$Evidencia = 'evidencia\correccion'
$Ejecutar = Join-Path $PSScriptRoot 'ejecutar-sql.ps1'

function Paso-Sql([string]$Archivo, [string]$Como) {
    if ($Archivo.Substring(0, 3) -lt $Desde) { return }
    Write-Host "== $Archivo ($Como)"
    & $Ejecutar (Join-Path $Raiz "sql\correccion\$Archivo") -Como $Como -Salida $Evidencia | Select-Object -Last 3
    if ($LASTEXITCODE -ne 0) { throw "Falló $Archivo" }
}

function Paso-Sh([string]$Archivo) {
    if ($Archivo.Substring(0, 3) -lt $Desde) { return }
    Write-Host "== $Archivo (sh)"
    $contenido = ((Get-Content (Join-Path $Raiz "sql\correccion\$Archivo") -Raw) -replace "`r", '') + "`nexit `$?`n"
    $salida = $contenido | docker exec -i iso-lab bash -s 2>&1
    $codigo = $LASTEXITCODE
    $destino = Join-Path $Raiz "$Evidencia\$([IO.Path]::GetFileNameWithoutExtension($Archivo)).txt"
    @("-- Evidencia: $Archivo | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") + $salida | Set-Content $destino -Encoding UTF8
    $salida | Select-Object -Last 3
    if ($codigo -ne 0) { throw "Falló $Archivo (código $codigo)" }
}

function Esperar-Base([datetime]$Desde) {
    for ($i = 0; $i -lt 60; $i++) {
        Start-Sleep 5
        $listo = docker logs --since $Desde.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') iso-lab 2>&1 |
            Select-String 'DATABASE IS READY TO USE' -Quiet
        if ($listo) { return }
    }
    throw 'La base no quedó lista tras el reinicio'
}

New-Item -ItemType Directory -Force (Join-Path $Raiz $Evidencia) | Out-Null
docker exec iso-lab mkdir -p /opt/oracle/oradata/wallet/tde /opt/oracle/oradata/fra
Paso-Sql 'C01-parametros-cdb.sql' 'sys-cdb'

if ($Desde -le 'C01') {
    Write-Host '== Reinicio de la instancia (parámetros estáticos)'
    $inicio = Get-Date
    docker restart iso-lab | Out-Null
    Esperar-Base $inicio
}

Paso-Sql 'C02-tde-monedero.sql' 'sys-cdb'
Paso-Sql 'C03-tde-tablespace.sql' 'sys'
Paso-Sql 'C04-roles-privilegios.sql' 'sys'
Paso-Sql 'C05-identidades-perfiles.sql' 'sys'
Paso-Sql 'C06-clasificacion.sql' 'sys'
Paso-Sql 'C07-redaccion-vpd.sql' 'sys'
Paso-Sql 'C08-fuga-datos.sql' 'sys'
Paso-Sql 'C09-eliminacion.sql' 'sys'
Paso-Sql 'C10-clon-dev.sql' 'sys'
Paso-Sql 'C11-auditoria.sql' 'sys'
Paso-Sh 'C12-red.sh'
Paso-Sh 'C13-respaldo.sh'
Paso-Sql 'C14-gobierno.sql' 'sys'
Write-Host 'Correcciones aplicadas. Siguiente: .\scripts\pruebas.ps1 -Fase despues y .\scripts\evaluar.ps1 -Fase despues'
