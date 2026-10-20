// Datos extremos SOLO PARA DESARROLLO (skill break-ui): se activan con ?datos=extremo en `npm run dev` y la
// compilación de producción los elimina (import.meta.env.DEV es falso). Cada valor es un caso realista, no inventado:
// - el estudiante ajusta riesgos.ts y tres factores quedan con los mismos valores (3 marcadores en una celda) y los
//   cinco con el mismo residual objetivo (5 en una celda);
// - una corrida posterior encuentra que la VPD dejó de funcionar (A8.3 en No cumple, P06 falla): R-CONF-02 no baja;
// - se renombra un script y su salida ya no se encuentra (A8.20);
// - Oracle devuelve un error largo en lo obtenido de una prueba.
import type { Bateria, Control, Evaluacion, Riesgo } from './tipos.ts';

export interface Conjunto {
    readonly riesgos: readonly Riesgo[];
    readonly controles: readonly Control[];
    readonly evaluacion: { readonly antes: Evaluacion; readonly despues: Evaluacion };
    readonly bateria: { readonly antes: Bateria; readonly despues: Bateria };
}

const ERROR_LARGO = 'ORA-28113: policy predicate has error ORA-06512: at "SEGURIDAD.FN_VPD_CARTERA", line 18 ORA-01403: no data found ORA-06512: at line 1';

export function conjuntoExtremo(real: Conjunto): Conjunto {
    const riesgos = real.riesgos.map((r): Riesgo => ({
        ...r,
        impacto: ['R-CONF-01', 'R-CONF-02', 'R-CONF-03'].includes(r.id) ? 4 : r.impacto,
        probabilidad: ['R-CONF-01', 'R-CONF-02', 'R-CONF-03'].includes(r.id) ? 4 : r.probabilidad,
        impactoObjetivo: 4,
        probabilidadObjetivo: 2,
    }));
    const controles = real.controles.map((c): Control => (c.id === 'A8.20' ? { ...c, scriptVerificacion: 'V15-A8.20-redes-v2.sql' } : c));
    const despues: Evaluacion = {
        ...real.evaluacion.despues,
        controles: real.evaluacion.despues.controles.map((r) => (r.control !== 'A8.3' ? r : {
            ...r, estado: 'No cumple', madurez: 0, cumplidos: 0,
            criterios: r.criterios.map((k) => ({ ...k, ok: false, observado: 'Política VPD_CARTERA_ANALISTA deshabilitada tras la importación del esquema' })),
        })),
    };
    const bateriaDespues: Bateria = {
        ...real.bateria.despues,
        pruebas: real.bateria.despues.pruebas.map((p) => (p.id !== 'P06' ? p : { ...p, paso: false, obtenido: [ERROR_LARGO] })),
    };
    return { riesgos, controles, evaluacion: { antes: real.evaluacion.antes, despues }, bateria: { antes: real.bateria.antes, despues: bateriaDespues } };
}
