"use client";

import { useState, useSyncExternalStore } from 'react';

const FALLBACK_ORIGIN = 'https://lexis.hridya.tech';

function noopSubscribe() {
  return () => {};
}

function getClientOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_ORIGIN;
}

function getClientOs(): 'mac' | 'win' | 'linux' {
  if (typeof navigator === 'undefined') {
    return 'mac';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) {
    return 'win';
  }
  if (userAgent.includes('linux')) {
    return 'linux';
  }
  return 'mac';
}

export function QuickInstall() {
  const os = useSyncExternalStore<'mac' | 'win' | 'linux'>(noopSubscribe, getClientOs, () => 'mac');
  const [copied, setCopied] = useState(false);
  const baseUrl = useSyncExternalStore(noopSubscribe, getClientOrigin, () => FALLBACK_ORIGIN);

  const commands = {
    mac: `curl -fsSL ${baseUrl}/install.sh | bash`,
    linux: `curl -fsSL ${baseUrl}/install.sh | bash`,
    win: `iwr ${baseUrl}/win.ps1 -useb | iex`
  };

  const labels = {
    mac: 'macOS',
    linux: 'Linux',
    win: 'Windows'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(commands[os]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[#222222] p-8 flex flex-col w-full bg-black">
      <div className="flex justify-between items-center mb-10">
        <p className="font-mono text-[10px] text-[#666666] uppercase tracking-[0.2em]">
          Install / {labels[os]}
        </p>
        <button 
          onClick={handleCopy} 
          className="text-[#666666] hover:text-white font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          [{copied ? 'COPIED' : 'COPY'}]
        </button>
      </div>
      <pre className="font-mono text-[13px] md:text-[14px] text-white overflow-x-auto whitespace-nowrap break-normal leading-relaxed">
        {commands[os]}
      </pre>
    </div>
  );
}
