import ts from "typescript-eslint";
export default ts.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".wrangler/**",
      ".artifacts/**",
      "release/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  ...ts.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
);
