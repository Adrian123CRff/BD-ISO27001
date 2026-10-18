# Batería de pruebas técnicas (enunciado, artefacto punto 6: ID, Tipo, Procedimiento, Resultado esperado, Herramienta).
# Cada prueba de sql/pruebas declara sus metadatos en la cabecera; aquí se ejecuta con la identidad indicada (COMO),
# se compara la salida con el PATRON del resultado esperado y se genera app/src/datos/pruebas-<fase>.json.
#
# Uso: .\scripts\pruebas.ps1 -Fase antes | despues
param([Parameter(Mandatory)][ValidateSet('antes', 'despues')][string]$Fase)

$ErrorActionPreference = 'Stop'
$Raiz = Split-Path -Parent $PSScriptRoot
$Carpeta = Join-Path $Raiz "evidencia\$Fase\pruebas"
New-Item -ItemType Directory -Force $Carpeta | Out-Null
$archivos = Get-ChildItem (Join-Path $Raiz 'sql\pruebas') -File | Where-Object { $_.Name -match '^P\d{2}-' } | Sort-Object Name
if ($archivos.Count -ne 19) { throw "Se esperaban 19 pruebas y hay $($archivos.Count)" }
$campos = 'PRUEBA', 'TIPO', 'CONTROL', 'RIESGO', 'COMO', 'PROCEDIMIENTO', 'ESPERADO', 'PATRON', 'HERRAMIENTA'

function Leer-Cabecera($Archivo) {
    $meta = @{}
    foreach ($linea in Get-Content $Archivo.FullName -Encoding UTF8 -TotalCount 14) {
        if ($linea -match '^(--|#)\s*([A-Z_]+):\s*(.+)$') { $meta[$Matches[2]] = $Matches[3].Trim() }
    }
    foreach ($campo in $campos) { if (-not $meta.ContainsKey($campo)) { throw "$($Archivo.Name): falta $campo" } }
    return $meta
}

function Limpiar([string]$Sentencia) {
    $fin = if ($Sentencia -match '^\s*begin') { "`n/" } else { ';' }
    "connect / as sysdba`nalter session set container = XEPDB1;`n$Sentencia$fin`nexit`n" |
        docker exec -i iso-lab sqlplus -s -L /nolog | Out-Null
}

$resultados = @()
foreach ($archivo in $archivos) {
    $meta = Leer-Cabecera $archivo
    Write-Host "Prueba $($meta.PRUEBA) ($($meta.TIPO))..."
    $destino = Join-Path $Carpeta ($archivo.BaseName + '.txt')
    if ($meta.COMO -eq 'sh') {
        $salida = (((Get-Content $archivo.FullName -Raw) -replace "`r", '') + "`nexit`n") | docker exec -i iso-lab bash -s 2>&1
        @("-- Evidencia: $($archivo.Name) | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") + $salida | Set-Content $destino -Encoding UTF8
    }
    else {
        $salida = & (Join-Path $PSScriptRoot 'ejecutar-sql.ps1') $archivo.FullName -Como $meta.COMO -Salida "evidencia\$Fase\pruebas" 2>&1
    }
    if ($meta.ContainsKey('LIMPIEZA_SYS')) { Limpiar $meta.LIMPIEZA_SYS }
    $texto = ($salida | ForEach-Object { "$_" }) -join "`n"
    $paso = [regex]::IsMatch($texto, $meta.PATRON, 'Multiline')
    $relevantes = @($salida | ForEach-Object { "$_".TrimEnd() } |
        Where-Object { $_ -ne '' -and $_ -notmatch '^-- Evidencia|^[-\s]+$|row(s)? selected|^Session altered' } |
        Select-Object -Last 8)
    $resultados += [ordered]@{
        id = $meta.PRUEBA; tipo = $meta.TIPO; control = $meta.CONTROL; riesgo = $meta.RIESGO
        procedimiento = $meta.PROCEDIMIENTO; esperado = $meta.ESPERADO; herramienta = $meta.HERRAMIENTA
        ejecutadoComo = $meta.COMO; script = $archivo.Name; paso = $paso; obtenido = $relevantes
    }
    Write-Host ("  {0}" -f $(if ($paso) { 'Resultado esperado obtenido' } else { 'NO se obtuvo el resultado esperado' }))
}

$json = [ordered]@{ fase = $Fase; fecha = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'); pruebas = $resultados }
$destinoJson = Join-Path $Raiz "app\src\datos\pruebas-$Fase.json"
$json | ConvertTo-Json -Depth 5 | Set-Content -Path $destinoJson -Encoding UTF8
$aprobadas = @($resultados | Where-Object { $_.paso }).Count
Write-Host "Batería '$Fase': $aprobadas de $($resultados.Count) con el resultado esperado. Guardado en $destinoJson"
