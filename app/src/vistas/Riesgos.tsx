// Artefacto, punto 1: tabla de los factores de riesgo con impacto, probabilidad, riesgo inherente y residual objetivo,
// cada valor con su justificación, y las escalas que los definen.
import { ESCALA_IMPACTO, ESCALA_PROBABILIDAD, NOMBRE_NIVEL, nivelRiesgo, RIESGO_RESIDUAL_ACEPTADO } from '../datos/escalas.ts';
import { RIESGOS } from '../datos/cargar.ts';
import type { Nivel } from '../datos/escalas.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { enlace, type Ruta } from '../ruta.ts';

function Escala({ titulo, niveles }: { readonly titulo: string; readonly niveles: readonly Nivel[] }) {
    return (
        <div className="tarjeta">
            <h3 className="tarjeta__titulo">{titulo}</h3>
            <dl className="escala">
                {niveles.map((n) => (
                    <div key={n.valor} className="escala__fila">
                        <dt><span className="codigo">{n.valor}</span> {n.nombre}</dt>
                        <dd>{n.significado}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export function Riesgos({ ruta }: { readonly ruta: Ruta }) {
    return (
        <>
            <CabeceraVista titulo="1 · Tabla de riesgos" enunciado="Tabla de riesgos R-CONF-01 a R-CONF-05 con impacto y probabilidad." />
            <div className="tabla-marco">
                <table className="tabla tabla--apilable">
                    <thead>
                        <tr><th scope="col">ID</th><th scope="col">Factor de riesgo</th><th scope="col">Impacto</th>
                            <th scope="col">Probabilidad</th><th scope="col">Inherente</th><th scope="col">Residual objetivo</th></tr>
                    </thead>
                    <tbody>
                        {RIESGOS.map((r) => {
                            const inh = nivelRiesgo(r.impacto, r.probabilidad);
                            const obj = nivelRiesgo(r.impactoObjetivo, r.probabilidadObjetivo);
                            return (
                                <tr key={r.id}>
                                    <td data-etiqueta="ID" className="codigo">{r.id}</td>
                                    <td data-etiqueta="Factor de riesgo">
                                        <b>{r.nombre}</b> <span className="etiqueta">{r.categoria}</span>
                                        <p className="tabla__nota">{r.descripcion}</p>
                                        <p className="tabla__nota"><b>En el escenario:</b> {r.enElEscenario}</p>
                                        <p className="tabla__nota">Pruebas: {r.pruebas.map((p, i) => <span key={p}>{i > 0 && ', '}<a href={enlace(ruta, { seccion: 'pruebas', prueba: p, fase: 'antes' })}>{p}</a></span>)}</p>
                                    </td>
                                    <td data-etiqueta="Impacto"><span className="valor">{r.impacto}</span><p className="tabla__nota">{r.porQueImpacto}</p></td>
                                    <td data-etiqueta="Probabilidad"><span className="valor">{r.probabilidad}</span><p className="tabla__nota">{r.porQueProbabilidad}</p></td>
                                    <td data-etiqueta="Inherente"><span className="valor">{inh}</span> {NOMBRE_NIVEL[inh]}<p className="tabla__nota">I {r.impacto} × P {r.probabilidad} = {r.impacto * r.probabilidad}</p></td>
                                    <td data-etiqueta="Residual objetivo"><span className="valor">{obj}</span> {NOMBRE_NIVEL[obj]}<p className="tabla__nota">I {r.impactoObjetivo} × P {r.probabilidadObjetivo}. {r.porQueObjetivo}</p></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <section className="grupo" aria-labelledby="titulo-escalas">
                <h2 id="titulo-escalas" className="seccion-titulo">Escalas</h2>
                <p className="parrafo">Nivel de riesgo = ⌈impacto × probabilidad ÷ 5⌉, de 1 a 5. El nivel de confidencialidad es el del peor factor: inherente 4 en el escenario; la administración acepta un residual de {RIESGO_RESIDUAL_ACEPTADO}. Los controles bajan la probabilidad; el impacto no cambia, porque el dato expuesto sería el mismo.</p>
                <div className="rejilla-2">
                    <Escala titulo="Impacto" niveles={ESCALA_IMPACTO} />
                    <Escala titulo="Probabilidad" niveles={ESCALA_PROBABILIDAD} />
                </div>
            </section>
        </>
    );
}
