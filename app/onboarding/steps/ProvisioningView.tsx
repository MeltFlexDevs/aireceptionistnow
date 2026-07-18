"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { useT } from "@/lib/i18n/client";
import { Spinner } from "@/app/dashboard/icons";
import { fillTemplate } from "../personality";
import { AiAvatar } from "../AiAvatar";
import { ensureProvisioningAction, type ProvisionPoll } from "../actions";

const POLL_MS = 2500;
const WAITING_SLOW_MS = 60_000;

// Post-payment screen: triggers provisioning (fallback to the Stripe webhook)
// and polls until the assistant is live. Progress is honest-indeterminate -
// the backend reports no mid-flight percentages.
export function ProvisioningView({ assistantName = "" }: { assistantName?: string }) {
  const t = useT();
  const o = t.onboarding;
  const name = assistantName.trim();
  const router = useRouter();
  const [state, setState] = useState<ProvisionPoll>({ status: "provisioning" });
  const [slow, setSlow] = useState(false);
  // Bumping this restarts the poll loop (used by retry).
  const [attempt, setAttempt] = useState(0);
  const startedAt = useRef<number | null>(null);

  // Each effect instance owns its whole tick chain via `alive` - safe under
  // StrictMode's mount/cleanup/remount (the first chain dies on cleanup, the
  // second keeps polling; a duplicate concurrent action call is harmless
  // because the server claim is a CAS).
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    startedAt.current ??= Date.now();

    async function tick() {
      if (!alive) return;
      let next: ProvisionPoll | null = null;
      try {
        // The action provisions when payment has landed and nothing else is
        // already running; otherwise it just reports current status.
        next = await ensureProvisioningAction();
      } catch {
        // Transient network/server hiccup - keep polling.
      }
      if (!alive) return;
      if (next) {
        setState(next);
        setSlow(Date.now() - (startedAt.current ?? Date.now()) > WAITING_SLOW_MS);
        // Terminal states stop the loop; retry() starts a fresh one.
        if (next.status === "done" || next.status === "error" || next.status === "guest" || next.status === "nothing") {
          return;
        }
      }
      timer = setTimeout(tick, next ? POLL_MS : POLL_MS * 2);
    }

    void tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [attempt]);

  function retry() {
    startedAt.current = Date.now();
    setSlow(false);
    setState({ status: "provisioning" });
    setAttempt((a) => a + 1);
  }

  if (state.status === "done") {
    return (
      <section className="rise flex flex-col items-center py-16 text-center">
        <div className="onb-aura">
          <div className="onb-avatar-disc">
            <AiAvatar mood="celebrate" className="h-[74%] w-[74%]" />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-900">
          {name ? fillTemplate(o.doneTitleNamed, { name }) : o.doneTitle}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {name ? fillTemplate(o.doneSubNamed, { name }) : o.doneSub}
        </p>
        {state.e164 && (
          <p className="mt-3 text-3xl font-medium tracking-tight text-neutral-900 tabular-nums">
            {formatPhone(state.e164)}
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="press mt-8 inline-flex h-10 items-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {o.doneCta}
        </button>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="rise flex flex-col items-center py-16 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">{o.errorTitle}</h1>
        {state.error && (
          <p className="mx-auto mt-3 max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        )}
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">{o.errorHint}</p>
        <button
          type="button"
          onClick={retry}
          className="press mt-6 inline-flex h-10 items-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {o.retry}
        </button>
      </section>
    );
  }

  const waiting = state.status === "waiting-payment";
  return (
    <section className="rise flex flex-col items-center py-16 text-center" aria-busy>
      <div className="onb-aura">
        <div className="onb-avatar-disc">
          <AiAvatar mood="friendly" className="h-[74%] w-[74%]" />
        </div>
      </div>
      <Spinner className="mt-6 h-6 w-6 animate-spin text-neutral-400" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
        {name ? fillTemplate(o.buildTitleNamed, { name }) : o.buildTitle}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
        {waiting ? o.waitingPayment : o.buildSub}
      </p>
      {waiting && slow && (
        <p className="mx-auto mt-3 max-w-md text-xs text-neutral-400">{o.stillWaiting}</p>
      )}
    </section>
  );
}
