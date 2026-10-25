// Navegación lateral: las seis partes del artefacto que pide el enunciado (sección 6), más la evolución en el tiempo
// (mejora pedida por el profesor) y la metodología. El uso de IA (sección 8) va solo en el informe: el enunciado lo
// pide ahí, no en el artefacto.
import { enlace, SECCIONES, type IdSeccion, type Ruta } from '../ruta.ts';
import { Icono, type NombreIcono } from './Icono.tsx';

const ICONO: Readonly<Record<IdSeccion, NombreIcono>> = {
    resumen: 'resumen', riesgos: 'riesgo', tareas: 'tabla', mapeo: 'tabla', observables: 'tabla',
    matriz: 'tabla', pruebas: 'prueba', evolucion: 'evolucion', metodologia: 'metodo',
};

export type Tema = 'claro' | 'oscuro';

interface Props {
    readonly ruta: Ruta;
    readonly tema: Tema;
    readonly alCambiarTema: () => void;
}

export function Navegacion({ ruta, tema, alCambiarTema }: Props) {
    return (
        <nav className="nav" aria-label="Secciones del artefacto">
            <div className="nav__marca">
                <span className="nav__titulo">Evaluador de confidencialidad</span>
                <span className="nav__sub">ISO/IEC 27001:2022 · Oracle 21c XE</span>
            </div>
            <ul className="nav__lista">
                {SECCIONES.map((s) => (
                    <li key={s.id}>
                        <a className="nav__enlace" href={enlace(ruta, { seccion: s.id })}
                           aria-current={ruta.seccion === s.id ? 'page' : undefined}>
                            <Icono nombre={ICONO[s.id]} />{s.titulo}
                        </a>
                    </li>
                ))}
            </ul>
            <div className="nav__pie">
                <button type="button" className="nav__tema" onClick={alCambiarTema}>
                    <Icono nombre={tema === 'claro' ? 'luna' : 'sol'} />
                    {tema === 'claro' ? 'Modo oscuro' : 'Modo claro'}
                </button>
                <p className="nav__credito">Adrián Fernández Fernández · UNA · Administración de Bases de Datos · II ciclo 2026</p>
            </div>
        </nav>
    );
}
