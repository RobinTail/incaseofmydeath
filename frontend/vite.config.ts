import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import materialSymbols from "vite-plugin-material-symbols";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), materialSymbols({ preload: true })],
});
