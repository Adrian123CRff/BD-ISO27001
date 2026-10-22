// Completa docs/informe.md y genera docs/informe.pdf. Solo reescribe los bloques marcados con
// "<!-- generado: X -->" ... "<!-- /generado: X -->" (artefacto, comparativa, capturas de SQL Developer y uso de IA),
// a partir de los mismos datos que usa la aplicación; el resto del informe lo escribe el estudiante y no se toca.
// Si los datos no pasan la validación, no escribe nada y termina con error.
// Uso (Node 23.6 o superior):  node scripts/generar-informe.mts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from '../app/node_modules/marked/lib/marked.esm.js';
import { CONTROLES } from '../app/src/datos/controles.ts';
import { NOMBRE_NIVEL, nivelRiesgo } from '../app/src/datos/escalas.ts';
import { RIESGOS } from '../app/src/datos/riesgos.ts';
import { TAREAS } from '../app/src/datos/tareas.ts';
import type { Bateria, Evaluacion, Riesgo, Valor15 } from '../app/src/datos/tipos.ts';
import { validarArtefacto } from '../app/src/datos/validar.ts';

const RAIZ = new URL('..', import.meta.url);
const INFORME = new URL('docs/informe.md', RAIZ);
const HTML = new URL('salidas/informe.html', RAIZ);
const PDF = new URL('docs/informe.pdf', RAIZ);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function leer(ruta: string): string {
    return readFileSync(new URL(ruta, RAIZ), 'utf8').replace(/^\uFEFF/, '');
}

function leerJson<T>(ruta: string): T {
    return JSON.parse(leer(ruta)) as T;
}

function fila(valores: readonly string[]): string {
    return `| ${valores.map((v) => v.replaceAll('\n', ' ')).join(' | ')} |`;
}

function tabla(encabezados: readonly string[], filas: readonly (readonly string[])[]): string[] {
    return [fila(encabezados), fila(encabezados.map(() => '---')), ...filas.map(fila)];
}

// Reemplaza el contenido entre los marcadores de un bloque; si falta un marcador, es un error (no se adivina dónde va).
function reemplazarBloque(texto: string, id: string, contenido: readonly string[]): string {
    const inicio = `<!-- generado: ${id} -->`;
    const fin = `<!-- /generado: ${id} -->`;
    const a = texto.indexOf(inicio);
    const b = texto.indexOf(fin);
    if (a < 0 || b < a) throw new Error(`Faltan los marcadores del bloque "${id}" en docs/informe.md`);
    return `${texto.slice(0, a + inicio.length)}\n\n${contenido.join('\n')}\n\n${texto.slice(b)}`;
}

// El artefacto completo (docs/artefacto.md), con sus encabezados numerados como subsecciones 6.2 a 6.8.
function bloqueArtefacto(): string[] {
    let n = 1;
    const lineas = leer('docs/artefacto.md').split(/\r?\n/).slice(1).filter((l) => !l.startsWith('> Generado por'));
    return lineas.map((l) => {
        const m = /^## (?:\d+\. )?(.+)$/.exec(l);
        if (m === null) return l;
        n += 1;
        return `### 6.${n} ${m[1] ?? ''}`;
    });
}

function residual(r: Riesgo, despues: Evaluacion, pruebas: Bateria): Valor15 {
    const aceptado = pruebas.pruebas.find((p) => p.id === 'P18')?.paso === true;
    const mitigado = CONTROLES.filter((c) => c.riesgos.includes(r.id)).every((c) => {
        const estado = despues.controles.find((x) => x.control === c.id)?.estado;
        return estado === 'Cumple' || (c.id === 'A8.8' && aceptado && estado === 'Parcial');
    });
    return mitigado ? nivelRiesgo(r.impactoObjetivo, r.probabilidadObjetivo) : nivelRiesgo(r.impacto, r.probabilidad);
}

function conteo(e: Evaluacion, estado: string): number {
    return e.controles.filter((c) => c.estado === estado).length;
}

// "2026-10-20T11:18:03" → "20/10/2026 11:18".
function fecha(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(iso);
    return m === null ? iso : `${m[3]}/${m[2]}/${m[1]} ${m[4]}`;
}

function nivel(v: Valor15): string {
    return `${v} (${NOMBRE_NIVEL[v]})`;
}

function bloqueComparativa(antes: Evaluacion, despues: Evaluacion, pa: Bateria, pd: Bateria): string[] {
    const inherente = Math.max(...RIESGOS.map((r) => nivelRiesgo(r.impacto, r.probabilidad))) as Valor15;
    const final = Math.max(...RIESGOS.map((r) => residual(r, despues, pd))) as Valor15;
    const madurez = (e: Evaluacion): string =>
        (e.controles.reduce((s, c) => s + c.madurez, 0) / e.controles.length).toFixed(1).replace('.', ',');
    const pasan = (b: Bateria): string => `${b.pruebas.filter((p) => p.paso).length} de ${b.pruebas.length}`;
    const factores = RIESGOS.map((r) => {
        const controles = CONTROLES.filter((c) => c.riesgos.includes(r.id)).map((c) =>
            `${c.id} ${despues.controles.find((x) => x.control === c.id)?.estado ?? '?'}`);
        return [r.id, r.nombre, nivel(nivelRiesgo(r.impacto, r.probabilidad)), controles.join(', '), nivel(residual(r, despues, pd))];
    });
    return [
        `Evaluación antes: ${fecha(antes.fecha)} · después: ${fecha(despues.fecha)} · ${despues.motor} · verificado como ${despues.ejecutadoComo}.`, '',
        ...tabla(['Indicador', 'Antes', 'Después'], [
            ['Nivel de riesgo de confidencialidad', nivel(inherente), nivel(final)],
            ['Controles en Cumple', String(conteo(antes, 'Cumple')), String(conteo(despues, 'Cumple'))],
            ['Controles en Parcial', String(conteo(antes, 'Parcial')), String(conteo(despues, 'Parcial'))],
            ['Controles en No cumple', String(conteo(antes, 'No cumple')), String(conteo(despues, 'No cumple'))],
            ['Madurez promedio (0-4)', madurez(antes), madurez(despues)],
            ['Pruebas con el resultado esperado', pasan(pa), pasan(pd)],
        ]), '',
        'Por factor de riesgo: los controles bajan la probabilidad; el impacto no cambia, porque el dato expuesto sería el mismo.', '',
        ...tabla(['Factor', 'Nombre', 'Inherente', 'Controles que lo mitigan (estado después)', 'Residual'], factores), '',
        `El detalle por control (criterio 0-4 y estado, antes y después) está en la matriz (sección 6.7) y el de cada prueba en la batería (sección 6.8).`,
    ];
}

const CAPTURAS_SQL_DEVELOPER = ['V07-A8.2-sql-developer.png', 'V16-A8.24-sql-developer.png', 'V15-A8.20-sql-developer.png'];

function bloqueSqlDeveloper(): string[] {
    const hay = CAPTURAS_SQL_DEVELOPER.filter((f) => existsSync(new URL(`evidencia/sql-developer/${f}`, RAIZ)));
    const faltan = CAPTURAS_SQL_DEVELOPER.filter((f) => !hay.includes(f));
    return [
        ...hay.map((f) => `![Verificación ${f.split('-sql')[0] ?? f} en SQL Developer](../evidencia/sql-developer/${f})\n`),
        ...(faltan.length === 0 ? [] : [
            '> **PENDIENTE DEL ESTUDIANTE**', '>',
            `> Faltan las capturas de SQL Developer en \`evidencia/sql-developer/\`: ${faltan.map((f) => `\`${f}\``).join(', ')}.`,
            '> Se toman siguiendo `docs/guia-sql-developer.md` y se vuelve a ejecutar `node scripts/generar-informe.mts`.',
        ]),
    ];
}

// Celdas de una fila de tabla Markdown, respetando las barras escapadas (\|) dentro de los prompts.
function celdas(linea: string): string[] {
    return linea.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
}

function bloqueUsoIa(): string[] {
    const texto = leer('docs/uso-ia.md');
    const filas = texto.split(/\r?\n/).filter((l) => /^\| \d+ \|/.test(l)).map(celdas).map((c) => {
        if (c.length !== 7) throw new Error(`docs/uso-ia.md: la fila ${c[0] ?? '?'} no tiene 7 columnas`);
        const [n, fecha, herramienta, prompt, aporte, validacion, fuente] = c as [string, string, string, string, string, string, string];
        return [`${herramienta} (${n}, ${fecha})`, prompt, aporte, validacion, fuente];
    });
    const declaracion = texto.split('## Declaración jurada')[1]?.trim();
    if (declaracion === undefined) throw new Error('docs/uso-ia.md: falta la sección "Declaración jurada"');
    return [
        ...tabla(['Herramienta IA', 'Prompt Exacto Utilizado', 'Aporte de la IA', 'Validación / Corrección del Estudiante', 'Fuente Verificada'], filas), '',
        '<div class="declaracion">', '', '**Declaración jurada**', '', declaracion, '', '</div>',
    ];
}

const CSS = `
@page { size: Letter; margin: 2cm 1.7cm 2cm 1.7cm; @bottom-center { content: counter(page); font: 9pt 'Segoe UI', sans-serif; color: #555; } }
@page :first { @bottom-center { content: none; } }
body { font: 10.5pt/1.45 'Segoe UI', Calibri, sans-serif; color: #111; }
h1 { font-size: 22pt; line-height: 1.2; margin: 0 0 12pt; }
h2 { font-size: 15pt; break-before: page; border-bottom: 2px solid #12355b; padding-bottom: 3pt; color: #12355b; }
h3 { font-size: 12pt; color: #12355b; break-after: avoid; }
table { width: 100%; border-collapse: collapse; font-size: 8pt; line-height: 1.3; margin: 6pt 0 10pt; }
th, td { border: 1px solid #b8c2cc; padding: 3pt 4pt; vertical-align: top; text-align: left; overflow-wrap: break-word; }
.id { white-space: nowrap; }
th { background: #e8eef4; } tr { break-inside: avoid; }
code { font: 8.5pt Consolas, monospace; background: #f1f3f5; padding: 0 2pt; }
img { display: block; max-width: 88%; margin: 6pt auto 12pt; border: 1px solid #b8c2cc; break-inside: avoid; }
blockquote { border: 2px dashed #b45309; background: #fff7ed; margin: 8pt 0; padding: 4pt 10pt; break-inside: avoid; }
.portada { min-height: 22cm; display: flex; flex-direction: column; justify-content: center; }
.portada table { font-size: 10pt; } .portada p { font-size: 12pt; }
.declaracion { border: 1px solid #12355b; padding: 6pt 12pt; margin-top: 12pt; break-inside: avoid; }
`;

function generarPdf(markdown: string): void {
    mkdirSync(new URL('salidas/', RAIZ), { recursive: true });
    const html = marked.parse(markdown.replace(/<!--[\s\S]*?-->/g, ''), { async: false });
    // Los identificadores (R-CONF-01, A8.2, P09, V07, C13) no se parten en las columnas angostas. Solo se toca el texto
    // entre etiquetas, nunca los atributos (por ejemplo, el alt de una imagen).
    const cuerpo = html.replace(/>([^<]+)</g, (_m: string, t: string) =>
        `>${t.replace(/\b(R-CONF-0\d|A[58]\.\d+|[PVCM]\d{2})\b/g, '<span class="id">$1</span>')}<`);
    writeFileSync(HTML, `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe ISO 27001 confidencialidad</title><style>${CSS}</style></head><body>${cuerpo}</body></html>`, 'utf8');
    const perfil = fileURLToPath(new URL('salidas/edge-perfil/', RAIZ));
    const antes = existsSync(PDF) ? statSync(PDF).mtimeMs : 0;
    execFileSync(EDGE, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--user-data-dir=${perfil}`,
        `--print-to-pdf=${fileURLToPath(PDF)}`, pathToFileURL(fileURLToPath(HTML)).href], { stdio: 'ignore', timeout: 120000 });
    if (!existsSync(PDF) || statSync(PDF).mtimeMs === antes) throw new Error('Edge no generó docs/informe.pdf');
}

const antes = leerJson<Evaluacion>('app/src/datos/evaluacion-antes.json');
const despues = leerJson<Evaluacion>('app/src/datos/evaluacion-despues.json');
const pruebasAntes = leerJson<Bateria>('app/src/datos/pruebas-antes.json');
const pruebasDespues = leerJson<Bateria>('app/src/datos/pruebas-despues.json');
const errores = validarArtefacto({ riesgos: RIESGOS, tareas: TAREAS, controles: CONTROLES }, [antes, despues], [pruebasAntes, pruebasDespues]);
if (errores.length > 0) {
    console.error(`Datos inválidos (${errores.length}):\n- ${errores.join('\n- ')}`);
    process.exit(1);
}

let informe = readFileSync(INFORME, 'utf8');
informe = reemplazarBloque(informe, 'artefacto', bloqueArtefacto());
informe = reemplazarBloque(informe, 'comparativa', bloqueComparativa(antes, despues, pruebasAntes, pruebasDespues));
informe = reemplazarBloque(informe, 'sql-developer', bloqueSqlDeveloper());
informe = reemplazarBloque(informe, 'uso-ia', bloqueUsoIa());
writeFileSync(INFORME, informe, 'utf8');
generarPdf(informe);
console.log('docs/informe.md actualizado y docs/informe.pdf generado.');
