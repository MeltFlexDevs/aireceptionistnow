/**
 * Whether a push register call leaves alerts on for this install.
 *
 * The app registers on every cold start and sends its stored mute as `muted`,
 * so the register itself keeps the mute. Before this the server always wrote
 * `enabled: true` and the app had to send a second call to mute again; when
 * that call failed, the app said Off and the phone still buzzed.
 *
 * Only `muted: true` mutes. A body without the field comes from an older
 * build, which always registered as enabled.
 *
 * No `server-only` import, so node:test can load it (lib/mobile/push.ts cannot).
 */
export function enabledOnRegister(body: Record<string, unknown>): boolean {
  return body.muted !== true;
}
