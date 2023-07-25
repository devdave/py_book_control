// noinspection ES6UnusedImports

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@src': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
