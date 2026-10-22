// Íconos SVG propios (sin emojis ni librerías). Decorativos por defecto (aria-hidden): el texto al lado da el sentido.
import type { ReactNode } from 'react';

type NombreIcono = 'cumple' | 'parcial' | 'no-cumple' | 'resumen' | 'riesgo' | 'tabla' | 'prueba' | 'metodo'
    | 'sol' | 'luna' | 'cerrar' | 'codigo';

const TRAZOS: Readonly<Record<NombreIcono, ReactNode>> = {
    'cumple': <><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16.5 9" /></>,
    'parcial': <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" /></>,
    'no-cumple': <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>,
    'resumen': <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    'riesgo': <><path d="M12 3 2.5 20h19Z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
    'tabla': <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9.5h18M9 4v16" /></>,
    'prueba': <><path d="M9.5 3h5v5l4.5 10a2 2 0 0 1-1.8 3H6.8A2 2 0 0 1 5 18l4.5-10Z" /><path d="M8 14h8" /></>,
    'metodo': <><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6" /><path d="M18 3v4h-4M6 21v-4h4" /></>,
    'sol': <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    'luna': <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
    'cerrar': <path d="m6 6 12 12M18 6 6 18" />,
    'codigo': <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />,
};

export function Icono({ nombre, tamano = 18 }: { readonly nombre: NombreIcono; readonly tamano?: number }) {
    return (
        <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            {TRAZOS[nombre]}
        </svg>
    );
}

export type { NombreIcono };
