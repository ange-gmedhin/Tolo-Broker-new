/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { CodeViewer } from './components/CodeViewer';
import { TelegramSimulator } from './components/TelegramSimulator';
import { DatabaseViewer } from './components/DatabaseViewer';
import { INITIAL_LISTINGS } from './data/sampleListings';
import { PhoneListing } from './types';
import { Sparkles, Terminal, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [listings, setListings] = useState<PhoneListing[]>(INITIAL_LISTINGS);

  const handleAddListing = (newListing: PhoneListing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Header */}
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Context Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white">Tolo Broker Implementation:</span> Handling image uploads via{' '}
              <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono">update.message.photo[-1]</code>,
              downloading to disk with <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono">download_to_drive()</code>,
              and saving listings into SQLite with direct buyer telephone links.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              <Terminal className="w-3 h-3 text-sky-400" />
              python-telegram-bot v20.x
            </span>
          </div>
        </div>

        {/* Dual Panel: Code & Architecture Guide on Left, Interactive Bot Simulator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Code Snippets & Architecture */}
          <div className="lg:col-span-7 flex flex-col h-[640px]">
            <CodeViewer />
          </div>

          {/* Right Column: Live Telegram Bot Simulator */}
          <div className="lg:col-span-5 flex flex-col h-[640px]">
            <TelegramSimulator
              listings={listings}
              onAddListing={handleAddListing}
            />
          </div>
        </div>

        {/* Bottom Section: SQLite Database Table Inspector */}
        <section id="database-inspector">
          <DatabaseViewer listings={listings} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        Tolo Broker Telegram Classifieds Bot Architecture • Built with python-telegram-bot v20+ async framework
      </footer>
    </div>
  );
}
