// Artefacto, punto 6: la batería de pruebas con sus columnas literales (ID, Tipo, Procedimiento, Resultado esperado,
// Herramienta) y el resultado real de cada fase; cada prueba abre su script y su salida.
import { useCallback, useEffect, useRef } from 'react';
import { BATERIA, evidenciaDePrueba, type Fase } from '../datos/cargar.ts';
import type { ResultadoPrueba } from '../datos/tipos.ts';
import { CabeceraVista } from '../componentes/CabeceraVista.tsx';
import { Icono } from '../componentes/Icono.tsx';
import type { Ruta } from '../ruta.ts';

function Resultado({ paso, fase }: { readonly paso: boolean; readonly fase: Fase }) {
    if (paso) return <span className="estado estado--cumple"><Icono nombre="cumple" tamano={16} />Resultado esperado</span>;
    return <span className="estado estado--no-cumple"><Icono nombre="no-cumple" tamano={16} />{fase === 'antes' ? 'Vulnerable' : 'No obtenido'}</span>;
}

function PanelPrueba({ p, fase, alCerrar }: { readonly p: ResultadoPrueba; readonly fase: Fase; readonly alCerrar: () => void }) {
    const ev = evidenciaDePrueba(p.script, fase);
    const ref = useRef<HTMLElement>(null);
    // El cajón se superpone a la tabla: recibe el foco al abrirse y se cierra con Escape.
    useEffect(() => {
        ref.current?.focus();
        const conEscape = (e: KeyboardEvent): void => { if (e.key === 'Escape') alCerrar(); };
        window.addEventListener('keydown', conEscape);
        return () => window.removeEventListener('keydown', conEscape);
    }, [p.id, alCerrar]);
    return (
        <section ref={ref} tabIndex={-1} className="panel panel--cajon" aria-label={`Prueba ${p.id}`}>
            <header className="panel__cabeza">
                <div>
                    <p className="panel__meta">{p.id} · {p.control} · {p.riesgo} · ejecutada como {p.ejecutadoComo}</p>
                    <h2 className="panel__titulo">{p.tipo}</h2>
                </div>
                <button type="button" className="boton-icono" onClick={alCerrar} aria-label="Cerrar la prueba"><Icono nombre="cerrar" /></button>
            </header>
            <p className="panel__estado"><Resultado paso={p.paso} fase={fase} /></p>
            <dl className="mapeo">
                <dt>Procedimiento</dt><dd>{p.procedimiento}</dd>
                <dt>Resultado esperado</dt><dd>{p.esperado}</dd>
                <dt>Obtenido ({fase === 'antes' ? 'antes' : 'después'})</dt>
                <dd><pre className="codigo-bloque codigo-bloque--corto">{p.obtenido.join('\n')}</pre></dd>
            </dl>
            <p className="panel__ruta codigo">{ev.rutaScript}</p>
            <pre className="codigo-bloque" tabIndex={0}>{ev.script}</pre>
            <p className="panel__ruta codigo">{ev.rutaSalida}</p>
            <pre className="codigo-bloque" tabIndex={0}>{ev.salida}</pre>
        </section>
    );
}

function Tabla({ fase, elegida, alElegir }: { readonly fase: Fase; readonly elegida: string | null; readonly alElegir: (id: string) => void }) {
    return (
        <div className="tabla-marco">
            <table className="tabla tabla--apilable">
                <thead>
                    <tr><th scope="col">ID</th><th scope="col">Tipo</th><th scope="col">Procedimiento</th><th scope="col">Resultado esperado</th>
                        <th scope="col">Herramienta</th><th scope="col">Resultado</th></tr>
                </thead>
                <tbody>
                    {BATERIA[fase].pruebas.map((p) => (
                        <tr key={p.id} className={elegida === p.id ? 'fila fila--activa' : 'fila'} onClick={() => alElegir(p.id)}>
                            <td data-etiqueta="ID">
                                <button type="button" className="fila__control codigo" data-prueba={p.id} aria-pressed={elegida === p.id}
                                        onClick={(e) => { e.stopPropagation(); alElegir(p.id); }}>{p.id}</button>
                                <span className="tabla__nota codigo">{p.control}</span>
                            </td>
                            <td data-etiqueta="Tipo">{p.tipo}</td>
                            <td data-etiqueta="Procedimiento" className="tabla__texto">{p.procedimiento}</td>
                            <td data-etiqueta="Resultado esperado" className="tabla__texto">{p.esperado}</td>
                            <td data-etiqueta="Herramienta">{p.herramienta}</td>
                            <td data-etiqueta="Resultado"><Resultado paso={p.paso} fase={fase} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Bateria({ ruta, navegar }: { readonly ruta: Ruta; readonly navegar: (c: Partial<Ruta>) => void }) {
    const pruebas = BATERIA[ruta.fase].pruebas;
    const elegida = pruebas.find((p) => p.id === ruta.prueba);
    const pasan = pruebas.filter((p) => p.paso).length;
    const abierta = ruta.prueba;
    // Al cerrar el cajón, el foco vuelve a la prueba que lo abrió.
    const cerrar = useCallback(() => {
        navegar({ prueba: null });
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`button[data-prueba="${abierta ?? ''}"]`)?.focus());
    }, [navegar, abierta]);
    return (
        <>
            <CabeceraVista titulo="6 · Batería de pruebas" fase={ruta.fase} alCambiarFase={(f) => navegar({ fase: f })}
                enunciado="Batería de pruebas (ID, Tipo, Procedimiento, Resultado esperado, Herramienta).">
                <p className="vista-cabeza__sub">{pasan} de {pruebas.length} pruebas con el resultado esperado {ruta.fase === 'antes' ? 'antes de corregir: en el escenario inicial los ataques tienen éxito' : 'después de corregir'}.</p>
            </CabeceraVista>
            <div className="cadena__cuerpo">
                <Tabla fase={ruta.fase} elegida={ruta.prueba} alElegir={(id) => navegar({ prueba: id })} />
                {elegida !== undefined && <PanelPrueba p={elegida} fase={ruta.fase} alCerrar={cerrar} />}
            </div>
        </>
    );
}
