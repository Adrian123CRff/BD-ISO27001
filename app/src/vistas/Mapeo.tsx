// Artefacto, punto 3: cada control ISO/IEC 27002:2022 con su justificación, su implementación sugerida (script de
// corrección) y su evidencia observable (consulta del auditor y script de verificación), agrupados por tema.
import { CONTROLES, resultadoDe } from '../datos/cargar.ts';
import type { Control } from '../datos/tipos.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { Estado } from '../componentes/Estado.tsx';
import { enlace, type Ruta } from '../ruta.ts';

function Tarjeta({ c, ruta }: { readonly c: Control; readonly ruta: Ruta }) {
    const r = resultadoDe(c.id, 'despues');
    return (
        <article className="tarjeta tarjeta--control">
            <header className="tarjeta__cabeza">
                <h3 className="tarjeta__titulo"><span className="codigo">{c.id}</span> {c.titulo}</h3>
                {r && <Estado estado={r.estado} />}
            </header>
            <p className="tarjeta__meta">{c.tema}{c.complementario ? ' · complementario' : ''} · {c.riesgos.join(', ')}</p>
            <dl className="mapeo">
                <dt>Por qué este control</dt><dd>{c.justificacion}</dd>
                <dt>Implementación sugerida</dt>
                <dd>{c.implementacion}<span className="mapeo__archivos codigo">{c.scriptsCorreccion.map((s) => `sql/correccion/${s}`).join(' · ')}</span></dd>
                <dt>Evidencia observable</dt>
                <dd><code className="codigo-linea">{c.consultaAuditor}</code><span className="mapeo__archivos codigo">sql/verificacion/{c.scriptVerificacion}</span></dd>
            </dl>
            <a className="enlace-accion" href={enlace(ruta, { seccion: 'matriz', control: c.id, riesgo: null })}>Ver su evidencia en la matriz</a>
        </article>
    );
}

export function Mapeo({ ruta }: { readonly ruta: Ruta }) {
    const grupos = [
        { titulo: 'Controles organizacionales (tema 5)', lista: CONTROLES.filter((c) => c.tema === 'Organizacional') },
        { titulo: 'Controles tecnológicos (tema 8)', lista: CONTROLES.filter((c) => c.tema === 'Tecnológico' && !c.complementario) },
        { titulo: 'Complementarios: tareas "cifrado TDE" y "parcheo"', lista: CONTROLES.filter((c) => c.complementario) },
    ];
    return (
        <>
            <CabeceraVista titulo="3 · Mapeo de controles ISO"
                enunciado="Mapeo de controles ISO con implementación sugerida y evidencia observable (ej: SELECT * FROM DBA_SYS_PRIVS, pg_hba.conf, SELECT * FROM v$encryption_wallet)." />
            {grupos.map((g) => (
                <section key={g.titulo} className="grupo" aria-label={g.titulo}>
                    <h2 className="seccion-titulo">{g.titulo}</h2>
                    <div className="rejilla-tarjetas">{g.lista.map((c) => <Tarjeta key={c.id} c={c} ruta={ruta} />)}</div>
                </section>
            ))}
        </>
    );
}
