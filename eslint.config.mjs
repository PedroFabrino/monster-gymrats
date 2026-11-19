import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-console": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 40, skipBlankLines: true, skipComments: true }],
      complexity: ["error", 10],
      "max-params": ["error", 3],
      "max-depth": ["error", 3],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/app/**/{page,layout,loading,error,not-found}.tsx", "src/**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Default exports are forbidden by AGENTS.md. Use named exports.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.test.ts"],
    rules: {
      "max-lines-per-function": "off",
    },
  },
);
