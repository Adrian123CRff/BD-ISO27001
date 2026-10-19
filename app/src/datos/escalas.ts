// Escalas del artefacto: impacto y probabilidad de cada factor de riesgo, nivel de riesgo y madurez de los controles.
import type { Madurez, Valor15 } from './tipos.ts';

export interface Nivel {
    readonly valor: Valor15;
    readonly nombre: string;
    readonly significado: string;
}

// Impacto sobre la confidencialidad si el factor de riesgo se materializa.
export const ESCALA_IMPACTO: readonly Nivel[] = [
    { valor: 1, nombre: 'Insignificante', significado: 'Se expone información interna sin datos personales.' },
    { valor: 2, nombre: 'Menor', significado: 'Se exponen datos personales de pocos clientes, sin datos financieros.' },
    { valor: 3, nombre: 'Moderado', significado: 'No se expone un dato directamente, pero se pierde la capacidad de detectar o probar un acceso indebido.' },
    { valor: 4, nombre: 'Mayor', significado: 'Se exponen datos personales y financieros de clientes (Ley 8968).' },
    { valor: 5, nombre: 'Crítico', significado: 'Se expone o copia toda la base, o alguien obtiene control administrativo sobre ella.' },
];

// Probabilidad, anclada a lo que se puede demostrar en el laboratorio.
export const ESCALA_PROBABILIDAD: readonly Nivel[] = [
    { valor: 1, nombre: 'Rara', significado: 'Requiere que fallen a la vez varios controles verificados.' },
    { valor: 2, nombre: 'Improbable', significado: 'Requiere eludir un control activo y verificado con evidencia.' },
    { valor: 3, nombre: 'Posible', significado: 'Requiere acceso al servidor o a la red, sin controles que lo impidan.' },
    { valor: 4, nombre: 'Probable', significado: 'Una prueba lo demostró con una cuenta de negocio existente.' },
    { valor: 5, nombre: 'Casi segura', significado: 'La debilidad está presente siempre, sin que nadie tenga que actuar.' },
];

// Nivel de riesgo de 1 a 5: ⌈impacto × probabilidad / 5⌉. Permite expresar en la misma escala la meta del caso de
// clase: confidencialidad con riesgo inherente 4 y residual aceptado 2 (docs/contexto-de-clase.md).
export const NOMBRE_NIVEL: Readonly<Record<Valor15, string>> = {
    1: 'Muy bajo', 2: 'Bajo', 3: 'Medio', 4: 'Alto', 5: 'Crítico',
};

export const RIESGO_INHERENTE_CLASE = 4;
export const RIESGO_RESIDUAL_ACEPTADO = 2;

export function nivelRiesgo(impacto: Valor15, probabilidad: Valor15): Valor15 {
    const producto = impacto * probabilidad;
    if (producto < 1 || producto > 25) {
        throw new Error(`Producto fuera de rango: ${producto}`);
    }
    return Math.ceil(producto / 5) as Valor15;
}

// Madurez 0-4 tal como la definió el profesor y como la aplica scripts/evaluar.ps1.
export const ESCALA_MADUREZ: Readonly<Record<Madurez, { readonly clase: string; readonly criterio: string }>> = {
    0: { clase: 'No existe.', criterio: 'Ningún criterio técnico del control se cumple.' },
    1: { clase: 'Existe, pero no se aplica constantemente.', criterio: 'Se cumplen algunos criterios técnicos, no todos.' },
    2: { clase: 'Se aplica constantemente, pero no está documentado.', criterio: 'Se cumplen todos los criterios técnicos, sin procedimiento aprobado.' },
    3: { clase: 'Documentado.', criterio: 'Además, hay un procedimiento aprobado en SEGURIDAD.PROCEDIMIENTOS (docs/procedimientos.md).' },
    4: { clase: 'Documentado, aplicado y verificado con evidencia.', criterio: 'Además, la revisión semanal está activa y dejó registro en los últimos 7 días.' },
};

// Estado del enunciado: Cumple / Parcial / No cumple.
export const REGLA_ESTADO = 'Cumple: todos los criterios técnicos se cumplen · Parcial: algunos · No cumple: ninguno.';
