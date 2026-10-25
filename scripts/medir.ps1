# Una medición del historial (vista "Evolución"): evalúa los 17 controles como ISO_AUDITOR y ejecuta las 19 pruebas,
# guarda la evidencia en evidencia/historial/<etapa>/ y agrega ambos resultados a app/src/datos/historial.json.
# Solo lee la base, salvo lo que cada prueba crea y limpia ella misma (LIMPIEZA_SYS).
#
# Uso: .\scripts\medir.ps1 -Etapa C04                 (lo llama scripts/corregir.ps1 después de cada corrección)
#      .\scripts\medir.ps1                            (medición de seguimiento: etapa revision-AAAAMMDD-HHMM)
param([ValidatePattern('^[A-Za-z0-9-]+$')][string]$Etapa = "revision-$(Get-Date -Format 'yyyyMMdd-HHmm')")

$ErrorActionPreference = 'Stop'
$salida = & (Join-Path $PSScriptRoot 'evaluar.ps1') -Fase historial -Etapa $Etapa 6>&1
$cumplen = @($salida | Where-Object { "$_" -match '^A\d\.\d+\s+Cumple\s' }).Count
$bateria = & (Join-Path $PSScriptRoot 'pruebas.ps1') -Fase historial -Etapa $Etapa 6>&1 | Select-Object -Last 1
Write-Host "Medición $Etapa ($(Get-Date -Format 'HH:mm')): $cumplen de 17 controles en Cumple · $bateria"
