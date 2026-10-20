// Cabecera común de cada vista: título, el texto literal del enunciado que la vista cumple y, si aplica, el
// interruptor Antes / Después.
import type { ReactNode } from 'react';
import type { Fase } from '../datos/cargar.ts';
import { InterruptorFase } from './InterruptorFase.tsx';

interface Props {
    readonly titulo: string;
    readonly enunciado?: string;
    readonly fase?: Fase;
    readonly alCambiarFase?: (f: Fase) => void;
    readonly children?: ReactNode;
}

export function CabeceraVista({ titulo, enunciado, fase, alCambiarFase, children }: Props) {
    return (
        <header className="vista-cabeza">
            <div>
                <h1 className="vista-cabeza__titulo">{titulo}</h1>
                {enunciado !== undefined && <p className="vista-cabeza__enunciado">Enunciado: «{enunciado}»</p>}
                {children}
            </div>
            {fase !== undefined && alCambiarFase !== undefined && <InterruptorFase fase={fase} alCambiar={alCambiarFase} />}
        </header>
    );
}
