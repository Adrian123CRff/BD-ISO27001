// Artefacto, punto 2: las 12 tareas del DBA que nombra el enunciado, con los factores de riesgo que atienden y los
// controles que las verifican (con su estado después de corregir).
import { resultadoDe, TAREAS, riesgoPorId } from '../datos/cargar.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { Estado } from '../componentes/Estado.tsx';
import { enlace, type Ruta } from '../ruta.ts';

export function Tareas({ ruta }: { readonly ruta: Ruta }) {
    return (
        <>
            <CabeceraVista titulo="2 · Tabla de tareas del DBA" enunciado="Tabla de tareas del DBA." />
            <p className="parrafo">Las 12 tareas que nombra el objetivo específico 2 del enunciado, en su orden. Cada una enlaza con sus controles en la matriz.</p>
            <div className="tabla-marco">
                <table className="tabla tabla--apilable">
                    <thead>
                        <tr><th scope="col">#</th><th scope="col">Tarea</th><th scope="col">Qué hace el DBA</th>
                            <th scope="col">Riesgos</th><th scope="col">Controles (estado después)</th></tr>
                    </thead>
                    <tbody>
                        {TAREAS.map((t) => (
                            <tr key={t.id}>
                                <td data-etiqueta="#" className="codigo">{t.id}</td>
                                <td data-etiqueta="Tarea"><b>{t.nombre}</b></td>
                                <td data-etiqueta="Qué hace el DBA">{t.queHaceElDba}</td>
                                <td data-etiqueta="Riesgos">
                                    {t.riesgos.map((r) => <span key={r} className="bloque"><span className="codigo">{r}</span> {riesgoPorId(r).nombre}</span>)}
                                </td>
                                <td data-etiqueta="Controles">
                                    {t.controles.map((c) => {
                                        const r = resultadoDe(c, 'despues');
                                        return (
                                            <span key={c} className="bloque">
                                                <a className="codigo" href={enlace(ruta, { seccion: 'matriz', control: c, riesgo: null })}>{c}</a>{' '}
                                                {r && <Estado estado={r.estado} />}
                                            </span>
                                        );
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
