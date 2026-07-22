import Link from "next/link";
import { ChevronDown } from "../icons";

interface Props {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`group press inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 ${className}`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white transition-[transform,border-color] duration-200 group-hover:-translate-x-0.5 group-hover:border-neutral-300">
        <ChevronDown className="h-3.5 w-3.5 rotate-90" aria-hidden />
      </span>
      {label}
    </Link>
  );
}
