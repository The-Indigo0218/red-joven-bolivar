import type {
  Availability,
  EducationLevel,
  InterestSlug,
  SeekingType,
} from '../types';

export const INTEREST_OPTIONS: { slug: InterestSlug; label: string }[] = [
  { slug: 'tecnologia', label: 'Tecnología' },
  { slug: 'arte', label: 'Arte' },
  { slug: 'deporte', label: 'Deporte' },
  { slug: 'emprendimiento', label: 'Emprendimiento' },
  { slug: 'medio-ambiente', label: 'Medio ambiente' },
  { slug: 'liderazgo', label: 'Liderazgo' },
];

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'primaria', label: 'Primaria' },
  { value: 'bachillerato-en-curso', label: 'Bachillerato en curso' },
  { value: 'bachiller', label: 'Bachiller' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'tecnologo', label: 'Tecnólogo' },
  { value: 'universitario', label: 'Universitario' },
  { value: 'ninguno', label: 'Ninguno' },
];

export const SEEKING_OPTIONS: { value: SeekingType; label: string }[] = [
  { value: 'empleo', label: 'Empleo' },
  { value: 'voluntariado', label: 'Voluntariado' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'todos', label: 'Los tres' },
];

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
  { value: 'fines-de-semana', label: 'Fines de semana' },
  { value: 'tiempo-completo', label: 'Tiempo completo' },
];
