import React, { useState } from 'react';
import { Creator } from '../types';
import { Briefcase, User, Compass, ArrowRight, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface EntryGateProps {
  creators: Creator[];
  onSignIn: (role: 'brand' | 'creator', idOrBrandName: string) => void;
}

export default function EntryGate({ creators, onSignIn }: EntryGateProps) {
  const [activeTab, setActiveTab] = useState<'brand' | 'creator'>('brand');
  const [customBrandName, setCustomBrandName] = useState('Blue Tokai Coffee');
  const [selectedCreatorId, setSelectedCreatorId] = useState(creators[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'brand') {
      onSignIn('brand', customBrandName.trim() || 'Guest Brand');
    } else {
      onSignIn('creator', selectedCreatorId);
    }
  };

  const selectedCreator = creators.find((c) => c.id === selectedCreatorId);

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between py-12 px-6 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Abstract structural grid lines - Swiss Brutalist Minimal style */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/4 border-b border-zinc-200/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-1/4 border-r border-zinc-200/40 pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-display font-black tracking-tighter text-sm">
            R.
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xs tracking-wider text-zinc-950 uppercase leading-none">
              RADIUS
            </span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-400 mt-0.5 uppercase leading-none">
              Hyperlocal Escrow Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200/60 px-2 py-0.5 rounded-md">
          <Compass className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
          <span>GRID: DELHI_NCR</span>
        </div>
      </header>

      {/* Core Onboarding Card */}
      <main className="max-w-lg mx-auto w-full z-10 my-auto flex flex-col gap-8 pt-8 pb-12">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-display font-black tracking-tight text-zinc-900 sm:text-4xl">
            Aesthetic Matchmaking.
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
            Instantly match creators in custom physical boundaries and release funds automatically upon verified EXIF geolocation.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-zinc-100/80 border border-zinc-200/50 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('brand')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-display font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'brand'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/30'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Brand Workspace</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-display font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/30'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Creator Terminal</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-display font-semibold text-zinc-800">
              {activeTab === 'brand' ? 'Authenticate Brand Workspace' : 'Select Acting Creator Profile'}
            </h2>
            <p className="text-[11px] text-zinc-400">
              {activeTab === 'brand'
                ? 'Type in your brand identity to lock secure campaign funds.'
                : 'Unlock geotagged job offers matched to your localized neighborhood.'}
            </p>
          </div>

          {activeTab === 'brand' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Brand Partnership Name
                </label>
                <input
                  type="text"
                  required
                  value={customBrandName || ''}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  placeholder="e.g. Blue Tokai Coffee"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Campaign Area Target
                </label>
                <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors">
                  <option>Connaught Place & South Delhi (Main Grid)</option>
                  <option>Gurgaon & DLF CyberHub Sector</option>
                  <option>Noida Electronic City</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Active Local Representatives
              </label>
              <div className="grid grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                {creators.map((c) => {
                  const isSelected = selectedCreatorId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCreatorId(c.id)}
                      className={`cursor-pointer p-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20'
                          : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50/40'
                      }`}
                    >
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-7 h-7 rounded-full object-cover border border-zinc-100 referrerPolicy='no-referrer'"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-zinc-800 truncate">{c.name.split(' ')[0]}</span>
                        <span className="text-[9px] text-zinc-400 font-mono truncate">{c.locality.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Value Prop Footer */}
          <div className="border-t border-zinc-100 pt-4 flex gap-2.5 items-start">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-zinc-700 font-mono">100% Cryptographic Escrow Protection</span>
              <p className="text-[9px] text-zinc-400 leading-normal">
                No complex billing or invoice cycles. Funds are held in escrow, releasing autonomously only to creators who deliver matching coordinates.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-950 hover:bg-zinc-900 text-white py-3 px-4 rounded-xl font-display font-medium text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-zinc-200"
          >
            <span>Initialize {activeTab === 'brand' ? 'Workspace' : `Terminal as ${selectedCreator?.name.split(' ')[0] || 'Creator'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>

      {/* Footer credits */}
      <footer className="max-w-4xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>V1.4 Production Gateway • Secured</span>
        </div>
        <div>
          <span>Designed with absolute geometric precision</span>
        </div>
      </footer>
    </div>
  );
}
