// Lista de los cinco factores de riesgo junto al mapa: es su vista en tabla (los mismos datos, sin depender del
// gráfico) y su leyenda. Elegir un factor filtra la matriz a sus controles.
import { NOMBRE_NIVEL, nivelRiesgo } from '../datos/escalas.ts';
import { posicionDe, RIESGOS, type Fase, type Posicion } from '../datos/cargar.ts';
import type { IdRiesgo } from '../datos/tipos.ts';

function textoLogro(pos: Posicion): string {
    switch (pos.logro) {
        case 'inherente': return 'Situación inicial';
        case 'alcanzado': return 'Residual objetivo alcanzado';
        case 'aceptado': return `Alcanzado con riesgo aceptado (${pos.sinCumplir.join(', ')})`;
        case 'pendiente': return `Pendiente: ${pos.sinCumplir.join(', ')}`;
    }
}

interface Props {
    readonly fase: Fase;
    readonly activo: IdRiesgo | null;
    readonly alElegir: (id: IdRiesgo) => void;
}

export function ListaRiesgos({ fase, activo, alElegir }: Props) {
    return (
        <ol className="riesgos">
            {RIESGOS.map((r) => {
                const inherente = nivelRiesgo(r.impacto, r.probabilidad);
                const pos = posicionDe(r, fase);
                return (
                    <li key={r.id}>
                        <button type="button" className={activo === r.id ? 'riesgo riesgo--activo' : 'riesgo'}
                                aria-pressed={activo === r.id} onClick={() => alElegir(r.id)}>
                            <span className="riesgo__marca" aria-hidden="true">{r.id.slice(-2)}</span>
                            <span className="riesgo__cuerpo">
                                <span className="riesgo__nombre">{r.id} · {r.nombre}</span>
                                <span className="riesgo__dato">
                                    Inherente {inherente} ({NOMBRE_NIVEL[inherente]})
                                    {fase === 'despues' && <> → residual <b>{pos.nivel} ({NOMBRE_NIVEL[pos.nivel]})</b></>}
                                </span>
                                <span className="riesgo__logro">{textoLogro(pos)}</span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );
}
