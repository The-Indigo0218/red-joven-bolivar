import { useState, type FormEvent } from 'react';
import { mockBarrios } from '../../data/mockBarrios';
import {
  AVAILABILITY_OPTIONS,
  EDUCATION_OPTIONS,
  INTEREST_OPTIONS,
  SEEKING_OPTIONS,
} from '../../constants/formOptions';
import { useApp } from '../../hooks/useApp';
import type {
  Availability,
  CreateYoungProfileRequest,
  EducationLevel,
  InterestSlug,
  SeekingType,
  UploadCvResponse,
} from '../../types';
import { UploadCvModal } from './UploadCvModal';

interface FormState {
  name: string;
  age: string;
  barrio: string;
  educationLevel: EducationLevel | '';
  seeking: SeekingType | '';
  interests: InterestSlug[];
  availability: Availability[];
}

interface FormErrors {
  name?: string;
  age?: string;
  barrio?: string;
  educationLevel?: string;
  seeking?: string;
  interests?: string;
  availability?: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  age: '',
  barrio: '',
  educationLevel: '',
  seeking: '',
  interests: [],
  availability: [],
};

interface OnboardingProfileProps {
  onComplete?: () => void;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Ingresá tu nombre (mínimo 2 caracteres).';
  }

  const age = Number(form.age);
  if (!form.age || Number.isNaN(age)) {
    errors.age = 'Ingresá tu edad.';
  } else if (age < 12 || age > 35) {
    errors.age = 'La edad debe estar entre 12 y 35 años.';
  }

  if (!form.barrio) {
    errors.barrio = 'Seleccioná tu barrio.';
  }

  if (!form.educationLevel) {
    errors.educationLevel = 'Seleccioná tu nivel educativo.';
  }

  if (!form.seeking) {
    errors.seeking = 'Indicá qué estás buscando.';
  }

  if (form.interests.length === 0) {
    errors.interests = 'Seleccioná al menos un interés.';
  }

  if (form.availability.length === 0) {
    errors.availability = 'Seleccioná al menos una franja horaria.';
  }

  return errors;
}

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function OnboardingProfile({ onComplete }: OnboardingProfileProps) {
  const { profile, saveProfile, clearProfile, isSavingProfile, notifyCvSkillsUpdated } = useApp();
  const [form, setForm] = useState<FormState>(() =>
    profile
      ? {
          name: profile.name,
          age: String(profile.age),
          barrio: profile.barrio,
          educationLevel: profile.educationLevel,
          seeking: profile.seeking,
          interests: [...profile.interests],
          availability: [...profile.availability],
        }
      : INITIAL_FORM,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [cvResult, setCvResult] = useState<UploadCvResponse | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const request: CreateYoungProfileRequest = {
      name: form.name.trim(),
      age: Number(form.age),
      barrio: form.barrio,
      educationLevel: form.educationLevel as EducationLevel,
      seeking: form.seeking as SeekingType,
      interests: form.interests,
      availability: form.availability,
    };

    try {
      await saveProfile(request);
      setSubmitted(true);
      onComplete?.();
    } catch {
      setErrors({ name: 'No pudimos guardar tu perfil. Intenta de nuevo.' });
    }
  }

  const fieldClass =
    'w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2';
  const fieldStyle = {
    borderColor: 'var(--rjb-border)',
    color: 'var(--rjb-text)',
    backgroundColor: 'var(--rjb-surface-2)',
  } as const;

  const selectClass = (empty: boolean) =>
    `${fieldClass} rjb-select${empty ? ' rjb-select--placeholder' : ''}`;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Creá tu perfil</h1>
      <p className="mb-6 sm:mb-8 text-sm sm:text-base" style={{ color: 'var(--rjb-text-muted)' }}>
        Contanos quién sos y qué buscás. Tus intereses ayudan a que las
        instituciones abran las oportunidades que tu barrio necesita.
      </p>

      {submitted && profile && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm border"
          style={{
            backgroundColor: 'var(--rjb-surface-2)',
            borderColor: 'var(--rjb-success)',
            color: 'var(--rjb-success)',
          }}
        >
          Perfil guardado. ¡Hola, {profile.name}! Podés ver oportunidades en la pestaña
          correspondiente o subir tu CV (PDF o TXT) para mejorar tu ruta.
        </div>
      )}

      {profile && (
        <div
          className="mb-6 rounded-2xl p-4 sm:p-5 border"
          style={{
            backgroundColor: 'var(--rjb-surface)',
            borderColor: 'var(--rjb-border)',
          }}
        >
          <h2 className="text-base font-bold mb-1">Tu CV</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--rjb-text-muted)' }}>
            Sube tu hoja de vida en PDF o TXT. La IA extrae tus habilidades y mejora el score en{' '}
            <strong>Ver mi ruta</strong>.
          </p>
          <button
            type="button"
            onClick={() => setCvModalOpen(true)}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--rjb-accent)', color: 'var(--rjb-bg)' }}
          >
            Subir CV (PDF o TXT)
          </button>

          {cvResult && cvResult.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--rjb-border)' }}>
              <p className="text-sm font-semibold mb-2">
                Ultimas habilidades detectadas ({Math.round(cvResult.confidence * 100)}% confianza)
              </p>
              <div className="flex flex-wrap gap-2">
                {cvResult.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ borderColor: 'var(--rjb-accent)', color: 'var(--rjb-accent)' }}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <UploadCvModal
        open={cvModalOpen}
        youngId={profile?.id ?? ''}
        youngName={profile?.name}
        onClose={() => setCvModalOpen(false)}
        onSuccess={(response) => {
          setCvResult(response);
          notifyCvSkillsUpdated();
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl p-4 sm:p-6 border"
        style={{
          backgroundColor: 'var(--rjb-surface)',
          borderColor: 'var(--rjb-border)',
        }}
        noValidate
      >
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold mb-1">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={fieldClass}
            style={{
              ...fieldStyle,
              borderColor: errors.name ? 'var(--rjb-warning)' : 'var(--rjb-border)',
            }}
            placeholder="Tu nombre completo"
          />
          {errors.name && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Edad */}
        <div>
          <label htmlFor="age" className="block text-sm font-semibold mb-1">
            Edad
          </label>
          <input
            id="age"
            type="number"
            min={12}
            max={35}
            value={form.age}
            onChange={(e) => updateField('age', e.target.value)}
            className={fieldClass}
            style={{
              ...fieldStyle,
              borderColor: errors.age ? 'var(--rjb-warning)' : 'var(--rjb-border)',
            }}
            placeholder="Ej: 18"
          />
          {errors.age && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.age}
            </p>
          )}
        </div>

        {/* Barrio */}
        <div>
          <label htmlFor="barrio" className="block text-sm font-semibold mb-1">
            Barrio de Cartagena
          </label>
          <select
            id="barrio"
            value={form.barrio}
            onChange={(e) => updateField('barrio', e.target.value)}
            className={selectClass(!form.barrio)}
            style={{
              borderColor: errors.barrio ? 'var(--rjb-warning)' : 'var(--rjb-border)',
            }}
          >
            <option value="">Seleccioná tu barrio</option>
            {mockBarrios.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.barrio && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.barrio}
            </p>
          )}
        </div>

        {/* Intereses */}
        <fieldset>
          <legend className="block text-sm font-semibold mb-2">Intereses</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTEREST_OPTIONS.map(({ slug, label }) => {
              const checked = form.interests.includes(slug);
              return (
                <label
                  key={slug}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer border"
                  style={{
                    backgroundColor: checked ? 'var(--rjb-surface-2)' : 'transparent',
                    borderColor: checked ? 'var(--rjb-accent)' : 'var(--rjb-border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      updateField('interests', toggleItem(form.interests, slug))
                    }
                    className="accent-cyan-500"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          {errors.interests && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.interests}
            </p>
          )}
        </fieldset>

        {/* Nivel educativo */}
        <div>
          <label htmlFor="education" className="block text-sm font-semibold mb-1">
            Nivel educativo actual
          </label>
          <select
            id="education"
            value={form.educationLevel}
            onChange={(e) =>
              updateField('educationLevel', e.target.value as EducationLevel | '')
            }
            className={selectClass(!form.educationLevel)}
            style={{
              borderColor: errors.educationLevel ? 'var(--rjb-warning)' : 'var(--rjb-border)',
            }}
          >
            <option value="">Seleccioná tu nivel</option>
            {EDUCATION_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.educationLevel && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.educationLevel}
            </p>
          )}
        </div>

        {/* Qué busca */}
        <fieldset>
          <legend className="block text-sm font-semibold mb-2">¿Qué buscás?</legend>
          <div className="flex flex-wrap gap-2">
            {SEEKING_OPTIONS.map(({ value, label }) => {
              const active = form.seeking === value;
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer border"
                  style={{
                    backgroundColor: active ? 'var(--rjb-primary)' : 'transparent',
                    borderColor: active ? 'var(--rjb-primary)' : 'var(--rjb-border)',
                    color: active ? 'var(--rjb-bg)' : 'var(--rjb-text)',
                  }}
                >
                  <input
                    type="radio"
                    name="seeking"
                    value={value}
                    checked={active}
                    onChange={() => updateField('seeking', value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          {errors.seeking && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.seeking}
            </p>
          )}
        </fieldset>

        {/* Disponibilidad */}
        <fieldset>
          <legend className="block text-sm font-semibold mb-2">
            Disponibilidad horaria
          </legend>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map(({ value, label }) => {
              const checked = form.availability.includes(value);
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer border"
                  style={{
                    backgroundColor: checked ? 'var(--rjb-surface-2)' : 'transparent',
                    borderColor: checked ? 'var(--rjb-accent)' : 'var(--rjb-border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      updateField('availability', toggleItem(form.availability, value))
                    }
                    className="accent-cyan-500"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          {errors.availability && (
            <p className="mt-1 text-xs" style={{ color: 'var(--rjb-warning)' }}>
              {errors.availability}
            </p>
          )}
        </fieldset>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: 'var(--rjb-primary)', color: 'var(--rjb-bg)' }}
          >
            {isSavingProfile ? 'Guardando...' : 'Guardar perfil'}
          </button>
          {profile && (
            <button
              type="button"
              onClick={() => {
                clearProfile();
                setForm(INITIAL_FORM);
                setSubmitted(false);
                setErrors({});
                setCvResult(null);
                setCvModalOpen(false);
              }}
              className="px-4 py-3 rounded-lg text-sm font-semibold border"
              style={{
                borderColor: 'var(--rjb-border)',
                color: 'var(--rjb-text-muted)',
              }}
            >
              Borrar perfil
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
