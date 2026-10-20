// Pantalla principal: la historia del proyecto en una vista. Arriba, el nivel de riesgo y el mapa de calor (los cinco
// factores pasan de inherente a residual al cambiar de fase); abajo, la matriz conectada con su evidencia.
import { NOMBRE_NIVEL, RIESGO_INHERENTE_CLASE, RIESGO_RESIDUAL_ACEPTADO } from '../datos/escalas.ts';
import { BATERIA, CONTROLES, EVALUACION, nivelGlobal, type Fase } from '../datos/cargar.ts';
import type { IdRiesgo } from '../datos/tipos.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { CadenaMatriz } from '../componentes/CadenaMatriz.tsx';
import { ListaRiesgos } from '../componentes/ListaRiesgos.tsx';
import { MapaCalor } from '../componentes/MapaCalor.tsx';
import type { Ruta } from '../ruta.ts';
import { fechaCorta } from '../utilidades.ts';

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
    const elegirRiesgo = (id: IdRiesgo): void => {
        const nuevo = riesgo === id ? null : id;
        const mitiga = nuevo === null || CONTROLES.find((c) => c.id === control)?.riesgos.includes(nuevo) === true;
        navegar({ riesgo: nuevo, control: mitiga ? control : null });
    };
    const activos: readonly IdRiesgo[] = riesgo !== null ? [riesgo] : CONTROLES.find((c) => c.id === control)?.riesgos ?? [];
    return (
        <>
            <CabeceraVista titulo="Riesgo de confidencialidad" fase={fase} alCambiarFase={(f) => navegar({ fase: f })}>
                <p className="vista-cabeza__sub">Cooperativa Financiera del Valle (ficticia) · evaluación {fase === 'antes' ? 'antes' : 'después'} de los controles · {fechaCorta(EVALUACION[fase].fecha)}</p>
            </CabeceraVista>
            <section className="historia" aria-label="Nivel de riesgo y mapa de calor">
                <div className="historia__texto">
                    <Cifra fase={fase} />
                    <ListaRiesgos fase={fase} activo={riesgo} alElegir={elegirRiesgo} />
                </div>
                <MapaCalor fase={fase} activos={activos} alElegir={elegirRiesgo} />
            </section>
            <CadenaMatriz ruta={ruta} navegar={navegar} titulo="Matriz de evaluación" />
        </>
    );
}
