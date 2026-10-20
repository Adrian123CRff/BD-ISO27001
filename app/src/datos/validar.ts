// Validación de los datos del artefacto al cargarlos (regla 5 de docs/reglas-de-codigo.md): cantidades del enunciado,
// referencias cruzadas sin huecos y coherencia con los resultados que generan los scripts. Devuelve la lista de
// errores; vacía significa datos válidos.
import { nivelRiesgo, RIESGO_INHERENTE_CLASE, RIESGO_RESIDUAL_ACEPTADO } from './escalas.ts';
import type { Bateria, Control, Evaluacion, ResultadoControl, Riesgo, Tarea } from './tipos.ts';

export interface Dominio {
    readonly riesgos: readonly Riesgo[];
    readonly tareas: readonly Tarea[];
    readonly controles: readonly Control[];
}

function sinRepetidos(ids: readonly (string | number)[], que: string): string[] {
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    return repetidos.map((id) => `${que} repetido: ${id}`);
}

function validarCantidades(d: Dominio): string[] {
    const errores: string[] = [];
    const delEnunciado = d.controles.filter((c) => !c.complementario).length;
    if (d.riesgos.length !== 5) errores.push(`Se esperaban 5 riesgos R-CONF y hay ${d.riesgos.length}`);
    if (d.tareas.length !== 12) errores.push(`Se esperaban 12 tareas del DBA y hay ${d.tareas.length}`);
    if (delEnunciado !== 15) errores.push(`Se esperaban 15 controles del enunciado y hay ${delEnunciado}`);
    return errores.concat(
        sinRepetidos(d.riesgos.map((r) => r.id), 'Riesgo'),
        sinRepetidos(d.tareas.map((t) => t.id), 'Tarea'),
        sinRepetidos(d.controles.map((c) => c.id), 'Control'),
    );
}

function validarReferencias(d: Dominio): string[] {
    const errores: string[] = [];
    const riesgos = new Set(d.riesgos.map((r) => r.id));
    const controles = new Set(d.controles.map((c) => c.id));
    for (const t of d.tareas) {
        for (const r of t.riesgos) if (!riesgos.has(r)) errores.push(`Tarea ${t.id}: riesgo inexistente ${r}`);
        for (const c of t.controles) if (!controles.has(c)) errores.push(`Tarea ${t.id}: control inexistente ${c}`);
    }
    for (const c of d.controles) {
        for (const r of c.riesgos) if (!riesgos.has(r)) errores.push(`Control ${c.id}: riesgo inexistente ${r}`);
        if (!d.tareas.some((t) => t.controles.includes(c.id))) errores.push(`Control ${c.id}: ninguna tarea lo usa`);
    }
    for (const r of d.riesgos) {
        if (!d.tareas.some((t) => t.riesgos.includes(r.id))) errores.push(`Riesgo ${r.id}: ninguna tarea lo atiende`);
        if (!d.controles.some((c) => c.riesgos.includes(r.id))) errores.push(`Riesgo ${r.id}: ningún control lo mitiga`);
    }
    return errores;
}

const EN_RANGO = (v: number): boolean => Number.isInteger(v) && v >= 1 && v <= 5;

function validarNiveles(d: Dominio): string[] {
    const errores: string[] = [];
    // Primero el rango 1-5: nivelRiesgo lanza una excepción con valores fuera de rango, y aquí se quiere un error
    // que la app muestre en pantalla, no una carga rota.
    for (const r of d.riesgos) {
        for (const [campo, v] of [['impacto', r.impacto], ['probabilidad', r.probabilidad], ['impacto objetivo', r.impactoObjetivo], ['probabilidad objetivo', r.probabilidadObjetivo]] as const) {
            if (!EN_RANGO(v)) errores.push(`${r.id}: ${campo} fuera de 1-5 (${v})`);
        }
    }
    if (errores.length > 0) return errores;
    const inherentes = d.riesgos.map((r) => nivelRiesgo(r.impacto, r.probabilidad));
    if (Math.max(...inherentes) !== RIESGO_INHERENTE_CLASE) {
        errores.push(`El riesgo inherente global debería ser ${RIESGO_INHERENTE_CLASE} y es ${Math.max(...inherentes)}`);
    }
    for (const r of d.riesgos) {
        if (nivelRiesgo(r.impactoObjetivo, r.probabilidadObjetivo) > RIESGO_RESIDUAL_ACEPTADO) {
            errores.push(`${r.id}: el residual objetivo supera el aceptado (${RIESGO_RESIDUAL_ACEPTADO})`);
        }
    }
    return errores;
}

// Estado y madurez se recalculan desde los criterios reales del JSON (no desde los totales que el mismo JSON declara),
// con la regla de scripts/evaluar.ps1: Cumple/Parcial/No cumple por criterios cumplidos; madurez 0 sin ninguno, 1 con
// algunos y 2-4 solo con todos.
function revisarResultado(fase: string, r: ResultadoControl): string[] {
    const errores: string[] = [];
    const total = r.criterios.length;
    const cumplidos = r.criterios.filter((k) => k.ok).length;
    const quien = `Evaluación ${fase}, ${r.control}`;
    if (total === 0) return [`${quien}: no tiene criterios`];
    if (r.total !== total || r.cumplidos !== cumplidos) errores.push(`${quien}: declara ${r.cumplidos}/${r.total} pero sus criterios dan ${cumplidos}/${total}`);
    const estado = cumplidos === total ? 'Cumple' : cumplidos > 0 ? 'Parcial' : 'No cumple';
    if (r.estado !== estado) errores.push(`${quien}: estado ${r.estado} no coincide con ${cumplidos}/${total} criterios`);
    const madurezValida = cumplidos === 0 ? r.madurez === 0 : cumplidos < total ? r.madurez === 1 : r.madurez >= 2 && r.madurez <= 4;
    if (!madurezValida) errores.push(`${quien}: madurez ${r.madurez} incoherente con ${cumplidos}/${total} criterios`);
    return errores;
}

function validarEvaluacion(d: Dominio, e: Evaluacion): string[] {
    const errores: string[] = [];
    const evaluados = new Set(e.controles.map((r) => r.control));
    for (const c of d.controles) if (!evaluados.has(c.id)) errores.push(`Evaluación ${e.fase}: falta ${c.id}`);
    for (const r of e.controles) {
        errores.push(...revisarResultado(e.fase, r));
        if (!d.controles.some((c) => c.id === r.control)) errores.push(`Evaluación ${e.fase}: control desconocido ${r.control}`);
    }
    return errores;
}

function validarBateria(d: Dominio, b: Bateria): string[] {
    const errores: string[] = [];
    for (const p of b.pruebas) {
        const control = d.controles.find((c) => c.id === p.control);
        const riesgo = d.riesgos.find((r) => r.id === p.riesgo);
        if (!control?.pruebas.includes(p.id)) errores.push(`Batería ${b.fase}: ${p.id} no figura en el control ${p.control}`);
        if (!riesgo?.pruebas.includes(p.id)) errores.push(`Batería ${b.fase}: ${p.id} no figura en el riesgo ${p.riesgo}`);
    }
    const ids = new Set(b.pruebas.map((p) => p.id));
    for (const c of d.controles) for (const p of c.pruebas) if (!ids.has(p)) errores.push(`Batería ${b.fase}: falta ${p} (${c.id})`);
    return errores;
}

export function validarArtefacto(d: Dominio, evaluaciones: readonly Evaluacion[], baterias: readonly Bateria[]): string[] {
    return validarCantidades(d).concat(
        validarReferencias(d),
        validarNiveles(d),
        ...evaluaciones.map((e) => validarEvaluacion(d, e)),
        ...baterias.map((b) => validarBateria(d, b)),
    );
}
