import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					reactflow: ["reactflow"],
					monaco: ["@monaco-editor/react"],
					htmlToImage: ["html-to-image"],
					jspdf: ["jspdf"],
				},
			},
		},
	},
});
