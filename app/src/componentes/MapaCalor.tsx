// Mapa de calor de riesgo 5×5 (impacto × probabilidad). La celda lleva el nivel ⌈I×P/5⌉ en un solo tono (claro →
// oscuro, validado con el script de dataviz). Cada factor R-CONF es un marcador con su número: en "antes" está en su
// celda inherente; en "después" se desplaza a la residual y deja un aro punteado donde estaba. La identidad va en la
// etiqueta, no en el color, así que se lee también en escala de grises. La lista de riesgos al lado es su vista tabla.
import { useState, type KeyboardEvent } from 'react';
import { NOMBRE_NIVEL, nivelRiesgo } from '../datos/escalas.ts';
import { posicionDe, RIESGOS, type Fase } from '../datos/cargar.ts';
import type { IdRiesgo, Valor15 } from '../datos/tipos.ts';

const CELDA = 84;
const HUECO = 4;
const IZQ = 60;
const SUP = 8;
const INF = 58;
const LADO = 5 * CELDA + 4 * HUECO;
const ANCHO = IZQ + LADO + 8;
const ALTO = SUP + LADO + INF;
const VALORES: readonly Valor15[] = [1, 2, 3, 4, 5];

const xCelda = (p: number): number => IZQ + (p - 1) * (CELDA + HUECO);
const yCelda = (i: number): number => SUP + (5 - i) * (CELDA + HUECO);
const etiqueta = (id: IdRiesgo): string => id.slice(-2);

interface Punto { readonly x: number; readonly y: number; readonly r: number }

// Rejilla dentro de la celda según cuántos factores comparten valores: 1-2 en fila, 3-4 en 2×2, 5 en 3+2 (máximo
// posible con 5 factores). Así ningún marcador sale de su celda, que haría leer un valor equivocado (prueba break-ui).
function rejilla(n: number): { readonly columnas: number; readonly r: number } {
    if (n <= 2) return { columnas: Math.max(n, 1), r: 17 };
    if (n <= 4) return { columnas: 2, r: 15 };
    return { columnas: 3, r: 12 };
}

function ubicar(coords: readonly { readonly id: IdRiesgo; readonly i: number; readonly p: number }[]): Map<IdRiesgo, Punto> {
    const puntos = new Map<IdRiesgo, Punto>();
    for (const c of coords) {
        const vecinos = coords.filter((o) => o.i === c.i && o.p === c.p);
        const k = vecinos.findIndex((o) => o.id === c.id);
        const { columnas, r } = rejilla(vecinos.length);
        const paso = 2 * r + 4;
        const fila = Math.floor(k / columnas);
        const filas = Math.ceil(vecinos.length / columnas);
        const enFila = Math.min(columnas, vecinos.length - fila * columnas);
        const dx = ((k % columnas) - (enFila - 1) / 2) * paso;
        const dy = (fila - (filas - 1) / 2) * paso;
        puntos.set(c.id, { x: xCelda(c.p) + CELDA / 2 + dx, y: yCelda(c.i) + CELDA / 2 + dy, r });
    }
    return puntos;
}

function Celdas() {
    return VALORES.flatMap((i) => VALORES.map((p) => {
        const n = nivelRiesgo(i, p);
        return (
            <rect key={`${i}-${p}`} x={xCelda(p)} y={yCelda(i)} width={CELDA} height={CELDA} rx={4}
                  fill={`var(--riesgo-${n})`}>
                <title>{`Impacto ${i} × probabilidad ${p}: nivel ${n} (${NOMBRE_NIVEL[n]})`}</title>
            </rect>
        );
    }));
}

function Ejes() {
    return (
        <g className="mapa__eje" aria-hidden="true">
            {VALORES.map((v) => <text key={`y${v}`} x={IZQ - 14} y={yCelda(v) + CELDA / 2 + 5} textAnchor="end">{v}</text>)}
            {VALORES.map((v) => <text key={`x${v}`} x={xCelda(v) + CELDA / 2} y={SUP + LADO + 22} textAnchor="middle">{v}</text>)}
            <text x={IZQ + LADO / 2} y={ALTO - 6} textAnchor="middle" className="mapa__titulo-eje">Probabilidad</text>
            <text x={16} y={SUP + LADO / 2} textAnchor="middle" className="mapa__titulo-eje"
                  transform={`rotate(-90 16 ${SUP + LADO / 2})`}>Impacto</text>
        </g>
    );
}

interface PropsMarcadores {
    readonly actuales: Map<IdRiesgo, Punto>;
    readonly activos: readonly IdRiesgo[];
    readonly alElegir: (id: IdRiesgo) => void;
    readonly alSenalar: (id: IdRiesgo | null) => void;
}

function Marcadores({ actuales, activos, alElegir, alSenalar }: PropsMarcadores) {
    const conTeclado = (e: KeyboardEvent<SVGGElement>, id: IdRiesgo): void => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alElegir(id); }
    };
    return RIESGOS.map((r) => {
        const p = actuales.get(r.id);
        if (p === undefined) return null;
        const activo = activos.includes(r.id);
        return (
            <g key={r.id} className={activo ? 'marcador marcador--activo' : 'marcador'} tabIndex={0} role="button"
               aria-pressed={activo} aria-label={`${r.id} ${r.nombre}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
               onClick={() => alElegir(r.id)} onKeyDown={(e) => conTeclado(e, r.id)}
               onMouseEnter={() => alSenalar(r.id)} onMouseLeave={() => alSenalar(null)}
               onFocus={() => alSenalar(r.id)} onBlur={() => alSenalar(null)}>
                <circle r={p.r + 2} className="marcador__zona" />
                <circle r={p.r} className="marcador__punto" />
                <text y={p.r < 15 ? 4 : 5} textAnchor="middle" className={p.r < 15 ? 'marcador__texto marcador__texto--chico' : 'marcador__texto'}>{etiqueta(r.id)}</text>
            </g>
        );
    });
}

function Rastros({ fase, actuales }: { readonly fase: Fase; readonly actuales: Map<IdRiesgo, Punto> }) {
    if (fase === 'antes') return null;
    const inherentes = ubicar(RIESGOS.map((r) => ({ id: r.id, i: r.impacto, p: r.probabilidad })));
    return (
        <g className="mapa__rastros" aria-hidden="true">
            {RIESGOS.map((r) => {
                const a = inherentes.get(r.id);
                const b = actuales.get(r.id);
                if (a === undefined || b === undefined || (a.x === b.x && a.y === b.y)) return null;
                return (
                    <g key={r.id}>
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mapa__rastro-fondo" />
                        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="mapa__rastro" />
                        <circle cx={a.x} cy={a.y} r={a.r - 2} className="mapa__fantasma" />
                    </g>
                );
            })}
        </g>
    );
}

function Ayuda({ id, punto, fase }: { readonly id: IdRiesgo; readonly punto: Punto; readonly fase: Fase }) {
    const r = RIESGOS.find((x) => x.id === id);
    if (r === undefined) return null;
    const ahora = posicionDe(r, fase);
    return (
        <div className="mapa__ayuda" role="status" style={{ left: `${(punto.x / ANCHO) * 100}%`, top: `${(punto.y / ALTO) * 100}%` }}>
            <strong>{r.id} · {r.nombre}</strong>
            <span>Inherente: I{r.impacto} × P{r.probabilidad} = nivel {nivelRiesgo(r.impacto, r.probabilidad)}</span>
            {fase === 'despues' && <span>Residual: I{ahora.impacto} × P{ahora.probabilidad} = nivel {ahora.nivel} ({NOMBRE_NIVEL[ahora.nivel]})</span>}
        </div>
    );
}

interface PropsMapa {
    readonly fase: Fase;
    readonly activos: readonly IdRiesgo[];
    readonly alElegir: (id: IdRiesgo) => void;
}

export function MapaCalor({ fase, activos, alElegir }: PropsMapa) {
    const [senalado, setSenalado] = useState<IdRiesgo | null>(null);
    const actuales = ubicar(RIESGOS.map((r) => {
        const pos = posicionDe(r, fase);
        return { id: r.id, i: pos.impacto, p: pos.probabilidad };
    }));
    const puntoSenalado = senalado === null ? undefined : actuales.get(senalado);
    return (
        <figure className="mapa">
            <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="group" aria-label={`Mapa de calor de riesgo, fase ${fase === 'antes' ? 'antes' : 'después'}`}>
                <Celdas />
                <Ejes />
                <Rastros fase={fase} actuales={actuales} />
                <Marcadores actuales={actuales} activos={activos} alElegir={alElegir} alSenalar={setSenalado} />
            </svg>
            {senalado !== null && puntoSenalado !== undefined && <Ayuda id={senalado} punto={puntoSenalado} fase={fase} />}
            <figcaption className="mapa__leyenda">
                {VALORES.map((n) => (
                    <span key={n} className="mapa__clave"><i style={{ background: `var(--riesgo-${n})` }} />{n} {NOMBRE_NIVEL[n]}</span>
                ))}
                {fase === 'despues' && <span className="mapa__clave"><i className="mapa__clave-fantasma" />Posición inherente</span>}
            </figcaption>
        </figure>
    );
}
