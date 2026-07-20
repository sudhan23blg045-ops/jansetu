export const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  kn: "Kannada (ಕನ್ನಡ)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  ml: "Malayalam (മലയാളം)",
};

export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES[code] || "English";
}
