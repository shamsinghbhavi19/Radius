import React, { useState, useEffect } from 'react';
import { Campaign, Creator } from '../types';
import { REGIONS, CREATORS } from '../data';
import { getDistanceKm } from './MinimalMap';
import {
  Sparkles,
  DollarSign,
  Users,
  Clock,
  Radio,
  Play,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
  Navigation,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BrandWorkspaceProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  setCenterLat: (lat: number) => void;
  setCenterLng: (lng: number) => void;
  setRadiusKm: (radius: number) => void;
  onCampaignCreated: (campaign: Campaign) => void;
  activeCampaigns: Campaign[];
  setActiveCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setSelectedCreator: (creator: Creator) => void;
  setView: (view: 'brand' | 'creator') => void;
  setSelectedCampaignId: (id: string | null) => void;
  activeSubTab?: 'setup' | 'dispatch' | 'analytics' | 'profile';
  customBrandName: string;
  setCustomBrandName: (name: string) => void;
  creators?: Creator[];
}

export default function BrandWorkspace({
  centerLat,
  centerLng,
  radiusKm,
  setCenterLat,
  setCenterLng,
  setRadiusKm,
  onCampaignCreated,
  activeCampaigns,
  setActiveCampaigns,
  setSelectedCreator,
  setView,
  setSelectedCampaignId,
  activeSubTab = 'setup',
  customBrandName,
  setCustomBrandName,
  creators,
}: BrandWorkspaceProps) {
  // Campaign Creator State
  const [title, setTitle] = useState('New South Delhi Flash Tour');
  const [brandName, setBrandName] = useState(customBrandName || 'Local Craft Brewers');
  const [niche, setNiche] = useState('Food & Lifestyle');
  const [deliverable, setDeliverable] = useState('1 Instagram Story highlighting local patio dining');
  const [budget, setBudget] = useState(450);
  const [spotsTotal, setSpotsTotal] = useState(3);
  const [durationHours, setDurationHours] = useState(24);
  const [isActivating, setIsActivating] = useState(false);

  // Sync brandName when customBrandName changes
  useEffect(() => {
    if (customBrandName) {
      setBrandName(customBrandName);
    }
  }, [customBrandName]);

  // Auto-locality match based on coordinates
  const currentLocality = useEffect(() => {
    let closestRegion = REGIONS[0];
    let minDistance = getDistanceKm(centerLat, centerLng, REGIONS[0].lat, REGIONS[0].lng);

    for (let i = 1; i < REGIONS.length; i++) {
      const dist = getDistanceKm(centerLat, centerLng, REGIONS[i].lat, REGIONS[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = REGIONS[i];
      }
    }
    // Update label to reflect coords
    return;
  }, [centerLat, centerLng]);

  const resolvedLocalityLabel = () => {
    let closestRegion = REGIONS[0];
    let minDistance = getDistanceKm(centerLat, centerLng, REGIONS[0].lat, REGIONS[0].lng);

    for (let i = 1; i < REGIONS.length; i++) {
      const dist = getDistanceKm(centerLat, centerLng, REGIONS[i].lat, REGIONS[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestRegion = REGIONS[i];
      }
    }
    return closestRegion.name;
  };

  // Smart Budget Estimator
  const estimatedBudgetRange = () => {
    // Basic heuristics
    let baseRate = 120; // base price per creator
    if (niche.includes('Tech')) baseRate = 180;
    if (niche.includes('Fashion')) baseRate = 150;
    if (deliverable.toLowerCase().includes('reel')) baseRate *= 1.8;

    // Radius multiplier (larger radius = more targeted competitors = higher premium)
    const radiusMultiplier = radiusKm <= 3 ? 1.0 : radiusKm <= 6 ? 1.15 : 1.3;

    const min = Math.round(baseRate * spotsTotal * radiusMultiplier);
    const max = Math.round(baseRate * spotsTotal * 1.4 * radiusMultiplier);
    return { min, max };
  };

  const { min: estMin, max: estMax } = estimatedBudgetRange();

  // Handle slider auto-recommender
  useEffect(() => {
    setBudget(Math.round((estMin + estMax) / 2));
  }, [spotsTotal, niche, deliverable, radiusKm, estMin, estMax]);

  // Find creators within current campaign radius
  const matchingCreators = () => {
    return (creators || CREATORS).map((creator) => {
      const dist = getDistanceKm(centerLat, centerLng, creator.lat, creator.lng);
      const isInside = dist <= radiusKm;
      return { ...creator, dist, isInside };
    }).filter((c) => c.isInside);
  };

  const currentMatches = matchingCreators();

  // Create Campaign
  const handleLaunchCampaign = () => {
    setIsActivating(true);
    setTimeout(() => {
      // Setup programmatic batches based on matching creators
      // Batch A: Priority Match (Velocity Tier & Highest Match Scores)
      // Batch B: Medium Match (High Match Scores but Free Tier)
      // Batch C: Backup Match (Further distance or lower match scores)
      const sortedMatches = [...currentMatches].sort((a, b) => b.matchScore - a.matchScore);

      const batchA_ids = sortedMatches
        .filter((c) => c.velocityTier === 'Velocity')
        .map((c) => c.id);

      const batchB_ids = sortedMatches
        .filter((c) => c.velocityTier === 'Free' && c.matchScore >= 90)
        .map((c) => c.id);

      const batchC_ids = sortedMatches
        .filter((c) => !batchA_ids.includes(c.id) && !batchB_ids.includes(c.id))
        .map((c) => c.id);

      // fallback in case batches are empty
      if (batchA_ids.length === 0 && sortedMatches.length > 0) {
        batchA_ids.push(sortedMatches[0].id);
      }
      if (batchB_ids.length === 0 && sortedMatches.length > 1) {
        batchB_ids.push(sortedMatches[1].id);
      }

      const campaign: Campaign = {
        id: `camp_${Date.now()}`,
        title,
        brandName,
        niche,
        deliverable,
        centerLocality: resolvedLocalityLabel(),
        centerLat,
        centerLng,
        radiusKm,
        budget,
        spotsTotal,
        spotsFilled: 0,
        durationHours,
        createdAt: new Date().toISOString(),
        status: 'active',
        escrowStatus: 'locked',
        activeBatchIndex: 0,
        batches: [
          {
            id: `b_a_${Date.now()}`,
            name: 'Batch A',
            creatorIds: batchA_ids.length > 0 ? batchA_ids : ['c1'],
            status: 'dispatched',
            timeLeftSeconds: 240, // Simulated quick minutes (240s)
            totalTimeSeconds: 240,
          },
          {
            id: `b_b_${Date.now()}`,
            name: 'Batch B',
            creatorIds: batchB_ids.length > 0 ? batchB_ids : ['c5'],
            status: 'pending',
            timeLeftSeconds: 240,
            totalTimeSeconds: 240,
          },
          {
            id: `b_c_${Date.now()}`,
            name: 'Batch C',
            creatorIds: batchC_ids.length > 0 ? batchC_ids : ['c2', 'c4'],
            status: 'pending',
            timeLeftSeconds: 240,
            totalTimeSeconds: 240,
          },
        ],
      };

      onCampaignCreated(campaign);
      setIsActivating(false);
    }, 1500);
  };

  // Simulate Batch Cascade manual trigger
  const handleSimulateCascade = (campaignId: string) => {
    setActiveCampaigns((prev) =>
      prev.map((camp) => {
        if (camp.id !== campaignId) return camp;
        const nextIndex = camp.activeBatchIndex + 1;

        if (nextIndex >= camp.batches.length) {
          // completed cascade with remaining unfilled
          return {
            ...camp,
            activeBatchIndex: camp.batches.length - 1,
          };
        }

        const updatedBatches = camp.batches.map((b, idx) => {
          if (idx === camp.activeBatchIndex) {
            return { ...b, status: 'cascaded' as const, timeLeftSeconds: 0 };
          }
          if (idx === nextIndex) {
            return { ...b, status: 'dispatched' as const };
          }
          return b;
        });

        return {
          ...camp,
          activeBatchIndex: nextIndex,
          batches: updatedBatches,
        };
      })
    );
  };

  if (activeSubTab === 'profile') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Brand Profile Editor Card */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-zinc-900">Brand Identity & Node Settings</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage your public brand workspace details, authorized contacts, and cryptographically linked release settings.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Node
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Corporate Name</label>
              <input
                id="brand-profile-name-input"
                type="text"
                value={customBrandName || ''}
                onChange={(e) => {
                  setCustomBrandName(e.target.value);
                  setBrandName(e.target.value);
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                placeholder="e.g. Blue Tokai Coffee"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Corporate Domain</label>
              <input
                id="brand-profile-domain-input"
                type="text"
                defaultValue="bluetokaicoffee.com"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. brand.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Authorized Administrator Email</label>
              <input
                id="brand-profile-email-input"
                type="email"
                defaultValue="harbolabhavya745@gmail.com"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. admin@brand.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Market Sector</label>
              <select
                id="brand-profile-sector-select"
                defaultValue="Food & Lifestyle"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="Food & Lifestyle">Food & Lifestyle</option>
                <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                <option value="Tech & Gaming">Tech & Gaming</option>
                <option value="Photography & Art">Photography & Art</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Bio / Mission Statement</label>
            <textarea
              id="brand-profile-bio-textarea"
              rows={3}
              defaultValue="Bringing specialty coffee directly to lovers across India. We source, roast, and serve fresh artisanal coffee within highly responsive, geolocated retail experiences."
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none leading-relaxed"
              placeholder="Tell creators who you are..."
            />
          </div>

          <div className="border-t border-zinc-100 pt-5 flex flex-col gap-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Secure Escrow Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium flex items-center gap-1">
                  <span className="text-zinc-400">$</span> Funding Escrow Wallet
                </label>
                <input
                  id="brand-profile-wallet-input"
                  type="text"
                  defaultValue="0x3FaA881c62bE09C137119E15b8c9d09c31F7B92"
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="0x..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Auto-Release Verification Mechanism</label>
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-xs text-zinc-600 font-medium">EXIF & GPS Match Trigger</span>
                  <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    AUTOMATED
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 flex justify-end">
            <button
              id="brand-profile-save-btn"
              onClick={() => {
                alert("Brand workspace settings updated successfully!");
              }}
              className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-xs rounded-xl font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              SAVE SETTINGS & DEPLOY
            </button>
          </div>
        </div>

        {/* Brand Stats Sidebar Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-6 shadow-xl flex flex-col gap-5 border border-zinc-800">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-display font-black text-lg">
                {customBrandName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight leading-none">{customBrandName}</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">Brand Node Operator</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Locked Capital</span>
                <span className="text-lg font-black text-white mt-1">${activeCampaigns.reduce((sum, c) => sum + c.budget, 0)}</span>
              </div>
              <div className="flex flex-col p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Grid Campaigns</span>
                <span className="text-lg font-black text-white mt-1">{activeCampaigns.length} Active</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Audit Trail Credentials
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your corporate node is currently integrated into the Delhi NCR cryptographic router. All campaigns automatically deploy automated multi-modal smart escrows.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'setup') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Campaign Builder Form */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-zinc-900">1. Define Campaign Radius</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Set localized radius. Creators in this geofence will be programmatically dispatched.
              </p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-100 flex items-center gap-1.5 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              Geo-targeted
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Brand Name</label>
              <input
                type="text"
                value={brandName || ''}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. Blue Tokai"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Campaign Title</label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. South Delhi Buzz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Target Niche</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="Food & Lifestyle">Food & Lifestyle</option>
                <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                <option value="Tech & Gaming">Tech & Gaming</option>
                <option value="Photography & Art">Photography & Art</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Deliverable</label>
              <input
                type="text"
                value={deliverable || ''}
                onChange={(e) => setDeliverable(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Map Location Coordinates indicator */}
          <div className="bg-zinc-50/60 border border-zinc-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-zinc-700">{resolvedLocalityLabel()}</span>
                <span className="text-[10px] text-zinc-400">Centered at: {centerLat.toFixed(4)}N, {centerLng.toFixed(4)}E</span>
              </div>
            </div>
            <div className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-2 py-0.5 rounded border border-indigo-100">
              CLICK MAP TO RE-CENTER
            </div>
          </div>

          {/* Radius & Quota Setup sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-700">Activation Radius</span>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Haversine geofence calculation is live</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-700">Target Quota (Spots)</span>
                <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{spotsTotal} creators</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={spotsTotal}
                onChange={(e) => setSpotsTotal(Number(e.target.value))}
                className="w-full accent-zinc-800 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Platform triggers auto-cascade until filled</span>
            </div>
          </div>

          {/* Smart Budget Estimator Widget */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-zinc-700">Smart Budget Recommender</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Estimated range: <span className="text-zinc-800 font-bold">${estMin} - ${estMax}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min={estMin - 100 > 50 ? estMin - 100 : 50}
                  max={estMax + 200}
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
              <div className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 font-mono text-sm font-bold text-zinc-800 flex items-center">
                $<input
                  type="number"
                  value={isNaN(budget) || budget === 0 ? '' : budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-14 focus:outline-none text-right font-mono"
                />
              </div>
            </div>
          </div>

          {/* Escrow Contract Terms Notice */}
          <div className="border border-zinc-150 rounded-xl p-3 bg-zinc-50/35 flex gap-3 items-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-zinc-700">Automated Escrow Protocol</span>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Your budget of <span className="font-semibold text-zinc-800">${budget}</span> will be locked instantly in a smart contract. Payouts release autonomously to creators upon successful multi-modal EXIF location match.
              </p>
            </div>
          </div>

          {/* Launch Campaign Button */}
          <button
            onClick={handleLaunchCampaign}
            disabled={isActivating || currentMatches.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-display font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              currentMatches.length === 0
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-900 active:scale-[0.98] cursor-pointer shadow-md shadow-zinc-200'
            }`}
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                <span>Locking Budget & Dispersing Batches...</span>
              </>
            ) : currentMatches.length === 0 ? (
              <span>No Creators Inside Selected Zone</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Lock ${budget} in Escrow & Launch Campaign</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Match list panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Matched Creators in Area */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-900">Programmatic Queue Analysis</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Creators within geofence analyzed by response latency and audience concentration.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[310px] overflow-y-auto pr-1">
              {currentMatches.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl">
                  <p className="text-xs text-zinc-400">Drag sliders or click map to view matching creators</p>
                </div>
              ) : (
                currentMatches.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => setSelectedCreator(creator)}
                    className="group border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-100 referrerPolicy='no-referrer'"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-zinc-800">{creator.name}</span>
                          {creator.velocityTier === 'Velocity' && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200/80 font-mono text-[9px] px-1.5 py-0.2 rounded font-medium">
                              Velocity
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{creator.handle} • {creator.followers} followers</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-mono font-bold text-indigo-600">{creator.matchScore}% match</span>
                      <span className="text-[9px] text-zinc-400 font-medium">
                        Responds in ~{creator.latencyHours}h
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-[11px] text-zinc-500 font-medium">
              <span>Total audience pool:</span>
              <span className="text-zinc-800 font-bold">
                {currentMatches.reduce((acc, c) => acc + parseInt(c.followers), 0)}K Reach
              </span>
            </div>
          </div>

          {/* Quick Platform Metrics card */}
          <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono tracking-wider uppercase text-zinc-400">Aesthetic ROI Estimate</span>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display text-zinc-100">3.5x</span>
                <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Average localized conversion boost</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display text-zinc-100">70%</span>
                <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Admin cost reduction vs agencies</span>
              </div>
            </div>

            <div className="bg-zinc-800/80 border border-zinc-700/60 p-3 rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium">Est. Cost Per Local Visit</span>
                <span className="text-xs font-bold text-zinc-100 font-mono">${(budget / (spotsTotal || 1)).toFixed(1)}</span>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'dispatch') {
    return (
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-display font-semibold text-zinc-900">Campaign Dispatch Tracking Room</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Watch programmatic queues cascade offers to Batch A (Priority), then Batch B, then Batch C.
            </p>
          </div>
          {activeCampaigns.length > 0 && (
            <button
              onClick={() => {
                // Restore default campaign states to let users play with it
                window.location.reload();
              }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mt-2 md:mt-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Simulation States
            </button>
          )}
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <Radio className="w-8 h-8 text-zinc-300 animate-pulse mb-3" />
            <span className="text-xs font-medium text-zinc-500">No active localized flash activations running.</span>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[280px]">
              Use the campaign setup card above to lock budget and launch one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {activeCampaigns.map((camp) => (
              <div key={camp.id} className="border border-zinc-150 rounded-xl p-5 flex flex-col gap-6">
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-800">{camp.title}</h4>
                      <span className="bg-zinc-100 text-zinc-600 font-mono text-[10px] px-2 py-0.5 rounded border border-zinc-200">
                        {camp.brandName}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      LOC: {camp.centerLocality} ({camp.radiusKm}km radius) • deliverable: {camp.deliverable}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Escrow Locked</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ${camp.budget} USD
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Campaign Status</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Batch {String.fromCharCode(65 + camp.activeBatchIndex)} Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Programmatic Batch Timeline Track */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {camp.batches.map((batch, idx) => {
                    const isCurrent = idx === camp.activeBatchIndex;
                    const isPassed = idx < camp.activeBatchIndex;

                    return (
                      <div
                        key={batch.id}
                        className={`border rounded-xl p-4 flex flex-col gap-3 transition-all ${
                          isCurrent
                            ? 'border-indigo-500 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-500/10'
                            : isPassed
                            ? 'border-zinc-200 bg-zinc-50/50 opacity-60'
                            : 'border-zinc-100 bg-white opacity-40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCurrent
                                  ? 'bg-indigo-600 animate-pulse'
                                  : isPassed
                                  ? 'bg-zinc-400'
                                  : 'bg-zinc-300'
                              }`}
                            />
                            {batch.name}
                          </span>
                          {isCurrent ? (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">
                              DISPATCHED
                            </span>
                          ) : isPassed ? (
                            <span className="text-zinc-500 text-[10px] font-mono font-medium">
                              CASCADED
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-[10px] font-mono">
                              QUEUED
                            </span>
                          )}
                        </div>

                        {/* Profiles matched in this batch */}
                        <div className="flex flex-col gap-1.5 my-1">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">Target Creators</span>
                          <div className="flex items-center gap-1.5">
                            {batch.creatorIds.map((cid) => {
                              const creator = (creators || CREATORS).find((c) => c.id === cid);
                              if (!creator) return null;
                              return (
                                <div
                                  key={cid}
                                  onClick={() => setSelectedCreator(creator)}
                                  className="flex items-center gap-1 bg-white border border-zinc-200/80 hover:border-zinc-300 px-1.5 py-0.5 rounded-lg text-[10px] cursor-pointer transition-all shrink-0"
                                  title={`Click to view ${creator.name}`}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.name}
                                    className="w-4.5 h-4.5 rounded-full object-cover referrerPolicy='no-referrer'"
                                  />
                                  <span className="font-medium text-zinc-700">{creator.name.split(' ')[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="mt-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-zinc-500 font-medium">Remaining Priority Window:</span>
                              <span className="text-indigo-600 font-mono font-bold animate-pulse">Auto-cascades in 4h</span>
                            </div>

                            <button
                              onClick={() => handleSimulateCascade(camp.id)}
                              className="w-full py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Simulate Timeout (Cascade ➔)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Campaign Progress tracker */}
                <div className="bg-zinc-50/50 border border-zinc-150/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-700">Campaign Fill Meter</span>
                      <p className="text-[10px] text-zinc-400">
                        {camp.spotsFilled} of {camp.spotsTotal} spots filled. Payout protocol triggers automatically as soon as verified.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedCampaignId(camp.id);
                        setView('creator');
                      }}
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <span>Act as Creator & Upload Photo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'analytics') {
    return (
      <div className="flex flex-col gap-6">
        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Delhi-NCR Dispatch Latency</span>
            <span className="text-3xl font-display font-black text-zinc-950">1.2 Hours</span>
            <p className="text-[11px] text-zinc-400">Average time to unlock localized escrow release across all grids.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Escrow Funds Secured</span>
            <span className="text-3xl font-display font-black text-emerald-600">${activeCampaigns.reduce((sum, c) => sum + c.budget, 0)} USD</span>
            <p className="text-[11px] text-zinc-400">100% cryptographic protection active for campaign matching.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Geotargeted Density</span>
            <span className="text-3xl font-display font-black text-indigo-600">{(creators || CREATORS).length} Active</span>
            <p className="text-[11px] text-zinc-400">Partners online with verified EXIF cameras in Connaught Place.</p>
          </div>
        </div>

        {/* Chart + Roster Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart Card */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-900">Conversion Boost Across Grids</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Average physical store footfall multiplier compared to digital ads.</p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { grid: 'Connaught Place (Main Grid)', value: 4.6, percent: 'w-[92%]', color: 'bg-zinc-950' },
                { grid: 'Gurgaon DLF CyberHub Sector', value: 3.8, percent: 'w-[76%]', color: 'bg-zinc-800' },
                { grid: 'South Delhi Parks & Markets', value: 4.2, percent: 'w-[84%]', color: 'bg-indigo-600' },
                { grid: 'Noida Electronic City', value: 2.9, percent: 'w-[58%]', color: 'bg-zinc-500' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-700 font-mono text-[11px]">{bar.grid}</span>
                    <span className="text-zinc-900 font-bold">{bar.value}x boost</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-md h-5 overflow-hidden border border-zinc-200/30">
                    <div className={`${bar.color} ${bar.percent} h-full rounded-r-sm transition-all duration-1000`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 leading-normal border-t border-zinc-100 pt-4">
              * Based on physical GPS check-ins matched within the geofence boundaries.
            </div>
          </div>

          {/* Matches Roster */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-900">Local Verified Roster</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Physical representatives available in current active radius.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 font-sans">
              {(creators || CREATORS).map((creator) => (
                <div key={creator.id} className="p-3 border border-zinc-150 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={creator.avatar} alt={creator.name} className="w-8 h-8 rounded-full object-cover border border-zinc-100 referrerPolicy='no-referrer'" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-800">{creator.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{creator.locality}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{creator.followers}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
