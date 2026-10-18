# Proyecto: Controles ISO 27001:2022 para la confidencialidad en la administración de bases de datos

Responder siempre en español. Proyecto **individual** de Adrián Fernández Fernández (UNA, Administración de Bases de
Datos II, II ciclo 2026, Prof. Johnny Villalobos Murillo). Se revisa originalidad (Turnitin e IA): el estudiante debe
poder defender todo lo entregado, así que explicar el porqué de cada decisión y no generar contenido que él no entienda.

## Antes de trabajar, leer

1. `docs/enunciado-literal.md`: **referencia obligatoria**. Transcripción textual del PDF. Todo lo que pide se cumple
   al pie de la letra y completo; no resumir, reinterpretar ni recortar sus requisitos.
2. `docs/checklist-enunciado.md`: cada requisito del enunciado, con su texto literal, dónde se cumple y su estado.
   Actualizarla cada vez que se avance; nada está terminado si su fila no está en "Cumplido" con evidencia.
3. `docs/contexto-de-clase.md`: lo que aclaró el profesor en clase y los "tres mundos". Complementa el enunciado,
   nunca lo reemplaza.
4. `docs/reglas-de-codigo.md`: reglas de código ("Power of 10" de NASA/JPL adaptadas) y de seguridad. Son obligatorias.
5. `docs/uso-ia.md`: registro obligatorio de prompts. **Agregar cada prompt relevante del estudiante, textual**, con
   el aporte de la IA; la columna de validación la completa el estudiante.

Materiales originales (no modificar): `materiales/enunciado/` y `materiales/clase/` (transcripción, notas y fotos de
la pizarra).

## Idea central

El artefacto es un **evaluador del riesgo de confidencialidad** que conecta tres mundos mediante una **matriz de
evaluación**: el administrativo (ISO 27001/27002, control interno, riesgo inherente 4 → residual 2), el de base de
datos (tareas del DBA: usuarios, privilegios, roles, perfiles, TDE, masking, backups, etc.) y el de herramientas
Oracle (consultas al diccionario, AUDIT, LogMiner y logs). Cada fila: Tarea · Factor de riesgo · Control ISO ·
Criterio 0-4 · Evidencia (script SQL) · Estado.

## Estructura

- `docs/`: contexto, marco teórico, informe, reglas y uso de IA.
- `sql/`: scripts de verificación y pruebas (uno por control o prueba), ejecutables en SQL Developer o SQL*Plus.
- `app/`: el artefacto interactivo.
- `materiales/`: insumos del curso, solo lectura.

## Reglas de trabajo

- No versionar secretos, wallets ni respaldos.
- Todo "Cumple" de la matriz debe tener su script y su salida como evidencia.
- No tocar los proyectos anteriores (`..\Administracion de Bases de datos`, contenedor `rman-lab`;
  `..\Estrategias-recuperacion`, contenedor `recu-lab`).
