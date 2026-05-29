// Gráfico de barras con el top de intereses declarados (Recharts).
// Estructura lista para construir — datos de mockDemand (luego GET /demand/by-interest).

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { InterestDemand } from '../../types';

interface DemandChartProps {
  interests: InterestDemand[];
}

export function DemandChart({ interests }: DemandChartProps) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ backgroundColor: 'var(--rjb-surface)', borderColor: 'var(--rjb-border)', height: 360 }}
    >
      <h3 className="text-lg font-bold mb-4">Top intereses declarados</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={interests}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              color: '#F9FAFB',
            }}
          />
          <Bar dataKey="youngCount" fill="#06B6D4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
