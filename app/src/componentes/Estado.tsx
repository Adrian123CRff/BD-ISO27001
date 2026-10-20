// Estado del enunciado (Cumple / Parcial / No cumple) y madurez 0-4. Nunca solo color: cada estado tiene su ícono,
// su texto y su borde (sólido, punteado o doble), para que se distinga también en escala de grises.
import type { Estado as TipoEstado, Madurez as TipoMadurez } from '../datos/tipos.ts';
import { Icono } from './Icono.tsx';

const CLASE: Readonly<Record<TipoEstado, string>> = { 'Cumple': 'cumple', 'Parcial': 'parcial', 'No cumple': 'no-cumple' };

export function Estado({ estado, detalle }: { readonly estado: TipoEstado; readonly detalle?: string }) {
    const clase = CLASE[estado];
    return (
        <span className={`estado estado--${clase}`}>
            <Icono nombre={clase === 'cumple' ? 'cumple' : clase === 'parcial' ? 'parcial' : 'no-cumple'} tamano={16} />
            {estado}
            {detalle !== undefined && <span className="estado__detalle">{detalle}</span>}
        </span>
    );
}

export function Madurez({ valor }: { readonly valor: TipoMadurez }) {
    const pasos = [1, 2, 3, 4] as const;
    return (
        <span className="madurez" role="img" aria-label={`Madurez ${valor} de 4`}>
            <span className="madurez__pasos" aria-hidden="true">
                {pasos.map((p) => <span key={p} className={p <= valor ? 'madurez__paso madurez__paso--lleno' : 'madurez__paso'} />)}
            </span>
            <span className="madurez__valor" aria-hidden="true">{valor}</span>
        </span>
    );
}
