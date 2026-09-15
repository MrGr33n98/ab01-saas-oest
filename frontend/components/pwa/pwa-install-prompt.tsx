"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "oest-pwa-install-dismissed";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (window.localStorage.getItem(DISMISS_KEY)) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Instalar aplicativo OEST"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[70] w-[min(23rem,calc(100vw-2rem))] border border-oest-blue/20 bg-white p-4 shadow-[0_20px_60px_rgba(17,24,32,0.18)] sm:right-6"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-oest-lightblue text-sm font-bold text-oest-ink">
          OE
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-oest-ink">Instale a OEST</p>
          <p className="mt-1 text-[13px] leading-relaxed text-oest-ink/65">
            Acesse missões e dados com uma experiência de aplicativo.
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={install} className="btn-oest-green px-4 py-2 text-[13px]">
          Instalar
        </button>
        <button type="button" onClick={dismiss} className="px-2 py-2 text-[13px] font-medium text-oest-ink/65 hover:text-oest-ink">
          Agora não
        </button>
      </div>
    </aside>
  );
}
