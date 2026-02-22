import { ArrowUpCircle, ChevronDown, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface OutdatedPlugin {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateCommand: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground ml-1 inline-flex shrink-0 cursor-pointer items-center"
      aria-label="Copy command">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
};

const OutdatedPluginsBadge = ({ outdatedPlugins }: { outdatedPlugins: OutdatedPlugin[] }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (outdatedPlugins.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold transition-colors"
        aria-label={`${outdatedPlugins.length} plugin update${outdatedPlugins.length > 1 ? 's' : ''} available`}>
        <ArrowUpCircle className="h-3 w-3" />
        {outdatedPlugins.length}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-border bg-card absolute top-full right-0 z-50 mt-1 w-72 rounded border-2 shadow-lg">
          <div className="font-head border-border border-b px-3 py-2 text-xs font-medium">Plugin Updates Available</div>
          <div className="max-h-64 overflow-y-auto">
            {outdatedPlugins.map(plugin => (
              <div key={plugin.name} className="border-border border-b px-3 py-2 last:border-b-0">
                <div className="text-foreground text-xs font-medium">{plugin.name}</div>
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {plugin.currentVersion} &rarr; {plugin.latestVersion}
                </div>
                <div className="bg-muted mt-1.5 flex items-center justify-between rounded px-2 py-1">
                  <code className="text-foreground min-w-0 truncate text-[10px]">{plugin.updateCommand}</code>
                  <CopyButton text={plugin.updateCommand} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { OutdatedPluginsBadge };
export type { OutdatedPlugin };
