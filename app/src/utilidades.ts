// Utilidades de presentación sin estado.

// "2026-10-18T10:04:12" → "18/10/2026 10:04"
export function fechaCorta(iso: string): string {
    const [d, h = ''] = iso.split('T');
    const [a, m, dia] = (d ?? '').split('-');
    return `${dia}/${m}/${a} ${h.slice(0, 5)}`;
}
