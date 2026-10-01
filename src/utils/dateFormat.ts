/**
 * Formats dates into Indian date format:
 * e.g., "18, December 2026" or "18-12-2026".
 * Handles ISO strings, YYYY-MM-DD, Month DD YYYY, and multi-date ranges.
 */
export function formatIndianDate(dateStr?: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();

  // If already in target format like "18, December 2026" or "17 & 18, December 2026"
  if (/^\d{1,2}\s*(&\s*\d{1,2})?,\s*[a-zA-Z]+\s*\d{4}/.test(trimmed)) return trimmed;
  
  // If "17 & 18 December 2026" or "18 December 2026"
  if (/^\d{1,2}\s*(&\s*\d{1,2})?\s+[a-zA-Z]+(\s+\d{4})?/.test(trimmed)) {
    const match = trimmed.match(/^(\d{1,2}(?:\s*&\s*\d{1,2})?)\s+([a-zA-Z]+)(?:\s+(\d{4}))?/);
    if (match) {
      const [, days, month, year] = match;
      return `${days}, ${month} ${year || "2026"}`;
    }
  }

  // If DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;

  // YYYY-MM-DD format (e.g. "2026-12-18" or "2026-12-18T00:00")
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)}, ${monthName} ${year}`;
  }

  // Month DD, YYYY format (e.g. "December 18, 2026" or "Jun 30, 2026")
  const mdyMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mdyMatch) {
    const [, monthName, day, year] = mdyMatch;
    return `${parseInt(day, 10)}, ${monthName} ${year}`;
  }

  return trimmed;
}
