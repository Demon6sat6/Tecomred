export type Tone = 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'violet' | 'sky';

export const initials = (name: string) => name.trim().split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase() || '?';

export const orderStatusTone = {
  Pendiente: 'amber', Procesando: 'blue', Enviado: 'violet', Entregado: 'green', Cancelado: 'rose',
} as const satisfies Record<string, Tone>;
