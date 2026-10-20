// La "cadena" de los tres mundos: la matriz (tarea, riesgo, control, criterio, evidencia, estado) y, al elegir un
// control, su evidencia real al lado. Se usa en el resumen y en la vista de la matriz.
import { riesgoPorId } from '../datos/cargar.ts';
import type { Ruta } from '../ruta.ts';
import { Icono } from './Icono.tsx';
import { Matriz } from './Matriz.tsx';
import { PanelEvidencia } from './PanelEvidencia.tsx';

interface Props {
    readonly ruta: Ruta;
    readonly navegar: (cambios: Partial<Ruta>) => void;
    readonly titulo?: string;
}

export function CadenaMatriz({ ruta, navegar, titulo }: Props) {
    const { fase, control, riesgo } = ruta;
    return (
        <section className="cadena" {...(titulo !== undefined ? { 'aria-labelledby': 'titulo-matriz' } : { 'aria-label': 'Matriz de evaluación' })}>
            <div className="cadena__cabeza">
                {titulo !== undefined && <h2 id="titulo-matriz" className="seccion-titulo">{titulo}</h2>}
                {riesgo !== null && (
                    <button type="button" className="filtro" onClick={() => navegar({ riesgo: null })}>
                        Solo {riesgo} · {riesgoPorId(riesgo).nombre} <Icono nombre="cerrar" tamano={14} />
                        <span className="sr-only">Quitar filtro</span>
                    </button>
                )}
                {control === null && <p className="cadena__ayuda">Elige un control para ver el script que lo verifica y la salida real que lo respalda.</p>}
            </div>
            <p className="sr-only" aria-live="polite">{control === null ? '' : `Evidencia de ${control} abierta junto a la matriz.`}</p>
            <div className={control === null ? 'cadena__cuerpo' : 'cadena__cuerpo cadena__cuerpo--con-panel'}>
                <Matriz fase={fase} filtroRiesgo={riesgo} seleccionado={control} alElegir={(id) => navegar({ control: id })} />
                {control !== null && <PanelEvidencia fase={fase} control={control} alCerrar={() => navegar({ control: null })} />}
            </div>
        </section>
    );
}
