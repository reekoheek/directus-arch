let theme: string;

export function getTheme() {
  if (theme === undefined) {
    theme = document.querySelector('html')?.getAttribute('data-bs-theme') ?? '';
  }
  return theme;
}
