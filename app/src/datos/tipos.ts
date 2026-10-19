// Tipos del artefacto. Los datos de dominio (riesgos, tareas, controles) son constantes tipadas (regla 3); los
// resultados de la evaluación y de la batería los generan scripts/evaluar.ps1 y scripts/pruebas.ps1 en JSON.

export type IdRiesgo = 'R-CONF-01' | 'R-CONF-02' | 'R-CONF-03' | 'R-CONF-04' | 'R-CONF-05';

// Los 15 controles que nombra el enunciado (OE-3) más los dos complementarios de las tareas TDE y parcheo.
export type IdControl =
    | 'A5.12' | 'A5.15' | 'A5.16' | 'A5.17' | 'A5.18' | 'A5.33'
    | 'A8.2' | 'A8.3' | 'A8.5' | 'A8.10' | 'A8.11' | 'A8.12' | 'A8.13' | 'A8.15' | 'A8.20'
    | 'A8.24' | 'A8.8';

export type IdTarea = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Escalas de 1 a 5 (ver escalas.ts).
export type Valor15 = 1 | 2 | 3 | 4 | 5;

export interface Riesgo {
    readonly id: IdRiesgo;
    readonly nombre: string;
    readonly categoria: string;
    readonly descripcion: string;
    readonly enElEscenario: string;
    readonly impacto: Valor15;
    readonly probabilidad: Valor15;
    readonly porQueImpacto: string;
    readonly porQueProbabilidad: string;
    readonly impactoObjetivo: Valor15;
    readonly probabilidadObjetivo: Valor15;
    readonly porQueObjetivo: string;
    readonly pruebas: readonly string[];
}

export interface Tarea {
    readonly id: IdTarea;
    readonly nombre: string;
    readonly queHaceElDba: string;
    readonly riesgos: readonly IdRiesgo[];
    readonly controles: readonly IdControl[];
}

export interface Control {
    readonly id: IdControl;
    readonly titulo: string;
    readonly tema: 'Organizacional' | 'Tecnológico';
    readonly complementario: boolean;
    readonly riesgos: readonly IdRiesgo[];
    readonly justificacion: string;
    readonly implementacion: string;
    readonly scriptsCorreccion: readonly string[];
    readonly scriptVerificacion: string;
    readonly consultaAuditor: string;
    readonly pruebas: readonly string[];
    readonly procedimiento: string;
}

// ---- Resultados generados por los scripts (JSON) ----

export type Estado = 'Cumple' | 'Parcial' | 'No cumple';
export type Madurez = 0 | 1 | 2 | 3 | 4;

export interface Criterio {
    readonly id: string;
    readonly ok: boolean;
    readonly criterio: string;
    readonly observado: string;
    readonly script: string;
}

export interface ResultadoControl {
    readonly control: IdControl;
    readonly estado: Estado;
    readonly madurez: Madurez;
    readonly cumplidos: number;
    readonly total: number;
    readonly documentado: boolean;
    readonly verificado: boolean;
    readonly falloDeControl: boolean;
    readonly criterios: readonly Criterio[];
    readonly gobierno: readonly Criterio[];
}

export interface Evaluacion {
    readonly fase: 'antes' | 'despues';
    readonly fecha: string;
    readonly motor: string;
    readonly ejecutadoComo: string;
    readonly controles: readonly ResultadoControl[];
}

export interface ResultadoPrueba {
    readonly id: string;
    readonly tipo: string;
    readonly control: IdControl;
    readonly riesgo: IdRiesgo;
    readonly procedimiento: string;
    readonly esperado: string;
    readonly herramienta: string;
    readonly ejecutadoComo: string;
    readonly script: string;
    readonly paso: boolean;
    readonly obtenido: readonly string[];
}

export interface Bateria {
    readonly fase: 'antes' | 'despues';
    readonly fecha: string;
    readonly pruebas: readonly ResultadoPrueba[];
}
