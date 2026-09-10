/** Resolves a path against `<base href>`, so OIDC still works when the app is under /RUTS/. */
export function appUrl(path: string): string {
  const base = document.querySelector('base')?.href ?? `${window.location.origin}/`;
  return new URL(path.replace(/^\//, ''), base).toString();
}
