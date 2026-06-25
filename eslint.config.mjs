import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores:
    "scripts/**",
  ]),
  // Project-wide rule overrides
  {
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      // Supabase DB records use 'any' throughout — warn instead of error
      "@typescript-eslint/no-explicit-any": "warn",
      // setState in useEffect is standard for data fetching & initialization
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
