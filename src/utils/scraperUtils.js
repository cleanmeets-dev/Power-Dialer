// Utility functions for ScraperPage

export function formatSessionLabel(session) {
  return `${session.businessType} in ${session.location}`;
}

export function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function normalizeExportPhone(phone) {
  if (!phone) return "";
  const normalized = String(phone)
    .normalize("NFKC")
    .replace(/^\uFEFF/, "")
    .replace(/^'+/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // Extract the first likely phone-like segment and drop stray icon/mojibake chars.
  const phoneLikeMatch = normalized.match(/\+?\d[\d\s().-]{6,}\d/);
  const candidate = phoneLikeMatch ? phoneLikeMatch[0] : normalized;
  return candidate
    .replace(/[^\d+().\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getProgressValue(session) {
  return Number.isFinite(Number(session?.progressPercent))
    ? Math.max(0, Math.min(100, Number(session.progressPercent)))
    : 0;
}
