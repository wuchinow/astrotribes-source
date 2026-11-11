'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from './Button';
import { cn } from '@/lib/cn';

type SubmitButtonProps = Extract<ButtonProps, { href?: undefined }> & {
  /** What the button says while its form is sending ("Posting", "Sending"). */
  pending: string;
};

/**
 * A form's submit button that shows the form is on its way (micro motion, David, Nov 11: "feel
 * responsive"). The Council, hellos, and messages post through server actions with no answer until
 * the page comes back, so on a slow phone a tap looked like nothing. While the form sends, the button
 * that was pressed says `pending` and breathes softly (`.is-sending` in app/globals.css, motion only
 * under no-preference), and every submit button in the form ignores a second tap, so nothing posts
 * twice. A form with two answers (Accept, Decline) changes only the one pressed: its name and value
 * ride in the form's data.
 */
export function SubmitButton({ pending: pendingLabel, children, className, name, value, onClick, ...rest }: SubmitButtonProps) {
  const { pending, data } = useFormStatus();
  const pressed = pending && (name === undefined || data?.get(name) === String(value));
  return (
    <Button
      {...rest}
      type="submit"
      name={name}
      value={value}
      aria-disabled={pending ? 'true' : rest['aria-disabled']}
      className={cn(className, pressed && 'is-sending')}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {pressed ? pendingLabel : children}
    </Button>
  );
}
