// Función de evaluación en el tiempo (pedida por el profesor en clase): cada evaluación E(t) de la empresa es una
// función de los 15 controles observables CO1..CO15, cada uno con un valor entre 0 y 1. E(t) se clasifica en
// verde, amarillo o rojo, y el diagnóstico dice qué controles explican el resultado y qué recomienda el auditor.
//
// - COi(t) = criterios cumplidos / criterios del control en la medición t (salida real de scripts/medir.ps1).
// - wi = suma de impacto × probabilidad / 5 (sin redondear) de los riesgos que mitiga: pesa más el que protege más
//   riesgo; los de R-CONF-02 y R-CONF-04 (impacto 5) quedan por encima del promedio.
// - E(t) = Σ wi·COi(t) / Σ wi.
// - Verde si E ≥ 0,80; amarillo si E ≥ 0,50; rojo si E < 0,50.
// - Veto: si un control de peso mayor que el promedio está en rojo, la evaluación no puede ser verde.
// Además del catálogo real hay tres catálogos simulados (mejora, deterioro y mixto), marcados como tales.
import { CONTROLES, HISTORIAL, RIESGOS } from './cargar.ts';
import { nombreEtapa } from './evolucion.ts';
import type { Control, IdControl } from './tipos.ts';

export type Color = 'Verde' | 'Amarillo' | 'Rojo';
export type IdCatalogo = 'real' | 'mejora' | 'deterioro' | 'mixto';

export const UMBRAL_VERDE = 0.8;
export const UMBRAL_AMARILLO = 0.5;

export interface Evaluacion {
    readonly id: string;
    readonly nombre: string;
    readonly fecha: string;
    readonly t: number;
    readonly co: ReadonlyMap<IdControl, number>;
}

export interface ResultadoControl {
    readonly control: Control;
    readonly peso: number;
    readonly co: number;
    readonly color: Color;
    readonly resta: number;
}

export interface Resultado {
    readonly e: number;
    readonly color: Color;
    readonly vetado: boolean;
    readonly controles: readonly ResultadoControl[];
}

// Los 15 controles que nombra el enunciado; A8.24 y A8.8 son complementarios y no entran en la función.
export const OBSERVABLES: readonly Control[] = CONTROLES.filter((c) => !c.complementario);

export const PESO: ReadonlyMap<IdControl, number> = new Map(OBSERVABLES.map((c) => [c.id, c.riesgos.reduce((s, id) => {
    const r = RIESGOS.find((x) => x.id === id);
    return s + (r === undefined ? 0 : (r.impacto * r.probabilidad) / 5);
}, 0)]));

const SUMA_PESOS = [...PESO.values()].reduce((a, b) => a + b, 0);
export const PESO_PROMEDIO = SUMA_PESOS / Math.max(1, PESO.size);

export function colorDe(valor: number): Color {
    return valor >= UMBRAL_VERDE ? 'Verde' : valor >= UMBRAL_AMARILLO ? 'Amarillo' : 'Rojo';
}

export function evaluar(ev: Evaluacion): Resultado {
    const controles = OBSERVABLES.map((c): ResultadoControl => {
        const peso = PESO.get(c.id) ?? 0;
        const co = ev.co.get(c.id) ?? 0;
        return { control: c, peso, co, color: colorDe(co), resta: (peso * (1 - co)) / SUMA_PESOS };
    }).sort((a, b) => b.resta - a.resta);
    const e = controles.reduce((s, r) => s + r.peso * r.co, 0) / SUMA_PESOS;
    const vetado = colorDe(e) === 'Verde' && controles.some((r) => r.color === 'Rojo' && r.peso > PESO_PROMEDIO);
    return { e, color: vetado ? 'Amarillo' : colorDe(e), vetado, controles };
}

function catalogoReal(): Evaluacion[] {
    return HISTORIAL.evaluaciones.map((m) => ({
        id: m.etapa,
        nombre: nombreEtapa(m.etapa),
        fecha: m.fecha,
        t: Date.parse(m.fecha),
        co: new Map(m.controles.map((c) => [c.control, c.total === 0 ? 0 : c.cumplidos / c.total])),
    }));
}

// Generador pseudoaleatorio con semilla fija: la simulación es la misma en cada carga (reproducible).
function generador(semilla: number): () => number {
    let s = semilla;
    return () => {
        s = (s * 1103515245 + 12345) % 2147483648;
        return s / 2147483648;
    };
}

const N_SIMULADAS = 17;
const PESADOS = [...OBSERVABLES].sort((a, b) => (PESO.get(b.id) ?? 0) - (PESO.get(a.id) ?? 0)).slice(0, 2).map((c) => c.id);

// Valor de un control en la evaluación k (0..16) según el escenario: inicio, fin y ruido acotado a [0, 1].
function valorSimulado(escenario: Exclude<IdCatalogo, 'real'>, id: IdControl, k: number, azar: () => number): number {
    const avance = k / (N_SIMULADAS - 1);
    const baja = escenario === 'deterioro' || (escenario === 'mixto' && PESADOS.includes(id));
    const inicio = baja ? 0.82 + azar() * 0.15 : 0.2 + azar() * 0.25;
    const fin = baja ? 0.25 + azar() * 0.2 : 0.85 + azar() * 0.13;
    const ruido = (azar() - 0.5) * 0.12;
    return Math.min(1, Math.max(0, inicio + (fin - inicio) * avance + ruido));
}

function catalogoSimulado(escenario: Exclude<IdCatalogo, 'real'>, semilla: number): Evaluacion[] {
    const azar = generador(semilla);
    const primera = Date.UTC(2026, 6, 6, 15);
    return Array.from({ length: N_SIMULADAS }, (_, k) => {
        const t = primera + k * 7 * 86_400_000;
        const etiqueta = `E${String(k + 1).padStart(2, '0')}`;
        return {
            id: etiqueta,
            nombre: `${etiqueta} (simulada)`,
            fecha: new Date(t).toISOString().slice(0, 19),
            t,
            co: new Map(OBSERVABLES.map((c) => [c.id, valorSimulado(escenario, c.id, k, azar)])),
        };
    });
}

export const CATALOGOS: Readonly<Record<IdCatalogo, { readonly texto: string; readonly evaluaciones: readonly Evaluacion[] }>> = {
    real: { texto: 'Mediciones reales', evaluaciones: catalogoReal() },
    mejora: { texto: 'Simulación: mejora', evaluaciones: catalogoSimulado('mejora', 11) },
    deterioro: { texto: 'Simulación: deterioro', evaluaciones: catalogoSimulado('deterioro', 23) },
    mixto: { texto: 'Simulación: mixta', evaluaciones: catalogoSimulado('mixto', 37) },
};

export const CONTROLES_PESADOS: readonly IdControl[] = PESADOS;

export function formato2(v: number): string {
    return v.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
