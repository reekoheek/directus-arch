export function localDay(offset = 0) {
  const today = new Date(new Date().getTime() + offset);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(today.getDate()).padStart(2, '0');

  const formatted = `${year}-${month}-${day}`;
  return formatted;
}
