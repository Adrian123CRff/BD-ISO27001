// Raíz de la aplicación: valida los datos al cargar (regla 5) y, si algo no cuadra, muestra los errores en pantalla en
// lugar de una matriz incorrecta. Luego reparte la navegación entre las vistas.
import { useEffect, useState } from 'react';
import { ERRORES_DE_DATOS } from './datos/cargar.ts';
import { Navegacion, type Tema } from './componentes/Navegacion.tsx';
import { Bateria } from './vistas/Bateria.tsx';
import { Evolucion } from './vistas/Evolucion.tsx';
import { Mapeo } from './vistas/Mapeo.tsx';
import { MatrizVista } from './vistas/MatrizVista.tsx';
import { Metodologia } from './vistas/Metodologia.tsx';
import { Observables } from './vistas/Observables.tsx';
import { Resumen } from './vistas/Resumen.tsx';
import { Riesgos } from './vistas/Riesgos.tsx';
import { Tareas } from './vistas/Tareas.tsx';
import { SECCIONES, useRuta, type Ruta } from './ruta.ts';

function temaInicial(): Tema {
    try {
        const guardado = window.localStorage.getItem('tema');
        if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch { /* sin almacenamiento: se usa la preferencia del sistema */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

function ErroresDeDatos() {
    return (
        <main className="errores" role="alert">
            <h1>Los datos del artefacto no pasan la validación</h1>
            <p>No se muestra la matriz para no presentar resultados incorrectos. Errores encontrados:</p>
            <ul>{ERRORES_DE_DATOS.map((e) => <li key={e}>{e}</li>)}</ul>
        </main>
    );
}

function Vista({ ruta, navegar }: { readonly ruta: Ruta; readonly navegar: (c: Partial<Ruta>) => void }) {
    switch (ruta.seccion) {
        case 'resumen': return <Resumen ruta={ruta} navegar={navegar} />;
        case 'riesgos': return <Riesgos ruta={ruta} />;
        case 'tareas': return <Tareas ruta={ruta} />;
        case 'mapeo': return <Mapeo ruta={ruta} />;
        case 'observables': return <Observables ruta={ruta} />;
        case 'matriz': return <MatrizVista ruta={ruta} navegar={navegar} />;
        case 'pruebas': return <Bateria ruta={ruta} navegar={navegar} />;
        case 'evolucion': return <Evolucion />;
        case 'metodologia': return <Metodologia />;
    }
}

export default function App() {
    const [ruta, navegar] = useRuta();
    const [tema, setTema] = useState<Tema>(temaInicial);
    useEffect(() => {
        document.documentElement.dataset.tema = tema;
        try { window.localStorage.setItem('tema', tema); } catch { /* preferencia solo de esta sesión */ }
    }, [tema]);
    useEffect(() => {
        window.scrollTo(0, 0);
        const titulo = SECCIONES.find((s) => s.id === ruta.seccion)?.titulo ?? '';
        document.title = `${titulo} · Evaluador de confidencialidad`;
    }, [ruta.seccion]);
    if (ERRORES_DE_DATOS.length > 0) return <ErroresDeDatos />;
    return (
        <div className="app">
            {/* Botón y no enlace: un href="#contenido" cambiaría la ruta, que vive en el hash. */}
            <button type="button" className="saltar" onClick={() => document.getElementById('contenido')?.focus()}>Saltar al contenido</button>
            <Navegacion ruta={ruta} tema={tema} alCambiarTema={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')} />
            <main className="contenido" id="contenido" tabIndex={-1}>
                <Vista ruta={ruta} navegar={navegar} />
            </main>
        </div>
    );
}
