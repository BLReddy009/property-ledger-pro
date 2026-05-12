import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".codex-*.cjs", ".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts"]
  }
];

export default eslintConfig;
