// Vista "Función de evaluación": catálogo de evaluaciones de la empresa en el tiempo, E(t) con su semáforo, y el
// diagnóstico de la evaluación elegida (qué controles la bajan y qué recomienda el auditor).
import { useState } from 'react';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { GraficoPorEtapa, type SerieEtapa } from '../componentes/GraficoPorEtapa.tsx';
import { Icono } from '../componentes/Icono.tsx';
import { RIESGOS } from '../datos/cargar.ts';
import { MARCADOR_RIESGO, etiquetaEtapa, fechaCorta, type Eje, type Punto, type Serie } from '../datos/evolucion.ts';
import {
    CATALOGOS, PESO_PROMEDIO, UMBRAL_AMARILLO, UMBRAL_VERDE, evaluar, evaluarRiesgo, formato2,
    type Color, type Evaluacion, type IdCatalogo, type Resultado,
} from '../datos/funcion-evaluacion.ts';

const CLASE: Readonly<Record<Color, 'cumple' | 'parcial' | 'no-cumple'>> = { Verde: 'cumple', Amarillo: 'parcial', Rojo: 'no-cumple' };

function Semaforo({ color, detalle }: { readonly color: Color; readonly detalle?: string }) {
    const clase = CLASE[color];
    return (
        <span className={`estado estado--${clase}`}>
            <Icono nombre={clase} tamano={16} />{color}
            {detalle !== undefined && <span className="estado__detalle">{detalle}</span>}
        </span>
    );
}

const EJE_E: Eje = {
    titulo: 'Valor (0 a 1)', min: 0, max: 1,
    marcas: [
        { valor: 0, texto: '0' }, { valor: UMBRAL_AMARILLO, texto: '0,50 · rojo debajo' },
        { valor: UMBRAL_VERDE, texto: '0,80 · verde arriba' }, { valor: 1, texto: '1' },
    ],
    // Las líneas de umbral van sin texto propio: el eje ya los rotula y así no chocan con las etiquetas de las series.
    meta: { valor: UMBRAL_VERDE, texto: '' },
    metas: [{ valor: UMBRAL_AMARILLO, texto: '' }],
};

// Cada punto se ubica en t = índice de la evaluación (eje por etapa).
function serieDe(id: string, nombre: string, evs: readonly Evaluacion[], valor: (ev: Evaluacion) => number): Serie {
    return {
        id, nombre,
        puntos: evs.map((ev, i): Punto => ({ t: i, fecha: ev.fecha, etapa: ev.nombre, evidencia: '', valor: valor(ev), grupo: '' })),
    };
}

// Global (línea gruesa) y específico: E(t) restringida a los controles de cada riesgo.
function seriesDe(evs: readonly Evaluacion[]): SerieEtapa[] {
    return [
        ...RIESGOS.map((r, i): SerieEtapa => ({
            serie: serieDe(r.id, r.id, evs, (ev) => evaluarRiesgo(ev, r.id)),
            color: `var(--serie-${i + 1})`, marcador: MARCADOR_RIESGO[i] ?? 'circulo',
        })),
        { serie: serieDe('E(t)', 'E(t) global', evs, (ev) => evaluar(ev).e), color: 'var(--tinta)', marcador: 'circulo', gruesa: true },
    ];
}

function Catalogo({ evs, elegida, alElegir }: { readonly evs: readonly Evaluacion[]; readonly elegida: number; readonly alElegir: (i: number) => void }) {
    return (
        <div className="tabla-marco">
            <table className="tabla">
                <caption className="sr-only">Catálogo de evaluaciones con E(t) y semáforo</caption>
                <thead><tr><th scope="col">Evaluación</th><th scope="col">Fecha</th><th scope="col">E(t)</th><th scope="col">Semáforo</th><th scope="col">Control que más resta</th><th scope="col"><span className="sr-only">Acción</span></th></tr></thead>
                <tbody>
                    {evs.map((ev, i) => {
                        const r = evaluar(ev);
                        const previo = i > 0 ? evaluar(evs[i - 1] ?? ev).e : r.e;
                        const flecha = r.e > previo + 0.005 ? '↑' : r.e < previo - 0.005 ? '↓' : '=';
                        return (
                            <tr key={ev.id} className={i === elegida ? 'fila--activa' : undefined}>
                                <th scope="row">{ev.nombre}</th>
                                <td className="codigo">{fechaCorta(ev.fecha)}</td>
                                <td className="codigo">{formato2(r.e)} <span aria-label={flecha === '↑' ? 'sube' : flecha === '↓' ? 'baja' : 'igual'}>{flecha}</span></td>
                                <td><Semaforo color={r.color} detalle={r.vetado ? 'por veto' : undefined} /></td>
                                <td>{r.controles[0] !== undefined && r.controles[0].resta > 0 ? `${r.controles[0].control.id} (${formato2(r.controles[0].co)})` : '—'}</td>
                                <td><button type="button" className="boton" aria-pressed={i === elegida} onClick={() => alElegir(i)}>Diagnóstico</button></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function Diagnostico({ ev, r }: { readonly ev: Evaluacion; readonly r: Resultado }) {
    const fallan = r.controles.filter((c) => c.color !== 'Verde');
    return (
        <section className="tarjeta" aria-labelledby="diag-titulo">
            <div className="tarjeta__cabeza">
                <h2 id="diag-titulo" className="tarjeta__titulo">Diagnóstico: {ev.nombre}, {fechaCorta(ev.fecha)}</h2>
                <Semaforo color={r.color} detalle={`E(t) = ${formato2(r.e)}`} />
            </div>
            {r.vetado && <p className="parrafo">El promedio ponderado llega a verde, pero un control de peso alto está en rojo: por la regla de veto la evaluación queda en amarillo.</p>}
            <div className="tabla-marco">
                <table className="tabla">
                    <caption className="sr-only">Controles ordenados por lo que restan a E(t)</caption>
                    <thead><tr><th scope="col">Control</th><th scope="col">COᵢ</th><th scope="col">Semáforo</th><th scope="col">Peso wᵢ</th><th scope="col">Resta a E(t)</th></tr></thead>
                    <tbody>
                        {r.controles.map((c) => (
                            <tr key={c.control.id}>
                                <th scope="row">{c.control.id} {c.control.titulo}</th>
                                <td className="codigo">{formato2(c.co)}</td>
                                <td><Semaforo color={c.color} /></td>
                                <td className="codigo">{formato2(c.peso)}{c.peso > PESO_PROMEDIO ? ' (alto)' : ''}</td>
                                <td className="codigo">{formato2(c.resta)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h3 className="tarjeta__titulo">Recomendaciones del auditor</h3>
            {fallan.length === 0
                ? <p className="parrafo">Los 15 controles están en verde: mantener la revisión semanal para conservar el resultado.</p>
                : <ol className="lista">{fallan.slice(0, 3).map((c) => (
                    <li key={c.control.id}><strong>{c.control.id} {c.control.titulo}</strong> ({c.color.toLowerCase()}, COᵢ = {formato2(c.co)}): {c.control.implementacion} Script: <span className="codigo">{c.control.scriptsCorreccion.join(', ')}</span>.</li>
                ))}</ol>}
        </section>
    );
}

const IDS: readonly IdCatalogo[] = ['real', 'mejora', 'deterioro', 'mixto'];

export function FuncionEvaluacion() {
    const [catalogo, setCatalogo] = useState<IdCatalogo>('real');
    const evs = CATALOGOS[catalogo].evaluaciones;
    const [elegida, setElegida] = useState(evs.length - 1);
    const i = Math.min(elegida, evs.length - 1);
    const ev = evs[i];
    if (ev === undefined) return null;
    const r = evaluar(ev);
    return (
        <>
            <CabeceraVista titulo="Función de evaluación E(t)">
                <p className="vista-cabeza__sub">Cada evaluación de la empresa es una función de los 15 controles observables (COᵢ entre 0 y 1). El catálogo muestra E(t) en el tiempo con su semáforo, y el diagnóstico dice qué controles explican el resultado.</p>
            </CabeceraVista>
            <section className="tarjeta" aria-label="Definición de la función">
                <p className="codigo">E(t) = Σ wᵢ · COᵢ(t) / Σ wᵢ</p>
                <ul className="lista">
                    <li><strong>COᵢ(t)</strong> = criterios cumplidos / criterios del control i en la evaluación t (salida de su script de verificación).</li>
                    <li><strong>wᵢ</strong> = suma de impacto × probabilidad / 5 de los riesgos que mitiga el control: pesa más el que protege más riesgo. Peso alto = por encima del promedio ({formato2(PESO_PROMEDIO)}).</li>
                    <li><strong>Semáforo:</strong> verde si E ≥ 0,80; amarillo si E ≥ 0,50; rojo si E &lt; 0,50. <strong>Veto:</strong> si un control de peso alto está en rojo, la evaluación no puede ser verde.</li>
                </ul>
            </section>
            <div className="fase" role="group" aria-label="Catálogo de evaluaciones">
                {IDS.map((id) => (
                    <button key={id} type="button" className="fase__opcion" aria-pressed={catalogo === id}
                            onClick={() => { setCatalogo(id); setElegida(CATALOGOS[id].evaluaciones.length - 1); }}>{CATALOGOS[id].texto}</button>
                ))}
            </div>
            {catalogo !== 'real' && <p className="parrafo">Catálogo simulado (valores generados con semilla fija para ver el comportamiento de la función); no son mediciones del laboratorio.</p>}
            <GraficoPorEtapa key={catalogo} series={seriesDe(evs)} etapas={evs.map((x) => etiquetaEtapa(x.id))} eje={EJE_E} formato={formato2}
                             seleccion={i} detalle={(k) => { const x = evs[k]; return x === undefined ? undefined : `Semáforo: ${evaluar(x).color}`; }}
                             nota="E(t) global en la línea gruesa; cada riesgo con su color y su forma (la misma función con solo sus controles). Las líneas horizontales son los umbrales del semáforo; la vertical punteada, la evaluación del diagnóstico. Cada punto es una evaluación; la línea solo las une." />
            <Catalogo evs={evs} elegida={i} alElegir={setElegida} />
            <Diagnostico ev={ev} r={r} />
        </>
    );
}
