// Artefacto, punto 5: la matriz de evaluación a ancho completo, con la escala de madurez y la regla de estado que
// aplica scripts/evaluar.ps1.
import { ESCALA_MADUREZ, REGLA_ESTADO } from '../datos/escalas.ts';
import type { Madurez as TipoMadurez } from '../datos/tipos.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { CadenaMatriz } from '../componentes/CadenaMatriz.tsx';
import { Madurez } from '../componentes/Estado.tsx';
import type { Ruta } from '../ruta.ts';

const NIVELES: readonly TipoMadurez[] = [0, 1, 2, 3, 4];

export function MatrizVista({ ruta, navegar }: { readonly ruta: Ruta; readonly navegar: (c: Partial<Ruta>) => void }) {
    return (
        <>
            <CabeceraVista titulo="5 · Matriz de evaluación" fase={ruta.fase} alCambiarFase={(f) => navegar({ fase: f })}
                enunciado="Matriz de evaluación (Tarea | Riesgo | Control | Criterio 0-4 | Evidencia | Estado)." />
            <details className="detalle">
                <summary>Cómo se calcula el criterio 0-4 y el estado</summary>
                <dl className="escala">
                    {NIVELES.map((n) => (
                        <div key={n} className="escala__fila">
                            <dt><Madurez valor={n} /></dt>
                            <dd><b>{ESCALA_MADUREZ[n].clase}</b> {ESCALA_MADUREZ[n].criterio}</dd>
                        </div>
                    ))}
                </dl>
                <p className="parrafo">{REGLA_ESTADO}</p>
            </details>
            <CadenaMatriz ruta={ruta} navegar={navegar} />
        </>
    );
}
