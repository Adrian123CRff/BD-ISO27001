// Genera docs/artefacto.md a partir de los mismos datos que usa la aplicación (app/src/datos), para que el documento
// y la pantalla nunca se contradigan. Si los datos no pasan la validación, no escribe nada y termina con error.
// Uso (Node 23.6 o superior, que ejecuta TypeScript directamente):  node scripts/generar-artefacto.mts
import { readFileSync, writeFileSync } from 'node:fs';
import { CONTROLES } from '../app/src/datos/controles.ts';
import { ESCALA_IMPACTO, ESCALA_MADUREZ, ESCALA_PROBABILIDAD, NOMBRE_NIVEL, REGLA_ESTADO, RIESGO_INHERENTE_CLASE,
         RIESGO_RESIDUAL_ACEPTADO, nivelRiesgo } from '../app/src/datos/escalas.ts';
import { RIESGOS } from '../app/src/datos/riesgos.ts';
import { TAREAS } from '../app/src/datos/tareas.ts';
import type { Bateria, Control, Evaluacion, Madurez, ResultadoControl } from '../app/src/datos/tipos.ts';
import { validarArtefacto } from '../app/src/datos/validar.ts';

const RAIZ = new URL('..', import.meta.url);

function leerJson<T>(ruta: string): T {
    return JSON.parse(readFileSync(new URL(ruta, RAIZ), 'utf8').replace(/^\uFEFF/, '')) as T;
}

function celda(texto: string): string {
    return texto.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function fila(valores: readonly string[]): string {
    return `| ${valores.map(celda).join(' | ')} |`;
}

function tabla(encabezados: readonly string[], filas: readonly (readonly string[])[]): string[] {
    return [fila(encabezados), fila(encabezados.map(() => '---')), ...filas.map(fila)];
}

function resultado(e: Evaluacion, control: Control): ResultadoControl {
    const r = e.controles.find((x) => x.control === control.id);
    if (r === undefined) throw new Error(`Sin resultado ${e.fase} para ${control.id}`);
    return r;
}

function seccionEscalas(): string[] {
    const madurez = ([0, 1, 2, 3, 4] as const).map((m: Madurez) => [String(m), ESCALA_MADUREZ[m].clase, ESCALA_MADUREZ[m].criterio]);
    return [
        '## Escalas', '',
        '**Impacto** (sobre la confidencialidad) y **probabilidad**, de 1 a 5:', '',
        ...tabla(['Valor', 'Impacto', 'Significado', 'Probabilidad', 'Significado'],
            ESCALA_IMPACTO.map((n, i) => [String(n.valor), n.nombre, n.significado, ESCALA_PROBABILIDAD[i].nombre, ESCALA_PROBABILIDAD[i].significado])),
        '',
        `**Nivel de riesgo** = ⌈impacto × probabilidad / 5⌉, de 1 (${NOMBRE_NIVEL[1]}) a 5 (${NOMBRE_NIVEL[5]}). El nivel global de`,
        'confidencialidad es el del peor factor. Así se expresa la meta del caso de clase: riesgo inherente',
        `${RIESGO_INHERENTE_CLASE} y residual aceptado ${RIESGO_RESIDUAL_ACEPTADO}.`, '',
        '**Madurez 0-4** (definida en clase y aplicada por `scripts/evaluar.ps1`):', '',
        ...tabla(['Nivel', 'Definición de clase', 'Criterio aplicado'], madurez), '',
        `**Estado**: ${REGLA_ESTADO}`, '',
    ];
}

function seccionRiesgos(): string[] {
    const filas = RIESGOS.map((r) => {
        const inh = nivelRiesgo(r.impacto, r.probabilidad);
        const obj = nivelRiesgo(r.impactoObjetivo, r.probabilidadObjetivo);
        return [r.id, `${r.nombre}: ${r.descripcion}`, r.categoria, `${r.impacto}. ${r.porQueImpacto}`,
            `${r.probabilidad}. ${r.porQueProbabilidad}`, `${inh} (${NOMBRE_NIVEL[inh]})`,
            `${obj} (${NOMBRE_NIVEL[obj]}): ${r.porQueObjetivo}`];
    });
    const global = Math.max(...RIESGOS.map((r) => nivelRiesgo(r.impacto, r.probabilidad)));
    return [
        '## 1. Tabla de riesgos R-CONF-01 a R-CONF-05 con impacto y probabilidad', '',
        ...tabla(['ID', 'Factor de riesgo', 'Clasificación', 'Impacto', 'Probabilidad', 'Riesgo inherente', 'Residual objetivo'], filas), '',
        `Riesgo inherente global de confidencialidad: **${global}**. Residual aceptado por la administración: **${RIESGO_RESIDUAL_ACEPTADO}**.`, '',
        'Situación de cada factor en el escenario inicial (`sql/01-escenario.sql`):', '',
        ...RIESGOS.map((r) => `- **${r.id}**: ${r.enElEscenario} Pruebas: ${r.pruebas.join(', ')}.`), '',
    ];
}

function seccionTareas(): string[] {
    const filas = TAREAS.map((t) => [String(t.id), t.nombre, t.queHaceElDba, t.riesgos.join(', '), t.controles.join(', ')]);
    return ['## 2. Tabla de tareas del DBA', '', ...tabla(['#', 'Tarea', 'Qué hace el DBA', 'Riesgos', 'Controles'], filas), ''];
}

function seccionMapeo(): string[] {
    const filas = CONTROLES.map((c) => [`${c.id}${c.complementario ? ' (complementario)' : ''}`, c.titulo, c.riesgos.join(', '),
        c.justificacion, `${c.implementacion} (${c.scriptsCorreccion.map((s) => `sql/correccion/${s}`).join(', ')})`,
        `${c.consultaAuditor} (sql/verificacion/${c.scriptVerificacion})`]);
    return [
        '## 3. Mapeo de controles ISO con implementación sugerida y evidencia observable', '',
        ...tabla(['Control', 'Título (ISO/IEC 27002:2022)', 'Riesgos', 'Justificación', 'Implementación sugerida', 'Evidencia observable'], filas), '',
    ];
}

function seccionObservables(): string[] {
    const linea = (c: Control, i: number): string =>
        `${i + 1}. **${c.id} ${c.titulo}**: \`${c.consultaAuditor}\`. Script: \`sql/verificacion/${c.scriptVerificacion}\` (ISO_AUDITOR, solo lectura).`;
    return [
        '## 4. Lista de 15 controles observables por auditor externo', '',
        'Cada control se observa con una consulta de solo lectura al diccionario, ejecutada como ISO_AUDITOR (el mismo privilegio que tendría un auditor externo):', '',
        ...CONTROLES.filter((c) => !c.complementario).map(linea), '',
        'Complementarios (tareas "cifrado TDE" y "parcheo"):', '',
        ...CONTROLES.filter((c) => c.complementario).map((c, i) => linea(c, 15 + i)), '',
    ];
}

function seccionMatriz(antes: Evaluacion, despues: Evaluacion): string[] {
    const filas = CONTROLES.map((c) => {
        const a = resultado(antes, c);
        const d = resultado(despues, c);
        const tareas = TAREAS.filter((t) => t.controles.includes(c.id)).map((t) => t.nombre).join(', ');
        const evidencia = `sql/verificacion/${c.scriptVerificacion}; evidencia/antes y evidencia/despues/${c.scriptVerificacion.replace('.sql', '.txt')}`;
        return [tareas, c.riesgos.join(', '), `${c.id} ${c.titulo}`, `${a.madurez} → ${d.madurez}`, evidencia,
            `${a.estado} (${a.cumplidos}/${a.total}) → ${d.estado} (${d.cumplidos}/${d.total})`];
    });
    return [
        '## 5. Matriz de evaluación (Tarea | Riesgo | Control | Criterio 0-4 | Evidencia | Estado)', '',
        `Antes: ${antes.fecha} · Después: ${despues.fecha} · ${despues.motor} · Ejecutado como ${despues.ejecutadoComo}.`, '',
        ...tabla(['Tarea', 'Riesgo', 'Control', 'Criterio 0-4 (antes → después)', 'Evidencia', 'Estado (antes → después)'], filas), '',
        'A8.8 queda en Parcial a propósito: Oracle 21c XE no recibe Release Updates y el riesgo está aceptado formalmente (`docs/procedimientos.md#a88`).', '',
    ];
}

function seccionBateria(antes: Bateria, despues: Bateria): string[] {
    const filas = antes.pruebas.map((p) => {
        const d = despues.pruebas.find((x) => x.id === p.id);
        const marca = (ok: boolean | undefined): string => (ok ? 'Resultado esperado' : 'Vulnerable / no obtenido');
        return [p.id, p.tipo, p.procedimiento, p.esperado, p.herramienta, `${p.control} · ${p.riesgo}`, marca(p.paso), marca(d?.paso)];
    });
    return [
        '## 6. Batería de pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta)', '',
        ...tabla(['ID', 'Tipo', 'Procedimiento', 'Resultado esperado', 'Herramienta', 'Control · Riesgo', 'Antes', 'Después'], filas), '',
        `Antes: ${antes.pruebas.filter((p) => p.paso).length} de ${antes.pruebas.length} con el resultado esperado · Después: ${despues.pruebas.filter((p) => p.paso).length} de ${despues.pruebas.length}. Evidencia en \`evidencia/<fase>/pruebas/\`.`, '',
    ];
}

const antes = leerJson<Evaluacion>('app/src/datos/evaluacion-antes.json');
const despues = leerJson<Evaluacion>('app/src/datos/evaluacion-despues.json');
const pruebasAntes = leerJson<Bateria>('app/src/datos/pruebas-antes.json');
const pruebasDespues = leerJson<Bateria>('app/src/datos/pruebas-despues.json');

const errores = validarArtefacto({ riesgos: RIESGOS, tareas: TAREAS, controles: CONTROLES }, [antes, despues], [pruebasAntes, pruebasDespues]);
if (errores.length > 0) {
    console.error(`Datos inválidos (${errores.length}):\n- ${errores.join('\n- ')}`);
    process.exit(1);
}

const documento = [
    '# Artefacto: evaluador del riesgo de confidencialidad', '',
    '> Generado por `scripts/generar-artefacto.mts` a partir de `app/src/datos/`. No editar a mano: cambiar los datos y volver a generar.', '',
    ...seccionEscalas(), ...seccionRiesgos(), ...seccionTareas(), ...seccionMapeo(), ...seccionObservables(),
    ...seccionMatriz(antes, despues), ...seccionBateria(pruebasAntes, pruebasDespues),
].join('\n');
writeFileSync(new URL('docs/artefacto.md', RAIZ), documento, 'utf8');
console.log(`docs/artefacto.md generado: ${RIESGOS.length} riesgos, ${TAREAS.length} tareas, ${CONTROLES.length} controles, ${pruebasDespues.pruebas.length} pruebas.`);
