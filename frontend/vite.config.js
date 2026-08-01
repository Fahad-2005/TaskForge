import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { aiChatApiPlugin } from './vite-ai-chat-plugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env keys (including GROQ_API_KEY) for the Vite Node server only.
  // Keys without VITE_ are NOT exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GROQ_API_KEY) {
    process.env.GROQ_API_KEY = env.GROQ_API_KEY
  }

  return {
    plugins: [react(), aiChatApiPlugin()],
    resolve: {
      alias: {
        // Assignment samples use 'ai/react'; AI SDK v7 moved the hook to @ai-sdk/react.
        'ai/react': fileURLToPath(new URL('./node_modules/@ai-sdk/react', import.meta.url)),
      },
    },
    server: {
      port: 5173,
    },
  }
})
