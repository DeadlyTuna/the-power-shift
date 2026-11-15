"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Progress } from "@/components/kit/progress";
import { cn } from "@/lib/cn";
import { FieldShell, fieldIds } from "./Field";

/**
 * Password input with a show/hide button, an optional Caps Lock warning and
 * an optional strength meter (for choosing a new password).
 *
 * Same look and a11y wiring as TextField in ./Field.tsx (label, hint, error,
 * aria-describedby, aria-invalid). The eye button is type="button" so it never
 * submits the form; clicking it keeps focus and the caret in the input, and
 * keyboard users stay on the button.
 */

export type PasswordStrength = {
  level: 1 | 2 | 3;
  label: "Weak" | "Okay" | "Strong";
  tip: string;
};

/**
 * A rough guide from length and variety (lower case, capitals, numbers,
 * symbols). Good enough to nudge people towards longer passwords; it is not
 * a breach or dictionary check.
 */
export function passwordStrength(password: string, minLength = 8): PasswordStrength | null {
  if (!password) return null;
  const length = password.length;
  if (length < minLength) {
    return { level: 1, label: "Weak", tip: `Use at least ${minLength} characters.` };
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  const lengthScore = length >= 20 ? 4 : length >= 16 ? 3 : length >= 12 ? 2 : 1;
  const score = new Set(password).size < 5 ? 0 : lengthScore + (variety - 1);

  if (score >= 5) return { level: 3, label: "Strong", tip: "That's a strong password." };
  if (score >= 3) {
    return { level: 2, label: "Okay", tip: "A few more characters, or a symbol, would make it stronger." };
  }
  return { level: 1, label: "Weak", tip: "Make it longer, or mix in capitals, numbers and symbols." };
}

const strengthStyles: Record<PasswordStrength["level"], { bar: string; text: string; value: number }> = {
  1: { bar: "[&_[data-slot=progress-indicator]]:bg-kumkum", text: "text-kumkum", value: 33 },
  2: { bar: "[&_[data-slot=progress-indicator]]:bg-marigold-500", text: "text-marigold-700", value: 66 },
  3: { bar: "[&_[data-slot=progress-indicator]]:bg-peacock-600", text: "text-peacock-700", value: 100 },
};

type PasswordFieldProps = {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  /** Prefix ids when the same form appears twice on a page. */
  idPrefix?: string;
  wrapperClassName?: string;
  /** "current" for signing in, "new" when choosing a password. Sets autoComplete. */
  purpose?: "current" | "new";
  /** Show the strength meter (use with purpose="new"). */
  showStrength?: boolean;
  /** Warn when Caps Lock is on while typing. Default true. */
  capsLockWarning?: boolean;
  /** Minimum length used by the strength meter. */
  minLength?: number;
  /** Extra content under the input, e.g. a "passwords match" note. */
  footer?: ReactNode;
} & Omit<ComponentProps<"input">, "name" | "type" | "ref" | "minLength">;

export function PasswordField({
  name,
  label,
  hint,
  error,
  optional,
  idPrefix = "f",
  wrapperClassName,
  className,
  purpose = "current",
  showStrength = false,
  capsLockWarning = true,
  minLength = 8,
  footer,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: PasswordFieldProps) {
  const id = `${idPrefix}-${name}`;
  const capsId = `${id}-caps`;
  const strengthId = `${id}-strength`;

  const inputRef = useRef<HTMLInputElement>(null);
  const pendingSelection = useRef<[number | null, number | null] | null>(null);
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [innerValue, setInnerValue] = useState(() => String(defaultValue ?? ""));

  const current = value !== undefined ? String(value) : innerValue;
  const strength = showStrength ? passwordStrength(current, minLength) : null;

  const { describedBy } = fieldIds(id, hint, error);
  const ariaDescribedBy =
    [describedBy, capsLock ? capsId : null, strength ? strengthId : null].filter(Boolean).join(" ") || undefined;

  // Changing the input type can reset the caret in some browsers: put it back.
  useLayoutEffect(() => {
    const input = inputRef.current;
    const selection = pendingSelection.current;
    pendingSelection.current = null;
    if (!input || !selection) return;
    if (document.activeElement !== input) input.focus({ preventScroll: true });
    try {
      input.setSelectionRange(selection[0], selection[1]);
    } catch {
      // Some input types don't support selection; nothing to restore.
    }
  }, [visible]);

  function toggleVisible() {
    const input = inputRef.current;
    pendingSelection.current =
      input && document.activeElement === input ? [input.selectionStart, input.selectionEnd] : null;
    setVisible((v) => !v);
  }

  function readCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    if (!capsLockWarning || typeof event.getModifierState !== "function") return;
    setCapsLock(event.getModifierState("CapsLock"));
  }

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      {/* One wrapper, so the optional extras below don't add gaps to the field when they're empty. */}
      <div>
        {/*
          The border lives on this wrapper, with the input and the eye button side by side inside it.
          Password managers (Edge, Bitwarden, LastPass, Dashlane…) inject their icon at the right edge
          of the <input> itself; because the input ends before the button, those icons can't cover it.
        */}
        <div
          className={cn(
            "flex items-center rounded-xl border border-line bg-white transition-colors hover:border-jamun-200",
            "focus-within:border-jamun-700 focus-within:ring-4 focus-within:ring-marigold-300/60",
            error && "border-kumkum hover:border-kumkum",
            className,
          )}
        >
          <input
            ref={inputRef}
            id={id}
            name={name}
            type={visible ? "text" : "password"}
            autoComplete={purpose === "new" ? "new-password" : "current-password"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={ariaDescribedBy}
            required={!optional}
            className="min-w-0 flex-1 rounded-xl border-0 bg-transparent py-3 pr-2 pl-4 text-[1.0625rem] text-ink placeholder:text-muted/70 focus:shadow-none focus:outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              if (value === undefined) setInnerValue(event.target.value);
              onChange?.(event);
            }}
            onKeyDown={(event) => {
              readCapsLock(event);
              onKeyDown?.(event);
            }}
            onKeyUp={(event) => {
              readCapsLock(event);
              onKeyUp?.(event);
            }}
            onBlur={(event) => {
              setCapsLock(false);
              onBlur?.(event);
            }}
            {...props}
          />
          <motion.button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            aria-controls={id}
            // Keep focus (and the caret) in the input when the button is clicked or tapped.
            onMouseDown={(event) => event.preventDefault()}
            onClick={toggleVisible}
            whileTap={{ scale: 0.88 }}
            className="mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-jamun-900"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={visible ? "hide" : "show"}
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                {visible ? (
                  <EyeOff aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <div aria-live="polite">
          <AnimatePresence initial={false}>
            {capsLock ? (
              <motion.p
                key="caps"
                id={capsId}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="flex items-center gap-1.5 pt-2 text-sm font-medium text-marigold-700">
                  <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
                  Caps Lock is on
                </span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {showStrength ? (
          <>
            {/* Announces only when the level changes, not on every keystroke. */}
            <p aria-live="polite" className="sr-only">
              {strength ? `Password strength: ${strength.label}` : ""}
            </p>
            <AnimatePresence initial={false}>
              {strength ? (
                <motion.div
                  key="strength"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1.5 pt-2.5">
                    <Progress
                      aria-hidden="true"
                      value={strengthStyles[strength.level].value}
                      className={cn("h-1.5 bg-mist", strengthStyles[strength.level].bar)}
                    />
                    <p id={strengthId} className="text-sm text-muted">
                      Strength:{" "}
                      <strong className={cn("font-semibold", strengthStyles[strength.level].text)}>
                        {strength.label}
                      </strong>
                      . {strength.tip}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        ) : null}

        {footer}
      </div>
    </FieldShell>
  );
}
