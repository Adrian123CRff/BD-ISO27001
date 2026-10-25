# Controles ISO 27001:2022 para la confidencialidad en la administración de bases de datos

Proyecto individual del curso Administración de Bases de Datos II (UNA, II ciclo 2026).

Artefacto: un evaluador del riesgo de confidencialidad en Oracle que conecta los controles ISO/IEC 27001:2022
(Anexo A) e ISO/IEC 27002:2022 con las tareas del DBA y con evidencia observable (scripts SQL), mediante una matriz
de evaluación con criterios de madurez 0-4.

| Carpeta | Contenido |
| --- | --- |
| `docs/` | Enunciado literal, lista de cumplimiento, contexto de la clase, reglas de código, registro de uso de IA, informe |
| `sql/` | Scripts de verificación y batería de pruebas |
| `app/` | Artefacto interactivo |
| `materiales/` | Enunciado del curso (el material de clase se conserva solo en local) |

Motor: Oracle Database 21c XE (Docker). Artefacto: React + Vite + TypeScript.

## Puesta en marcha

1. Crear `.env` en la raíz (no se versiona) con `ORACLE_PASSWORD`, `AUDITOR_PASSWORD`, `LAB_USER_PASSWORD` y
   `TDE_PASSWORD` (sin comillas, `&`, espacios ni `\`).
2. `.\scripts\iso-lab.ps1 -Crear` y esperar a que `.\scripts\iso-lab.ps1 -Estado` diga `Base lista: True`.
   Conexión desde SQL Developer: `localhost`, puerto `1526`, servicio `XEPDB1` (ver `docs/guia-sql-developer.md`).
3. Ciclo PHVA:
   - Planificar: `.\scripts\ejecutar-sql.ps1 sql-escenario.sql -Como sys` y `sql-auditor.sql -Como sys`.
   - Verificar (antes): `.\scripts\evaluar.ps1 -Fase antes` y `.\scripts\pruebas.ps1 -Fase antes`.
   - Hacer: `.\scripts\corregir.ps1` (C01-C15).
   - Verificar (después): `.\scripts\pruebas.ps1 -Fase despues` y `.\scripts\evaluar.ps1 -Fase despues`.
   - Actuar: revisión semanal programada; para adelantarla, `sql\mantenimiento\M02-revision-semanal.sql -Como sys`.
   - Seguimiento: `.\scripts\medir.ps1` agrega una medición con fecha al historial de la vista Evolución
     (`corregir.ps1` ya mide después de cada corrección).
4. Artefacto: `cd app`, `npm install`, `npm run build` y `npx vite preview` (http://localhost:4173).
5. Documentos generados desde los datos: `node scripts/generar-artefacto.mts` (`docs/artefacto.md`) y
   `node scripts/generar-informe.mts` (`docs/informe.md` y `docs/informe.pdf`).

Avance de requisitos en `docs/checklist-enunciado.md`.
