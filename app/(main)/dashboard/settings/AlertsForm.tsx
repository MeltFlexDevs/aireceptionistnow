"use client";

import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import type { AccountSettings } from "@/lib/dashboard/account";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { saveNotificationsAction } from "./actions";

const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4";

export function AlertsForm({
  account,
  canEdit,
}: {
  account: AccountSettings | null;
  canEdit: boolean;
}) {
  const t = useT();
  const s = t.settings;
  const [state, formAction] = useActionState<ActionState, FormData>(saveNotificationsAction, IDLE);

  const rows = [
    {
      name: "notify_email",
      title: s.emailNotif,
      body: s.emailNotifSub,
      checked: account?.notify_email ?? true,
    },
    {
      name: "notify_sms",
      title: s.smsNotif,
      body: s.smsNotifSub,
      checked: account?.notify_sms ?? false,
    },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-xs leading-relaxed text-neutral-500">{s.alertsSub}</p>

      {rows.map((row) => (
        <label
          key={row.name}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300"
        >
          <span>
            <span className="block text-sm font-medium text-neutral-800">{row.title}</span>
            <span className="block text-xs text-neutral-400">{row.body}</span>
          </span>
          <input
            type="checkbox"
            name={row.name}
            defaultChecked={row.checked}
            className="peer sr-only"
            disabled={!canEdit}
          />
          <span className={toggle} />
        </label>
      ))}

      <div className="flex items-center justify-end gap-3">
        <SavePill state={state} />
        <SubmitButton disabled={!canEdit}>{t.common.save}</SubmitButton>
      </div>
    </form>
  );
}
