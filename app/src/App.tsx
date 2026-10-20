// Raíz de la aplicación: valida los datos al cargar (regla 5) y, si algo no cuadra, muestra los errores en pantalla en
// lugar de una matriz incorrecta. Luego reparte la navegación entre las vistas.
import { useEffect, useState } from 'react';
import { ERRORES_DE_DATOS } from './datos/cargar.ts';
import { Navegacion, type Tema } from './componentes/Navegacion.tsx';
import { Resumen } from './vistas/Resumen.tsx';
import { SECCIONES, useRuta } from './ruta.ts';

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

function EnConstruccion({ titulo }: { readonly titulo: string }) {
    return (
        <section className="en-construccion">
            <h1 className="vista-cabeza__titulo">{titulo}</h1>
            <p>Esta sección se construye en la siguiente etapa. Su contenido ya está en <code>docs/artefacto.md</code>.</p>
        </section>
    );
}

export default function App() {
    const [ruta, navegar] = useRuta();
    const [tema, setTema] = useState<Tema>(temaInicial);
    useEffect(() => {
        document.documentElement.dataset.tema = tema;
        try { window.localStorage.setItem('tema', tema); } catch { /* preferencia solo de esta sesión */ }
    }, [tema]);
    if (ERRORES_DE_DATOS.length > 0) return <ErroresDeDatos />;
    const titulo = SECCIONES.find((s) => s.id === ruta.seccion)?.titulo ?? '';
    return (
        <div className="app">
            <Navegacion ruta={ruta} tema={tema} alCambiarTema={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')} />
            <main className="contenido" id="contenido">
                {ruta.seccion === 'resumen' || ruta.seccion === 'matriz'
                    ? <Resumen ruta={ruta} navegar={navegar} />
                    : <EnConstruccion titulo={titulo} />}
            </main>
        </div>
    );
}
