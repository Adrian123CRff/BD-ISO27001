// Uso de IA (enunciado, sección 8): la tabla y la declaración jurada se leen de docs/uso-ia.md, la misma fuente que
// va al informe, para que nunca haya dos versiones distintas.
import usoIa from '../../../docs/uso-ia.md?raw';
import type { ReactNode } from 'react';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';

interface Registro {
    readonly numero: string;
    readonly fecha: string;
    readonly herramienta: string;
    readonly prompt: string;
    readonly aporte: string;
    readonly validacion: string;
    readonly fuente: string;
}

function leerRegistros(md: string): Registro[] {
    return md.split('\n').filter((l) => /^\| \d+ \|/.test(l)).map((l) => {
        const c = l.replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').split(/\s\|\s/);
        return { numero: c[0] ?? '', fecha: c[1] ?? '', herramienta: c[2] ?? '', prompt: c[3] ?? '', aporte: c[4] ?? '', validacion: c[5] ?? '', fuente: c[6] ?? '' };
    });
}

// Texto de Markdown simple: saltos <br> y código entre comillas invertidas; el resto se muestra tal cual.
function texto(md: string): ReactNode[] {
    return md.replaceAll('<br>', '\n').replace(/^_|_$/g, '').split('`').map((parte, i) => (i % 2 === 1 ? <code key={i} className="codigo">{parte}</code> : parte));
}

const REGISTROS = leerRegistros(usoIa);
const DECLARACION = usoIa.split('## Declaración jurada')[1]?.trim() ?? '';

export function UsoIA() {
    const pendientes = REGISTROS.filter((r) => r.validacion.includes('Pendiente')).length;
    return (
        <>
            <CabeceraVista titulo="Uso de IA" enunciado="Debe incluir en el informe una sección con la siguiente tabla: Herramienta IA | Prompt Exacto Utilizado | Aporte de la IA | Validación / Corrección del Estudiante | Fuente Verificada.">
                <p className="vista-cabeza__sub">{REGISTROS.length} prompts registrados textualmente en <span className="codigo">docs/uso-ia.md</span> · {pendientes} con la validación del estudiante pendiente.</p>
            </CabeceraVista>
            <ol className="registros">
                {REGISTROS.map((r) => (
                    <li key={r.numero} className="tarjeta registro">
                        <p className="tarjeta__meta">#{r.numero} · {r.fecha} · {r.herramienta}</p>
                        <blockquote className="registro__prompt">{texto(r.prompt)}</blockquote>
                        <dl className="mapeo">
                            <dt>Aporte de la IA</dt><dd>{texto(r.aporte)}</dd>
                            <dt>Validación / corrección del estudiante</dt>
                            <dd className={r.validacion.includes('Pendiente') ? 'registro__pendiente' : ''}>{texto(r.validacion)}</dd>
                            <dt>Fuente verificada</dt><dd>{texto(r.fuente)}</dd>
                        </dl>
                    </li>
                ))}
            </ol>
            <section className="grupo tarjeta" aria-labelledby="titulo-declaracion">
                <h2 id="titulo-declaracion" className="seccion-titulo">Declaración jurada</h2>
                <p className="parrafo registro__declaracion">{DECLARACION}</p>
            </section>
        </>
    );
}
