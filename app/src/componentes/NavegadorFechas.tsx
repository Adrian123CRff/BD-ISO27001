// Navegador de fechas (el gráfico pequeño del boceto del profesor): todo el historial en miniatura, con el tramo que
// muestra el gráfico principal marcado. Arrastrar sobre él elige otro tramo; los botones de rango hacen lo mismo con
// teclado (dataviz: el rango de fechas es el primer filtro y va arriba).
import { useState, type PointerEvent } from 'react';
import type { Serie } from '../datos/evolucion.ts';

const ANCHO = 320;
const ALTO = 64;
const MARGEN = 6;

export interface Rango {
    readonly id: string;
    readonly texto: string;
    readonly valor: readonly [number, number];
}

interface Props {
    readonly serie: Serie | undefined;
    readonly min: number;
    readonly max: number;
    readonly rango: readonly [number, number];
    readonly rangos: readonly Rango[];
    readonly alCambiar: (r: readonly [number, number]) => void;
}

export function NavegadorFechas({ serie, min, max, rango, rangos, alCambiar }: Props) {
    const [arrastre, setArrastre] = useState<number | null>(null);
    const total = max - min || 1;
    const x = (t: number): number => MARGEN + ((t - min) / total) * (ANCHO - 2 * MARGEN);
    const t = (px: number): number => min + ((px - MARGEN) / (ANCHO - 2 * MARGEN)) * total;
    const valores = serie?.puntos.map((p) => p.valor) ?? [0];
    const vMax = Math.max(1, ...valores);
    const y = (v: number): number => ALTO - MARGEN - (v / vMax) * (ALTO - 2 * MARGEN);
    const ruta = serie?.puntos.map((p, i) => (i === 0 ? `M${x(p.t)},${y(p.valor)}` : `H${x(p.t)}V${y(p.valor)}`)).join('') ?? '';
    const posicion = (e: PointerEvent<SVGSVGElement>): number => {
        const caja = e.currentTarget.getBoundingClientRect();
        return Math.min(max, Math.max(min, t(((e.clientX - caja.left) / caja.width) * ANCHO)));
    };
    const alSoltar = (e: PointerEvent<SVGSVGElement>): void => {
        if (arrastre === null) return;
        const fin = posicion(e);
        setArrastre(null);
        if (Math.abs(fin - arrastre) > total * 0.01) alCambiar([Math.min(arrastre, fin), Math.max(arrastre, fin)]);
    };
    const igual = (a: readonly [number, number]): boolean => a[0] === rango[0] && a[1] === rango[1];
    return (
        <div className="navegador">
            <div className="navegador__rangos" role="group" aria-label="Rango de fechas">
                {rangos.map((r) => (
                    <button key={r.id} type="button" className="navegador__rango" aria-pressed={igual(r.valor)} onClick={() => alCambiar(r.valor)}>{r.texto}</button>
                ))}
            </div>
            <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="navegador__lienzo" aria-hidden="true"
                 onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastre(posicion(e)); }}
                 onPointerUp={alSoltar} onDoubleClick={() => alCambiar([min, max])}>
                <rect x={0} y={0} width={ANCHO} height={ALTO} className="navegador__fondo" />
                <rect x={x(rango[0])} y={1} width={Math.max(2, x(rango[1]) - x(rango[0]))} height={ALTO - 2} className="navegador__tramo" />
                <path d={ruta} className="navegador__linea" />
            </svg>
            <p className="navegador__ayuda">Arrastre sobre la miniatura para ampliar un tramo; doble clic para verlo todo.</p>
        </div>
    );
}
