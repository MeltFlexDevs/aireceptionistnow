"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

/**
 * Dependency-free inline form validation built on the browser's Constraint
 * Validation API, so it works on ANY control - controlled or uncontrolled,
 * server-action forms or client onSubmit forms - without a form library.
 *
 * A field opts in with the normal HTML constraints (`required`, `type="email"`,
 * `pattern`, `minLength`, ...). The form then, live:
 *  - shows each field's error inline once it's been blurred or a submit attempted
 *    (<FieldError name>, or automatically via <Field>);
 *  - marks required vs optional on the label (a red `*` / a muted "(optional)");
 *  - blocks submitting while anything is invalid (<ValidatedSubmit> disables, and
 *    an invalid Enter-key submit is prevented and reveals every error).
 *
 * Messages default to clean English, overridable per field via `data-error-*`
 * attributes (e.g. data-error-valuemissing="Tell us your name").
 */

interface FieldState {
  /** Current validation message, "" when valid. */
  message: string;
  /** Has the user left the field, so an error is fair to show yet? */
  touched: boolean;
}

interface FormCtx {
  /** A submit has been attempted, so every field may reveal its error now. */
  attempted: boolean;
  /** Whole-form validity, for gating the submit control. */
  valid: boolean;
  fields: Record<string, FieldState>;
}

const Ctx = createContext<FormCtx | null>(null);

/** Read the surrounding form's validity, for a custom submit control. */
export function useFormValidity(): { valid: boolean; attempted: boolean } {
  const ctx = use(Ctx);
  return { valid: ctx?.valid ?? true, attempted: ctx?.attempted ?? false };
}

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isControl(el: Element): el is Control {
  return (
    (el instanceof HTMLInputElement && el.type !== "hidden" && el.type !== "submit" && el.type !== "button") ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  );
}

// Clean English defaults for the common validity states, plus per-control
// overrides via data-error-<state> attributes. Falls back to the browser's own
// (localized) validationMessage for anything not covered.
function messageFor(el: Control): string {
  if (el.validity.valid) return "";
  const data = el.dataset;
  const pick = (key: string, fallback: string) => data[`error${key}`] ?? fallback;
  const v = el.validity;
  if (v.valueMissing) return pick("Valuemissing", "This field is required.");
  if (v.typeMismatch) {
    if (el instanceof HTMLInputElement && el.type === "email")
      return pick("Typemismatch", "Enter a valid email address.");
    if (el instanceof HTMLInputElement && el.type === "url")
      return pick("Typemismatch", "Enter a valid URL.");
    if (el instanceof HTMLInputElement && el.type === "tel")
      return pick("Typemismatch", "Enter a valid phone number.");
    return pick("Typemismatch", "Enter a valid value.");
  }
  if (v.patternMismatch) return pick("Patternmismatch", el.title || "Please match the requested format.");
  if (v.tooShort) return pick("Tooshort", `Please use at least ${(el as HTMLInputElement).minLength} characters.`);
  if (v.tooLong) return pick("Toolong", "This is too long.");
  if (v.rangeUnderflow) return pick("Rangeunderflow", `Must be at least ${(el as HTMLInputElement).min}.`);
  if (v.rangeOverflow) return pick("Rangeoverflow", `Must be at most ${(el as HTMLInputElement).max}.`);
  if (v.stepMismatch) return pick("Stepmismatch", "Enter a valid value.");
  if (v.badInput) return pick("Badinput", "Enter a valid value.");
  return el.validationMessage;
}

type ValidatedFormProps = FormHTMLAttributes<HTMLFormElement> & { children: ReactNode };

export function ValidatedForm({ children, onSubmit, ...props }: ValidatedFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [valid, setValid] = useState(true);
  const [attempted, setAttempted] = useState(false);

  // Recompute every field's message + overall validity from the live DOM. Merges
  // with prior state so the per-field `touched` flag survives.
  const recompute = useCallback(() => {
    const form = ref.current;
    if (!form) return;
    setFields((prev) => {
      const next: Record<string, FieldState> = {};
      for (const el of Array.from(form.elements)) {
        if (!isControl(el) || !el.name) continue;
        next[el.name] = { message: messageFor(el), touched: prev[el.name]?.touched ?? false };
      }
      return next;
    });
    setValid(form.checkValidity());
  }, []);

  // Initial pass so prefilled edit forms enable submit immediately and empty
  // required forms start disabled.
  useEffect(() => {
    recompute();
  }, [recompute]);

  const markTouched = useCallback((name: string) => {
    setFields((prev) => ({ ...prev, [name]: { message: prev[name]?.message ?? "", touched: true } }));
  }, []);

  const value = useMemo<FormCtx>(() => ({ attempted, valid, fields }), [attempted, valid, fields]);

  return (
    <Ctx.Provider value={value}>
      <form
        ref={ref}
        noValidate
        onInput={recompute}
        onBlurCapture={(e) => {
          const el = e.target as Element;
          if (isControl(el) && el.name) markTouched(el.name);
        }}
        onSubmit={(e) => {
          const form = ref.current;
          if (form && !form.checkValidity()) {
            e.preventDefault();
            setAttempted(true);
            recompute();
            for (const el of Array.from(form.elements)) {
              if (isControl(el) && !el.validity.valid) {
                el.focus();
                break;
              }
            }
            return;
          }
          onSubmit?.(e);
        }}
        {...props}
      >
        {children}
      </form>
    </Ctx.Provider>
  );
}

/** Inline error for a field, shown once the field is touched or a submit tried. */
export function FieldError({ name, className = "" }: { name: string; className?: string }) {
  const ctx = use(Ctx);
  const field = ctx?.fields[name];
  if (!ctx || !field?.message || !(field.touched || ctx.attempted)) return null;
  return (
    <p role="alert" className={`mt-1 text-xs text-rose-600 ${className}`}>
      {field.message}
    </p>
  );
}

/** Red `*` for required fields. */
export function RequiredMark() {
  return (
    <span className="text-rose-500" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/** Muted "(optional)" for optional fields. */
export function OptionalMark() {
  return <span className="font-normal text-neutral-400"> (optional)</span>;
}

/**
 * The common label + control + inline-error group. Pass the control as children
 * (any input/select/textarea with `name`); Field renders the label with the
 * required/optional marker, an optional hint, and the field's error. Use the
 * lower-level ValidatedForm + FieldError directly for bespoke layouts.
 */
export function Field({
  name,
  label,
  required = false,
  hint,
  className = "",
  labelClassName = "mb-1.5 block text-sm font-medium text-neutral-700",
  children,
}: {
  name: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClassName}>
        {label}
        {required ? <RequiredMark /> : <OptionalMark />}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>}
      <FieldError name={name} />
    </div>
  );
}

/**
 * Submit control that disables itself while the form is invalid (and shows a
 * pending state during a server action). Self-contained: no i18n dependency, so
 * it works on marketing, onboarding, and dashboard forms alike. Pass the same
 * className the surrounding design uses.
 */
export function ValidatedSubmit({
  children,
  pendingText,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  pendingText?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { valid } = useFormValidity();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled || !valid}
      aria-busy={pending}
      className={className}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
