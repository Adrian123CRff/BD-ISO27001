// Navegación por hash (#/seccion?fase=...&control=...&riesgo=...): cada vista, fase y control se puede abrir con un
// enlace directo, útil para mostrar una evidencia concreta durante la exposición. Sin dependencias.
import { useCallback, useEffect, useState } from 'react';
import type { Fase } from './datos/cargar.ts';
import type { IdControl, IdRiesgo } from './datos/tipos.ts';
import { CONTROLES, RIESGOS } from './datos/cargar.ts';

export const SECCIONES = [
    { id: 'resumen', titulo: 'Resumen' },
    { id: 'riesgos', titulo: '1 · Riesgos' },
    { id: 'tareas', titulo: '2 · Tareas del DBA' },
    { id: 'mapeo', titulo: '3 · Mapeo de controles' },
    { id: 'observables', titulo: '4 · Controles observables' },
    { id: 'matriz', titulo: '5 · Matriz de evaluación' },
    { id: 'pruebas', titulo: '6 · Batería de pruebas' },
    { id: 'evolucion', titulo: 'Evolución' },
    { id: 'metodologia', titulo: 'Metodología PHVA' },
] as const;

export type IdSeccion = (typeof SECCIONES)[number]['id'];

export interface Ruta {
    readonly seccion: IdSeccion;
    readonly fase: Fase;
    readonly control: IdControl | null;
    readonly riesgo: IdRiesgo | null;
    readonly prueba: string | null;
}

const RUTA_INICIAL: Ruta = { seccion: 'resumen', fase: 'despues', control: null, riesgo: null, prueba: null };

function leerHash(hash: string): Ruta {
    const [camino = '', consulta = ''] = hash.replace(/^#\/?/, '').split('?');
    const p = new URLSearchParams(consulta);
    const seccion = SECCIONES.find((s) => s.id === camino)?.id ?? RUTA_INICIAL.seccion;
    const fase: Fase = p.get('fase') === 'antes' ? 'antes' : 'despues';
    const control = CONTROLES.find((c) => c.id === p.get('control'))?.id ?? null;
    const riesgo = RIESGOS.find((r) => r.id === p.get('riesgo'))?.id ?? null;
    const prueba = /^P\d{2}$/.test(p.get('prueba') ?? '') ? p.get('prueba') : null;
    return { seccion, fase, control, riesgo, prueba };
}

function escribirHash(r: Ruta): string {
    const p = new URLSearchParams({ fase: r.fase });
    if (r.control !== null) p.set('control', r.control);
    if (r.riesgo !== null) p.set('riesgo', r.riesgo);
    if (r.prueba !== null) p.set('prueba', r.prueba);
    return `#/${r.seccion}?${p.toString()}`;
}

export function enlace(r: Ruta, cambios: Partial<Ruta>): string {
    return escribirHash({ ...r, ...cambios });
}

export function useRuta(): readonly [Ruta, (cambios: Partial<Ruta>) => void] {
    const [ruta, setRuta] = useState<Ruta>(() => leerHash(window.location.hash));
    useEffect(() => {
        const alCambiar = (): void => setRuta(leerHash(window.location.hash));
        window.addEventListener('hashchange', alCambiar);
        return () => window.removeEventListener('hashchange', alCambiar);
    }, []);
    const navegar = useCallback((cambios: Partial<Ruta>) => {
        window.location.hash = escribirHash({ ...leerHash(window.location.hash), ...cambios });
    }, []);
    return [ruta, navegar] as const;
}
