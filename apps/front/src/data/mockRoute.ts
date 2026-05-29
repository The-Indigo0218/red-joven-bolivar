import type {
  CivicCoinsBalanceResponse,
  GrowthRouteResponse,
  RedemptionCatalogResponse,
  SuggestedActivitiesResponse,
} from '../types';

export function buildMockRoute(
  opportunityId: string,
  youngId: string,
): GrowthRouteResponse {
  return {
    opportunityId,
    youngId,
    affinityScore: 62,
    headline: 'Estas cerca: refuerza Excel y logica para este empleo en Cartagena.',
    matchingSkills: [
      { id: 's1', slug: 'comunicacion', label: 'Comunicacion', category: 'blanda' },
      { id: 's2', slug: 'trabajo-en-equipo', label: 'Trabajo en equipo', category: 'blanda' },
    ],
    missingSkills: [
      { id: 's3', slug: 'excel-avanzado', label: 'Excel avanzado', category: 'digital' },
      { id: 's4', slug: 'logica-programacion', label: 'Logica de programacion', category: 'tecnica' },
    ],
    closingOpportunities: [],
  };
}

export const mockCivicCoinsBalance = (youngId: string): CivicCoinsBalanceResponse => ({
  youngId,
  balance: 120,
  history: [
    {
      id: 'tx1',
      type: 'earned',
      amount: 50,
      description: 'Limpieza de playa en La Boquilla',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'tx2',
      type: 'earned',
      amount: 70,
      description: 'Bono de bienvenida a Red Joven Bolivar',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ],
});

export const mockSuggestedActivities: SuggestedActivitiesResponse = {
  items: [
    {
      id: 'act1',
      title: 'Limpieza comunitaria La Boquilla',
      description: 'Jornada de recoleccion de residuos en la playa.',
      pointsReward: 50,
      category: 'medio-ambiente',
      barrio: 'La Boquilla',
      requiredSkills: [],
      affinityScore: 85,
    },
    {
      id: 'act2',
      title: 'Taller de emprendimiento juvenil',
      description: 'Sesion grupal para ideas de negocio local.',
      pointsReward: 40,
      category: 'emprendimiento',
      barrio: 'Chiquinquira',
      requiredSkills: [
        { id: 's5', slug: 'comunicacion', label: 'Comunicacion', category: 'blanda' },
      ],
      affinityScore: 72,
    },
  ],
};

export const mockRedemptionCatalog: RedemptionCatalogResponse = {
  items: [
    {
      id: 'cat1',
      partner: 'Almacenes Exito',
      description: 'Descuento en insumos escolares',
      pointsCost: 100,
      category: 'insumos',
      discount: 15,
    },
    {
      id: 'cat2',
      partner: 'SENA Cartagena',
      description: 'Prioridad en inscripcion a curso corto',
      pointsCost: 200,
      category: 'educacion',
      discount: null,
    },
  ],
};
