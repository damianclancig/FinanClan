import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...nextCoreWebVitals],
    rules: {
        "react-hooks/set-state-in-effect": "warn",
        "react-hooks/purity": "warn",
        "react-hooks/preserve-manual-memoization": "warn",
        "react-hooks/incompatible-library": "warn",
        "react-hooks/static-components": "warn"
    }
}]);