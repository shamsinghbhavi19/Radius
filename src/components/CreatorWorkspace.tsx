import React, { useState, useMemo, useEffect } from 'react';
import { Campaign, Creator, Submission, EscrowLog } from '../types';
import { CREATORS, MOCK_UPLOADS } from '../data';
import { getDistanceKm } from './MinimalMap';
import {
  ShieldCheck,
  Upload,
  AlertTriangle,
  Award,
  DollarSign,
  Briefcase,
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight,
  Database,
  Smartphone,
  Calendar,
  Sparkles,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatorWorkspaceProps {
  activeCampaigns: Campaign[];
  setActiveCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  selectedCreatorId: string;
  setSelectedCreatorId: (id: string) => void;
  selectedCampaignId: string | null;
  setSelectedCampaignId: (id: string | null) => void;
  activeSubTab?: 'radar' | 'escrow' | 'wallet' | 'profile';
  creators?: Creator[];
  setCreators?: React.Dispatch<React.SetStateAction<Creator[]>>;
}

export default function CreatorWorkspace({
  activeCampaigns,
  setActiveCampaigns,
  selectedCreatorId,
  setSelectedCreatorId,
  selectedCampaignId,
  setSelectedCampaignId,
  activeSubTab = 'radar',
  creators,
  setCreators,
}: CreatorWorkspaceProps) {
  // Current acting creator
  const currentCreator = useMemo(() => {
    return (creators || CREATORS).find((c) => c.id === selectedCreatorId) || (creators || CREATORS)[0];
  }, [selectedCreatorId, creators]);

  // Velocity Tier local upgrade state
  const [velocitySubscribed, setVelocitySubscribed] = useState(
    currentCreator.velocityTier === 'Velocity'
  );

  // Sync velocity subscription state when currentCreator changes
  useEffect(() => {
    setVelocitySubscribed(currentCreator.velocityTier === 'Velocity');
  }, [currentCreator]);

  const handleToggleVelocity = () => {
    const nextSubscribed = !velocitySubscribed;
    const nextTier = nextSubscribed ? 'Velocity' : 'Basic';
    setVelocitySubscribed(nextSubscribed);
    if (setCreators) {
      setCreators((prev) =>
        prev.map((c) => {
          if (c.id === currentCreator.id) {
            return { ...c, velocityTier: nextTier };
          }
          return c;
        })
      );
    }
  };

  // When selected creator changes, synchronize subscription state
  const handleCreatorChange = (id: string) => {
    setSelectedCreatorId(id);
    const newCreator = (creators || CREATORS).find((c) => c.id === id);
    if (newCreator) {
      setVelocitySubscribed(newCreator.velocityTier === 'Velocity');
    }
  };

  // Creator's feed of campaigns
  const creatorCampaigns = useMemo(() => {
    return activeCampaigns.map((camp) => {
      const distance = getDistanceKm(camp.centerLat, camp.centerLng, currentCreator.lat, currentCreator.lng);
      const isInside = distance <= camp.radiusKm;

      // Determine match score factoring distance, niche match, and priority
      let matchScore = currentCreator.matchScore;
      if (camp.niche !== currentCreator.niche) matchScore -= 12;
      if (!isInside) matchScore -= 20;

      return {
        ...camp,
        distance,
        isInside,
        matchScore: Math.max(50, Math.min(99, matchScore)),
      };
    });
  }, [activeCampaigns, currentCreator]);

  // Active accepted campaign
  const activeWorkingCampaign = useMemo(() => {
    if (selectedCampaignId) {
      return creatorCampaigns.find((c) => c.id === selectedCampaignId);
    }
    // Return first campaign where the creator is in the current active dispatch batch
    return creatorCampaigns.find((camp) => {
      const activeBatch = camp.batches[camp.activeBatchIndex];
      return activeBatch && activeBatch.creatorIds.includes(currentCreator.id);
    });
  }, [creatorCampaigns, selectedCampaignId, currentCreator.id]);

  // Submission State
  const [selectedPresetImage, setSelectedPresetImage] = useState<typeof MOCK_UPLOADS[0] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [escrowLogs, setEscrowLogs] = useState<EscrowLog[]>([]);

  // Simulation parameters for custom uploads
  const handleSimulatePresetSelect = (preset: typeof MOCK_UPLOADS[0]) => {
    setSelectedPresetImage(preset);
  };

  // Convert preset URL / file into a simulated verified submission
  const handlePresetSelect = () => {
    if (!selectedPresetImage || !activeWorkingCampaign) return;

    setIsVerifying(true);

    setTimeout(() => {
      // Simulate EXIF parsing from preset coordinates
      const targetCoords = {
        lat: activeWorkingCampaign.centerLat,
        lng: activeWorkingCampaign.centerLng,
      };

      // Slight GPS jitter to simulate actual camera metadata (within geofence)
      const offsetLat = (Math.random() - 0.5) * (activeWorkingCampaign.radiusKm / 111) * 0.4;
      const offsetLng = (Math.random() - 0.5) * (activeWorkingCampaign.radiusKm / 111) * 0.4;
      const sampleLat = targetCoords.lat + offsetLat;
      const sampleLng = activeWorkingCampaign.centerLng + offsetLng;

      const submission: Submission = {
        id: `sub_${Date.now()}`,
        campaignId: activeWorkingCampaign.id,
        creatorId: currentCreator.id,
        imageUrl: selectedPresetImage.url,
        actualLat: currentCreator.lat,
        actualLng: currentCreator.lng,
        exifLat: sampleLat,
        exifLng: sampleLng,
        exifDevice: 'Apple iPhone 15 Pro Max (Simulated)',
        exifDateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        isExifValid: true,
        isGeoMatched: true,
        geoMatchPercentage: 100,
        engagementScore: 94,
      };

      setActiveSubmission(submission);
      setIsVerifying(false);
    }, 1200);
  };

  // Process Payout via Smart Contract Release
  const handleTriggerPayout = () => {
    if (!activeSubmission || !activeWorkingCampaign) return;

    setIsVerifying(true);

    setTimeout(() => {
      const payoutAmount = activeWorkingCampaign.budget;
      const txHash = `0x${Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      setEscrowLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'released',
          amount: payoutAmount,
          txHash,
        },
      ]);

      // Update campaigns state filled spots
      setActiveCampaigns((prev) =>
        prev.map((camp) => {
          if (camp.id !== activeWorkingCampaign.id) return camp;
          return {
            ...camp,
            spotsFilled: Math.min(camp.spotsTotal, camp.spotsFilled + 1),
            escrowStatus: 'released',
          };
        })
      );

      setIsVerifying(false);
    }, 2000);
  };

  if (activeSubTab === 'profile') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Creator Profile Editor Card */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-zinc-900">Creator Identity & Node Registry</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage your public creator workspace details, geolocated coordinates, and verify your photography gear credentials.
              </p>
            </div>
            {currentCreator.velocityTier === 'Velocity' ? (
              <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-200 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Velocity Node
              </span>
            ) : (
              <span className="bg-zinc-50 text-zinc-500 text-xs px-2.5 py-1 rounded-full font-semibold border border-zinc-200 flex items-center gap-1.5">
                Basic Node
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Public Display Name</label>
              <input
                id="creator-profile-name-input"
                type="text"
                defaultValue={currentCreator.name}
                onBlur={(e) => {
                  if (setCreators) {
                    setCreators((prev) =>
                      prev.map((c) => (c.id === currentCreator.id ? { ...c, name: e.target.value } : c))
                    );
                  }
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                placeholder="e.g. Bhavya Harbola"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Social Handle / Address</label>
              <input
                id="creator-profile-handle-input"
                type="text"
                defaultValue={currentCreator.handle}
                onBlur={(e) => {
                  if (setCreators) {
                    setCreators((prev) =>
                      prev.map((c) => (c.id === currentCreator.id ? { ...c, handle: e.target.value } : c))
                    );
                  }
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. @bhavya_craft"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Content Niche Sector</label>
              <select
                id="creator-profile-niche-select"
                defaultValue={currentCreator.niche}
                onChange={(e) => {
                  if (setCreators) {
                    setCreators((prev) =>
                      prev.map((c) => (c.id === currentCreator.id ? { ...c, niche: e.target.value } : c))
                    );
                  }
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              >
                <option value="Food & Lifestyle">Food & Lifestyle</option>
                <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                <option value="Tech & Gaming">Tech & Gaming</option>
                <option value="Photography & Art">Photography & Art</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Total Audience Reach</label>
              <input
                id="creator-profile-followers-input"
                type="text"
                defaultValue={currentCreator.followers}
                onBlur={(e) => {
                  if (setCreators) {
                    setCreators((prev) =>
                      prev.map((c) => (c.id === currentCreator.id ? { ...c, followers: e.target.value } : c))
                    );
                  }
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. 42K"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Primary Hub Locality</label>
              <input
                id="creator-profile-locality-input"
                type="text"
                defaultValue={currentCreator.locality}
                onBlur={(e) => {
                  if (setCreators) {
                    setCreators((prev) =>
                      prev.map((c) => (c.id === currentCreator.id ? { ...c, locality: e.target.value } : c))
                    );
                  }
                }}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                placeholder="e.g. Connaught Place, Delhi"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">EXIF Certified Camera Hardware</label>
              <input
                id="creator-profile-camera-input"
                type="text"
                defaultValue="Sony A7IV, FE 35mm f/1.4 GM"
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-mono"
                placeholder="Camera lens configuration..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Creative Description / Bio</label>
            <textarea
              id="creator-profile-bio-textarea"
              rows={3}
              defaultValue="Specializing in urban architectural aesthetics, artisanal cafe crawls, and hyperlocal lifestyle coverage across the South Delhi and Connaught Place networks."
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none leading-relaxed"
              placeholder="Tell brands why they should cascade priority offers to you..."
            />
          </div>

          <div className="border-t border-zinc-100 pt-4 flex justify-end">
            <button
              id="creator-profile-save-btn"
              onClick={() => {
                alert("Creator cryptographic node profiles updated successfully!");
              }}
              className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-xs rounded-xl font-bold tracking-wider uppercase transition-all cursor-pointer"
            >
              COMMIT LOCAL PROFILE CHANGES
            </button>
          </div>
        </div>

        {/* Creator Profile Statistics Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in">
          {/* Creator Profile Display Card */}
          <div className="bg-zinc-950 text-zinc-300 rounded-2xl p-6 shadow-xl flex flex-col gap-5 border border-zinc-800">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <img
                src={currentCreator.avatar}
                alt={currentCreator.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/25 referrerPolicy='no-referrer'"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight leading-none">{currentCreator.name}</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-1.5 uppercase">{currentCreator.handle}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Match Score</span>
                <span className="text-lg font-black text-white mt-1">{currentCreator.matchScore}%</span>
              </div>
              <div className="flex flex-col p-3 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Audience zone</span>
                <span className="text-lg font-black text-emerald-400 mt-1">{currentCreator.audienceInLocality}% CP</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Crypto Verification State
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Camera hardware: Sony Exmor R CMOS integrated. Geofence checks enforce GPS satellite triangulation on submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'radar') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
        {/* Left Pane: Profiles, Subscriptions and Available feeds */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Creator identity profile selector */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Select Acting Creator</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Toggle profile to view geofenced campaigns available to them.</p>
            </div>

            <div className="flex flex-col gap-2">
              {(creators || CREATORS).map((creator) => {
                const isSelected = creator.id === selectedCreatorId;
                return (
                  <button
                    key={creator.id}
                    onClick={() => handleCreatorChange(creator.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-sm font-medium'
                        : 'border-zinc-100 hover:border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-100 referrerPolicy='no-referrer'"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-800 leading-normal">{creator.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono leading-none">{creator.locality.split(' ')[0]} • {creator.niche}</span>
                      </div>
                    </div>
                    {creator.velocityTier === 'Velocity' && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0">
                        V-Tier
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Velocity Tier subscription panel */}
          <div className="bg-zinc-950 text-white rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Velocity Priority Tier</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 text-[9px] font-mono px-2 py-0.5 rounded border border-zinc-700 font-bold">
                Delhi NCR Grid
              </span>
            </div>

            <div className="z-10 flex flex-col gap-1">
              <h4 className="text-base font-display font-black tracking-tight">Programmatic Queue Front-running</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                By upgrading to Velocity priority tier, your profile moves programmatically to Batch A (Priority) in 100% of geofenced campaigns matching your niche.
              </p>
            </div>

            {/* Simulated Tier state toggle */}
            <div className="z-10 flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400">Upgrade status:</span>
                <span className={`font-mono font-bold ${velocitySubscribed ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {velocitySubscribed ? 'ACTIVE (PRIORITY FRONT-RUNNING)' : 'INACTIVE (BASIC CASCADE)'}
                </span>
              </div>

              <button
                onClick={handleToggleVelocity}
                className={`w-full py-2 px-3 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-all active:scale-[0.98] ${
                  velocitySubscribed
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    : 'bg-amber-400 hover:bg-amber-500 text-zinc-950'
                }`}
              >
                {velocitySubscribed ? 'Downgrade to Basic Tier' : 'Upgrade to Velocity Tier ($9.9/mo)'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Available Campaigns Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Local geofenced campaign feed */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Local Geofenced Activations</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Campaigns matched to your current coordinates.</p>
            </div>

            <div className="flex flex-col gap-3">
              {creatorCampaigns.map((camp) => {
                const inActiveBatch = camp.batches[camp.activeBatchIndex]?.creatorIds.includes(currentCreator.id);

                return (
                  <div
                    key={camp.id}
                    className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      camp.id === selectedCampaignId
                        ? 'border-indigo-500 bg-indigo-50/10'
                        : 'border-zinc-150 hover:border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-800">{camp.title}</h4>
                        {inActiveBatch && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/80 font-mono text-[8px] px-1.5 py-0.2 rounded font-bold animate-pulse">
                            Priority Batch Offer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Target Locality: {camp.centerLocality} ({camp.radiusKm}km radius)
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                        <span>Distance: {camp.distance.toFixed(2)} km away</span>
                        <span>•</span>
                        {camp.isInside ? (
                          <span className="text-emerald-600 font-bold">Inside Zone</span>
                        ) : (
                          <span className="text-rose-500 font-bold">Outside Zone</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-mono text-zinc-400">Match score:</span>
                        <span className="text-xs font-bold text-indigo-600">{camp.matchScore}%</span>
                      </div>

                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-mono text-zinc-400">Budget:</span>
                        <span className="text-xs font-bold text-emerald-600 font-mono">${camp.budget}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCampaignId(camp.id);
                          setSelectedPresetImage(null);
                          setActiveSubmission(null);
                          setEscrowLogs([]);
                        }}
                        className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Accept Run</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'escrow') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
        {activeWorkingCampaign ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="flex flex-col">
                <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded w-max">
                  ACTIVE GEOFENCED TASK
                </span>
                <h2 className="text-base font-display font-bold text-zinc-900 mt-2">{activeWorkingCampaign.title}</h2>
                <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Brand: {activeWorkingCampaign.brandName} • Quota: {activeWorkingCampaign.spotsFilled}/{activeWorkingCampaign.spotsTotal} spots
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Escrow Release Value</span>
                <span className="text-xl font-mono font-bold text-emerald-600">${activeWorkingCampaign.budget} USD</span>
              </div>
            </div>

            {/* Escrow Status Stepper */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Escrow Protocol State</span>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { step: 'Locked', desc: 'Budget escrowed', active: true, done: true },
                  {
                    step: 'Submitted',
                    desc: 'Content uploaded',
                    active: !!activeSubmission,
                    done: !!activeSubmission,
                  },
                  {
                    step: 'Verifying',
                    desc: 'EXIF geofence verification',
                    active: isVerifying,
                    done: escrowLogs.length > 0,
                  },
                  {
                    step: 'Released',
                    desc: 'Instant bank transfer',
                    active: escrowLogs.length > 0,
                    done: escrowLogs.length > 0,
                  },
                ].map((st, i) => (
                  <div
                    key={i}
                    className={`border rounded-xl p-3 flex flex-col gap-1 transition-all ${
                      st.done
                        ? 'border-emerald-500 bg-emerald-50/10'
                        : st.active
                        ? 'border-indigo-500 bg-indigo-50/10'
                        : 'border-zinc-100 bg-zinc-50/30 opacity-60'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold ${
                        st.done ? 'text-emerald-700' : st.active ? 'text-indigo-700' : 'text-zinc-500'
                      }`}
                    >
                      {i + 1}. {st.step}
                    </span>
                    <span className="text-[9px] text-zinc-400 leading-normal">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload form or verified state */}
            {!activeSubmission ? (
              <div className="flex flex-col gap-5 pt-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-800">2. Submit Local Activation Photo</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    We parse the embedded JPG metadata (GPS geotags, camera lens, device timestamp) to confirm the photo was taken within the geofence.
                  </p>
                </div>

                {/* Preset simulator options */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                    Choose photo preset to simulate camera capture:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {MOCK_UPLOADS.map((preset, i) => {
                      const isSelected = selectedPresetImage?.name === preset.name;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSimulatePresetSelect(preset)}
                          className={`cursor-pointer border p-2.5 rounded-xl flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/25 ring-2 ring-indigo-500/10'
                              : 'border-zinc-150 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-100 referrerPolicy='no-referrer'"
                          />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-800 line-clamp-1">{preset.name}</span>
                            <span className="text-[9px] text-zinc-400 line-clamp-1">{preset.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-all ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-50/30'
                      : 'border-zinc-200 bg-zinc-50/35 hover:bg-zinc-50/80'
                  }`}
                >
                  <Upload className="w-8 h-8 text-zinc-400" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-zinc-700">
                      {selectedPresetImage ? `Selected: ${selectedPresetImage.name}` : 'Select preset above or drag file'}
                    </span>
                    <span className="text-[10px] text-zinc-400">JPEG, PNG with metadata up to 10MB</span>
                  </div>

                  {selectedPresetImage && (
                    <button
                      onClick={handlePresetSelect}
                      className="mt-2 py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Extract EXIF & Submit Photo
                    </button>
                  )}
                </div>
              </div>
            ) : escrowLogs.length === 0 ? (
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-xl overflow-hidden border border-zinc-200/50 shrink-0">
                  <img
                    src={activeSubmission.imageUrl}
                    alt="Active run submit"
                    className="w-full h-full object-cover referrerPolicy='no-referrer'"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      EXIF Geo-Metadata Extracted
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Programmatic location verification successful. Metadata details matches campaign coordinates.
                    </p>
                  </div>

                  {/* Metadata key-values */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-b border-zinc-150 py-3 font-mono text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">CAMERA DEVICE:</span>
                      <span className="text-zinc-700 font-bold">{activeSubmission.exifDevice}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">GPS LATITUDE:</span>
                      <span className="text-zinc-700 font-bold">{activeSubmission.exifLat?.toFixed(5)} N</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">GPS LONGITUDE:</span>
                      <span className="text-zinc-700 font-bold">{activeSubmission.exifLng?.toFixed(5)} E</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">TIMELOCK STAMP:</span>
                      <span className="text-zinc-700 font-bold">{activeSubmission.exifDateTime}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">GEOFENCE MATCH:</span>
                      <span className="text-emerald-600 font-bold">{activeSubmission.geoMatchPercentage}% Verified</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 font-medium">LOCALITY INDEX:</span>
                      <span className="text-zinc-700 font-bold">{activeWorkingCampaign.centerLocality}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTriggerPayout}
                      disabled={isVerifying}
                      className="py-2 px-4 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Processing payout on-chain...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Trigger Smart Payout Now</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-zinc-400 leading-normal">
                      * Escrow budget is instantly routed to your Bank Account upon trigger.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="flex flex-col gap-1 max-w-sm">
                  <h4 className="text-sm font-bold text-zinc-800">Smart Contract Released Successfully!</h4>
                  <p className="text-[11px] text-zinc-500">
                    Your location match passed at 100%. Budget of <span className="font-bold">${activeWorkingCampaign.budget}</span> has been transferred directly into your creator account.
                  </p>
                </div>

                <div className="bg-white border border-emerald-250 p-3 rounded-xl flex flex-col gap-1 text-[10px] text-zinc-500 font-mono text-left w-full max-w-sm">
                  <div className="flex justify-between border-b border-zinc-100 pb-1 mb-1">
                    <span>TX STATUS:</span>
                    <span className="text-emerald-600 font-bold">CONFIRMED (ESCROW RELEASE)</span>
                  </div>
                  <div>TX HASH: {escrowLogs[0]?.txHash}</div>
                  <div>TIME: {escrowLogs[0]?.timestamp}</div>
                  <div>GAS COST: 0.0001 ETH (Paid by Radius)</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCampaignId(null);
                    setSelectedPresetImage(null);
                    setActiveSubmission(null);
                    setEscrowLogs([]);
                  }}
                  className="py-1.5 px-4 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Return to Campaign Feed
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 shadow-sm text-center max-w-xl mx-auto flex flex-col items-center gap-4">
            <Briefcase className="w-10 h-10 text-zinc-300 animate-pulse" />
            <h4 className="text-lg font-display font-semibold text-zinc-950">No Active Geofenced Task</h4>
            <p className="text-sm text-zinc-500 max-w-sm">
              Accept a hyperlocal campaign from the Active Radar to lock contract payouts and activate EXIF multi-modal verification.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'wallet') {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Quick Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Unclaimed Escrow Balance</span>
            <span className="text-3xl font-display font-black text-emerald-600">$450.00 USD</span>
            <p className="text-[11px] text-zinc-400">Locked in verified smart contracts. Instant bank payout available.</p>
            <button className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-[10px] rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer">
              WITHDRAW TO BANK ACCOUNT
            </button>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Total Payouts Released</span>
            <span className="text-3xl font-display font-black text-zinc-950">$1,890.00 USD</span>
            <p className="text-[11px] text-zinc-400">All historical geofence runs cleared without disputes.</p>
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Velocity Tier Status</span>
            <span className="text-3xl font-display font-black text-indigo-600">{velocitySubscribed ? 'Active' : 'Basic'}</span>
            <p className="text-[11px] text-zinc-400">2x frequency boost in priority queue cascades.</p>
          </div>
        </div>

        {/* History + Earnings Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart card */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-900">Monthly Localized Earnings</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Your monthly payout progression in the Delhi NCR Grid network.</p>
            </div>

            <div className="flex items-end justify-between gap-4 h-48 pt-6 border-b border-zinc-150 px-4">
              {[
                { month: 'Oct 26', amount: 320, height: 'h-[40%]' },
                { month: 'Nov 26', amount: 480, height: 'h-[60%]' },
                { month: 'Dec 26', amount: 750, height: 'h-[90%]' },
                { month: 'Jan 27 (Est)', amount: 620, height: 'h-[75%]' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-800">${bar.amount}</span>
                  <div className={`w-full bg-indigo-600/90 rounded-t-sm ${bar.height} transition-all duration-500 hover:bg-indigo-700`} />
                  <span className="text-[10px] font-mono text-zinc-400 mt-1">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Logs */}
          <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-zinc-900">Cryptographic Escrow History</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Logs of recent automated smart contract payouts.</p>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {[
                { campaign: 'Connaught Place Patio Tour', date: 'Yesterday', amount: 250, status: 'Completed' },
                { campaign: 'Sunder Nursery Aesthetics', date: '3 days ago', amount: 300, status: 'Completed' },
                { campaign: 'HKV Cafe Crawl', date: '1 week ago', amount: 180, status: 'Completed' },
              ].map((log, i) => (
                <div key={i} className="p-3 border border-zinc-100 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800">{log.campaign}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{log.date}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono font-bold text-emerald-600">+${log.amount}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.2 rounded font-medium">Secured</span>
                  </div>
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
