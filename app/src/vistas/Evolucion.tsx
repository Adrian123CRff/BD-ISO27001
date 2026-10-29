// Vista "Evolución" (mejora pedida por el profesor tras revisar el artefacto): un gráfico en el tiempo de los controles,
// los factores de riesgo o las pruebas, eligiendo cuáles ver (todos, uno por uno o por estado) y el tramo de fechas.
// Cada punto es una medición real del historial (scripts/medir.ps1); la tabla muestra los mismos datos sin gráfico.
import { useRef, useState, type KeyboardEvent } from 'react';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { GraficoEvolucion, type Trazo } from '../componentes/GraficoEvolucion.tsx';
import { GraficoPorEtapa, type SerieEtapa } from '../componentes/GraficoPorEtapa.tsx';
import { NavegadorFechas, type Rango } from '../componentes/NavegadorFechas.tsx';
import { SelectorSeries } from '../componentes/SelectorSeries.tsx';
import { EVALUACION, HISTORIAL } from '../datos/cargar.ts';
import { EJE, MARCADOR_RIESGO, RANURAS, SERIES, agregado, asignarColores, ejePruebas, fechaCorta, madurezPorRiesgo, nombreEtapa, type Dimension, type Serie } from '../datos/evolucion.ts';

const DIMENSIONES: readonly { readonly id: Dimension; readonly texto: string }[] = [
    { id: 'controles', texto: 'Controles' }, { id: 'riesgos', texto: 'Riesgos' }, { id: 'pruebas', texto: 'Pruebas' },
];
const TODAS = (d: Dimension): string[] => SERIES[d].map((s) => s.id);

function formato(v: number): string {
    return Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',');
}

function InterruptorDimension({ valor, alCambiar }: { readonly valor: Dimension; readonly alCambiar: (d: Dimension) => void }) {
    const botones = useRef<Partial<Record<Dimension, HTMLButtonElement | null>>>({});
    const conTeclado = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const i = DIMENSIONES.findIndex((d) => d.id === valor);
        const otra = DIMENSIONES[(i + (e.key === 'ArrowRight' ? 1 : DIMENSIONES.length - 1)) % DIMENSIONES.length]?.id ?? valor;
        alCambiar(otra);
        botones.current[otra]?.focus();
    };
    return (
        <div className="fase" role="radiogroup" aria-label="Qué graficar" onKeyDown={conTeclado}>
            {DIMENSIONES.map((d) => (
                <button key={d.id} ref={(b) => { botones.current[d.id] = b; }} type="button" role="radio" aria-checked={valor === d.id}
                        tabIndex={valor === d.id ? 0 : -1} className="fase__opcion" onClick={() => alCambiar(d.id)}>{d.texto}</button>
            ))}
        </div>
    );
}

// Con 5 series o menos, cada una con su color (y etiqueta directa hasta 4); con más, todas en gris con la línea de
// resumen resaltada, y la que se señala en la lista se pinta encima. Las pruebas se resumen en una sola línea.
function construirTrazos(dim: Dimension, series: readonly Serie[], ranuras: ReadonlyMap<string, number>, destacada: string | null): Trazo[] {
    const resumen = agregado(dim, series);
    if (resumen === undefined) return [];
    if (dim === 'pruebas') return [{ serie: resumen, color: 'var(--serie-1)', clase: 'resumen', etiqueta: false }];
    if (series.length <= RANURAS) {
        return series.map((s) => ({ serie: s, color: `var(--serie-${ranuras.get(s.id) ?? 1})`, clase: 'color', etiqueta: series.length <= 4 }));
    }
    const gris = series.map((s): Trazo => ({ serie: s, color: 'var(--tinta-3)', clase: 'gris', etiqueta: false }));
    const marcada = series.find((s) => s.id === destacada);
    const extra: Trazo[] = marcada === undefined ? [] : [{ serie: marcada, color: 'var(--serie-1)', clase: 'destacada', etiqueta: true }];
    return [{ serie: resumen, color: 'var(--tinta)', clase: 'resumen', etiqueta: true }, ...gris, ...extra];
}

function detalleDe(dim: Dimension, series: readonly Serie[], indice: number): string | undefined {
    const puntos = series.map((s) => ({ id: s.id, p: s.puntos[indice] }));
    if (dim === 'pruebas') {
        const fallan = puntos.filter((x) => x.p?.valor === 0).map((x) => x.id);
        return fallan.length === 0 ? 'Todas las seleccionadas con el resultado esperado' : `Sin el resultado esperado: ${fallan.join(', ')}`;
    }
    if (dim === 'riesgos') return `Nivel de confidencialidad (el peor factor): ${Math.max(...puntos.map((x) => x.p?.valor ?? 0))}`;
    const cuenta = (g: string): number => puntos.filter((x) => x.p?.grupo === g).length;
    return `Seleccionados: ${cuenta('Cumple')} en Cumple · ${cuenta('Parcial')} en Parcial · ${cuenta('No cumple')} en No cumple`;
}

function rangosDe(): { min: number; max: number; rangos: Rango[] } {
    const tiempos = [...HISTORIAL.evaluaciones, ...HISTORIAL.baterias].map((m) => Date.parse(m.fecha));
    const min = Math.min(...tiempos);
    const max = Math.max(...tiempos);
    const margen = Math.max(60_000, (max - min) * 0.03);
    const todo: Rango = { id: 'todo', texto: 'Todo el historial', valor: [min - margen, max + margen] };
    const ciclo: Rango = { id: 'ciclo', texto: 'Ciclo de corrección', valor: [Date.parse(EVALUACION.antes.fecha) - margen, Date.parse(EVALUACION.despues.fecha) + margen] };
    const semana: Rango = { id: 'semana', texto: 'Últimos 7 días', valor: [max - 7 * 86_400_000, max + margen] };
    const distintos = [todo, ciclo, semana].filter((r, i, l) => r.valor[0] >= todo.valor[0] && l.findIndex((o) => o.valor[0] === r.valor[0] && o.valor[1] === r.valor[1]) === i);
    return { min: todo.valor[0], max: todo.valor[1], rangos: distintos };
}

function Leyenda({ trazos }: { readonly trazos: readonly Trazo[] }) {
    if (trazos.length < 2) return null;
    const gris = trazos.some((t) => t.clase === 'gris');
    const claves = gris ? trazos.filter((t) => t.clase !== 'gris') : trazos;
    return (
        <figcaption className="evo__leyenda">
            {claves.map((t) => <span key={t.serie.id} className="evo__clave"><i style={{ background: t.color }} />{t.clase === 'resumen' ? `${t.serie.nombre} de los seleccionados` : t.serie.nombre}</span>)}
            {gris && <span className="evo__clave"><i className="evo__clave--gris" />Cada elemento seleccionado (señale uno en la lista para resaltarlo)</span>}
        </figcaption>
    );
}

interface PropsTabla {
    readonly series: readonly Serie[];
    readonly resumen: Serie | undefined;
    readonly rango: readonly [number, number];
    readonly texto: (s: Serie, valor: number) => string;
}

function Tabla({ series, resumen, rango, texto }: PropsTabla) {
    const columnas = resumen === undefined ? series : [resumen, ...series];
    const filas = (columnas[0]?.puntos ?? []).map((p, i) => ({ p, i })).filter(({ p }) => p.t >= rango[0] && p.t <= rango[1]);
    return (
        <details className="evo__tabla">
            <summary>Ver los datos como tabla ({filas.length} mediciones)</summary>
            <div className="tabla-marco">
                <table className="tabla">
                    <thead><tr><th scope="col">Fecha</th><th scope="col">Medición</th><th scope="col">Evidencia</th>
                        {columnas.map((s) => <th key={s.id} scope="col">{s.id === 'agregado' ? s.nombre : s.id}</th>)}</tr></thead>
                    <tbody>
                        {filas.map(({ p, i }) => (
                            <tr key={p.t}>
                                <td className="codigo">{fechaCorta(p.fecha)}</td><td>{nombreEtapa(p.etapa)}</td><td className="codigo">{p.evidencia}</td>
                                {columnas.map((s) => <td key={s.id}>{texto(s, s.puntos[i]?.valor ?? 0)}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </details>
    );
}

// Madurez media de los controles de cada riesgo en cada medición, con el eje por etapa (Antes, C01…C15, Después).
function PorRiesgo() {
    const { etapas, riesgos, promedio } = madurezPorRiesgo();
    const series: SerieEtapa[] = [
        ...riesgos.map((s, i): SerieEtapa => ({ serie: s, color: `var(--serie-${i + 1})`, marcador: MARCADOR_RIESGO[i] ?? 'circulo' })),
        { serie: promedio, color: 'var(--tinta)', marcador: 'circulo', gruesa: true },
    ];
    return (
        <section className="evo__seccion" aria-labelledby="por-riesgo">
            <h2 id="por-riesgo" className="tarjeta__titulo">Madurez media por riesgo, tras cada corrección</h2>
            <GraficoPorEtapa series={series} etapas={etapas} eje={EJE.controles} formato={formato}
                             nota="Cada punto es una medición real (scripts/medir.ps1): nada se calcula entre etapas. Cada línea es la madurez media de los controles que mitigan ese riesgo; la gruesa, el promedio de los 17 controles. Se ve qué corrección movió cada riesgo, por ejemplo C14, que aprueba los procedimientos y corre la revisión semanal." />
        </section>
    );
}

function Resumen({ serie, rango }: { readonly serie: Serie | undefined; readonly rango: readonly [number, number] }) {
    const puntos = serie?.puntos.filter((p) => p.t >= rango[0] && p.t <= rango[1]) ?? [];
    const primero = puntos[0];
    const ultimo = puntos.at(-1);
    if (serie === undefined || primero === undefined || ultimo === undefined) return null;
    return (
        <p className="parrafo">
            <b>{serie.nombre}:</b> {formato(primero.valor)} el {fechaCorta(primero.fecha)} → <b>{formato(ultimo.valor)}</b> el {fechaCorta(ultimo.fecha)} ({puntos.length} mediciones en el tramo).
        </p>
    );
}

export function Evolucion() {
    const [dim, setDim] = useState<Dimension>('controles');
    const [seleccion, setSeleccion] = useState<Record<Dimension, readonly string[]>>({ controles: TODAS('controles'), riesgos: TODAS('riesgos'), pruebas: TODAS('pruebas') });
    const [ranuras, setRanuras] = useState<Record<Dimension, ReadonlyMap<string, number>>>({
        controles: asignarColores(new Map(), TODAS('controles')), riesgos: asignarColores(new Map(), TODAS('riesgos')), pruebas: new Map(),
    });
    const [destacada, setDestacada] = useState<string | null>(null);
    const { min, max, rangos } = rangosDe();
    const [rango, setRango] = useState<readonly [number, number]>([min, max]);
    const elegidas = SERIES[dim].filter((s) => seleccion[dim].includes(s.id));
    const trazos = construirTrazos(dim, elegidas, ranuras[dim], destacada);
    const eje = dim === 'pruebas' ? ejePruebas(elegidas.length) : EJE[dim];
    const enColor = dim !== 'pruebas' && elegidas.length <= RANURAS;
    const colores = new Map(enColor ? elegidas.map((s) => [s.id, `var(--serie-${ranuras[dim].get(s.id) ?? 1})`] as const) : []);
    const cambiarSeleccion = (ids: readonly string[]): void => {
        setSeleccion((s) => ({ ...s, [dim]: ids }));
        setRanuras((r) => ({ ...r, [dim]: asignarColores(r[dim], ids) }));
    };
    return (
        <>
            <CabeceraVista titulo="Evolución en el tiempo">
                <p className="vista-cabeza__sub">Cómo cambian los controles, los riesgos y las pruebas en cada medición real: la evaluación inicial, después de cada corrección (C01-C15), la evaluación final y las revisiones de seguimiento.</p>
            </CabeceraVista>
            <div className="evo__filtros">
                <InterruptorDimension valor={dim} alCambiar={(d) => { setDim(d); setDestacada(null); }} />
                <NavegadorFechas serie={agregado(dim, SERIES[dim])} min={min} max={max} rango={rango} rangos={rangos} alCambiar={setRango} />
            </div>
            <div className="evo">
                <SelectorSeries dimension={dim} series={SERIES[dim]} seleccion={seleccion[dim]} colores={colores} alCambiar={cambiarSeleccion} alDestacar={setDestacada} />
                <figure className="evo__figura">
                    {trazos.length === 0
                        ? <p className="evo__vacio">Elija al menos un elemento en la lista para ver su evolución.</p>
                        : <GraficoEvolucion eje={eje} trazos={trazos} rango={rango} formato={formato} detalle={(i) => detalleDe(dim, elegidas, i)} />}
                    <Leyenda trazos={trazos} />
                    <Resumen serie={agregado(dim, elegidas)} rango={rango} />
                </figure>
            </div>
            <PorRiesgo />
            <Tabla series={elegidas} resumen={agregado(dim, elegidas)} rango={rango}
                   texto={(s, v) => (dim === 'pruebas' && s.id !== 'agregado' ? (v === 1 ? 'Sí' : 'No') : formato(v))} />
            <p className="parrafo evo__nota">Cada punto es una medición real con su fecha y su evidencia (<span className="codigo">scripts/medir.ps1</span>, que ejecuta los 18 scripts de verificación y las 19 pruebas); entre dos mediciones el valor se mantiene, por eso las líneas son escalonadas. En riesgos, el nivel de cada factor baja a su residual solo cuando todos sus controles cumplen. Las líneas con el mismo valor se superponen: el detalle (al señalar el gráfico) y la tabla muestran cada valor.</p>
        </>
    );
}
