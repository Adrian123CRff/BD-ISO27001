// Panel de evidencia del control elegido: sus criterios en la fase actual, el script SQL que lo verifica y la salida
// real de ese script (evidencia/antes o evidencia/despues), tal como están en el repositorio.
import { CONTROLES, evidenciaDe, resultadoDe, type Fase } from '../datos/cargar.ts';
import type { IdControl } from '../datos/tipos.ts';
import { Estado } from './Estado.tsx';
import { Icono } from './Icono.tsx';

interface Props {
    readonly fase: Fase;
    readonly control: IdControl | null;
    readonly alCerrar: () => void;
}

export function PanelEvidencia({ fase, control, alCerrar }: Props) {
    const c = CONTROLES.find((x) => x.id === control);
    if (c === undefined) {
        return (
            <aside className="panel panel--vacio" aria-label="Evidencia">
                <Icono nombre="codigo" tamano={28} />
                <p>Elige un control de la matriz para ver el script que lo verifica y la salida real que lo respalda.</p>
            </aside>
        );
    }
    const r = resultadoDe(c.id, fase);
    const antes = resultadoDe(c.id, 'antes');
    const ev = evidenciaDe(c, fase);
    return (
        <aside className="panel" aria-label={`Evidencia de ${c.id}`}>
            <header className="panel__cabeza">
                <div>
                    <p className="panel__meta">{c.id} · {c.tema}{c.complementario ? ' · complementario' : ''}</p>
                    <h2 className="panel__titulo">{c.titulo}</h2>
                </div>
                <button type="button" className="boton-icono" onClick={alCerrar} aria-label="Cerrar la evidencia">
                    <Icono nombre="cerrar" />
                </button>
            </header>
            {r && (
                <p className="panel__estado">
                    {fase === 'despues' && antes && <><Estado estado={antes.estado} /> <span aria-hidden="true">→</span> </>}
                    <Estado estado={r.estado} detalle={`madurez ${r.madurez}`} />
                </p>
            )}
            <ul className="criterios">
                {r?.criterios.map((k) => (
                    <li key={k.id} className={k.ok ? 'criterio criterio--ok' : 'criterio criterio--falla'}>
                        <Icono nombre={k.ok ? 'cumple' : 'no-cumple'} tamano={16} />
                        <span><b>{k.id}</b> · {k.criterio} <span className="criterio__obs">({k.observado})</span></span>
                    </li>
                ))}
            </ul>
            <p className="panel__ruta codigo">{ev.rutaScript}</p>
            <pre className="codigo-bloque" tabIndex={0}>{ev.script}</pre>
            <p className="panel__ruta codigo">{ev.rutaSalida}</p>
            <pre className="codigo-bloque" tabIndex={0}>{ev.salida}</pre>
        </aside>
    );
}
