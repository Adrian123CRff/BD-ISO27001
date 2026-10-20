// Metodología PHVA (enunciado, sección 7) y cómo la matriz une los tres mundos de la clase.
import { EVALUACION } from '../datos/cargar.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { fechaCorta } from '../utilidades.ts';

const PASOS = [
    { fase: 'Planificar', texto: 'Se describe la situación inicial del cliente ficticio con sus debilidades, se analizan los cinco factores de riesgo (impacto y probabilidad) y se fijan los procedimientos de cada control.',
      archivos: ['sql/01-escenario.sql', 'sql/02-auditor.sql', 'app/src/datos/riesgos.ts', 'docs/procedimientos.md'] },
    { fase: 'Hacer', texto: 'Se aplican las correcciones en orden, incluido el reinicio que exigen los parámetros estáticos: TDE, roles, perfiles, clasificación, Data Redaction, VPD, cierre de fugas, purga, clon ficticio, auditoría, red cifrada, respaldo cifrado, gobierno y permisos de los logs.',
      archivos: ['scripts/corregir.ps1', 'sql/correccion/C01 … C15', 'evidencia/correccion/'] },
    { fase: 'Verificar', texto: 'Antes y después de corregir, 18 scripts de solo lectura calculan el estado y la madurez de cada control, y 19 pruebas intentan explotar cada debilidad. Además se reinicia la base para comprobar que el cifrado sobrevive.',
      archivos: ['scripts/evaluar.ps1', 'scripts/pruebas.ps1', 'evidencia/antes/', 'evidencia/despues/', 'evidencia/reinicio/'] },
    { fase: 'Actuar', texto: 'La revisión semanal programada deja un registro en la bitácora; el riesgo que no se puede corregir (A8.8, XE sin parches) se acepta formalmente con medidas compensatorias; y los errores que encontró la corrida se corrigieron en los propios scripts antes de repetirla desde cero.',
      archivos: ['sql/correccion/C14-gobierno.sql', 'docs/procedimientos.md#a88', 'sql/mantenimiento/M01-regenerar-autologin.sql'] },
] as const;

const MUNDOS = [
    { mundo: 'Administrativo', aporta: 'ISO/IEC 27001 y 27002, análisis de riesgo (inherente 4 → residual 2), procedimientos y madurez 0-4.', columna: 'Riesgo · Control · Criterio 0-4' },
    { mundo: 'Base de datos', aporta: 'Las 12 tareas del DBA: usuarios, privilegios, perfiles, TDE, enmascaramiento, respaldos, auditoría…', columna: 'Tarea' },
    { mundo: 'Herramientas Oracle', aporta: 'Consultas al diccionario, AUDIT, RMAN, TDE, Data Redaction y VPD, ejecutadas sobre Oracle 21c XE.', columna: 'Evidencia · Estado' },
] as const;

export function Metodologia() {
    return (
        <>
            <CabeceraVista titulo="Metodología PHVA" enunciado="Metodología: PHVA (Planificar-Hacer-Verificar-Actuar)." />
            <ol className="phva">
                {PASOS.map((p, i) => (
                    <li key={p.fase} className="tarjeta phva__paso">
                        <span className="phva__letra" aria-hidden="true">{p.fase[0]}</span>
                        <h2 className="tarjeta__titulo">{i + 1}. {p.fase}</h2>
                        <p>{p.texto}</p>
                        <ul className="archivos">{p.archivos.map((a) => <li key={a} className="codigo">{a}</li>)}</ul>
                    </li>
                ))}
            </ol>
            <section className="grupo" aria-labelledby="titulo-mundos">
                <h2 id="titulo-mundos" className="seccion-titulo">Los tres mundos que une la matriz</h2>
                <div className="tabla-marco">
                    <table className="tabla tabla--apilable">
                        <thead><tr><th scope="col">Mundo</th><th scope="col">Qué aporta</th><th scope="col">Columna de la matriz</th></tr></thead>
                        <tbody>
                            {MUNDOS.map((m) => (
                                <tr key={m.mundo}><td data-etiqueta="Mundo"><b>{m.mundo}</b></td><td data-etiqueta="Qué aporta">{m.aporta}</td><td data-etiqueta="Columna">{m.columna}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="grupo" aria-labelledby="titulo-corrida">
                <h2 id="titulo-corrida" className="seccion-titulo">Datos de la corrida</h2>
                <dl className="ficha">
                    <div><dt>Motor</dt><dd>{EVALUACION.despues.motor}</dd></div>
                    <div><dt>Verificación ejecutada como</dt><dd>{EVALUACION.despues.ejecutadoComo}</dd></div>
                    <div><dt>Evaluación antes</dt><dd>{fechaCorta(EVALUACION.antes.fecha)}</dd></div>
                    <div><dt>Evaluación después</dt><dd>{fechaCorta(EVALUACION.despues.fecha)}</dd></div>
                </dl>
            </section>
        </>
    );
}
