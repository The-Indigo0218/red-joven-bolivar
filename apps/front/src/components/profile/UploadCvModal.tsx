import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { api } from '../../api';
import { ApiRequestError } from '../../api/errors';
import type { Skill, UploadCvResponse } from '../../types';
import { extractTextFromPdf } from '../../utils/extractPdfText';
import { LoadingSpinner } from '../ui/LoadingSpinner';

type ModalStep = 'pick' | 'processing' | 'success';

interface UploadCvModalProps {
  open: boolean;
  youngId: string;
  youngName?: string;
  onClose: () => void;
  onSuccess?: (result: UploadCvResponse) => void;
}

export function UploadCvModal({
  open,
  youngId,
  youngName,
  onClose,
  onSuccess,
}: UploadCvModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ModalStep>('pick');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadCvResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const closeModal = useCallback(() => {
    setStep('pick');
    setFileName(null);
    setError(null);
    setResult(null);
    setDragOver(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && step !== 'processing') closeModal();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, step, closeModal]);

  if (!open) return null;

  async function handleFile(file: File) {
    if (!youngId) {
      setError('Guarda tu perfil antes de subir el CV.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setStep('processing');

    try {
      const cvText = await extractTextFromPdf(file);
      const response = await api.young.uploadCv({ cvText, youngId });
      setResult(response);
      setStep('success');
      onSuccess?.(response);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'No pudimos procesar tu CV.';
      setError(message);
      setStep('pick');
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={step !== 'processing' ? closeModal : undefined}
    >
      <div className="absolute inset-0 bg-black/60" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl border shadow-xl"
        style={{
          backgroundColor: 'var(--rjb-surface)',
          borderColor: 'var(--rjb-border)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="flex items-start justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--rjb-border)' }}
        >
          <div>
            <h2 id={titleId} className="text-lg font-bold">
              Subir tu CV
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--rjb-text-muted)' }}>
              {youngName
                ? `PDF de ${youngName} — extraemos tus habilidades para mejorar tu ruta.`
                : 'Sube tu CV en PDF para detectar tus habilidades.'}
            </p>
          </div>
          {step !== 'processing' && (
            <button
              type="button"
              onClick={closeModal}
              className="text-xl leading-none px-2 py-1 rounded-lg"
              style={{ color: 'var(--rjb-text-muted)' }}
              aria-label="Cerrar"
            >
              ×
            </button>
          )}
        </header>

        <div className="px-5 py-5">
          {step === 'pick' && (
            <>
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? 'var(--rjb-accent)' : 'var(--rjb-border)',
                  backgroundColor: dragOver ? 'var(--rjb-surface-2)' : 'transparent',
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <p className="text-4xl mb-3" aria-hidden>
                  📄
                </p>
                <p className="font-semibold mb-1">Arrastra tu PDF aqui</p>
                <p className="text-sm mb-4" style={{ color: 'var(--rjb-text-muted)' }}>
                  o haz clic para elegir archivo
                </p>
                <p className="text-xs" style={{ color: 'var(--rjb-text-muted)' }}>
                  Solo PDF · maximo 5 MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleInputChange}
                />
              </div>

              {fileName && !error && (
                <p className="mt-3 text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
                  Archivo seleccionado: <strong>{fileName}</strong>
                </p>
              )}

              {error && (
                <p
                  className="mt-3 rounded-lg px-3 py-2 text-sm"
                  style={{
                    backgroundColor: 'var(--rjb-surface-2)',
                    color: 'var(--rjb-warning)',
                  }}
                >
                  {error}
                </p>
              )}
            </>
          )}

          {step === 'processing' && (
            <LoadingSpinner
              label={
                fileName
                  ? `Leyendo ${fileName} y extrayendo habilidades...`
                  : 'Procesando tu CV...'
              }
            />
          )}

          {step === 'success' && result && (
            <CvResult result={result} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
}

function CvResult({ result, onClose }: { result: UploadCvResponse; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl px-4 py-3 text-sm border"
        style={{
          borderColor: 'var(--rjb-success)',
          backgroundColor: 'var(--rjb-surface-2)',
          color: 'var(--rjb-success)',
        }}
      >
        CV procesado. Confianza de extraccion: {Math.round(result.confidence * 100)}%
      </div>

      {result.skills.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--rjb-text-muted)' }}>
          No detectamos habilidades del catalogo en tu CV. Proba con otro archivo o revisa que
          mencione competencias como Excel, comunicacion o programacion.
        </p>
      ) : (
        <div>
          <p className="text-sm font-semibold mb-2">Habilidades detectadas</p>
          <SkillList skills={result.skills} />
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: 'var(--rjb-primary)', color: 'var(--rjb-bg)' }}
      >
        Listo
      </button>
    </div>
  );
}

function SkillList({ skills }: { skills: Skill[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="px-3 py-1.5 rounded-full text-sm font-medium border"
          style={{
            borderColor: 'var(--rjb-accent)',
            color: 'var(--rjb-accent)',
          }}
        >
          {skill.label}
          <span className="ml-1 opacity-60 text-xs">({skill.category})</span>
        </li>
      ))}
    </ul>
  );
}
