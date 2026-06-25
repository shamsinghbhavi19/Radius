import { useState, useEffect } from 'react';
import MinimalMap from './components/MinimalMap';
import BrandWorkspace from './components/BrandWorkspace';
import CreatorWorkspace from './components/CreatorWorkspace';
import EntryGate from './components/EntryGate';
import { DEFAULT_CAMPAIGNS, CREATORS } from './data';
import { Campaign, Creator } from './types';
import {
  Compass,
  Briefcase,
  User,
  ShieldCheck,
  HelpCircle,
  Activity,
  ChevronRight,
  Info,
  LogOut,
  Radio,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Session States
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'brand' | 'creator' | null>(null);
  const [customBrandName, setCustomBrandName] = useState<string>('Blue Tokai Coffee');

  // Global States
  const [creators, setCreators] = useState<Creator[]>(CREATORS);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>(DEFAULT_CAMPAIGNS);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('c1');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>('camp_1');

  // Interactive Map Geofence Center (South Delhi default)
  const [centerLat, setCenterLat] = useState<number>(28.5276);
  const [centerLng, setCenterLng] = useState<number>(77.2197);
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Active acting persona viewport toggle
  const [view, setView] = useState<'brand' | 'creator'>('brand');

  // Active sub-tab states for navigation sidebar
  const [activeBrandSubTab, setActiveBrandSubTab] = useState<'setup' | 'dispatch' | 'analytics' | 'profile'>('setup');
  const [activeCreatorSubTab, setActiveCreatorSubTab] = useState<'radar' | 'escrow' | 'wallet' | 'profile'>('radar');

  // Interactive Walkthrough Guide Stage
  const [walkthroughStep, setWalkthroughStep] = useState<number>(1);
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(true);

  // Sync geofence center coordinate when selected campaign changes
  useEffect(() => {
    if (selectedCampaignId) {
      const camp = activeCampaigns.find((c) => c.id === selectedCampaignId);
      if (camp) {
        setCenterLat(camp.centerLat);
        setCenterLng(camp.centerLng);
        setRadiusKm(camp.radiusKm);
      }
    }
  }, [selectedCampaignId, activeCampaigns]);

  // Synchronize persona map marker when selected creator changes
  const handleSelectCreatorOnMap = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setView('creator');
    setActiveCreatorSubTab('radar');
    // find if there is an active matching campaign for this creator
    const creator = creators.find((c) => c.id === creatorId);
    if (creator) {
      const matchingCamp = activeCampaigns.find((camp) => {
        const activeBatch = camp.batches[camp.activeBatchIndex];
        return activeBatch && activeBatch.creatorIds.includes(creator.id);
      });
      if (matchingCamp) {
        setSelectedCampaignId(matchingCamp.id);
      }
    }
  };

  const currentCreatorProfile = creators.find((c) => c.id === selectedCreatorId) || creators[0];

  // Callback when a new campaign is successfully launched
  const handleCampaignCreated = (newCampaign: Campaign) => {
    setActiveCampaigns((prev) => [newCampaign, ...prev]);
    setSelectedCampaignId(newCampaign.id);
    setActiveBrandSubTab('dispatch'); // Fluid transition to the priority tracking room!
    setWalkthroughStep(2); // Progress guide
  };

  // Sign In Callback from EntryGate
  const handleSignIn = (role: 'brand' | 'creator', idOrBrandName: string) => {
    setUserRole(role);
    setView(role);
    if (role === 'brand') {
      const brandClean = idOrBrandName.trim() || 'Blue Tokai Coffee';
      setCustomBrandName(brandClean);
      setActiveBrandSubTab('setup');
      
      // Personalize default mock campaigns with the customized brand name
      setActiveCampaigns((prev) =>
        prev.map((c) => ({
          ...c,
          brandName: c.brandName.includes('Zara') ? c.brandName : brandClean,
          title: c.title.includes('Zara') ? c.title : `${brandClean} South Delhi Buzz`,
        }))
      );
      setWalkthroughStep(1);
    } else {
      setSelectedCreatorId(idOrBrandName);
      setActiveCreatorSubTab('radar');
      const creator = creators.find((c) => c.id === idOrBrandName);
      if (creator) {
        setCenterLat(creator.lat);
        setCenterLng(creator.lng);
      }
      setWalkthroughStep(3);
    }
    setIsSignedIn(true);
  };

  // If not signed in yet, render the beautiful onboarding EntryGate
  if (!isSignedIn) {
    return <EntryGate creators={creators} onSignIn={handleSignIn} />;
  }

  // Determine whether to display the Map depending on the current active view/sub-tab
  const showMap = view === 'brand'
    ? (activeBrandSubTab === 'setup' || activeBrandSubTab === 'dispatch')
    : (activeCreatorSubTab === 'radar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-[#f2f5f9] to-slate-100 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-row">
      
      {/* MINIMALIST PERSISTENT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 border-r border-zinc-800 flex flex-col justify-between shrink-0 sticky h-screen top-0 z-40 overflow-y-auto">
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-zinc-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-display font-black tracking-tighter text-sm">
              R.
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm tracking-tight text-white uppercase leading-none">
                RADIUS
              </span>
              <span className="text-[9px] font-mono tracking-wider text-zinc-500 mt-0.5 uppercase leading-none">
                Hyperlocal Escrow
              </span>
            </div>
          </div>

          {/* Mode switch */}
          <div className="p-4 flex flex-col gap-1.5 border-b border-zinc-900">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1.5">Workspace Persona</span>
            <div className="flex flex-col gap-1 p-1 bg-zinc-900/40 rounded-xl border border-zinc-850">
              <button
                onClick={() => {
                  setView('brand');
                  if (walkthroughStep === 3) setWalkthroughStep(1);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-display font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                  view === 'brand'
                    ? 'bg-zinc-800 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Brand Operations</span>
              </button>
              <button
                onClick={() => {
                  setView('creator');
                  if (walkthroughStep === 1 || walkthroughStep === 2) setWalkthroughStep(3);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-display font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                  view === 'creator'
                    ? 'bg-zinc-800 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Creator Portal</span>
              </button>
            </div>
          </div>

          {/* Subtab Navigation */}
          <div className="p-4 flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1.5">Navigation Features</span>
            <nav className="flex flex-col gap-1">
              {view === 'brand' ? (
                <>
                  <button
                    onClick={() => setActiveBrandSubTab('setup')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'setup'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>1. Launch Engine</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('dispatch')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'dispatch'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    <span>2. Dispatch Room</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('analytics')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'analytics'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. Analytics Logs</span>
                  </button>
                  <button
                    onClick={() => setActiveBrandSubTab('profile')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeBrandSubTab === 'profile'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>4. Brand Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveCreatorSubTab('radar')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'radar'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>1. Active Radar</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('escrow')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'escrow'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>2. Active Task Run</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('wallet')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'wallet'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>3. Secure Wallet</span>
                  </button>
                  <button
                    onClick={() => setActiveCreatorSubTab('profile')}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeCreatorSubTab === 'profile'
                        ? 'bg-zinc-900 text-white font-semibold border-l-2 border-indigo-500 rounded-l-none'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>4. Creator Profile</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom profile info */}
        <div className="p-4 border-t border-zinc-900 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-1">
            {view === 'brand' ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-indigo-400 uppercase">
                {customBrandName.substring(0, 2)}
              </div>
            ) : (
              <img
                src={currentCreatorProfile.avatar}
                alt={currentCreatorProfile.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-800 referrerPolicy='no-referrer'"
              />
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white tracking-tight line-clamp-1 leading-none">
                {view === 'brand' ? customBrandName : currentCreatorProfile.name}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 mt-0.5 leading-none">
                {view === 'brand' ? 'Active Brand Admin' : 'Grid Operator'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSignedIn(false);
              setUserRole(null);
            }}
            className="w-full py-2 border border-zinc-850 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 hover:text-white hover:bg-zinc-900/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Role</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic header status bar */}
        <header className="border-b border-zinc-200/60 bg-white/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Current Node:</span>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                {view === 'brand' ? `${customBrandName} Admin` : `${currentCreatorProfile.name} Terminal`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-500">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Escrow Status: Live Cryptographic Locks</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
          
          {/* Step-by-Step Live Walkthrough Bar */}
          <AnimatePresence>
            {showWalkthrough && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      Interactive Walkthrough — Experience the Hyperlocal Loop
                    </span>
                    <div className="text-[11px] text-indigo-700 leading-normal max-w-4xl">
                      {walkthroughStep === 1 && (
                        <span>
                          <strong className="text-indigo-950">Step 1 (Brand View):</strong> Target a coordinates geofence. Use the sliders on the left to set boundaries, and click <strong>"Lock Budget & Launch"</strong> to deposit budget into the escrow contract.
                        </span>
                      )}
                      {walkthroughStep === 2 && (
                        <span>
                          <strong className="text-indigo-950">Step 2 (Queue Cascading):</strong> Excellent! Budget is locked. Check the <strong>"Dispatch Room"</strong> sub-tab. Click <strong>"Simulate Timeout"</strong> to immediately cascade the priority offer from Batch A down to Batch B! Once ready, click <strong>"Act as Creator"</strong>.
                        </span>
                      )}
                      {walkthroughStep === 3 && (
                        <span>
                          <strong className="text-indigo-950">Step 3 (Multi-Modal Photo Submit):</strong> You are now acting as creator <span className="font-bold underline">{currentCreatorProfile.name}</span>. Click <strong>"Accept Run"</strong> on the target campaign under <strong>"Local Geofenced Activations"</strong>.
                        </span>
                      )}
                      {walkthroughStep === 4 && (
                        <span>
                          <strong className="text-indigo-950">Step 4 (Automated Escrow Release):</strong> The EXIF and geofence verification algorithm matched! Click <strong>"Trigger Smart Payout Now"</strong> to release the locked contract fund instantly.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {walkthroughStep < 4 ? (
                    <button
                      onClick={() => {
                        if (walkthroughStep === 1) {
                          setWalkthroughStep(2);
                        } else if (walkthroughStep === 2) {
                          setView('creator');
                          setActiveCreatorSubTab('radar');
                          setWalkthroughStep(3);
                        } else if (walkthroughStep === 3) {
                          setWalkthroughStep(4);
                        }
                      }}
                      className="py-1 px-2.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Complete!
                    </span>
                  )}
                  <button
                    onClick={() => setShowWalkthrough(false)}
                    className="text-[10px] text-zinc-400 hover:text-zinc-600 font-medium underline"
                  >
                    Dismiss Guide
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Map Grid */}
          {showMap && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              <div className="lg:col-span-12 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-sm font-display font-bold text-zinc-900 tracking-tight">
                      {view === 'brand' ? 'Hyperlocal Match Engine' : 'Geofenced Active Radar'}
                    </h1>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {view === 'brand'
                        ? 'Place target pin coordinates to visualize creator match density in Delhi NCR.'
                        : 'Your geolocated position relative to active brand campaigns.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono font-medium text-zinc-500">
                    <Compass className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                    <span>Delhi Grid (CP Centered)</span>
                  </div>
                </div>

                <MinimalMap
                  centerLat={centerLat}
                  centerLng={centerLng}
                  radiusKm={radiusKm}
                  onMapClick={(lat, lng) => {
                    setCenterLat(lat);
                    setCenterLng(lng);
                  }}
                  selectedCreatorId={selectedCreatorId}
                  onSelectCreator={handleSelectCreatorOnMap}
                  activeCampaignId={selectedCampaignId}
                  creators={creators}
                />
              </div>
            </div>
          )}

          {/* Dynamic Portal view viewport */}
          <AnimatePresence mode="wait">
            {view === 'brand' ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <BrandWorkspace
                  centerLat={centerLat}
                  centerLng={centerLng}
                  radiusKm={radiusKm}
                  setCenterLat={setCenterLat}
                  setCenterLng={setCenterLng}
                  setRadiusKm={setRadiusKm}
                  onCampaignCreated={handleCampaignCreated}
                  activeCampaigns={activeCampaigns}
                  setActiveCampaigns={setActiveCampaigns}
                  setSelectedCreator={(creator) => {
                    setSelectedCreatorId(creator.id);
                    setView('creator');
                    setActiveCreatorSubTab('escrow'); // Direct jump to submission photo box
                    setWalkthroughStep(3);
                  }}
                  setView={setView}
                  setSelectedCampaignId={setSelectedCampaignId}
                  activeSubTab={activeBrandSubTab}
                  customBrandName={customBrandName}
                  setCustomBrandName={setCustomBrandName}
                  creators={creators}
                />
              </motion.div>
            ) : (
              <motion.div
                key="creator"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <CreatorWorkspace
                  activeCampaigns={activeCampaigns}
                  setActiveCampaigns={setActiveCampaigns}
                  selectedCreatorId={selectedCreatorId}
                  setSelectedCreatorId={setSelectedCreatorId}
                  selectedCampaignId={selectedCampaignId}
                  setSelectedCampaignId={(id) => {
                    setSelectedCampaignId(id);
                    if (id) {
                      setActiveCreatorSubTab('escrow'); // Direct jump to active task submission
                    }
                    if (walkthroughStep === 3) setWalkthroughStep(4);
                  }}
                  activeSubTab={activeCreatorSubTab}
                  creators={creators}
                  setCreators={setCreators}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
