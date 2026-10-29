// Gráfico por etapas: una línea por serie (cada una con su color y su forma de marcador), una línea gruesa de resumen
// y fichas arriba para mostrar u ocultar cada serie. El eje X va por evaluación (Antes, C01…, Después o E01…E17), así
// se lee qué etapa movió cada línea. Debajo, los mismos números en una tabla.
import { useState } from 'react';
import type { Eje, Serie } from '../datos/evolucion.ts';
import { ClaveSerie, GraficoEvolucion, type Marcador, type Trazo } from './GraficoEvolucion.tsx';

export interface SerieEtapa {
    readonly serie: Serie;
    readonly color: string;
    readonly marcador: Marcador;
    readonly gruesa?: boolean;
}

interface Props {
    readonly series: readonly SerieEtapa[];
    readonly etapas: readonly string[];
    readonly eje: Eje;
    readonly formato: (valor: number) => string;
    readonly forma?: 'escalon' | 'recta';
    readonly seleccion?: number;
    readonly detalle?: (indice: number) => string | undefined;
    readonly nota: string;
}

function Fichas({ series, ocultas, alCambiar }: { readonly series: readonly SerieEtapa[]; readonly ocultas: ReadonlySet<string>; readonly alCambiar: (id: string) => void }) {
    return (
        <div className="fichas" role="group" aria-label="Series visibles">
            {series.map((s) => {
                const visible = !ocultas.has(s.serie.id);
                return (
                    <button key={s.serie.id} type="button" className="ficha" aria-pressed={visible} onClick={() => alCambiar(s.serie.id)}>
                        <ClaveSerie color={s.color} marcador={s.marcador} gruesa={s.gruesa} />{s.serie.nombre}
                    </button>
                );
            })}
        </div>
    );
}

function TablaNumeros({ series, etapas, formato }: Pick<Props, 'series' | 'etapas' | 'formato'>) {
    return (
        <details className="evo__tabla">
            <summary>Ver los números del gráfico</summary>
            <div className="tabla-marco">
                <table className="tabla">
                    <thead><tr><th scope="col">Evaluación</th>{series.map((s) => <th key={s.serie.id} scope="col">{s.serie.nombre}</th>)}</tr></thead>
                    <tbody>
                        {etapas.map((etapa, i) => (
                            <tr key={etapa}>
                                <th scope="row">{etapa}</th>
                                {series.map((s) => <td key={s.serie.id} className="codigo">{formato(s.serie.puntos[i]?.valor ?? 0)}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </details>
    );
}

export function GraficoPorEtapa({ series, etapas, eje, formato, forma = 'recta', seleccion, detalle, nota }: Props) {
    const [ocultas, setOcultas] = useState<ReadonlySet<string>>(new Set());
    const visibles = series.filter((s) => !ocultas.has(s.serie.id));
    // Siempre queda al menos una serie visible: ocultar la última no tiene efecto.
    const alternar = (id: string): void => setOcultas((o) => {
        const nuevo = new Set(o);
        if (nuevo.has(id)) nuevo.delete(id);
        else if (series.length - nuevo.size > 1) nuevo.add(id);
        return nuevo;
    });
    const trazos: Trazo[] = [...visibles].sort((a, b) => Number(a.gruesa === true) - Number(b.gruesa === true)).map((s) => ({
        serie: s.serie, color: s.color, marcador: s.marcador, clase: s.gruesa === true ? 'resumen' : 'color', etiqueta: visibles.length <= 6,
    }));
    return (
        <figure className="evo__figura">
            <Fichas series={series} ocultas={ocultas} alCambiar={alternar} />
            <GraficoEvolucion eje={eje} trazos={trazos} rango={[-0.4, etapas.length - 0.6]} formato={formato}
                              etapas={etapas} forma={forma} seleccion={seleccion} detalle={detalle} />
            <figcaption className="evo__leyenda">{nota}</figcaption>
            <TablaNumeros series={series} etapas={etapas} formato={formato} />
        </figure>
    );
}
