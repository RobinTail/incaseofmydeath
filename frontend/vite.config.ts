import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const icons = [
  "account_circle",
  "brightness_4",
  "brightness_7",
  "build_circle",
  "chat",
  "comment",
  "content_copy",
  "conversion_path",
  "delete",
  "fact_check",
  "home",
  "info",
  "play_circle",
  "ring_volume",
  "send",
  "wifi_off",
].toSorted();

process.env.VITE_ICONS = icons.join(",");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
