// Mapa de Cartagena con la concentración de jóvenes por barrio (Leaflet + React-Leaflet).
// Estructura lista para construir — los datos vienen de mockDemand (luego GET /demand/by-zone).

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { ZoneDemand } from '../../types';

interface DemandMapProps {
  zones: ZoneDemand[];
}

// Centro aproximado de Cartagena de Indias.
const CARTAGENA_CENTER: [number, number] = [10.4106, -75.5144];

export function DemandMap({ zones }: DemandMapProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--rjb-border)', height: 360 }}
    >
      <MapContainer
        center={CARTAGENA_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone) => (
          <CircleMarker
            key={zone.barrio}
            center={[zone.lat, zone.lng]}
            radius={Math.max(6, Math.sqrt(zone.youngCount))}
            pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.5 }}
          >
            <Tooltip>
              {zone.barrio}: {zone.youngCount} jóvenes
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
