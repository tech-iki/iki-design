import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "src/icons.generated.tsx"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
