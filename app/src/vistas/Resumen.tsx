// Pantalla principal: la historia del proyecto en una vista. Arriba, el nivel de riesgo y el mapa de calor (los cinco
// factores pasan de inherente a residual al cambiar de fase); abajo, la matriz conectada con su evidencia.
import { NOMBRE_NIVEL, RIESGO_INHERENTE_CLASE, RIESGO_RESIDUAL_ACEPTADO } from '../datos/escalas.ts';
import { BATERIA, CONTROLES, EVALUACION, nivelGlobal, riesgoPorId, type Fase } from '../datos/cargar.ts';
import type { IdRiesgo } from '../datos/tipos.ts';
import { InterruptorFase } from '../componentes/InterruptorFase.tsx';
import { ListaRiesgos } from '../componentes/ListaRiesgos.tsx';
import { MapaCalor } from '../componentes/MapaCalor.tsx';
import { Matriz } from '../componentes/Matriz.tsx';
import { PanelEvidencia } from '../componentes/PanelEvidencia.tsx';
import { Icono } from '../componentes/Icono.tsx';
import type { Ruta } from '../ruta.ts';

function fecha(iso: string): string {
    const [d, h = ''] = iso.split('T');
    const [a, m, dia] = (d ?? '').split('-');
    return `${dia}/${m}/${a} ${h.slice(0, 5)}`;
}

function Cifra({ fase }: { readonly fase: Fase }) {
    const nivel = nivelGlobal(fase);
    const cumplen = EVALUACION[fase].controles.filter((c) => c.estado === 'Cumple').length;
    const pruebas = BATERIA[fase].pruebas;
    const pasan = pruebas.filter((p) => p.paso).length;
    return (
        <div className="cifra">
            <p className="cifra__rotulo">Nivel de riesgo de confidencialidad</p>
            <p className="cifra__valor"><span className="cifra__numero">{nivel}</span> <span className="cifra__nombre">{NOMBRE_NIVEL[nivel]}</span></p>
            <p className="cifra__contexto">
                {fase === 'antes'
                    ? <>Riesgo inherente. Meta de la administración: llevarlo a <b>{RIESGO_RESIDUAL_ACEPTADO}</b>.</>
                    : <>Era <b>{RIESGO_INHERENTE_CLASE}</b> ({NOMBRE_NIVEL[RIESGO_INHERENTE_CLASE]}). Meta de la administración: <b>{RIESGO_RESIDUAL_ACEPTADO}</b>, {nivel <= RIESGO_RESIDUAL_ACEPTADO ? 'alcanzada' : 'pendiente'}.</>}
            </p>
            <dl className="cifra__totales">
                <div><dt>Controles en Cumple</dt><dd>{cumplen} de {CONTROLES.length}</dd></div>
                <div><dt>Pruebas con el resultado esperado</dt><dd>{pasan} de {pruebas.length}</dd></div>
            </dl>
        </div>
    );
}

interface Props {
    readonly ruta: Ruta;
    readonly navegar: (cambios: Partial<Ruta>) => void;
}

export function Resumen({ ruta, navegar }: Props) {
    const { fase, control, riesgo } = ruta;
    const elegirRiesgo = (id: IdRiesgo): void => navegar({ riesgo: riesgo === id ? null : id });
    const activos: readonly IdRiesgo[] = riesgo !== null ? [riesgo] : CONTROLES.find((c) => c.id === control)?.riesgos ?? [];
    return (
        <>
            <header className="vista-cabeza">
                <div>
                    <h1 className="vista-cabeza__titulo">Riesgo de confidencialidad</h1>
                    <p className="vista-cabeza__sub">Cooperativa Financiera del Valle (ficticia) · evaluación {fase === 'antes' ? 'antes' : 'después'} de los controles · {fecha(EVALUACION[fase].fecha)}</p>
                </div>
                <InterruptorFase fase={fase} alCambiar={(f) => navegar({ fase: f })} />
            </header>
            <section className="historia" aria-label="Nivel de riesgo y mapa de calor">
                <div className="historia__texto">
                    <Cifra fase={fase} />
                    <ListaRiesgos fase={fase} activo={riesgo} alElegir={elegirRiesgo} />
                </div>
                <MapaCalor fase={fase} activos={activos} alElegir={elegirRiesgo} />
            </section>
            <section className="cadena" aria-labelledby="titulo-matriz">
                <div className="cadena__cabeza">
                    <h2 id="titulo-matriz" className="seccion-titulo">Matriz de evaluación</h2>
                    {riesgo !== null && (
                        <button type="button" className="filtro" onClick={() => navegar({ riesgo: null })}>
                            Solo {riesgo} · {riesgoPorId(riesgo).nombre} <Icono nombre="cerrar" tamano={14} />
                            <span className="sr-only">Quitar filtro</span>
                        </button>
                    )}
                    {control === null && <p className="cadena__ayuda">Elige un control para ver el script que lo verifica y la salida real que lo respalda.</p>}
                </div>
                <div className={control === null ? 'cadena__cuerpo' : 'cadena__cuerpo cadena__cuerpo--con-panel'}>
                    <Matriz fase={fase} filtroRiesgo={riesgo} seleccionado={control} alElegir={(id) => navegar({ control: id })} />
                    {control !== null && <PanelEvidencia fase={fase} control={control} alCerrar={() => navegar({ control: null })} />}
                </div>
            </section>
        </>
    );
}
