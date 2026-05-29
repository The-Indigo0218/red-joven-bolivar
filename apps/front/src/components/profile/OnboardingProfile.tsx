// Pantalla 1 — OnboardingProfile.
// Captura el perfil del joven (genera la señal de demanda).
// TODO: implementar el formulario completo y POST /young/profile.
// Estructura lista para construir — sin lógica de negocio todavía.

export function OnboardingProfile() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-2">Creá tu perfil</h1>
      <p className="mb-8" style={{ color: 'var(--rjb-text-muted)' }}>
        Contanos quién sos y qué buscás. Tus intereses ayudan a que las
        instituciones abran las oportunidades que tu barrio necesita.
      </p>

      <form
        className="space-y-6 rounded-2xl p-6 border"
        style={{
          backgroundColor: 'var(--rjb-surface)',
          borderColor: 'var(--rjb-border)',
        }}
      >
        {/* TODO: campos — nombre, edad, barrio (mockBarrios), intereses (múltiple),
            nivel educativo, qué busca, disponibilidad horaria. */}
        <p style={{ color: 'var(--rjb-text-muted)' }}>
          Formulario en construcción.
        </p>
      </form>
    </section>
  );
}
