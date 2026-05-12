const ELIGIBLE_MAJORS = new Set([
  "business",
  "business administration",
  "bba",
  "accounting",
  "acctg",
  "information systems",
  "management information systems",
  "mis",
  "is",
]);

export function normalizeMajor(major: string) {
  return major
    .toLowerCase()
    .replace(/[().,/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAutoEligible(major: string) {
  return ELIGIBLE_MAJORS.has(normalizeMajor(major));
}

export const AUTO_ELIGIBLE_MAJORS_DISPLAY = [
  "Business",
  "Information Systems",
  "Accounting",
] as const;
