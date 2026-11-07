import type { ComponentProps, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Accessible form fields. Each field wires its label, hint and error to the
 * control with aria-describedby / aria-invalid. Inputs use 16px+ text so iOS
 * doesn't zoom on focus.
 */

const control =
  "block w-full rounded-xl border border-line bg-white px-4 py-3 text-[1.0625rem] text-ink placeholder:text-muted/70 transition-colors hover:border-jamun-200 focus:border-jamun-700 focus:ring-4 focus:ring-marigold-300/60 focus:outline-none aria-[invalid=true]:border-kumkum";

type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function fieldIds(id: string, hint?: ReactNode, error?: string) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return { describedBy: describedBy || undefined };
}

export function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[0.9375rem] font-semibold text-jamun-900">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-kumkum">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

type BaseFieldProps = {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Prefix ids when the same form appears twice on a page. */
  idPrefix?: string;
  wrapperClassName?: string;
};

export function TextField({
  name,
  label,
  hint,
  error,
  optional,
  idPrefix = "f",
  wrapperClassName,
  className,
  ...props
}: BaseFieldProps & Omit<ComponentProps<"input">, "name">) {
  const id = `${idPrefix}-${name}`;
  const { describedBy } = fieldIds(id, hint, error);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={!optional}
        className={cn(control, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  optional,
  idPrefix = "f",
  wrapperClassName,
  className,
  ...props
}: BaseFieldProps & Omit<ComponentProps<"textarea">, "name">) {
  const id = `${idPrefix}-${name}`;
  const { describedBy } = fieldIds(id, hint, error);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <textarea
        id={id}
        name={name}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={!optional}
        className={cn(control, "min-h-28 resize-y", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  hint,
  error,
  optional,
  idPrefix = "f",
  wrapperClassName,
  className,
  options,
  placeholder = "Choose one",
  ...props
}: BaseFieldProps &
  Omit<ComponentProps<"select">, "name"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  const id = `${idPrefix}-${name}`;
  const { describedBy } = fieldIds(id, hint, error);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={!optional}
        className={cn(
          control,
          "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%232a1636%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10",
          className,
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  error,
  idPrefix = "f",
  wrapperClassName,
  className,
  ...props
}: Omit<BaseFieldProps, "hint" | "optional"> & Omit<ComponentProps<"input">, "name" | "type">) {
  const id = `${idPrefix}-${name}`;
  return (
    <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("mt-1 size-5 shrink-0 cursor-pointer rounded accent-jamun-900", className)}
          {...props}
        />
        <label htmlFor={id} className="cursor-pointer text-[0.9375rem] leading-snug text-ink">
          {label}
        </label>
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

/** Off-screen field that only bots fill in. Pair with `isBot()` on the server. */
export function Honeypot({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </label>
    </div>
  );
}

/** Form-level error summary. Focus it after a failed submit so screen readers announce it. */
export function FormAlert({
  id,
  title,
  children,
  tone = "error",
}: {
  id?: string;
  title?: string;
  children: ReactNode;
  tone?: "error" | "info" | "success";
}) {
  return (
    <div
      id={id}
      role={tone === "error" ? "alert" : "status"}
      tabIndex={-1}
      className={cn(
        "rounded-xl border px-4 py-3 text-[0.9375rem]",
        tone === "error" && "border-kumkum/30 bg-kumkum-50 text-jamun-950",
        tone === "info" && "border-jamun-200 bg-mist text-jamun-950",
        tone === "success" && "border-peacock-600/30 bg-peacock-50 text-peacock-700",
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}
