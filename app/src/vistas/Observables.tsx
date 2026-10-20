// Artefacto, punto 4: los 15 controles del enunciado como lista de comprobaciones que un auditor externo puede repetir
// con una cuenta de solo lectura (ISO_AUDITOR), más los dos complementarios.
import { CONTROLES, resultadoDe } from '../datos/cargar.ts';
import type { Control } from '../datos/tipos.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { Estado } from '../componentes/Estado.tsx';
import { enlace, type Ruta } from '../ruta.ts';

function Item({ c, numero, ruta }: { readonly c: Control; readonly numero: number; readonly ruta: Ruta }) {
    const antes = resultadoDe(c.id, 'antes');
    const despues = resultadoDe(c.id, 'despues');
    return (
        <li className="observable">
            <span className="observable__numero" aria-hidden="true">{numero}</span>
            <div className="observable__cuerpo">
                <h3 className="observable__titulo"><span className="codigo">{c.id}</span> {c.titulo}</h3>
                <code className="codigo-linea">{c.consultaAuditor}</code>
                <p className="observable__pie">
                    <span className="codigo">sql/verificacion/{c.scriptVerificacion}</span>
                    <span className="observable__estados">
                        {antes && <Estado estado={antes.estado} />} <span aria-hidden="true">→</span> {despues && <Estado estado={despues.estado} />}
                    </span>
                    <a className="enlace-accion" href={enlace(ruta, { seccion: 'matriz', control: c.id, riesgo: null })}>Ver salida</a>
                </p>
            </div>
        </li>
    );
}

export function Observables({ ruta }: { readonly ruta: Ruta }) {
    const delEnunciado = CONTROLES.filter((c) => !c.complementario);
    const complementarios = CONTROLES.filter((c) => c.complementario);
    return (
        <>
            <CabeceraVista titulo="4 · Controles observables" enunciado="Lista de 15 controles observables por auditor externo." />
            <p className="parrafo">Cada control se comprueba con una consulta de solo lectura al diccionario de datos, ejecutada como <span className="codigo">ISO_AUDITOR</span>: el mismo privilegio que tendría un auditor externo, que no puede leer los datos de negocio ni modificar nada.</p>
            <h2 className="seccion-titulo">Los 15 controles del enunciado</h2>
            <ol className="observables">
                {delEnunciado.map((c, i) => <Item key={c.id} c={c} numero={i + 1} ruta={ruta} />)}
            </ol>
            <h2 className="seccion-titulo">Complementarios</h2>
            <ol className="observables" start={16}>
                {complementarios.map((c, i) => <Item key={c.id} c={c} numero={16 + i} ruta={ruta} />)}
            </ol>
        </>
    );
}
