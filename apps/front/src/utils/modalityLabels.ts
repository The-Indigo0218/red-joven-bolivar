import type { OpportunityModality } from '../types';

const LABELS: Record<OpportunityModality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
};

export function modalityLabel(modalidad: OpportunityModality): string {
  return LABELS[modalidad];
}
