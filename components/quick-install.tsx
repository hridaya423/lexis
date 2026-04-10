"use client";

import { useState, useEffect } from 'react';

export function QuickInstall() {
  const [os, setOs] = useState<'mac' | 'win' | 'linux'>('mac');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setOs('win');
    } else if (userAgent.includes('linux')) {
      setOs('linux');
    } else {
      setOs('mac');
    }
  }, []);

  const commands = {
    mac: 'curl -fsSL https://get.lexis.sh | bash',
    linux: 'curl -fsSL https://get.lexis.sh | bash',
    win: 'iwr https://get.lexis.sh/win.ps1 -useb | iex'
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
      <pre className="font-mono text-[13px] md:text-[14px] text-white overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        {commands[os]}
      </pre>
    </div>
  );
}
