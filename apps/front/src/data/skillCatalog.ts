import type { Skill, SkillCategory } from '../types';

export const SKILL_CATALOG: Array<{ slug: string; label: string; category: SkillCategory }> = [
  { slug: 'logica-programacion', label: 'Lógica de programación', category: 'tecnica' },
  { slug: 'bases-datos', label: 'Bases de datos', category: 'tecnica' },
  { slug: 'redes', label: 'Redes y conectividad', category: 'tecnica' },
  { slug: 'ingles-tecnico', label: 'Inglés técnico', category: 'tecnica' },
  { slug: 'ingles-conversacional', label: 'Inglés conversacional', category: 'blanda' },
  { slug: 'excel-avanzado', label: 'Excel avanzado', category: 'digital' },
  { slug: 'atencion-cliente', label: 'Atención al cliente', category: 'blanda' },
  { slug: 'comunicacion', label: 'Comunicación', category: 'blanda' },
  { slug: 'educacion-ambiental', label: 'Educación ambiental', category: 'tecnica' },
];

export function extractSkillsFromText(cvText: string): Skill[] {
  const haystack = cvText.toLowerCase();
  return SKILL_CATALOG.filter((entry) => {
    const label = entry.label.toLowerCase();
    const slugWords = entry.slug.replace(/-/g, ' ');
    return haystack.includes(label) || haystack.includes(slugWords);
  }).map((entry, index) => ({
    id: `mock-skill-${index}-${entry.slug}`,
    slug: entry.slug,
    label: entry.label,
    category: entry.category,
  }));
}
