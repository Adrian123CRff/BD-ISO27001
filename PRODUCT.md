# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Profesor del curso** (Administración de Bases de Datos II, UNA): evalúa el artefacto con la rúbrica del
  enunciado; lo abre desde el link del informe o el repositorio.
- **Estudiante expositor** (Adrián Fernández Fernández): lo presenta proyectado en clase (el profesor puede elegir a
  cualquiera para exponer en el avance) y lo usa para defender el trabajo: ir directo a un control, mostrar su script
  SQL y la salida real que lo respalda.
- **Compañeros de clase** que ven la exposición proyectada.

## Product Purpose

Evaluador del riesgo de confidencialidad de una base Oracle: conecta los "tres mundos" de la clase (administrativo
ISO 27001/27002, tareas del DBA y herramientas Oracle) mediante una matriz de evaluación. Muestra cómo el riesgo
inherente (4) de un cliente ficticio baja al residual aceptado (2) al aplicar controles, y prueba cada afirmación con
evidencia. Éxito: que el profesor pueda verificar, sin ayuda, que cada "Cumple" tiene su script y su salida.

## Positioning

No es una lista de controles con estados escritos a mano: cada estado, madurez y resultado de prueba sale de scripts
ejecutados contra un Oracle 21c XE real (una corrida antes y otra después de corregir), y la app enlaza cada fila con
el script y la salida que la producen.

## Operating Context

- Exposición en clase con proyector o pantalla compartida; avance obligatorio y defensa posterior ante el profesor.
- Video explicativo de 5 minutos grabado sobre la app.
- El enunciado pide: "artefacto (interactivo HTML, PDF o sitio)" e "Informe PDF con artefacto (o link a artefacto
  interactivo)". La app debe funcionar como sitio estático, sin Oracle corriendo, para poder publicarse y enlazarse.
- Idioma: español (Costa Rica).

## Capabilities and Constraints

- Contenido obligatorio (sección 6 del enunciado): tabla de riesgos R-CONF-01 a 05 con impacto y probabilidad; tabla de
  tareas del DBA; mapeo de controles ISO con implementación sugerida y evidencia observable; lista de 15 controles
  observables por auditor externo; matriz (Tarea | Riesgo | Control | Criterio 0-4 | Evidencia | Estado); batería de
  pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta). Además, metodología PHVA y uso de IA.
- Datos: `app/src/datos/` (dominio tipado y JSON generados por `scripts/evaluar.ps1` y `scripts/pruebas.ps1`); scripts
  en `sql/` y salidas en `evidencia/`. Nada se escribe a mano en los componentes.
- Reglas de código: `docs/reglas-de-codigo.md` (Power of 10 adaptadas): TypeScript estricto, funciones cortas, sin
  `any`, validación de datos al cargar.
- Stack: React + Vite + TypeScript (sugerido por el profesor), CSS propio con variables, sin librerías de UI pesadas.
- Abierto: dónde se publica el sitio estático (candidato: GitHub Pages del repositorio público).

## Brand Commitments

- Sin identidad visual obligatoria (el enunciado no exige ninguna). Textos institucionales del enunciado:
  "Universidad Nacional de Costa Rica | Escuela de Informática | II Ciclo 2026", curso "Administración de Bases de
  Datos", "Prof. Johnny Villalobos Murillo". No usar logos institucionales sin que el estudiante los entregue.

## Evidence on Hand

- Resultados reales de una corrida limpia: `app/src/datos/evaluacion-{antes,despues}.json` (17 controles) y
  `pruebas-{antes,despues}.json` (19 pruebas); salidas en `evidencia/`.
- Documentos: `docs/artefacto.md` (generado), `docs/procedimientos.md`, `docs/uso-ia.md`, `docs/marco-teorico-esquema.md`.
- El cliente ("Cooperativa Financiera del Valle") y todos sus datos son **ficticios y sintéticos**; no inventar
  clientes, cifras ni testimonios fuera de lo que generan los scripts.

## Product Principles

1. **Toda afirmación tiene evidencia**: ningún estado sin su script y su salida a uno o dos clics.
2. **Fiel al enunciado**: los seis contenidos de la sección 6 con sus nombres y columnas literales.
3. **Defendible en vivo**: llegar a cualquier control, riesgo o prueba en segundos durante una exposición.
4. **Honesto con los límites**: lo que no se cumple (A8.8, riesgo aceptado) se muestra como tal.

## Accessibility & Inclusion

WCAG 2.2 AA. Legible proyectado (contraste alto, texto grande) y los estados no dependen solo del color: deben
distinguirse también en escala de grises.
