// Interruptor Antes / Después: cambia toda la pantalla a la vez (cifras, mapa de calor, matriz y evidencia).
// Grupo de radio accesible: Tab entra al grupo y las flechas cambian de opción llevando el foco a la elegida.
import { useRef, type KeyboardEvent } from 'react';
import type { Fase } from '../datos/cargar.ts';

const OPCIONES: readonly { readonly fase: Fase; readonly texto: string }[] = [
    { fase: 'antes', texto: 'Antes' },
    { fase: 'despues', texto: 'Después' },
];

export function InterruptorFase({ fase, alCambiar }: { readonly fase: Fase; readonly alCambiar: (f: Fase) => void }) {
    const botones = useRef<Partial<Record<Fase, HTMLButtonElement | null>>>({});
    const conTeclado = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        const otra: Fase = fase === 'antes' ? 'despues' : 'antes';
        alCambiar(otra);
        botones.current[otra]?.focus();
    };
    return (
        <div className="fase" role="radiogroup" aria-label="Fase de la evaluación" onKeyDown={conTeclado}>
            {OPCIONES.map((o) => (
                <button key={o.fase} ref={(b) => { botones.current[o.fase] = b; }} type="button" role="radio"
                        aria-checked={fase === o.fase} tabIndex={fase === o.fase ? 0 : -1} className="fase__opcion"
                        onClick={() => alCambiar(o.fase)}>
                    {o.texto}
                </button>
            ))}
        </div>
    );
}
