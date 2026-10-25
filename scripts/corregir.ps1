# PHVA: HACER. Aplica en orden los scripts de sql/correccion sobre iso-lab y guarda cada salida en
# evidencia/correccion/. Incluye el reinicio de la instancia que exigen los parámetros estáticos de C01.
# Ejecutar una sola vez, después de .\scripts\evaluar.ps1 -Fase antes y .\scripts\pruebas.ps1 -Fase antes.
# -Desde Cnn permite reanudar desde un paso si uno anterior falló y ya se corrigió.
# Después de cada corrección toma una medición (scripts/medir.ps1): así el historial de la vista "Evolución" muestra
# en qué momento sube cada control. -SinMedir la omite (solo para depurar un paso; la corrida oficial siempre mide).
param([string]$Desde = 'C01', [switch]$SinMedir)
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

function Medir([string]$Archivo) {
    $etapa = $Archivo.Substring(0, 3)
    if ($SinMedir -or $etapa -lt $Desde) { return }
    & (Join-Path $PSScriptRoot 'medir.ps1') -Etapa $etapa
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
Medir 'C01-parametros-cdb.sql'

# C15 va al final para que también queden protegidos los respaldos y archive logs que creó C13.
$pasos = @(
    @('C02-tde-monedero.sql', 'sys-cdb'), @('C03-tde-tablespace.sql', 'sys'), @('C04-roles-privilegios.sql', 'sys'),
    @('C05-identidades-perfiles.sql', 'sys'), @('C06-clasificacion.sql', 'sys'), @('C07-redaccion-vpd.sql', 'sys'),
    @('C08-fuga-datos.sql', 'sys'), @('C09-eliminacion.sql', 'sys'), @('C10-clon-dev.sql', 'sys'),
    @('C11-auditoria.sql', 'sys'), @('C12-red.sh', 'sh'), @('C13-respaldo.sh', 'sh'),
    @('C14-gobierno.sql', 'sys'), @('C15-proteccion-logs.sh', 'sh')
)
foreach ($paso in $pasos) {
    if ($paso[1] -eq 'sh') { Paso-Sh $paso[0] } else { Paso-Sql $paso[0] $paso[1] }
    Medir $paso[0]
}
Write-Host 'Correcciones aplicadas. Siguiente: .\scripts\pruebas.ps1 -Fase despues y .\scripts\evaluar.ps1 -Fase despues'
