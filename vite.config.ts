import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PWA（Step 4.2）之後再加 vite-plugin-pwa
export default defineConfig({
  plugins: [react()],
});
