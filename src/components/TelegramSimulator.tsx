import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Phone, CheckCircle2, RotateCcw, Smartphone, ShoppingBag, PlusCircle, ArrowRight } from 'lucide-react';
import { PhoneListing, TelegramMessage } from '../types';

interface TelegramSimulatorProps {
  listings: PhoneListing[];
  onAddListing: (listing: PhoneListing) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'iPhone 15 Pro',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Samsung S24 Ultra',
    url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Google Pixel 8 Pro',
    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  },
];

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({ listings, onAddListing }) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: `👋 *Welcome to Tolo Broker!*\n\nYour trusted marketplace to buy & sell phones directly on Telegram.\n\nWhat would you like to do?\n➕ /newlisting - Post your phone for sale\n📱 /browse - Browse available phone listings\n❌ /cancel - Cancel anytime`,
      timestamp: '10:00',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'MODEL' | 'DESC' | 'PRICE' | 'PHOTO' | 'PHONE'>('IDLE');
  const [draftListing, setDraftListing] = useState<Partial<PhoneListing>>({});
  const [selectedPresetPhoto, setSelectedPresetPhoto] = useState(SAMPLE_PHOTO_PRESETS[0].url);
  const [activeCallModal, setActiveCallModal] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStep]);

  const addBotMessage = (text?: string, photoUrl?: string, replyMarkup?: TelegramMessage['replyMarkup']) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender: 'bot',
        text,
        photoUrl,
        replyMarkup,
        timestamp: timeStr,
      },
    ]);
  };

  const addUserMessage = (text?: string, photoUrl?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender: 'user',
        text,
        photoUrl,
        timestamp: timeStr,
      },
    ]);
  };

  const handleSend = (overrideText?: string) => {
    const text = (overrideText ?? inputVal).trim();
    if (!text && currentStep !== 'PHOTO') return;

    if (text) {
      addUserMessage(text);
      if (!overrideText) setInputVal('');
    }

    // Process State Machine
    if (text === '/start') {
      setCurrentStep('IDLE');
      setDraftListing({});
      setTimeout(() => {
        addBotMessage(
          `👋 *Welcome to Tolo Broker!*\n\nYour trusted marketplace to buy & sell phones directly on Telegram.\n\nWhat would you like to do?\n➕ /newlisting - Post your phone for sale\n📱 /browse - Browse available phone listings\n❌ /cancel - Cancel anytime`
        );
      }, 400);
      return;
    }

    if (text === '/cancel') {
      setCurrentStep('IDLE');
      setDraftListing({});
      setTimeout(() => {
        addBotMessage('❌ Operation canceled. Type /start anytime to begin again.');
      }, 400);
      return;
    }

    if (text === '/newlisting' || text === '➕ Post Phone for Sale') {
      setCurrentStep('MODEL');
      setDraftListing({});
      setTimeout(() => {
        addBotMessage(
          `📱 *Step 1/5: Phone Model*\n\nPlease enter the brand and model name of the phone.\n(e.g., *iPhone 14 Pro Max 256GB* or *Samsung Galaxy S23 Ultra*)`
        );
      }, 400);
      return;
    }

    if (text === '/browse' || text === '🛍️ Browse Phones') {
      setTimeout(() => {
        renderBrowseListings();
      }, 400);
      return;
    }

    // Active Wizard Steps
    if (currentStep === 'MODEL') {
      setDraftListing((prev) => ({ ...prev, phoneModel: text }));
      setCurrentStep('DESC');
      setTimeout(() => {
        addBotMessage(
          `✅ Model: *${text}*\n\n📝 *Step 2/5: Description*\nProvide details such as condition (Brand New/Used), battery health %, storage, and included accessories.`
        );
      }, 400);
      return;
    }

    if (currentStep === 'DESC') {
      setDraftListing((prev) => ({ ...prev, description: text }));
      setCurrentStep('PRICE');
      setTimeout(() => {
        addBotMessage(
          `💰 *Step 3/5: Price*\n\nEnter the selling price in USD or local currency (e.g. *680* or *$680*):`
        );
      }, 400);
      return;
    }

    if (currentStep === 'PRICE') {
      const cleanPrice = text.replace(/[^0-9.]/g, '') || '500';
      setDraftListing((prev) => ({ ...prev, price: cleanPrice, currency: 'USD' }));
      setCurrentStep('PHOTO');
      setTimeout(() => {
        addBotMessage(
          `📸 *Step 4/5: Photo Upload*\n\nPlease send a clear photo of the phone. You can pick a sample photo below or upload your own image.`
        );
      }, 400);
      return;
    }

    if (currentStep === 'PHONE') {
      const sellerPhone = text;
      const finalListing: PhoneListing = {
        id: `TB-${String(listings.length + 1).padStart(3, '0')}`,
        userId: 1094829,
        sellerName: 'You (Current User)',
        phoneModel: draftListing.phoneModel || 'Smartphone',
        description: draftListing.description || 'Clean condition phone',
        price: draftListing.price || '550',
        currency: 'USD',
        photoUrl: draftListing.photoUrl || selectedPresetPhoto,
        photoFileId: `AgACAgIAAxkBAAIB..._${Date.now()}`,
        sellerPhone: sellerPhone,
        sellerUsername: '@tolo_seller',
        createdAt: 'Just now',
        status: 'active',
      };

      onAddListing(finalListing);
      setCurrentStep('IDLE');
      setDraftListing({});

      setTimeout(() => {
        addBotMessage(
          `🎉 *Listing Published Successfully! (#${finalListing.id})*\n\n📱 *Model:* ${finalListing.phoneModel}\n💵 *Price:* $${Number(finalListing.price).toLocaleString()}\n📝 *Description:* ${finalListing.description}\n📞 *Seller Phone:* \`${sellerPhone}\`\n\nBuyers can now find your listing with /browse!`,
          finalListing.photoUrl,
          {
            inlineKeyboard: [
              [
                { text: `📞 Call Seller (${sellerPhone})`, callbackData: `call_${finalListing.id}` },
              ],
            ],
          }
        );
      }, 500);
    }
  };

  const handlePhotoSelect = (url: string) => {
    addUserMessage('Sent a photo', url);
    setDraftListing((prev) => ({ ...prev, photoUrl: url }));
    setCurrentStep('PHONE');

    setTimeout(() => {
      addBotMessage(
        `✅ Photo received & saved to disk!\n\n📞 *Step 5/5: Owner Phone Number*\nPlease enter your contact phone number so buyers can call you directly:\n(e.g., *+251 911 234567* or *+1 555 019 2831*)`
      );
    }, 500);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    handlePhotoSelect(objectUrl);
  };

  const renderBrowseListings = () => {
    if (listings.length === 0) {
      addBotMessage('📭 No active listings right now. Be the first to create one with /newlisting!');
      return;
    }

    addBotMessage(`🛍️ Showing ${listings.length} active phone listings:`);

    listings.slice(0, 3).forEach((item, index) => {
      setTimeout(() => {
        addBotMessage(
          `📱 *${item.phoneModel}*\n💵 *Price:* $${Number(item.price).toLocaleString()}\n📝 ${item.description}\n\n👤 *Seller:* ${item.sellerName}\n📞 *Phone:* \`${item.sellerPhone}\`\n🏷️ *Listing ID:* #${item.id}`,
          item.photoUrl,
          {
            inlineKeyboard: [
              [
                { text: `📞 Call Seller (${item.sellerPhone})`, callbackData: `call_${item.id}` },
              ],
            ],
          }
        );
      }, (index + 1) * 350);
    });
  };

  const resetChat = () => {
    setCurrentStep('IDLE');
    setDraftListing({});
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `👋 *Welcome to Tolo Broker!*\n\nWhat would you like to do?\n➕ /newlisting - Post your phone for sale\n📱 /browse - Browse available phone listings\n❌ /cancel - Cancel anytime`,
        timestamp: '10:00',
      },
    ]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      {/* Telegram Mockup Top Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            TB
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Tolo Broker</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400">bot</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>online • Python Telegram Bot Simulator</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="sim-reset-btn"
            onClick={resetChat}
            title="Reset Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-2 text-xs overflow-x-auto">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Quick test:</span>
        <button
          id="quick-new-listing"
          onClick={() => handleSend('/newlisting')}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3 h-3" />
          <span>/newlisting</span>
        </button>
        <button
          id="quick-browse"
          onClick={() => handleSend('/browse')}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>/browse</span>
        </button>
        <button
          id="quick-cancel"
          onClick={() => handleSend('/cancel')}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
        >
          <span>/cancel</span>
        </button>
      </div>

      {/* Telegram Chat Message History */}
      <div
        id="telegram-chat-container"
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950/90"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-md relative ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-xs'
                  : 'bg-slate-800/95 border border-slate-700/80 text-slate-200 rounded-tl-xs'
              }`}
            >
              {msg.photoUrl && (
                <div className="mb-2.5 overflow-hidden rounded-xl bg-black/40 border border-black/20">
                  <img
                    src={msg.photoUrl}
                    alt="Listing Photo"
                    className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {msg.text && (
                <div className="text-xs whitespace-pre-wrap leading-relaxed">
                  {msg.text.split('\n').map((line, idx) => {
                    // Quick markdown formatting simulation
                    let parsed = line;
                    if (parsed.startsWith('🎉') || parsed.startsWith('📱') || parsed.startsWith('💰') || parsed.startsWith('📝') || parsed.startsWith('📞')) {
                      return <div key={idx} className="my-0.5 font-medium">{parsed}</div>;
                    }
                    return <div key={idx}>{parsed}</div>;
                  })}
                </div>
              )}

              {/* Inline Buttons (e.g. Call Seller) */}
              {msg.replyMarkup?.inlineKeyboard && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1.5">
                  {msg.replyMarkup.inlineKeyboard.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5">
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          id={`inline-btn-${btn.callbackData || bIdx}`}
                          onClick={() => {
                            setActiveCallModal(btn.text);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-semibold transition cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{btn.text}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Dynamic Wizard Helper Prompts */}
        {currentStep === 'MODEL' && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono block mb-2">⚡ Quick pick phone model:</span>
            <div className="flex flex-wrap gap-1.5">
              {['iPhone 15 Pro Max 256GB', 'Samsung Galaxy S24 Ultra', 'Google Pixel 8 Pro'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer text-xs transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'DESC' && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono block mb-2">⚡ Quick pick description:</span>
            <div className="space-y-1.5">
              <button
                onClick={() => handleSend('Pristine condition, battery health 95%, with original box & charger')}
                className="w-full text-left px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer text-xs transition"
              >
                &quot;Pristine condition, battery health 95%, with original box & charger&quot;
              </button>
              <button
                onClick={() => handleSend('Brand new sealed in box, factory unlocked with 1-year warranty')}
                className="w-full text-left px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer text-xs transition"
              >
                &quot;Brand new sealed in box, factory unlocked with 1-year warranty&quot;
              </button>
            </div>
          </div>
        )}

        {currentStep === 'PRICE' && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono block mb-2">⚡ Quick pick price:</span>
            <div className="flex gap-2">
              {['$450', '$650', '$899'].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer text-xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'PHOTO' && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Select or upload phone photo:
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-[11px] cursor-pointer"
              >
                Upload from device
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => handlePhotoSelect(preset.url)}
                  className="group relative cursor-pointer rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition shadow-sm"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-16 object-cover group-hover:scale-110 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[10px] text-white truncate font-medium">{preset.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'PHONE' && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400 font-mono block mb-2">⚡ Quick sample phone number:</span>
            <div className="flex flex-wrap gap-2">
              {['+251 911 445566', '+1 555 019 2831', '+44 7700 900077'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSend(num)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 cursor-pointer text-xs"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="telegram-input-field"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              currentStep === 'MODEL'
                ? 'Enter phone model name...'
                : currentStep === 'DESC'
                ? 'Enter phone description...'
                : currentStep === 'PRICE'
                ? 'Enter price (e.g. 650)...'
                : currentStep === 'PHOTO'
                ? 'Pick a photo above or upload...'
                : currentStep === 'PHONE'
                ? 'Enter your phone number...'
                : 'Type /newlisting, /browse, or a message...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          <button
            type="submit"
            id="telegram-send-btn"
            className="w-8 h-8 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Simulated Call Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Calling Seller</h3>
              <p className="text-xs text-slate-400 mt-1">
                In actual Telegram, clicking this button triggers the native OS phone dialer with:
              </p>
              <div className="font-mono text-emerald-400 font-bold text-sm bg-slate-950 py-2 px-3 rounded-lg border border-slate-800 mt-2">
                {activeCallModal}
              </div>
            </div>
            <button
              onClick={() => setActiveCallModal(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
