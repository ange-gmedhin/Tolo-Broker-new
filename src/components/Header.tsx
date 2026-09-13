import React, { useState } from 'react';
import { Bot, Copy, Check, Terminal, ShieldCheck, Database, Image as ImageIcon } from 'lucide-react';
import { PYTHON_FULL_CODE } from '../data/codeSnippets';

export const Header: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyFull = () => {
    navigator.clipboard.writeText(PYTHON_FULL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Tolo Broker</h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Telegram Classifieds Bot
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              python-telegram-bot v20+ • Image Upload Handler & Database Storage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Photo[-1] Storage</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite3 DB</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Direct Tel Dialing</span>
          </div>

          <button
            id="copy-full-bot-btn"
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow-sm cursor-pointer ml-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied bot.py!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy bot.py</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
