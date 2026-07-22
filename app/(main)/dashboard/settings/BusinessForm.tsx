"use client";

import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import type { AccountSettings } from "@/lib/dashboard/account";
import { SavePill } from "../components/SavePill";
import { ValidatedForm, Field, ValidatedSubmit } from "@/app/components/forms/validated-form";
import { TimezoneSelect } from "./TimezoneSelect";
import { saveAccountAction } from "./actions";

// Dashboard primary-button styling, mirrored onto the self-contained
// ValidatedSubmit (which gates on form validity).
const primaryBtn =
  "press inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";
const toggle =
  "relative h-5 w-9 shrink-0 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-4";

export function BusinessForm({
  account,
  email,
  zones,
  canEdit,
  businessCount,
}: {
  account: AccountSettings | null;
  email: string;
  zones: string[];
  canEdit: boolean;
  /** Drives which business-name hint to show; the rename only syncs at 1. */
  businessCount: number;
}) {
  const t = useT();
  const s = t.settings;
  const [state, formAction] = useActionState<ActionState, FormData>(saveAccountAction, IDLE);

  return (
    <ValidatedForm action={formAction} className="space-y-4">
      <p className="text-xs leading-relaxed text-neutral-500">{s.accountSub}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label={s.fullName} required>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={account?.full_name ?? ""}
            className={field}
            disabled={!canEdit}
          />
        </Field>
        <div>
          <label htmlFor="email_display" className={labelCls}>
            {s.email}
          </label>
          <input
            id="email_display"
            value={email}
            disabled
            readOnly
            className={`${field} bg-neutral-50 text-neutral-500`}
          />
        </div>
        <Field
          name="company"
          label={s.company}
          required
          hint={businessCount > 1 ? s.companyMultiHint : s.companyHint}
        >
          <input
            id="company"
            name="company"
            required
            defaultValue={account?.company ?? ""}
            className={field}
            disabled={!canEdit}
          />
        </Field>
        <Field name="role" label={s.role}>
          <input
            id="role"
            name="role"
            defaultValue={account?.role ?? ""}
            className={field}
            disabled={!canEdit}
          />
        </Field>
        <Field name="phone" label={s.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={account?.phone ?? ""}
            className={field}
            disabled={!canEdit}
          />
        </Field>
        <div>
          <label htmlFor="timezone" className={labelCls}>
            {s.timezone}
          </label>
          <TimezoneSelect
            value={account?.timezone ?? ""}
            zones={zones}
            className={field}
            disabled={!canEdit}
          />
          {state.fields?.timezone && (
            <p className="mt-1 text-xs text-rose-600">{state.fields.timezone}</p>
          )}
        </div>
      </div>

      <Field name="about" label={s.aboutYou}>
        <textarea
          id="about"
          name="about"
          defaultValue={account?.about ?? ""}
          rows={4}
          placeholder={s.aboutYouPlaceholder}
          className={`${field} resize-y`}
          disabled={!canEdit}
        />
      </Field>

      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300">
        <span>
          <span className="block text-sm font-medium text-neutral-800">{s.shareTitle}</span>
          <span className="block text-xs text-neutral-400">{s.shareBody}</span>
        </span>
        <input
          type="checkbox"
          name="share_with_assistants"
          defaultChecked={account?.share_with_assistants ?? true}
          className="peer sr-only"
          disabled={!canEdit}
        />
        <span className={toggle} />
      </label>

      <div className="flex items-center justify-end gap-3">
        <SavePill state={state} />
        <ValidatedSubmit className={primaryBtn} disabled={!canEdit}>
          {t.common.save}
        </ValidatedSubmit>
      </div>
    </ValidatedForm>
  );
}
