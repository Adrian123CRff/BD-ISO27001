// Artefacto, punto 5: "Matriz de evaluación (Tarea | Riesgo | Control | Criterio 0-4 | Evidencia | Estado)".
// Una fila por control; cada fila abre su evidencia (script y salida) en el panel de al lado.
import { CONTROLES, resultadoDe, TAREAS, type Fase } from '../datos/cargar.ts';
import type { Control, IdControl, IdRiesgo } from '../datos/tipos.ts';
import { Estado, Madurez } from './Estado.tsx';

interface Props {
    readonly fase: Fase;
    readonly filtroRiesgo: IdRiesgo | null;
    readonly seleccionado: IdControl | null;
    readonly alElegir: (id: IdControl) => void;
}

function Fila({ control, fase, seleccionado, alElegir }: { readonly control: Control } & Omit<Props, 'filtroRiesgo'>) {
    const r = resultadoDe(control.id, fase);
    const antes = resultadoDe(control.id, 'antes');
    const tareas = TAREAS.filter((t) => t.controles.includes(control.id)).map((t) => t.nombre).join(', ');
    const activo = seleccionado === control.id;
    return (
        <tr className={activo ? 'fila fila--activa' : 'fila'} onClick={() => alElegir(control.id)}>
            <td data-etiqueta="Tarea">{tareas}</td>
            <td data-etiqueta="Riesgo" className="codigo">{control.riesgos.join(', ')}</td>
            <td data-etiqueta="Control">
                <button type="button" className="fila__control" aria-pressed={activo} onClick={(e) => { e.stopPropagation(); alElegir(control.id); }}>
                    <span className="codigo">{control.id}</span> {control.titulo}
                </button>
                {control.complementario && <span className="etiqueta">Complementario</span>}
            </td>
            <td data-etiqueta="Criterio 0-4">
                {r && <Madurez valor={r.madurez} />}
                {fase === 'despues' && antes && <span className="fila__antes">antes {antes.madurez}</span>}
            </td>
            <td data-etiqueta="Evidencia" className="codigo fila__evidencia">{control.scriptVerificacion.slice(0, 3)}</td>
            <td data-etiqueta="Estado">{r && <Estado estado={r.estado} detalle={`${r.cumplidos}/${r.total}`} />}</td>
        </tr>
    );
}

export function Matriz({ fase, filtroRiesgo, seleccionado, alElegir }: Props) {
    const filas = CONTROLES.filter((c) => filtroRiesgo === null || c.riesgos.includes(filtroRiesgo));
    return (
        <div className="tabla-marco">
            <table className="matriz tabla--apilable">
                <caption className="sr-only">Matriz de evaluación, fase {fase === 'antes' ? 'antes' : 'después'}</caption>
                <thead>
                    <tr><th scope="col">Tarea</th><th scope="col">Riesgo</th><th scope="col">Control</th>
                        <th scope="col">Criterio 0-4</th><th scope="col">Evidencia</th><th scope="col">Estado</th></tr>
                </thead>
                <tbody>
                    {filas.map((c) => <Fila key={c.id} control={c} fase={fase} seleccionado={seleccionado} alElegir={alElegir} />)}
                </tbody>
            </table>
        </div>
    );
}
