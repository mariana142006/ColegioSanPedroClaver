import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  preview: {
    host: true,
    allowedHosts: ["selfless-cat-production-4cac.up.railway.app"],
  },
});
