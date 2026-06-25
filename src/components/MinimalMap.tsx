import React, { useState, useMemo } from 'react';
import { Creator } from '../types';
import { CREATORS } from '../data';
import { MapPin, Compass, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Math distance formula
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert Lat/Lng coordinates to canvas percent
export function coordsToPercent(lat: number, lng: number) {
  const minLat = 28.40;
  const maxLat = 28.75;
  const minLng = 77.00;
  const maxLng = 77.38;

  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  // Invert Y because screen coordinates go top to bottom
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  return { x, y };
}

// Reverse percent to coords
export function percentToCoords(percentX: number, percentY: number) {
  const minLat = 28.40;
  const maxLat = 28.75;
  const minLng = 77.00;
  const maxLng = 77.38;

  const lng = minLng + (percentX / 100) * (maxLng - minLng);
  const lat = minLat + (1 - percentY / 100) * (maxLat - minLat);

  return { lat, lng };
}

interface MinimalMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedCreatorId?: string | null;
  onSelectCreator?: (creatorId: string) => void;
  activeCampaignId?: string | null;
  creators?: Creator[];
}

export default function MinimalMap({
  centerLat,
  centerLng,
  radiusKm,
  onMapClick,
  selectedCreatorId,
  onSelectCreator,
  creators,
}: MinimalMapProps) {
  const [hoveredCreator, setHoveredCreator] = useState<Creator | null>(null);

  // Center position in percent
  const centerPercent = useMemo(() => coordsToPercent(centerLat, centerLng), [centerLat, centerLng]);

  // Radius in pixels (estimate based on map scale)
  // At 28.6 degrees latitude, 1 degree latitude is ~111km.
  // Full latitude span is 28.75 - 28.40 = 0.35 degrees (~39 km)
  // So radius percent = (radiusKm / 39) * 100
  const radiusPercent = useMemo(() => {
    const totalSpanKm = 39;
    return (radiusKm / totalSpanKm) * 100;
  }, [radiusKm]);

  // Map other creators and compute their distance
  const creatorsWithStatus = useMemo(() => {
    return (creators || CREATORS).map((creator) => {
      const distance = getDistanceKm(centerLat, centerLng, creator.lat, creator.lng);
      const isInside = distance <= radiusKm;
      const percent = coordsToPercent(creator.lat, creator.lng);
      return {
        ...creator,
        distance,
        isInside,
        percent,
      };
    });
  }, [centerLat, centerLng, radiusKm]);

  const activeMatchesCount = useMemo(() => {
    return creatorsWithStatus.filter((c) => c.isInside).length;
  }, [creatorsWithStatus]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const coords = percentToCoords(x, y);
    // Standardize decimals
    onMapClick(Number(coords.lat.toFixed(4)), Number(coords.lng.toFixed(4)));
  };

  return (
    <div className="relative w-full h-[360px] md:h-[440px] bg-slate-50 border border-zinc-200/80 rounded-2xl overflow-hidden select-none">
      {/* Abstract Background Design Element */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      {/* Grid Lines representing sectors */}
      <div className="absolute inset-x-0 top-1/3 border-t border-zinc-200/40 pointer-events-none" />
      <div className="absolute inset-x-0 top-2/3 border-t border-zinc-200/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-1/3 border-r border-zinc-200/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-2/3 border-r border-zinc-200/40 pointer-events-none" />

      {/* Aesthetic minimalist map boundary lines (representing Yamuna river and major ring roads of Delhi) */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {/* River Yamuna representation */}
        <path
          d="M 280,0 Q 290,120 380,200 T 450,450"
          className="stroke-blue-400 stroke-[4px] fill-none"
          strokeLinecap="round"
        />
        {/* Ring Road Outer */}
        <ellipse cx="50%" cy="45%" rx="180" ry="140" className="stroke-zinc-400 stroke-[1.5px] stroke-dasharray-[4,4] fill-none" />
        {/* Ring Road Inner */}
        <ellipse cx="55%" cy="42%" rx="90" ry="70" className="stroke-zinc-400 stroke-[1px] fill-none" />
      </svg>

      {/* Hover Info Bubble */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-500 animate-spin-slow" />
          <span className="text-xs font-mono font-medium text-zinc-700">DELHI GEO-RADIAL ENGINE</span>
        </div>
        <div className="bg-zinc-950/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2.5">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-sans font-medium">
            Active Target: <span className="text-indigo-300 font-bold">{activeMatchesCount} matches</span> inside {radiusKm}km radius
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-zinc-200/60 shadow-sm text-[10px] font-mono text-zinc-400 flex flex-col gap-0.5">
        <div>LAT: {centerLat.toFixed(4)}</div>
        <div>LNG: {centerLng.toFixed(4)}</div>
      </div>

      {/* Clickable Map Surface */}
      <div
        id="radius-interactive-map"
        onClick={handleContainerClick}
        className="absolute inset-0 cursor-crosshair"
      >
        {/* Active Radius Selection Circle */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
          style={{
            left: `${centerPercent.x}%`,
            top: `${centerPercent.y}%`,
          }}
        >
          {/* Radial Zone */}
          <div
            className="rounded-full border-2 border-indigo-500/30 bg-indigo-500/10 transition-all duration-300"
            style={{
              width: `${radiusPercent * 8}px`, // Scaled factor for visual appearance
              height: `${radiusPercent * 8}px`,
            }}
          />
          {/* Outer Pulse Indicator */}
          <div
            className="absolute inset-0 rounded-full border border-indigo-400/40 animate-ping"
            style={{
              animationDuration: '3s',
            }}
          />
          {/* Exact Pinpoint */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white shadow-md shadow-indigo-200" />
          </div>
        </div>

        {/* Creator Dots */}
        {creatorsWithStatus.map((creator) => {
          const isSelected = selectedCreatorId === creator.id;
          return (
            <div
              key={creator.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer p-2 group"
              style={{
                left: `${creator.percent.x}%`,
                top: `${creator.percent.y}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCreator) onSelectCreator(creator.id);
              }}
              onMouseEnter={() => setHoveredCreator(creator)}
              onMouseLeave={() => setHoveredCreator(null)}
            >
              {/* Creator Pin Element */}
              <div className="relative flex items-center justify-center">
                {/* Active Match Pulsar */}
                {creator.isInside && (
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-400/20 animate-pulse pointer-events-none" />
                )}

                {/* Dot Base */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 shadow-sm ${
                    isSelected
                      ? 'bg-indigo-600 border-white scale-125 ring-4 ring-indigo-100'
                      : creator.isInside
                      ? 'bg-emerald-500 border-white ring-2 ring-emerald-50'
                      : 'bg-zinc-400 border-white ring-1 ring-zinc-100 opacity-60'
                  }`}
                />

                {/* Locator Pointer for selected */}
                {isSelected && (
                  <MapPin className="absolute -top-7 w-5 h-5 text-indigo-600 animate-bounce" />
                )}
              </div>
            </div>
          );
        })}

        {/* Popover Hover Card */}
        <AnimatePresence>
          {hoveredCreator && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-30 pointer-events-none bg-zinc-950/95 text-white p-3 rounded-xl shadow-xl border border-zinc-800 flex flex-col gap-2 max-w-[200px]"
              style={{
                left: `${hoveredCreator.percent.x}%`,
                top: `calc(${hoveredCreator.percent.y}% - 110px)`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={hoveredCreator.avatar}
                  alt={hoveredCreator.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700 referrerPolicy='no-referrer'"
                />
                <div className="flex flex-col">
                  <div className="text-[11px] font-semibold leading-tight">{hoveredCreator.name}</div>
                  <div className="text-[9px] font-mono text-zinc-400">{hoveredCreator.handle}</div>
                </div>
              </div>
              <div className="border-t border-zinc-800/80 pt-1.5 flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Locality:</span>
                  <span className="text-zinc-300 font-medium">{hoveredCreator.locality.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Audience:</span>
                  <span className="text-emerald-400 font-bold">{hoveredCreator.audienceInLocality}% in zone</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Match score:</span>
                  <span className="text-indigo-400 font-bold">{hoveredCreator.matchScore}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Legends */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4 bg-white/90 backdrop-blur-md border border-zinc-200/50 p-2 rounded-xl text-[10px] font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" />
          <span className="text-zinc-600 font-medium">Inside Zone (Targeted)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-white shadow-sm" />
          <span className="text-zinc-500">Outside Zone</span>
        </div>
      </div>
    </div>
  );
}
