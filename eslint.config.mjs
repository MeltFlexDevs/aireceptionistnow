import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Machine-generated article translations (scripts/translate-blog.ts).
    //
    // react/no-unescaped-entities wants &apos; in JSX text. That is the right
    // rule for hand-written posts and the generator still asks the model for
    // it, but French and Italian prose is dense with apostrophes and a single
    // missed one would fail lint on an otherwise perfect 500-line translation.
    // A raw apostrophe in JSX text is valid JSX and renders identically, so the
    // rule is off here rather than paying to regenerate whole articles over it.
    files: ["content/i18n/*/blog/**/*.tsx"],
    rules: { "react/no-unescaped-entities": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
