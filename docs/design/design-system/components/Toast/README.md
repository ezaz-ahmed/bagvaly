# Toast

A short confirmation or error message.

- Success on `color-success-100` with a `color-success-600` check; error on `color-error-100` with a `color-error-600` alert. Always an icon and words, never colour alone.
- Place toasts at the top on mobile, bottom on desktop. Auto-dismiss after 4 seconds, except errors, which stay until dismissed (`onDismiss`).

The consumer handles placement and timing and provides the message.
