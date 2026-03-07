import { useCallback, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useWallets } from '@/hooks/useWalletMonitor';
import type { SystemWallet, WalletsResponse } from '@/lib/api';

const DISMISS_KEY = 'wallet-alert-dismissed-at';
const DISMISS_HOURS = 4;

let dismissVersion = 0;
const listeners = new Set<() => void>();

function getDismissSnapshot(): number {
  return dismissVersion;
}

function subscribeDismiss(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function isDismissedNow(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  return Date.now() - Number(dismissedAt) < DISMISS_HOURS * 3600_000;
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
  dismissVersion++;
  listeners.forEach((cb) => cb());
}

export function WalletAlertBanner() {
  const { data } = useWallets();

  useSyncExternalStore(subscribeDismiss, getDismissSnapshot);
  const dismissed = isDismissedNow();

  const handleDismiss = useCallback(() => dismiss(), []);

  const walletsResponse = data?.data as WalletsResponse | undefined;
  const wallets: SystemWallet[] = walletsResponse?.wallets ?? [];
  const alertWallets = wallets.filter((w) => w.status === 'critical' || w.status === 'low');

  if (dismissed || alertWallets.length === 0) return null;

  const worst = alertWallets.find((w) => w.status === 'critical') ?? alertWallets[0];
  const isCritical = worst.status === 'critical';

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${
        isCritical
          ? 'bg-red-900/30 border-b border-red-700/50'
          : 'bg-yellow-900/30 border-b border-yellow-700/50'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle
          className={`w-4 h-4 flex-shrink-0 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`}
        />
        <span className="text-gray-200 truncate">
          {worst.name}: {worst.balance} AVAX
          {isCritical ? ' — can nap gap!' : ' — balance thap'}
          {alertWallets.length > 1 && (
            <span className="text-gray-400"> (+{alertWallets.length - 1} vi khac)</span>
          )}
        </span>
        <Link to="/wallet-monitor" className="text-blue-400 hover:text-blue-300 whitespace-nowrap">
          Xem Wallet Monitor
        </Link>
      </div>
      <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-300 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
