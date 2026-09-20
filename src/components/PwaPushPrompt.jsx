import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaPushPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [pushStatus, setPushStatus] = useState('default'); // 'default', 'granted', 'denied'
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check Notification API support
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }

    // PWA Install Prompt Handler
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications are not supported on this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('Urban Fork Alert Enabled', {
          body: 'You will receive live kitchen updates and seasonal offers!',
          icon: '/favicon.svg'
        });
      }
    } catch (err) {
      console.warn('Push permission request error:', err);
    }
  };

  if (dismissed || (!showInstallBanner && pushStatus === 'granted')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 rounded-2xl shadow-2xl border"
        style={{
          background: 'rgba(22, 36, 22, 0.95)',
          borderColor: 'rgba(244, 160, 23, 0.3)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl flex-shrink-0">
              🔔
            </div>
            <div>
              <h4 className="text-cream font-heading font-bold text-sm">Stay Updated with Urban Fork</h4>
              <p className="text-cream/50 text-xs font-body mt-0.5">
                Install our app or enable live notifications for chef specials and discount perks.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-cream/40 hover:text-cream text-sm p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          {showInstallBanner && (
            <button
              onClick={handleInstallClick}
              className="flex-1 text-dark-900 py-2 px-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#f7b84b,#f4a017)' }}
            >
              Install App
            </button>
          )}

          {pushStatus !== 'granted' && (
            <button
              onClick={handleEnablePush}
              className="flex-1 py-2 px-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
            >
              Allow Alerts
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="py-2 px-3 rounded-xl font-heading text-xs text-cream/40 hover:text-cream/70"
          >
            Later
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
