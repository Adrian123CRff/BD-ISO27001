// Lista de lo que se grafica (el boceto: "todos" y una casilla por elemento), con filtros rápidos por estado según la
// última medición: por ejemplo, solo los controles que aún no cumplen.
import { useEffect, useRef } from 'react';
import { GRUPOS, grupoActual, type Dimension, type Serie } from '../datos/evolucion.ts';

interface Props {
    readonly dimension: Dimension;
    readonly series: readonly Serie[];
    readonly seleccion: readonly string[];
    readonly colores: ReadonlyMap<string, string>;
    readonly alCambiar: (seleccion: readonly string[]) => void;
    readonly alDestacar: (id: string | null) => void;
}

const NOMBRE: Readonly<Record<Dimension, string>> = { controles: 'Controles', riesgos: 'Factores de riesgo', pruebas: 'Pruebas' };

export function SelectorSeries({ dimension, series, seleccion, colores, alCambiar, alDestacar }: Props) {
    const todos = useRef<HTMLInputElement>(null);
    const parcial = seleccion.length > 0 && seleccion.length < series.length;
    useEffect(() => { if (todos.current !== null) todos.current.indeterminate = parcial; }, [parcial]);
    const alternar = (id: string): void => {
        alCambiar(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : series.map((s) => s.id).filter((x) => x === id || seleccion.includes(x)));
    };
    return (
        <fieldset className="selector">
            <legend className="selector__titulo">{NOMBRE[dimension]} ({seleccion.length} de {series.length})</legend>
            <div className="selector__rapidos" role="group" aria-label="Filtros rápidos según la última medición">
                {GRUPOS[dimension].map((g) => {
                    const ids = series.filter((s) => grupoActual(s) === g).map((s) => s.id);
                    return (
                        <button key={g} type="button" className="selector__rapido" disabled={ids.length === 0} onClick={() => alCambiar(ids)}>
                            Solo: {g} ({ids.length})
                        </button>
                    );
                })}
            </div>
            <label className="selector__item selector__item--todos">
                <input ref={todos} type="checkbox" checked={seleccion.length === series.length}
                       onChange={() => alCambiar(seleccion.length === series.length ? [] : series.map((s) => s.id))} />
                Todos
            </label>
            <ul className="selector__lista">
                {series.map((s) => {
                    const color = colores.get(s.id);
                    return (
                        <li key={s.id} onMouseEnter={() => alDestacar(s.id)} onMouseLeave={() => alDestacar(null)}>
                            <label className="selector__item">
                                <input type="checkbox" checked={seleccion.includes(s.id)} onChange={() => alternar(s.id)}
                                       onFocus={() => alDestacar(s.id)} onBlur={() => alDestacar(null)} />
                                <i className="selector__clave" style={color === undefined ? undefined : { background: color }} aria-hidden="true" />
                                <span className="selector__nombre">{s.nombre}</span>
                                <span className="selector__grupo">{grupoActual(s)}</span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
}
