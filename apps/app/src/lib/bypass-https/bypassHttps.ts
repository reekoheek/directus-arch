export async function bypassHttps(checkUrl: string) {
  try {
    await fetch(checkUrl);
  } catch {
    location.href = `${checkUrl}?redirect=${location.href}`;
  }
}
