// Gráfico de evolución: una línea escalonada por serie (el valor se mantiene entre dos mediciones; no se inventan
// puntos intermedios), eje Y según la dimensión y eje X con las fechas reales de cada medición. Una línea vertical
// sigue al puntero o a las flechas del teclado y muestra todos los valores de esa medición (dataviz: crosshair).
// El lienzo mide su contenedor: una unidad del SVG es un píxel, así el texto conserva su tamaño también en móvil.
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { fechaCorta, nombreEtapa, type Eje, type Serie } from '../datos/evolucion.ts';

interface Medidas {
    readonly ancho: number;
    readonly alto: number;
    readonly izq: number;
    readonly der: number;
    readonly sup: number;
    readonly inf: number;
    readonly ap: number;
    readonly al: number;
    readonly marcasX: number;
}

function medidas(ancho: number): Medidas {
    const angosto = ancho < 560;
    const alto = angosto ? 300 : 380;
    const izq = angosto ? 52 : 130;
    const der = angosto ? 72 : 150;
    const sup = 16;
    const inf = 46;
    return { ancho, alto, izq, der, sup, inf, ap: ancho - izq - der, al: alto - sup - inf, marcasX: angosto ? 3 : 5 };
}

export type Marcador = 'circulo' | 'cuadrado' | 'rombo' | 'triangulo' | 'triangulo-inv';

export interface Trazo {
    readonly serie: Serie;
    readonly color: string;
    readonly clase: 'color' | 'gris' | 'resumen' | 'destacada';
    readonly etiqueta: boolean;
    // Forma del punto: identifica la serie sin depender solo del color (accesibilidad e impresión en gris).
    readonly marcador?: Marcador;
}

interface Props {
    readonly eje: Eje;
    readonly trazos: readonly Trazo[];
    readonly rango: readonly [number, number];
    readonly formato: (valor: number) => string;
    readonly detalle?: (indice: number) => string | undefined;
    // Eje X por etapas (Antes, C01…, Después o E01…E17): cada punto se ubica en t = su índice y se rotula con su
    // etapa. Sin esta propiedad el eje X es de fechas.
    readonly etapas?: readonly string[];
    // 'escalon': el valor se mantiene hasta la siguiente medición; 'recta': une evaluaciones puntuales.
    readonly forma?: 'escalon' | 'recta';
    // Índice de la evaluación elegida, marcado con una línea vertical fija.
    readonly seleccion?: number;
}

interface PropsCapa {
    readonly m: Medidas;
    readonly eje: Eje;
    readonly rango: readonly [number, number];
    readonly trazos: readonly Trazo[];
    readonly etapas?: readonly string[];
    readonly forma?: 'escalon' | 'recta';
}

function escalas(m: Medidas, eje: Eje, [desde, hasta]: readonly [number, number]) {
    const x = (t: number): number => m.izq + (hasta === desde ? m.ap / 2 : ((t - desde) / (hasta - desde)) * m.ap);
    const y = (v: number): number => m.sup + ((eje.max - v) / (eje.max - eje.min)) * m.al;
    return { x, y };
}

function rutaDe(s: Serie, x: (t: number) => number, y: (v: number) => number, forma: 'escalon' | 'recta'): string {
    return s.puntos.map((p, i) => (i === 0 ? `M${x(p.t)},${y(p.valor)}` : forma === 'recta' ? `L${x(p.t)},${y(p.valor)}` : `H${x(p.t)}V${y(p.valor)}`)).join('');
}

// Forma del marcador centrada en (cx, cy); r es el radio aproximado.
function formaMarcador(marcador: Marcador, cx: number, cy: number, r: number): string {
    switch (marcador) {
        case 'cuadrado': return `M${cx - r},${cy - r}h${2 * r}v${2 * r}h${-2 * r}Z`;
        case 'rombo': return `M${cx},${cy - r * 1.35}L${cx + r * 1.35},${cy}L${cx},${cy + r * 1.35}L${cx - r * 1.35},${cy}Z`;
        case 'triangulo': return `M${cx},${cy - r * 1.3}L${cx + r * 1.25},${cy + r}L${cx - r * 1.25},${cy + r}Z`;
        case 'triangulo-inv': return `M${cx},${cy + r * 1.3}L${cx + r * 1.25},${cy - r}L${cx - r * 1.25},${cy - r}Z`;
        default: return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
    }
}

// Clave de la leyenda: un trozo de línea con el marcador de la serie.
export function ClaveSerie({ color, marcador, gruesa }: { readonly color: string; readonly marcador?: Marcador; readonly gruesa?: boolean }) {
    return (
        <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true" style={{ color, flex: 'none' }}>
            <line x1="1" x2="25" y1="7" y2="7" stroke="currentColor" strokeWidth={gruesa === true ? 3 : 2} />
            <path d={formaMarcador(marcador ?? 'circulo', 13, 7, gruesa === true ? 4.5 : 3.8)} className="evo__punto" />
        </svg>
    );
}

// Marcas del eje X por etapa: todas si caben (unos 52 px por rótulo); si no, una de cada k. La última siempre se
// muestra y, si queda pegada a la anterior, esa se omite para que no se encimen.
function marcasEtapa(etapas: readonly string[], ancho: number): { t: number; texto: string }[] {
    const k = Math.max(1, Math.ceil((etapas.length * 52) / Math.max(1, ancho)));
    const ultima = etapas.length - 1;
    const marcas = etapas.map((texto, t) => ({ t, texto })).filter(({ t }) => t % k === 0 && (t === ultima || ultima - t >= k));
    const fin = etapas[ultima];
    return fin === undefined || marcas.at(-1)?.t === ultima ? marcas : [...marcas, { t: ultima, texto: fin }];
}

// Marcas del eje X repartidas en el rango. Hora si el rango cabe en un día, día y hora hasta una semana (si no, se
// repetiría el mismo día), y solo día y mes en rangos más largos.
function marcasTiempo([desde, hasta]: readonly [number, number], cantidad: number): { t: number; texto: string }[] {
    const dia = 86_400_000;
    const n = hasta === desde ? 1 : cantidad;
    const dos = (v: number): string => String(v).padStart(2, '0');
    return Array.from({ length: n }, (_, i) => {
        const t = n === 1 ? desde : desde + ((hasta - desde) * i) / (n - 1);
        const d = new Date(t);
        const hora = `${dos(d.getHours())}:${dos(d.getMinutes())}`;
        const fecha = `${dos(d.getDate())}/${dos(d.getMonth() + 1)}`;
        return { t, texto: hasta - desde < dia ? hora : hasta - desde < 7 * dia ? `${fecha} ${hora}` : fecha };
    });
}

function Ejes({ m, eje, rango, etapas }: Omit<PropsCapa, 'trazos'>) {
    const { x, y } = escalas(m, eje, rango);
    const dia = new Date(rango[0]);
    return (
        <g className="evo__eje" aria-hidden="true">
            {eje.marcas.map((k) => (
                <g key={k.valor}>
                    <line x1={m.izq} x2={m.izq + m.ap} y1={y(k.valor)} y2={y(k.valor)} className="evo__rejilla" />
                    <text x={m.izq - 8} y={y(k.valor) + 5} textAnchor="end">{m.izq < 100 ? k.valor : k.texto}</text>
                </g>
            ))}
            {(etapas !== undefined ? marcasEtapa(etapas, m.ap) : marcasTiempo(rango, m.marcasX === 3 && rango[1] - rango[0] >= 86_400_000 ? 2 : m.marcasX))
                .map((k) => <text key={k.t} x={x(k.t)} y={m.alto - m.inf + 22} textAnchor="middle">{k.texto}</text>)}
            <text x={m.izq + m.ap / 2} y={m.alto - 4} textAnchor="middle" className="evo__titulo-eje">
                {etapas !== undefined ? 'Evaluación (en orden)' : rango[1] - rango[0] < 86_400_000 ? `Hora de cada medición (${dia.toLocaleDateString('es-CR')})` : 'Fecha de cada medición'}
            </text>
            <text x={14} y={m.sup + m.al / 2} textAnchor="middle" className="evo__titulo-eje" transform={`rotate(-90 14 ${m.sup + m.al / 2})`}>{eje.titulo}</text>
            {[...(eje.meta === undefined ? [] : [eje.meta]), ...(eje.metas ?? [])].map((meta) => (
                <g key={meta.valor} className="evo__meta">
                    <line x1={m.izq} x2={m.izq + m.ap} y1={y(meta.valor)} y2={y(meta.valor)} />
                    {meta.texto !== '' && <text x={m.izq + m.ap + 8} y={y(meta.valor) + 5}>{m.der > 100 ? meta.texto : String(meta.valor).replace('.', ',')}</text>}
                </g>
            ))}
        </g>
    );
}

// Etiquetas directas al final de cada línea con etiqueta; si chocan, se separan 16 px manteniendo el orden.
function Etiquetas({ m, trazos, eje, rango }: PropsCapa) {
    const { y } = escalas(m, eje, rango);
    // En pantallas angostas solo caben rótulos cortos (A8.2, E(t)); los largos quedan en la leyenda o en las fichas.
    const cabe = (t: Trazo): boolean => m.der > 100 || (t.serie.id === 'agregado' ? 'Promedio' : t.serie.id).length <= 6;
    const lista = trazos.filter((t) => t.etiqueta && cabe(t)).map((t) => ({ t, y: y(t.serie.puntos.at(-1)?.valor ?? eje.min) }))
        .sort((a, b) => a.y - b.y);
    for (let i = 1; i < lista.length; i++) {
        const previa = lista[i - 1];
        const actual = lista[i];
        if (previa !== undefined && actual !== undefined && actual.y - previa.y < 16) actual.y = previa.y + 16;
    }
    return (
        <g className="evo__etiquetas" aria-hidden="true">
            {lista.map(({ t, y: posY }) => (
                <text key={t.serie.id} x={m.izq + m.ap + 10} y={posY + 5}>{t.serie.id === 'agregado' ? 'Promedio' : t.serie.id}</text>
            ))}
        </g>
    );
}

function Lineas({ m, trazos, eje, rango, forma = 'escalon', recorte }: PropsCapa & { readonly recorte: string }) {
    const { x, y } = escalas(m, eje, rango);
    const orden = ['gris', 'color', 'resumen', 'destacada'];
    const ordenados = [...trazos].sort((a, b) => orden.indexOf(a.clase) - orden.indexOf(b.clase));
    return (
        <g clipPath={`url(#${recorte})`} aria-hidden="true">
            {ordenados.map((t) => (
                <g key={t.serie.id} className={`evo__serie evo__serie--${t.clase}`} style={{ color: t.color }}>
                    <path d={rutaDe(t.serie, x, y, forma)} className="evo__halo" />
                    <path d={rutaDe(t.serie, x, y, forma)} className="evo__linea" />
                    {t.clase !== 'gris' && t.serie.puntos.map((p) => <path key={p.t} d={formaMarcador(t.marcador ?? 'circulo', x(p.t), y(p.valor), t.clase === 'resumen' ? 5 : 4)} className="evo__punto" />)}
                </g>
            ))}
        </g>
    );
}

function Detalle({ m, trazos, indice, formato, detalle, rango, eje }: Props & { readonly indice: number; readonly m: Medidas }) {
    const base = trazos[0]?.serie.puntos[indice];
    if (base === undefined) return null;
    const { x } = escalas(m, eje, rango);
    const visibles = trazos.filter((t) => t.clase !== 'gris').slice(0, 8);
    const extra = detalle?.(indice);
    const izquierda = Math.min(Math.max(x(base.t), 130), m.ancho - 130);
    return (
        <div className="evo__ayuda" role="status" style={{ left: `${izquierda}px` }}>
            <span className="evo__ayuda-fecha">{fechaCorta(base.fecha)} · {nombreEtapa(base.etapa)}</span>
            {visibles.map((t) => (
                <span key={t.serie.id} className="evo__ayuda-fila">
                    <i style={{ background: t.color }} /><b>{formato(t.serie.puntos[indice]?.valor ?? 0)}</b> {t.serie.nombre}
                </span>
            ))}
            {extra !== undefined && <span className="evo__ayuda-extra">{extra}</span>}
        </div>
    );
}

function useAncho(): readonly [RefObject<HTMLDivElement | null>, number] {
    const ref = useRef<HTMLDivElement>(null);
    const [ancho, setAncho] = useState(860);
    useLayoutEffect(() => {
        const nodo = ref.current;
        if (nodo === null) return undefined;
        const observador = new ResizeObserver(([e]) => { if (e !== undefined) setAncho(Math.max(300, Math.round(e.contentRect.width))); });
        observador.observe(nodo);
        return () => observador.disconnect();
    }, []);
    return [ref, ancho] as const;
}

export function GraficoEvolucion(props: Props) {
    const { eje, trazos, rango, etapas, forma, seleccion } = props;
    const [ref, ancho] = useAncho();
    const m = medidas(ancho);
    const [indice, setIndice] = useState<number | null>(null);
    const puntos = trazos[0]?.serie.puntos ?? [];
    const visibles = puntos.map((p, i) => ({ p, i })).filter(({ p }) => p.t >= rango[0] && p.t <= rango[1]);
    const { x } = escalas(m, eje, rango);
    const alMover = (e: PointerEvent<SVGRectElement>): void => {
        const caja = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (caja === undefined || visibles.length === 0) return;
        const px = ((e.clientX - caja.left) / caja.width) * m.ancho;
        setIndice(visibles.reduce((a, b) => (Math.abs(x(b.p.t) - px) < Math.abs(x(a.p.t) - px) ? b : a)).i);
    };
    const conTeclado = (e: KeyboardEvent<SVGSVGElement>): void => {
        if (e.key === 'Escape') { setIndice(null); return; }
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const pos = visibles.findIndex((v) => v.i === indice);
        const sig = e.key === 'ArrowRight' ? Math.min(visibles.length - 1, pos + 1) : Math.max(0, pos < 0 ? 0 : pos - 1);
        setIndice(visibles[sig]?.i ?? null);
    };
    const tSel = indice === null ? undefined : puntos[indice]?.t;
    const tFijo = seleccion === undefined ? undefined : puntos[seleccion]?.t;
    // Un recorte por gráfico: con dos gráficos en la misma página, un id compartido recortaría con el área del otro.
    const recorte = `evo-recorte-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    return (
        <div className="evo__lienzo" ref={ref}>
            <svg viewBox={`0 0 ${m.ancho} ${m.alto}`} tabIndex={0} onKeyDown={conTeclado} onBlur={() => setIndice(null)}
                 aria-label={`Gráfico de evolución: ${eje.titulo}. Use las flechas izquierda y derecha para recorrer las mediciones.`}>
                <defs><clipPath id={recorte}><rect x={m.izq - 6} y={m.sup - 6} width={m.ap + 12} height={m.al + 12} /></clipPath></defs>
                <Ejes m={m} eje={eje} rango={rango} etapas={etapas} />
                {tFijo !== undefined && <line x1={x(tFijo)} x2={x(tFijo)} y1={m.sup} y2={m.sup + m.al} className="evo__fija" aria-hidden="true" />}
                <Lineas m={m} trazos={trazos} eje={eje} rango={rango} forma={forma} recorte={recorte} />
                <Etiquetas m={m} trazos={trazos} eje={eje} rango={rango} />
                {tSel !== undefined && <line x1={x(tSel)} x2={x(tSel)} y1={m.sup} y2={m.sup + m.al} className="evo__cruz" aria-hidden="true" />}
                <rect x={m.izq} y={m.sup} width={m.ap} height={m.al} className="evo__captura" onPointerMove={alMover} onPointerLeave={() => setIndice(null)} />
            </svg>
            {indice !== null && <Detalle {...props} m={m} indice={indice} />}
        </div>
    );
}
