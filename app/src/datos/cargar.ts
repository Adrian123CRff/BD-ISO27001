// Carga única de los datos del artefacto (regla 3: todo se carga al inicio y no crece). Los resultados vienen de los
// JSON que generan scripts/evaluar.ps1 y scripts/pruebas.ps1; los scripts SQL y sus salidas se leen de sql/ y
// evidencia/ tal como están en el repositorio. Todo pasa por validarArtefacto antes de mostrarse (regla 5).
import { CONTROLES as CONTROLES_REALES } from './controles.ts';
import { nivelRiesgo } from './escalas.ts';
import { conjuntoExtremo, type Conjunto } from './extremo.ts';
import { RIESGOS as RIESGOS_REALES } from './riesgos.ts';
import { TAREAS } from './tareas.ts';
import type { Bateria, Control, Evaluacion, IdControl, IdRiesgo, ResultadoControl, Riesgo, Valor15 } from './tipos.ts';
import { validarArtefacto } from './validar.ts';
import evaluacionAntes from './evaluacion-antes.json';
import evaluacionDespues from './evaluacion-despues.json';
import pruebasAntes from './pruebas-antes.json';
import pruebasDespues from './pruebas-despues.json';

export type Fase = 'antes' | 'despues';

// Los JSON se validan campo por campo en validarArtefacto; aquí solo se les da su tipo declarado.
const REAL: Conjunto = {
    riesgos: RIESGOS_REALES,
    controles: CONTROLES_REALES,
    evaluacion: { antes: evaluacionAntes as unknown as Evaluacion, despues: evaluacionDespues as unknown as Evaluacion },
    bateria: { antes: pruebasAntes as unknown as Bateria, despues: pruebasDespues as unknown as Bateria },
};

// Prueba de casos extremos (break-ui): solo en desarrollo y con ?datos=extremo; en producción esta rama no existe.
const DATOS: Conjunto = import.meta.env.DEV && new URLSearchParams(window.location.search).get('datos') === 'extremo'
    ? conjuntoExtremo(REAL)
    : REAL;

export const RIESGOS: readonly Riesgo[] = DATOS.riesgos;
export const CONTROLES: readonly Control[] = DATOS.controles;
export const EVALUACION: Readonly<Record<Fase, Evaluacion>> = DATOS.evaluacion;
export const BATERIA: Readonly<Record<Fase, Bateria>> = DATOS.bateria;

export const ERRORES_DE_DATOS: readonly string[] = validarArtefacto(
    { riesgos: RIESGOS, tareas: TAREAS, controles: CONTROLES },
    [EVALUACION.antes, EVALUACION.despues],
    [BATERIA.antes, BATERIA.despues],
);

const SCRIPTS = import.meta.glob<string>('../../../sql/verificacion/*.sql', { query: '?raw', import: 'default', eager: true });
const SALIDAS: Readonly<Record<Fase, Record<string, string>>> = {
    antes: import.meta.glob<string>('../../../evidencia/antes/V*.txt', { query: '?raw', import: 'default', eager: true }),
    despues: import.meta.glob<string>('../../../evidencia/despues/V*.txt', { query: '?raw', import: 'default', eager: true }),
};

function buscarPorNombre(archivos: Record<string, string>, nombre: string): string {
    const clave = Object.keys(archivos).find((ruta) => ruta.endsWith(`/${nombre}`));
    return clave === undefined ? `(No se encontró ${nombre})` : (archivos[clave] ?? '');
}

export interface Evidencia {
    readonly rutaScript: string;
    readonly script: string;
    readonly rutaSalida: string;
    readonly salida: string;
}

export function evidenciaDe(control: Control, fase: Fase): Evidencia {
    const salida = control.scriptVerificacion.replace('.sql', '.txt');
    return {
        rutaScript: `sql/verificacion/${control.scriptVerificacion}`,
        script: buscarPorNombre(SCRIPTS, control.scriptVerificacion),
        rutaSalida: `evidencia/${fase}/${salida}`,
        salida: buscarPorNombre(SALIDAS[fase], salida),
    };
}

const SCRIPTS_PRUEBA = import.meta.glob<string>('../../../sql/pruebas/P*', { query: '?raw', import: 'default', eager: true });
const SALIDAS_PRUEBA: Readonly<Record<Fase, Record<string, string>>> = {
    antes: import.meta.glob<string>('../../../evidencia/antes/pruebas/P*.txt', { query: '?raw', import: 'default', eager: true }),
    despues: import.meta.glob<string>('../../../evidencia/despues/pruebas/P*.txt', { query: '?raw', import: 'default', eager: true }),
};

export function evidenciaDePrueba(script: string, fase: Fase): Evidencia {
    const salida = script.replace(/\.(sql|sh)$/, '.txt');
    return {
        rutaScript: `sql/pruebas/${script}`,
        script: buscarPorNombre(SCRIPTS_PRUEBA, script),
        rutaSalida: `evidencia/${fase}/pruebas/${salida}`,
        salida: buscarPorNombre(SALIDAS_PRUEBA[fase], salida),
    };
}

export function resultadoDe(id: IdControl, fase: Fase): ResultadoControl | undefined {
    return EVALUACION[fase].controles.find((r) => r.control === id);
}

// Situación de un factor de riesgo en una fase: en "antes" está en su celda inherente; en "despues" llega a su
// residual objetivo solo si la evaluación lo respalda (todos sus controles en Cumple, o el único faltante es un
// riesgo aceptado formalmente, A8.8).
export type Logro = 'inherente' | 'alcanzado' | 'aceptado' | 'pendiente';

export interface Posicion {
    readonly impacto: Valor15;
    readonly probabilidad: Valor15;
    readonly nivel: Valor15;
    readonly logro: Logro;
    readonly sinCumplir: readonly IdControl[];
}

const RIESGO_ACEPTADO: readonly IdControl[] = ['A8.8'];

export function posicionDe(riesgo: Riesgo, fase: Fase): Posicion {
    const inherente = { impacto: riesgo.impacto, probabilidad: riesgo.probabilidad, nivel: nivelRiesgo(riesgo.impacto, riesgo.probabilidad) };
    if (fase === 'antes') return { ...inherente, logro: 'inherente', sinCumplir: [] };
    const sinCumplir = CONTROLES.filter((c) => c.riesgos.includes(riesgo.id))
        .filter((c) => resultadoDe(c.id, 'despues')?.estado !== 'Cumple')
        .map((c) => c.id);
    if (sinCumplir.some((id) => !RIESGO_ACEPTADO.includes(id))) return { ...inherente, logro: 'pendiente', sinCumplir };
    return {
        impacto: riesgo.impactoObjetivo,
        probabilidad: riesgo.probabilidadObjetivo,
        nivel: nivelRiesgo(riesgo.impactoObjetivo, riesgo.probabilidadObjetivo),
        logro: sinCumplir.length > 0 ? 'aceptado' : 'alcanzado',
        sinCumplir,
    };
}

export function nivelGlobal(fase: Fase): Valor15 {
    const niveles = RIESGOS.map((r) => posicionDe(r, fase).nivel);
    return Math.max(...niveles) as Valor15;
}

export function riesgoPorId(id: IdRiesgo): Riesgo {
    const r = RIESGOS.find((x) => x.id === id);
    if (r === undefined) throw new Error(`Riesgo desconocido: ${id}`);
    return r;
}

export { TAREAS };
