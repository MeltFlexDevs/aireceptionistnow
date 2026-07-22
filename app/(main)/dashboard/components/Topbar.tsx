"use client";

import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { NotificationsBell } from "./NotificationsBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { AppUser } from "@/lib/auth-user";

export function Topbar({ user }: { user: AppUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
      <MobileNav />

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />

        <NotificationsBell />

        <UserMenu user={user} />
      </div>
    </header>
  );
}
