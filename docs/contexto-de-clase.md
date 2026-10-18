# Contexto de la clase

Proyecto **individual**: "Controles ISO 27001:2022 para la Confidencialidad en Administración de Bases de Datos"
(Administración de Bases de Datos II, Prof. Johnny Villalobos Murillo, UNA, II ciclo 2026).

**Los requisitos no están aquí.** Se cumplen al pie de la letra según `docs/enunciado-literal.md` (transcripción
textual del PDF) y se controlan en `docs/checklist-enunciado.md`. Este documento solo recoge lo que el profesor
explicó en clase, como complemento: no reemplaza ni recorta nada del enunciado.

Fuentes: `materiales/clase/transcripcion-clase.txt`, `materiales/clase/notas-adrian.txt` y las tres fotos de la pizarra.

## Fechas

- Entrega final: unos 15 días después de la clase en que se asignó.
- **Avance obligatorio el jueves siguiente** a la asignación: "no demostrar el adelanto es una pérdida casi inmediata del proyecto".
- Hay revisiones opcionales en la oficina del profesor (lunes 8:00 a 12:00). Quien no va a revisiones conserva la nota que tenga.

## Lo que aclaró el profesor en clase

- El artefacto es "un **evaluador del riesgo de confidencialidad**": a la vez análisis de riesgos, mapeo de controles
  y matriz de evaluación. Puede ser HTML, PDF o sitio; sugirió **React "bien elegante y bien hecho"**, pero "lo que
  importa es que lo que se hace y se dice ahí sea lógico".
- Los "riesgos" del objetivo deben entenderse como **factores de riesgo**: lo que hace que el riesgo de
  confidencialidad se materialice. Los controles "matan" esos factores.
- Escenario del curso: el cliente tenía riesgo **8 · 8 · 4** (integridad · disponibilidad · confidencialidad).
  La administración pide llevarlo a **4 · 4 · 2**: ese es el **riesgo residual aceptado**. Cada control tiene un costo.
- **Controles observables**: controles que se pueden aplicar o verificar, en su mayoría **sentencias SQL de alto nivel**
  contra el Oracle del cliente, que determinan el nivel de exposición o corrigen un control que falta.
- **Madurez 0-4**: 0 no existe; 1 existe pero no se aplica constantemente; 2 se aplica constantemente pero no está
  documentado; 3 documentado; 4 documentado, aplicado y verificado con evidencia. Un control documentado sin evidencia
  de ejecución es un **fallo de control** (ejemplo: decir que hay respaldos RMAN y que al abrirlos no haya nada).
- **Estado "Cumple"**: el requisito pide A, B, C y D, y hay sentencias que demuestran cada parte (ejemplo A8.3).
- Es un control **preventivo**, no correctivo (correctivo sería recuperar la base).
- Prestar atención a `v$encryption_wallet` (dice si el monedero de TDE está abierto y si la base trabaja cifrada).
- Comentario sobre el proyecto RMAN: los **logs de respaldo están abiertos** y revelan dónde están los componentes de
  la base; deberían protegerse. Con el log y el BKP se podría intentar abrir los tablespaces si no están cifrados.
- Prueba técnica de ejemplo: cada semana abrir 2, 3 o 5 archivos de respaldo y sus logs, ver si dieron error y qué se
  hizo. Otra: reporte semanal de AUDIT de accesos no autorizados por privilegios heredados o cedidos.
- Trabajo **individual**; se revisa originalidad con Turnitin y con una IA "antagónica". Hay que **poder defender**
  todo lo que se entregue. Recomienda usar dos IA y contrastarlas.

## Las tres pizarras: los tres mundos que hay que conectar

"Quiero pegar este mundo con este y con este a través de una **matriz de evaluación**. Ese es el artefacto."

| Mundo | Pizarra | Contenido |
| --- | --- | --- |
| **Administrativo** | `pizarra-1-administrativa.jpeg` | ISO 27000 → análisis de control interno y exposición al riesgo → controles sugeridos. Integridad 8 → 4, disponibilidad 8 → 4, confidencialidad 4 → 2 (requisitos 8.1, 9.2, 9.5, 9.7, 10.1). Cada control cuesta (administración, afinamiento, respaldo, escenarios). Ley de Control Interno → administración de riesgos (SUGEF, SUGEVAL y supervisores del sistema financiero) → certificaciones ISACA e ISO |
| **Base de datos** | `pizarra-2-base-de-datos.jpeg` | Confidencialidad = acceso a datos, a datos sensibles y a copias no autorizadas. Se controla con **usuarios** (`CREATE USER ... IDENTIFIED BY ... DEFAULT TABLESPACE ... QUOTA`), **privilegios** directos y heredados (`GRANT ... ON t1 TO juan`; `GRANT EXECUTE ON sp001` da acceso indirecto a las tablas del procedimiento), **roles** (`CREATE ROLE vendedores`, `GRANT ... TO vendedores`, `GRANT vendedores TO juan`) y **perfiles** (idle time y demás) → **política de seguridad** (I, D, C). Esbozos de matriz y de clústeres (machine learning) |
| **Herramientas Oracle** | `pizarra-3-herramientas-oracle.jpeg` | **Redo online / archive logs** (cada registro: día, hora, usuario, sesión, identificador, SQL, éxito, texto SQL) → **LogMiner** para trazabilidad y fraudes, y como base de análisis con ML no supervisado. **AUDIT** (`AUD$` en el tablespace SYSAUX, apagado por defecto en XE) → trazabilidad del **uso**: conexiones, SELECT con éxito o fallo, horarios, accesos fuera de la política. No usar triggers para auditar (sobrecargan la base) |

Interpretación de trabajo: cada fila de la matriz une una **tarea del DBA** (mundo base de datos) con el **factor de
riesgo** y el **control ISO** (mundo administrativo) y con la **evidencia observable** obtenida con SQL, AUDIT o
LogMiner (mundo herramientas), y termina en un **criterio 0-4** y un **estado**, que permite pasar del riesgo
inherente al residual.

## Decisiones tomadas (17/10/2026)

- **Motor**: Oracle Database 21c XE en un contenedor Docker propio (`iso-lab`), para cumplir "Motor: Oracle 19c/21c XE"
  al pie de la letra. Con 21c se usa la auditoría tradicional (`AUDIT`, `AUD$`) explicada en clase. No se usan los
  contenedores de los otros proyectos (`rman-lab`, `recu-lab`).
- **Artefacto**: aplicación React + Vite + TypeScript en `app/` (el enunciado admite "interactivo HTML, PDF o sitio";
  el profesor sugirió React).
- **Repositorio**: https://github.com/Adrian123CRff/BD-ISO27001 (público). Por ser público, el material de clase
  (`materiales/clase/`: transcripción, notas y fotos) queda solo en el equipo local y fuera de git.
