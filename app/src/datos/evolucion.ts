// Series de la vista "Evolución" (mejora pedida por el profesor): cómo cambian en el tiempo la madurez de cada
// control, el nivel de cada factor de riesgo y el resultado de cada prueba. Todo sale de HISTORIAL, es decir, de
// mediciones reales con fecha (scripts/medir.ps1); nada se interpola: entre dos mediciones el valor se mantiene.
import { BATERIA, CONTROLES, HISTORIAL, PRUEBA_DE_ACEPTACION, RIESGOS } from './cargar.ts';
import { NOMBRE_NIVEL, RIESGO_RESIDUAL_ACEPTADO, nivelRiesgo } from './escalas.ts';
import type { Estado, MedicionBateria, MedicionEvaluacion, Riesgo, Valor15 } from './tipos.ts';

export type Dimension = 'controles' | 'riesgos' | 'pruebas';

export interface Punto {
    readonly t: number;
    readonly fecha: string;
    readonly etapa: string;
    readonly evidencia: string;
    readonly valor: number;
    readonly grupo: string;
}

export interface Serie {
    readonly id: string;
    readonly nombre: string;
    readonly puntos: readonly Punto[];
}

export interface Eje {
    readonly titulo: string;
    readonly min: number;
    readonly max: number;
    readonly marcas: readonly { readonly valor: number; readonly texto: string }[];
    readonly meta?: { readonly valor: number; readonly texto: string };
}

// Agrupación para los filtros rápidos ("los que no cumplen", etc.), según la última medición de cada serie.
export const GRUPOS: Readonly<Record<Dimension, readonly string[]>> = {
    controles: ['No cumple', 'Parcial', 'Cumple'],
    riesgos: ['Sobre la meta', 'En la meta'],
    pruebas: ['Sin el resultado esperado', 'Con el resultado esperado'],
};

// Nombre corto de cada nivel de madurez para el eje (la definición completa está en ESCALA_MADUREZ y en la Matriz).
const MADUREZ_CORTA = ['No existe', 'Existe', 'Se aplica', 'Documentado', 'Verificado'] as const;

export const EJE: Readonly<Record<Exclude<Dimension, 'pruebas'>, Eje>> = {
    controles: {
        titulo: 'Madurez (criterio 0-4)', min: 0, max: 4,
        marcas: ([0, 1, 2, 3, 4] as const).map((m) => ({ valor: m, texto: `${m} · ${MADUREZ_CORTA[m]}` })),
    },
    riesgos: {
        titulo: 'Nivel de riesgo (1-5)', min: 1, max: 5,
        marcas: ([1, 2, 3, 4, 5] as const).map((n) => ({ valor: n, texto: `${n} · ${NOMBRE_NIVEL[n]}` })),
        meta: { valor: RIESGO_RESIDUAL_ACEPTADO, texto: `Meta de la administración: ${RIESGO_RESIDUAL_ACEPTADO}` },
    },
};

export function ejePruebas(seleccionadas: number): Eje {
    const max = Math.max(1, seleccionadas);
    const paso = max > 10 ? 5 : max > 4 ? 2 : 1;
    const marcas = Array.from({ length: Math.floor(max / paso) + 1 }, (_, i) => ({ valor: i * paso, texto: String(i * paso) }))
        .filter((m) => max - m.valor >= paso / 2 || m.valor === max);
    if (marcas.at(-1)?.valor !== max) marcas.push({ valor: max, texto: String(max) });
    return { titulo: 'Pruebas con el resultado esperado', min: 0, max, marcas };
}

function punto(m: MedicionEvaluacion | MedicionBateria, valor: number, grupo: string): Punto {
    return { t: Date.parse(m.fecha), fecha: m.fecha, etapa: m.etapa, evidencia: m.evidencia, valor, grupo };
}

function estadoEn(e: MedicionEvaluacion, id: string): Estado | undefined {
    return e.controles.find((c) => c.control === id)?.estado;
}

// La batería de la misma etapa o, si no hay, la última anterior a la evaluación.
function bateriaDe(e: MedicionEvaluacion): MedicionBateria | undefined {
    const misma = HISTORIAL.baterias.find((b) => b.etapa === e.etapa);
    if (misma !== undefined) return misma;
    return HISTORIAL.baterias.filter((b) => Date.parse(b.fecha) <= Date.parse(e.fecha)).at(-1);
}

// Misma regla que posicionDe (cargar.ts) aplicada a una medición: el factor llega a su residual objetivo solo si
// todos sus controles cumplen, o si el único faltante es un riesgo aceptado cuya prueba lo demuestra.
export function nivelEnMedicion(r: Riesgo, e: MedicionEvaluacion): Valor15 {
    const bateria = bateriaDe(e);
    const aceptado = (id: string, estado: Estado | undefined): boolean => {
        const prueba = PRUEBA_DE_ACEPTACION[id as keyof typeof PRUEBA_DE_ACEPTACION];
        return prueba !== undefined && estado !== 'No cumple' && bateria?.pruebas.find((p) => p.id === prueba)?.paso === true;
    };
    const mitigado = CONTROLES.filter((c) => c.riesgos.includes(r.id)).every((c) => {
        const estado = estadoEn(e, c.id);
        return estado === 'Cumple' || aceptado(c.id, estado);
    });
    return mitigado ? nivelRiesgo(r.impactoObjetivo, r.probabilidadObjetivo) : nivelRiesgo(r.impacto, r.probabilidad);
}

function seriesControles(): Serie[] {
    return CONTROLES.map((c) => ({
        id: c.id,
        nombre: `${c.id} ${c.titulo}`,
        puntos: HISTORIAL.evaluaciones.map((e) => {
            const m = e.controles.find((x) => x.control === c.id);
            return punto(e, m?.madurez ?? 0, m?.estado ?? 'No cumple');
        }),
    }));
}

function seriesRiesgos(): Serie[] {
    return RIESGOS.map((r) => ({
        id: r.id,
        nombre: `${r.id} ${r.nombre}`,
        puntos: HISTORIAL.evaluaciones.map((e) => {
            const nivel = nivelEnMedicion(r, e);
            return punto(e, nivel, nivel > RIESGO_RESIDUAL_ACEPTADO ? 'Sobre la meta' : 'En la meta');
        }),
    }));
}

function seriesPruebas(): Serie[] {
    return BATERIA.antes.pruebas.map((p) => ({
        id: p.id,
        nombre: `${p.id} ${p.tipo}`,
        puntos: HISTORIAL.baterias.map((b) => {
            const paso = b.pruebas.find((x) => x.id === p.id)?.paso === true;
            return punto(b, paso ? 1 : 0, paso ? 'Con el resultado esperado' : 'Sin el resultado esperado');
        }),
    }));
}

export const SERIES: Readonly<Record<Dimension, readonly Serie[]>> = {
    controles: seriesControles(),
    riesgos: seriesRiesgos(),
    pruebas: seriesPruebas(),
};

export function grupoActual(s: Serie): string {
    return s.puntos.at(-1)?.grupo ?? '';
}

// Línea de resumen: promedio de madurez (controles), peor nivel (riesgos) o cuántas pruebas pasan (pruebas).
export function agregado(dim: Dimension, series: readonly Serie[]): Serie | undefined {
    const primera = series[0];
    if (primera === undefined) return undefined;
    const nombre = dim === 'controles' ? 'Madurez promedio' : dim === 'riesgos' ? 'Nivel de confidencialidad (el peor factor)' : 'Pruebas con el resultado esperado';
    const puntos = primera.puntos.map((p, i) => {
        const valores = series.map((s) => s.puntos[i]?.valor ?? 0);
        const suma = valores.reduce((a, b) => a + b, 0);
        const valor = dim === 'controles' ? suma / valores.length : dim === 'riesgos' ? Math.max(...valores) : suma;
        return { ...p, valor, grupo: '' };
    });
    return { id: 'agregado', nombre, puntos };
}

// Colores categóricos (5 ranuras validadas con el script de dataviz): el color sigue a la serie, no a su posición.
// Las series que siguen seleccionadas conservan su ranura; las nuevas toman la primera libre.
export const RANURAS = 5;

export function asignarColores(previo: ReadonlyMap<string, number>, seleccion: readonly string[]): Map<string, number> {
    const nuevo = new Map<string, number>();
    for (const id of seleccion) {
        const r = previo.get(id);
        if (r !== undefined) nuevo.set(id, r);
    }
    for (const id of seleccion) {
        if (nuevo.has(id)) continue;
        const usadas = new Set(nuevo.values());
        const libre = Array.from({ length: RANURAS }, (_, i) => i + 1).find((r) => !usadas.has(r));
        if (libre !== undefined) nuevo.set(id, libre);
    }
    return nuevo;
}

const NOMBRE_ETAPA: Readonly<Record<string, string>> = { antes: 'Evaluación inicial (antes)', despues: 'Evaluación final (después)' };

export function nombreEtapa(etapa: string): string {
    if (NOMBRE_ETAPA[etapa] !== undefined) return NOMBRE_ETAPA[etapa];
    if (/^C\d{2}$/.test(etapa)) return `Tras la corrección ${etapa}`;
    return etapa.startsWith('revision') ? 'Revisión de seguimiento' : etapa;
}

// "2026-10-25T10:12:30" → "25/10/2026 10:12" (hora local del laboratorio, como la escriben los scripts).
export function fechaCorta(fecha: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(fecha);
    return m === null ? fecha : `${m[3]}/${m[2]}/${m[1]} ${m[4]}`;
}
