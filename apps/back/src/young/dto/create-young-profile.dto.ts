import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { INTEREST_SLUGS } from '../../common/interests';
import type {
  Availability,
  EducationLevel,
  InterestSlug,
  SeekingType,
} from '../young.entity';

const EDUCATION_LEVELS: EducationLevel[] = [
  'primaria',
  'bachillerato-en-curso',
  'bachiller',
  'tecnico',
  'tecnologo',
  'universitario',
  'ninguno',
];

const SEEKING_TYPES: SeekingType[] = [
  'empleo',
  'voluntariado',
  'estudio',
  'todos',
];

const AVAILABILITY_OPTIONS: Availability[] = [
  'manana',
  'tarde',
  'noche',
  'fines-de-semana',
  'tiempo-completo',
];

// Contrato de POST /young/profile (ver docs/API_CONTRACTS.md).
export class CreateYoungProfileDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(12)
  @Max(35)
  age!: number;

  @IsString()
  barrio!: string;

  @IsIn(EDUCATION_LEVELS)
  educationLevel!: EducationLevel;

  @IsIn(SEEKING_TYPES)
  seeking!: SeekingType;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(AVAILABILITY_OPTIONS, { each: true })
  availability!: Availability[];

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(INTEREST_SLUGS, { each: true })
  interests!: InterestSlug[];
}
