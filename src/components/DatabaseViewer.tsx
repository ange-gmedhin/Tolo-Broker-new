import React from 'react';
import { Database, Phone, CheckCircle2 } from 'lucide-react';
import { PhoneListing } from '../types';

interface DatabaseViewerProps {
  listings: PhoneListing[];
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({ listings }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            SQLite Database Table: `listings` ({listings.length} rows)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">tolo_broker.db</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Photo</th>
              <th className="py-2.5 px-3">Model</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Seller Phone</th>
              <th className="py-2.5 px-3">Telegram File ID</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {listings.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="py-2.5 px-3 font-semibold text-sky-400">#{item.id}</td>
                <td className="py-2.5 px-3">
                  <img
                    src={item.photoUrl}
                    alt={item.phoneModel}
                    className="w-8 h-8 rounded object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                </td>
                <td className="py-2.5 px-3 font-sans font-medium text-white max-w-[180px] truncate">
                  {item.phoneModel}
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                  ${Number(item.price).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{item.sellerPhone}</span>
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                  {item.photoFileId.slice(0, 16)}...
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
