"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import type { AccountSettings } from "@/lib/dashboard/account";
import { ChevronRight } from "../icons";

type Props = { account: AccountSettings | null; canEdit: boolean };

// The account-wide email and SMS switches are gone: the call engine never reads
// the account notify columns, so they changed nothing. Texts and
// recaps are set on each receptionist, so this tab links there. page.tsx still
// passes account and canEdit; this component takes no parameters, which the
// props type allows, so nothing unused is declared.
export const AlertsForm: (props: Props) => ReactNode = () => {
  const t = useT();
  const a = t.assistants;

  const rows = [
    {
      key: "sms",
      title: a.textAlerts,
      body: a.textAlertsSub,
      where: a.topicEscalationTitle,
    },
    {
      key: "email",
      title: a.sendEmailTranscripts,
      body: a.sendEmailTranscriptsSub,
      where: a.topicTuneTitle,
    },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <Link
          key={row.key}
          href="/dashboard/assistant"
          className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-300"
        >
          <span>
            <span className="block text-sm font-medium text-neutral-800">{row.title}</span>
            <span className="block text-xs text-neutral-500">{row.body}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-700">
            {t.nav.assistants} / {row.where}
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
};
