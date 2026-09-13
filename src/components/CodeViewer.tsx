import React, { useState } from 'react';
import { Copy, Check, FileCode, Camera, Database, PhoneCall, Terminal, Info } from 'lucide-react';
import { PYTHON_FULL_CODE, IMAGE_SNIPPET, DATABASE_SNIPPET, BUYER_CARD_SNIPPET } from '../data/codeSnippets';

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'full' | 'image' | 'db' | 'buyer' | 'guide'>('image');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCodeForTab = () => {
    switch (activeTab) {
      case 'image':
        return IMAGE_SNIPPET;
      case 'db':
        return DATABASE_SNIPPET;
      case 'buyer':
        return BUYER_CARD_SNIPPET;
      case 'full':
        return PYTHON_FULL_CODE;
      default:
        return '';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Tab Navigation */}
      <div className="bg-slate-950/70 border-b border-slate-800 p-2 sm:px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-image-handler"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Image Upload Logic</span>
          </button>

          <button
            id="tab-db-storage"
            onClick={() => setActiveTab('db')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'db'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Database</span>
          </button>

          <button
            id="tab-buyer-card"
            onClick={() => setActiveTab('buyer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'buyer'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Buyer View & Call Seller</span>
          </button>

          <button
            id="tab-full-bot"
            onClick={() => setActiveTab('full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'full'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Full bot.py</span>
          </button>

          <button
            id="tab-setup-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Run</span>
          </button>
        </div>

        {activeTab !== 'guide' && (
          <button
            id="copy-current-code-btn"
            onClick={() => handleCopy(getCodeForTab(), activeTab)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            {copiedKey === activeTab ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Explanatory Banner per Tab */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          {activeTab === 'image' && (
            <p>
              <strong className="text-amber-300">How Image Uploads Work in python-telegram-bot v20:</strong> Telegram sends <code className="text-amber-200 bg-slate-800 px-1 py-0.5 rounded">update.message.photo</code> as a list of resized thumbnails. Index <code className="text-amber-200 bg-slate-800 px-1 py-0.5 rounded">[-1]</code> is the full high-res photo. Use <code className="text-amber-200 bg-slate-800 px-1 py-0.5 rounded">await context.bot.get_file(file_id)</code> and <code className="text-amber-200 bg-slate-800 px-1 py-0.5 rounded">download_to_drive()</code> to save it locally.
            </p>
          )}
          {activeTab === 'db' && (
            <p>
              <strong className="text-emerald-300">Data Storage Strategy:</strong> Stores the listing details (phone model, description, price, seller phone number) alongside both the Telegram <code className="text-emerald-200 bg-slate-800 px-1 py-0.5 rounded">photo_file_id</code> (for zero-latency, zero-bandwidth Telegram re-sends) and the <code className="text-emerald-200 bg-slate-800 px-1 py-0.5 rounded">photo_local_path</code> on disk.
            </p>
          )}
          {activeTab === 'buyer' && (
            <p>
              <strong className="text-sky-300">Direct Buyer-Seller Communication:</strong> We format the listing as a rich photo card and attach an <code className="text-sky-200 bg-slate-800 px-1 py-0.5 rounded">InlineKeyboardButton</code> with a <code className="text-sky-200 bg-slate-800 px-1 py-0.5 rounded">tel:</code> URI. When a buyer taps the button on Telegram mobile, it instantly opens their phone dialer with the seller's number!
            </p>
          )}
          {activeTab === 'full' && (
            <p>
              <strong className="text-purple-300">Complete Ready-to-Run Application:</strong> Production-ready async script using <code className="text-purple-200 bg-slate-800 px-1 py-0.5 rounded">ConversationHandler</code> with 5 distinct states: MODEL ➔ DESCRIPTION ➔ PRICE ➔ PHOTO ➔ PHONE.
            </p>
          )}
          {activeTab === 'guide' && (
            <p>
              <strong className="text-cyan-300">3-Minute Quickstart:</strong> Get your bot token from @BotFather, install dependencies, and run the bot locally or on your server.
            </p>
          )}
        </div>
      </div>

      {/* Code / Content Body */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950">
        {activeTab === 'guide' ? (
          <div className="font-sans space-y-6 text-sm text-slate-300 max-w-2xl py-2">
            <div>
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                Install Dependencies
              </h3>
              <p className="text-xs text-slate-400 mb-2">
                Make sure you have Python 3.10+ installed. Install the modern <code className="text-cyan-300 font-mono">python-telegram-bot</code> library with job-queue extensions:
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <span>pip install &quot;python-telegram-bot[job-queue]&gt;=20.0&quot;</span>
                <button
                  onClick={() => handleCopy('pip install "python-telegram-bot[job-queue]>=20.0"', 'pip')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {copiedKey === 'pip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                Get Telegram Bot Token
              </h3>
              <ol className="text-xs text-slate-400 list-decimal list-inside space-y-1.5">
                <li>Open Telegram and search for <strong className="text-white">@BotFather</strong></li>
                <li>Send command <code className="text-cyan-300 font-mono">/newbot</code></li>
                <li>Give your bot a display name (e.g. <strong className="text-white">Tolo Broker</strong>)</li>
                <li>Give it a username ending in <code className="text-cyan-300 font-mono">bot</code> (e.g. <code className="text-cyan-300 font-mono">tolo_broker_bot</code>)</li>
                <li>Copy the HTTP API Token provided by BotFather</li>
              </ol>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                Export Environment Variable & Run
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-300 space-y-2">
                <div className="text-slate-400"># Linux / macOS</div>
                <div>export TELEGRAM_BOT_TOKEN=&quot;123456789:ABCdefGhIJKlmNoPQRstuvWXyz&quot;</div>
                <div>python bot.py</div>
                <div className="text-slate-400 mt-2"># Windows (PowerShell)</div>
                <div>$env:TELEGRAM_BOT_TOKEN=&quot;123456789:ABCdefGhIJKlmNoPQRstuvWXyz&quot;</div>
                <div>python bot.py</div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200">
              💡 <strong>Pro Tip on Photos:</strong> Storing <code className="font-mono text-white">photo_file_id</code> in your database is optimal because when multiple buyers browse listings with <code className="font-mono text-white">/browse</code>, Telegram servers send the cached image instantly without re-uploading the file from your server!
            </div>
          </div>
        ) : (
          <pre className="leading-relaxed selection:bg-sky-800 selection:text-white">
            <code>{getCodeForTab()}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
