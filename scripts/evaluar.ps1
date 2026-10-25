# PHVA: VERIFICAR. Ejecuta todos los scripts de sql/verificacion como ISO_AUDITOR, guarda cada salida como evidencia
# en evidencia/<fase>/ y genera app/src/datos/evaluacion-<fase>.json, que alimenta la matriz del artefacto.
#
# Uso: .\scripts\evaluar.ps1 -Fase antes      (situación inicial, riesgo inherente)
#      .\scripts\evaluar.ps1 -Fase despues    (tras aplicar sql/correccion, riesgo residual)
#      .\scripts\evaluar.ps1 -Fase historial -Etapa C04   (medición intermedia: evidencia en evidencia/historial/C04/)
# Toda evaluación se agrega además a app/src/datos/historial.json (vista "Evolución", ver scripts/historial.ps1).
#
# Regla de estado (enunciado: Cumple / No cumple / Parcial):
#   Cumple = todos los criterios técnicos OK · Parcial = algunos · No cumple = ninguno.
# Regla de madurez 0-4 (definida por el profesor en clase):
#   0 no existe (ningún criterio) · 1 existe pero no se aplica de forma completa (algunos criterios)
#   2 se aplica (todos los criterios) pero no está documentado · 3 documentado (procedimiento aprobado)
#   4 documentado, aplicado y verificado con evidencia (revisión semanal activa con registro reciente).
#   Un procedimiento documentado cuyo control no se cumple se marca como "fallo de control".
param(
    [Parameter(Mandatory)][ValidateSet('antes', 'despues', 'historial')][string]$Fase,
    [ValidatePattern('^[A-Za-z0-9-]+$')][string]$Etapa = $Fase
)

$ErrorActionPreference = 'Stop'
$Raiz = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'historial.ps1')
if ($Fase -eq 'historial' -and $Etapa -eq 'historial') { throw 'Indicar -Etapa para una medición del historial' }
$Evidencia = if ($Fase -eq 'historial') { "evidencia\historial\$Etapa" } else { "evidencia\$Fase" }
$scripts = Get-ChildItem (Join-Path $Raiz 'sql\verificacion') -Filter 'V*.sql' | Sort-Object Name
if ($scripts.Count -ne 18) { throw "Se esperaban 18 scripts de verificación y hay $($scripts.Count)" }

$criterios = @{}
$gobierno = @{}
foreach ($archivo in $scripts) {
    Write-Host "Verificando $($archivo.Name)..."
    $salida = & (Join-Path $PSScriptRoot 'ejecutar-sql.ps1') $archivo.FullName -Salida $Evidencia
    if ($LASTEXITCODE -ne 0) { throw "Falló $($archivo.Name)" }
    foreach ($linea in $salida) {
        $partes = "$linea".Trim() -split '\|'
        if ($partes.Count -lt 6) { continue }
        $registro = [ordered]@{ id = $partes[2]; ok = ($partes[3] -eq 'OK'); criterio = $partes[4]; observado = $partes[5]
                                script = $archivo.Name }
        if ($partes[0] -eq 'CRITERIO') {
            if (-not $criterios.ContainsKey($partes[1])) { $criterios[$partes[1]] = @() }
            $criterios[$partes[1]] += $registro
        }
        elseif ($partes[0] -eq 'GOBIERNO') { $gobierno["$($partes[1])|$($partes[2])"] = $registro }
    }
}

function Evaluar-Control([string]$Control) {
    $lista = @($criterios[$Control])
    if ($lista.Count -eq 0) { throw "El control $Control no produjo criterios" }
    $cumplidos = @($lista | Where-Object { $_.ok }).Count
    $doc = $gobierno["$Control|DOC"]
    $ver = $gobierno["$Control|VER"]
    if ($null -eq $doc -or $null -eq $ver) { throw "Falta el gobierno del control $Control" }
    $estado = if ($cumplidos -eq $lista.Count) { 'Cumple' } elseif ($cumplidos -gt 0) { 'Parcial' } else { 'No cumple' }
    $madurez = if ($cumplidos -eq 0) { 0 } elseif ($cumplidos -lt $lista.Count) { 1 }
               elseif (-not $doc.ok) { 2 } elseif (-not $ver.ok) { 3 } else { 4 }
    return [ordered]@{
        control = $Control; estado = $estado; madurez = $madurez
        cumplidos = $cumplidos; total = $lista.Count
        documentado = $doc.ok; verificado = $ver.ok
        falloDeControl = ($doc.ok -and $cumplidos -lt $lista.Count)
        criterios = $lista; gobierno = @($doc, $ver)
    }
}

$controles = @($criterios.Keys | Sort-Object { $_ -replace 'A(\d)\.(\d+)', '$1.$2' -as [version] } | ForEach-Object { Evaluar-Control $_ })
if ($controles.Count -ne 17) { throw "Se esperaban 17 controles evaluados y hay $($controles.Count)" }

$fecha = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'
if ($Fase -ne 'historial') {
    $resultado = [ordered]@{
        fase = $Fase
        fecha = $fecha
        motor = 'Oracle Database 21c Express Edition 21.3.0.0.0 (contenedor iso-lab, XEPDB1)'
        ejecutadoComo = 'ISO_AUDITOR (solo lectura del diccionario)'
        controles = $controles
    }
    $destino = Join-Path $Raiz "app\src\datos\evaluacion-$Fase.json"
    New-Item -ItemType Directory -Force (Split-Path $destino) | Out-Null
    $resultado | ConvertTo-Json -Depth 6 | Set-Content -Path $destino -Encoding UTF8
    Write-Host "Evaluación '$Fase' guardada en $destino"
}
# Misma fecha que el JSON oficial: la app comprueba que el historial coincide con las evaluaciones antes y después.
Agregar-AlHistorial $Raiz 'evaluaciones' ([ordered]@{
    etapa = $Etapa; fecha = $fecha; evidencia = ($Evidencia -replace '\\', '/')
    controles = @($controles | ForEach-Object {
        [ordered]@{ control = $_.control; estado = $_.estado; madurez = $_.madurez; cumplidos = $_.cumplidos; total = $_.total } })
})
$controles | ForEach-Object { '{0,-6} {1,-10} madurez {2}  ({3}/{4})' -f $_.control, $_.estado, $_.madurez, $_.cumplidos, $_.total }
Write-Host "Medición '$Etapa' agregada al historial"
