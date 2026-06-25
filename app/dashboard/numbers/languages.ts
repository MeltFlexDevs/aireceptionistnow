// Languages the AI can speak/transcribe, keyed by the code stored on the number
// and used by Deepgram STT. Flag is a representative country for the language.

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "multi", name: "Auto-detect (match caller)", flag: "🌐" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "en-AU", name: "English (Australia)", flag: "🇦🇺" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "es-419", name: "Spanish (Latin America)", flag: "🇲🇽" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "fr-CA", name: "French (Canada)", flag: "🇨🇦" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Taiwan)", flag: "🇹🇼" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
];

export function findLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
