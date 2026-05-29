import type { Opportunity } from '../opportunities/opportunity.entity';
import type { InterestSlug, YoungProfile } from '../young/young.entity';
import { affinityScore } from './affinity';

function profile(
  interests: InterestSlug[],
  barrio: string,
): YoungProfile {
  return {
    id: 'young-1',
    name: 'Joven de prueba',
    age: 18,
    barrio,
    educationLevel: 'bachiller',
    seeking: 'empleo',
    availability: ['manana'],
    interests,
    createdAt: new Date('2026-01-01'),
  };
}

function opportunity(
  interests: InterestSlug[],
  barrio: string,
): Opportunity {
  return {
    id: 'opp-1',
    title: 'Oportunidad de prueba',
    organization: 'Org',
    kind: 'empleo',
    requirements: [],
    slotsTotal: 5,
    slotsAvailable: 5,
    barrio,
    interests,
  };
}

describe('affinityScore', () => {
  it('devuelve 1 cuando hay solape total de intereses y mismo barrio', () => {
    const score = affinityScore(
      profile(['tecnologia', 'arte'], 'Manga'),
      opportunity(['tecnologia', 'arte'], 'Manga'),
    );
    expect(score).toBe(1);
  });

  it('pondera solape parcial de intereses con barrio distinto', () => {
    // 1 de 2 intereses → interestScore 0.5 → 0.6*0.5 + 0 = 0.3
    const score = affinityScore(
      profile(['tecnologia'], 'Manga'),
      opportunity(['tecnologia', 'arte'], 'Bocagrande'),
    );
    expect(score).toBe(0.3);
  });

  it('suma bonus de barrio cuando no hay intereses en común', () => {
    const score = affinityScore(
      profile(['deporte'], 'Manga'),
      opportunity(['tecnologia'], 'Manga'),
    );
    expect(score).toBe(0.4);
  });

  it('devuelve 0.6 con solape total pero barrio distinto', () => {
    const score = affinityScore(
      profile(['tecnologia'], 'Manga'),
      opportunity(['tecnologia'], 'Bocagrande'),
    );
    expect(score).toBe(0.6);
  });

  it('devuelve 0 sin solape ni mismo barrio', () => {
    const score = affinityScore(
      profile(['deporte'], 'Manga'),
      opportunity(['tecnologia'], 'Bocagrande'),
    );
    expect(score).toBe(0);
  });

  it('trata intereses vacíos de la oportunidad como score de interés 0', () => {
    expect(
      affinityScore(profile(['tecnologia'], 'Manga'), opportunity([], 'Manga')),
    ).toBe(0.4);
    expect(
      affinityScore(
        profile(['tecnologia'], 'Manga'),
        opportunity([], 'Bocagrande'),
      ),
    ).toBe(0);
  });

  it('redondea a dos decimales', () => {
    // 1 de 3 intereses → 0.333… → raw ≈ 0.6*0.333 + 0.4*1 ≈ 0.6
    const score = affinityScore(
      profile(['tecnologia'], 'Manga'),
      opportunity(['tecnologia', 'arte', 'deporte'], 'Manga'),
    );
    expect(score).toBe(0.6);
  });
});
