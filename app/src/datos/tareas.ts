// Artefacto, punto 2: "Tabla de tareas del DBA". Las 12 tareas que nombra el enunciado (OE-2), en su orden, cada una
// con los factores de riesgo que atiende y los controles que la verifican.
import type { Tarea } from './tipos.ts';

export const TAREAS: readonly Tarea[] = [
    { id: 1, nombre: 'Gestión de usuarios', riesgos: ['R-CONF-01'], controles: ['A5.16', 'A5.18'],
      queHaceElDba: 'Da de alta cuentas con responsable, bloquea bajas y cuentas genéricas, y revisa los derechos cada semestre.' },
    { id: 2, nombre: 'Privilegios', riesgos: ['R-CONF-02'], controles: ['A5.15', 'A8.2', 'A8.3'],
      queHaceElDba: 'Concede el acceso solo por roles de negocio, retira privilegios administrativos y ANY, y restringe filas con VPD.' },
    { id: 3, nombre: 'Autenticación', riesgos: ['R-CONF-01'], controles: ['A5.17', 'A8.5'],
      queHaceElDba: 'Asigna perfiles con complejidad, vigencia y bloqueo por intentos fallidos, y exige verificadores modernos.' },
    { id: 4, nombre: 'Cifrado TDE', riesgos: ['R-CONF-04'], controles: ['A8.24'],
      queHaceElDba: 'Gestiona el monedero y la clave maestra, y mantiene los datos de negocio en un tablespace cifrado.' },
    { id: 5, nombre: 'Masking', riesgos: ['R-CONF-03'], controles: ['A5.12', 'A8.11'],
      queHaceElDba: 'Clasifica las columnas personales y las enmascara con Data Redaction para quien no necesita verlas completas.' },
    { id: 6, nombre: 'Backup', riesgos: ['R-CONF-04'], controles: ['A8.13', 'A8.12'],
      queHaceElDba: 'Toma respaldos RMAN cifrados, los valida y controla las exportaciones (Data Pump, directorios, UTL_FILE).' },
    { id: 7, nombre: 'Auditoría', riesgos: ['R-CONF-05'], controles: ['A8.15'],
      queHaceElDba: 'Activa AUDIT con texto SQL sobre sesiones, cuentas, privilegios y lecturas, y deja la revisión semanal.' },
    { id: 8, nombre: 'Parcheo', riesgos: ['R-CONF-02'], controles: ['A8.8'],
      queHaceElDba: 'Revisa versión y parches; si el motor no se puede parchear, documenta la aceptación del riesgo y sus medidas compensatorias.' },
    { id: 9, nombre: 'Listener', riesgos: ['R-CONF-04'], controles: ['A8.20'],
      queHaceElDba: 'Exige cifrado e integridad en Oracle Net e impide cambiar la configuración del listener en caliente.' },
    { id: 10, nombre: 'Eliminación segura', riesgos: ['R-CONF-03'], controles: ['A8.10'],
      queHaceElDba: 'Elimina sin dejar copias recuperables: purga la papelera y borra tablespaces junto con sus archivos.' },
    { id: 11, nombre: 'Logs', riesgos: ['R-CONF-05'], controles: ['A5.33'],
      queHaceElDba: 'Protege la pista de auditoría y los logs del servidor contra borrado, alteración y lectura no autorizada.' },
    { id: 12, nombre: 'Clones DEV/TEST', riesgos: ['R-CONF-03'], controles: ['A8.11'],
      queHaceElDba: 'Genera los clones con datos ficticios y comprueba que no contienen datos reales de producción.' },
];
