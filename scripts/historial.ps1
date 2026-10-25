# Historial de mediciones (vista "Evolución" del artefacto). Lo cargan con punto evaluar.ps1 y pruebas.ps1: cada
# evaluación o batería agrega un registro con su fecha a app/src/datos/historial.json, sin reemplazar los anteriores,
# para que el gráfico muestre cómo cambia cada control, riesgo y prueba en el tiempo.
#
# Etapas: 'antes' y 'despues' (las evaluaciones oficiales), 'C01'...'C15' (tras cada corrección, scripts/corregir.ps1)
# y cualquier otra medición posterior, por ejemplo la revisión semanal (scripts/medir.ps1 -Etapa revision-20261101).

function Agregar-AlHistorial([string]$Raiz, [ValidateSet('evaluaciones', 'baterias')][string]$Lista, $Registro) {
    $ruta = Join-Path $Raiz 'app\src\datos\historial.json'
    $historial = if (Test-Path $ruta) { Get-Content $ruta -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable }
                 else { [ordered]@{ evaluaciones = @(); baterias = @() } }
    # Contains sirve tanto para el Hashtable que da ConvertFrom-Json como para el [ordered] inicial.
    foreach ($clave in 'evaluaciones', 'baterias') { if (-not $historial.Contains($clave)) { $historial[$clave] = @() } }
    $historial[$Lista] = @($historial[$Lista]) + @($Registro)
    [ordered]@{ evaluaciones = @($historial.evaluaciones); baterias = @($historial.baterias) } |
        ConvertTo-Json -Depth 6 | Set-Content -Path $ruta -Encoding UTF8
}
