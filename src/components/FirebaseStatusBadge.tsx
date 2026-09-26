import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Layers,
  Key
} from 'lucide-react';
import { firebaseConfig } from '../firebase/config';

export const FirebaseStatusBadge: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(firebaseConfig.projectId);
    setCopiedProjectId(true);
    setTimeout(() => setCopiedProjectId(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">
              Firebase Project: <span className="font-semibold text-amber-400">{firebaseConfig.projectId}</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded-full">
              Live Configured
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>{expanded ? 'Hide config details' : 'Setup tips & config'}</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {expanded && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-300 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Project ID:</span>
                  <span className="font-mono text-slate-200 font-medium">{firebaseConfig.projectId}</span>
                </div>
                <button
                  onClick={handleCopyProjectId}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                  title="Copy Project ID"
                >
                  {copiedProjectId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Current Hostname:</span>
                  <span className="font-mono text-slate-200 font-medium truncate max-w-[170px] inline-block">
                    {currentHostname || 'localhost'}
                  </span>
                </div>
                <button
                  onClick={handleCopyDomain}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                  title="Copy Hostname for Authorized Domains"
                >
                  {copiedDomain ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-200/90 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs">
                <AlertCircle size={14} />
                <span>Firebase Console Checklist for New Projects:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-200/80">
                <li>
                  In <strong>Firebase Console &gt; Authentication &gt; Sign-in method</strong>: make sure <strong>Email/Password</strong> is enabled.
                </li>
                <li>
                  To enable Google Sign-In, turn on the <strong>Google</strong> provider and save support email.
                </li>
                <li>
                  Under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, add <code className="bg-slate-900/80 px-1 py-0.5 rounded text-amber-300">{currentHostname}</code> if you see domain errors during Google login.
                </li>
              </ul>
              <div className="pt-1">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:underline"
                >
                  Open Firebase Console for {firebaseConfig.projectId} <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
